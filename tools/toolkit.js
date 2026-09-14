/* =========================================================
   NOVERA TOOLKIT CONTROLLER
   V1.0 — STABLE CONTROLLER
========================================================= */

(function () {
  "use strict";

  const state = {
    activeTool: "calculator",
    calculatorMode: "basic",
    algebraMode: "linear",
    graphMode: "auto",
    physicsMode: "speed",
    chemistryMode: "moles",
    statisticsMode: "mean",
    history: []
  };

  const TOOL_NAMES = [
    "calculator",
    "algebra",
    "graph",
    "physics",
    "chemistry",
    "statistics"
  ];

  const HISTORY_KEY = "novera_toolkit_history";

  /* ========================================================
     HELPERS
  ======================================================== */

  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function show(el) {
    if (el) el.hidden = false;
  }

  function hide(el) {
    if (el) el.hidden = true;
  }

  function text(el, value) {
    if (el) el.textContent = value;
  }

  function safeNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function formatNumber(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return String(value);
    }

    if (Math.abs(value) < 1e-12) return "0";

    return Number(value.toFixed(10)).toString();
  }

  function formatResult(result) {
    if (result === null || result === undefined) {
      return "No result.";
    }

    if (typeof result === "number") {
      return formatNumber(result);
    }

    if (typeof result === "string") {
      return result;
    }

    if (typeof result === "object") {
      if ("result" in result) {
        return formatResult(result.result);
      }

      if ("value" in result && typeof result.value !== "object") {
        return formatResult(result.value);
      }

      try {
        return Object.entries(result)
          .map(([key, value]) => {
            return `${key}: ${formatResult(value)}`;
          })
          .join("\n");
      } catch (e) {
        return String(result);
      }
    }

    return String(result);
  }

  function displayAnswer(container, result) {
    if (!container) return;

    container.textContent = formatResult(result);
    container.classList.remove("answer-pop");
    void container.offsetWidth;
    container.classList.add("answer-pop");
  }

  function getAnswerBox(panel) {
    if (!panel) return null;

    return (
      panel.querySelector(".result-value") ||
      panel.querySelector(".tool-result") ||
      panel.querySelector(".result") ||
      panel.querySelector("[data-result]") ||
      panel.querySelector(".answer")
    );
  }

  function showError(message, input) {
    if (!input) return;

    const old = input.parentElement?.querySelector(".tool-error");
    if (old) old.remove();

    const error = document.createElement("div");
    error.className = "tool-error";
    error.textContent = message;

    input.parentElement?.appendChild(error);

    setTimeout(() => {
      error.remove();
    }, 3500);
  }

  /* ========================================================
     HISTORY
  ======================================================== */

  function loadHistory() {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          state.history = parsed;
        }
      }
    } catch (error) {
      state.history = [];
    }

    renderHistory();
  }

  function saveHistory() {
    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(state.history.slice(0, 50))
      );
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function addHistory(tool, input, result) {
    const item = {
      tool,
      input,
      result: formatResult(result),
      time: new Date().toLocaleTimeString()
    };

    state.history.unshift(item);
    state.history = state.history.slice(0, 50);

    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    const list = $("#historyList");
    if (!list) return;

    list.innerHTML = "";

    if (!state.history.length) {
      const empty = document.createElement("div");
      empty.className = "history-empty";
      empty.textContent = "No calculations yet.";
      list.appendChild(empty);
      return;
    }

    state.history.forEach((item) => {
      const row = document.createElement("div");
      row.className = "history-item";

      const top = document.createElement("div");
      top.className = "history-item-top";

      const tool = document.createElement("strong");
      tool.textContent = item.tool;

      const time = document.createElement("span");
      time.textContent = item.time;

      top.appendChild(tool);
      top.appendChild(time);

      const input = document.createElement("div");
      input.className = "history-input";
      input.textContent = item.input;

      const result = document.createElement("div");
      result.className = "history-result";
      result.textContent = item.result;

      row.appendChild(top);
      row.appendChild(input);
      row.appendChild(result);

      list.appendChild(row);
    });
  }

  function clearHistory() {
    state.history = [];

    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {}

    renderHistory();
  }

  /* ========================================================
     TOOL ACTIVATION
  ======================================================== */

  function findPanel(tool) {
    return (
      document.querySelector(`[data-panel="${tool}"]`) ||
      document.querySelector(`[data-tool="${tool}"]`) ||
      document.getElementById(`panel-${tool}`)
    );
  }

  function activateTool(tool) {
    if (!TOOL_NAMES.includes(tool)) return;

    state.activeTool = tool;

    $$(".tool-card").forEach((card) => {
      const cardTool = card.dataset.tool;

      card.classList.toggle("active", cardTool === tool);
      card.setAttribute(
        "aria-selected",
        cardTool === tool ? "true" : "false"
      );
    });

    TOOL_NAMES.forEach((name) => {
      const panel = findPanel(name);

      if (!panel) return;

      panel.classList.toggle("active-panel", name === tool);
      panel.classList.toggle("active", name === tool);

      if (name === tool) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });

    const workspace = $(".tool-workspace");

    if (workspace) {
      workspace.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  function setupToolCards() {
    $$(".tool-card").forEach((card) => {
      card.addEventListener("click", () => {
        activateTool(card.dataset.tool);
      });
    });
  }

  /* ========================================================
     CALCULATOR
  ======================================================== */

  function safeExpression(expression) {
    let value = String(expression || "").trim();

    if (!value) {
      throw new Error("Enter a calculation.");
    }

    value = value
      .replace(/π/g, "Math.PI")
      .replace(/\^/g, "**")
      .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

    if (!/^[0-9+\-*/().%\sA-Za-z_*]+$/.test(value)) {
      throw new Error("Invalid expression.");
    }

    if (
      value.includes("Math.") === false &&
      /[A-Za-z]/.test(value)
    ) {
      throw new Error("Invalid expression.");
    }

    const allowed = value.replace(/Math\.(PI|E)/g, "");

    if (/[A-Za-z]/.test(allowed)) {
      throw new Error("Invalid expression.");
    }

    const result = Function(
      `"use strict"; return (${value});`
    )();

    if (!Number.isFinite(result)) {
      throw new Error("Result is not finite.");
    }

    return result;
  }

  function calculateCalculator() {
    const input = $("#calculatorInput");
    if (!input) return;

    try {
      const expression = input.value.trim();

      if (!expression) {
        showError("Enter something to calculate.", input);
        return;
      }

      let result;

      if (
        window.NOVERA_CALCULATOR &&
        typeof window.NOVERA_CALCULATOR.calculate === "function"
      ) {
        result = window.NOVERA_CALCULATOR.calculate(expression);
      } else {
        result = safeExpression(expression);
      }

      const panel = $("#panel-calculator");
      const answer = getAnswerBox(panel);

      displayAnswer(answer, result);

      addHistory("Calculator", expression, result);
    } catch (error) {
      showError(
        error.message || "Could not calculate.",
        input
      );
    }
  }

  function setupCalculator() {
    const button =
      $("#calculateCalculator") ||
      $("#calculatorCalculate") ||
      $("#calculateBasic") ||
      $('[data-action="calculate-calculator"]');

    if (button) {
      button.addEventListener("click", calculateCalculator);
    }

    const input = $("#calculatorInput");

    if (input) {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          calculateCalculator();
        }
      });
    }

    $$(".calculator-mode-selector [data-calculator-mode], .calculator-mode-selector [data-mode]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const mode =
            button.dataset.calculatorMode ||
            button.dataset.mode;

          if (mode) {
            state.calculatorMode = mode;
          }

          $$(".calculator-mode-selector button").forEach((b) => {
            b.classList.toggle("active", b === button);
          });
        });
      });

    $$("[data-expression]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const expression =
          chip.dataset.expression ||
          chip.dataset.value ||
          chip.textContent.trim();

        if (input) {
          input.value = expression;
          input.focus();
        }
      });
    });
  }

  /* ========================================================
     GENERIC ENGINE CALLER
  ======================================================== */

  function callEngine(engine, method, args) {
    if (
      engine &&
      typeof engine[method] === "function"
    ) {
      return engine[method](...args);
    }

    return null;
  }

  /* ========================================================
     ALGEBRA
  ======================================================== */

  function solveAlgebra() {
    const input = $("#algebraInput");
    if (!input) return;

    const expression = input.value.trim();

    if (!expression) {
      showError("Enter an equation or expression.", input);
      return;
    }

    try {
      let result = null;

      const engine = window.NOVERA_ALGEBRA;

      if (engine) {
        const mode = state.algebraMode;

        if (
          mode === "linear" &&
          typeof engine.solveLinear === "function"
        ) {
          result = engine.solveLinear(expression);
        } else if (
          mode === "quadratic" &&
          typeof engine.solveQuadratic === "function"
        ) {
          result = engine.solveQuadratic(expression);
        } else if (
          mode === "simultaneous" &&
          typeof engine.solveSimultaneous === "function"
        ) {
          result = engine.solveSimultaneous(expression);
        } else if (
          mode === "ratio" &&
          typeof engine.solveRatio === "function"
        ) {
          result = engine.solveRatio(expression);
        } else if (
          typeof engine.solve === "function"
        ) {
          result = engine.solve(expression, mode);
        }
      }

      if (result === null) {
        result = "Enter a valid algebra problem.";
      }

      const answer = getAnswerBox($("#panel-algebra"));
      displayAnswer(answer, result);

      addHistory("Algebra", expression, result);
    } catch (error) {
      showError(
        error.message || "Could not solve.",
        input
      );
    }
  }

  function setupAlgebra() {
    $$(".algebra-mode-selector [data-algebra-mode], .algebra-mode-selector [data-mode]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          state.algebraMode =
            button.dataset.algebraMode ||
            button.dataset.mode ||
            state.algebraMode;

          $$(".algebra-mode-selector button").forEach((b) => {
            b.classList.toggle("active", b === button);
          });
        });
      });

    const button =
      $("#solveAlgebra") ||
      $('[data-action="solve-algebra"]');

    if (button) {
      button.addEventListener("click", solveAlgebra);
    }

    const input = $("#algebraInput");

    if (input) {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          solveAlgebra();
        }
      });
    }
  }

  /* ========================================================
     GRAPH
  ======================================================== */

  function setupGraph() {
    $$(".graph-options [data-graph-type], .graph-options [data-mode]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          state.graphMode =
            button.dataset.graphType ||
            button.dataset.mode ||
            state.graphMode;

          $$(".graph-options button").forEach((b) => {
            b.classList.toggle("active", b === button);
          });
        });
      });

    const button =
      $("#plotGraph") ||
      $('[data-action="plot-graph"]');

    if (button) {
      button.addEventListener("click", plotGraph);
    }
  }

  function plotGraph() {
    const input = $("#graphInput");
    if (!input) return;

    const expression = input.value.trim();

    if (!expression) {
      showError("Enter a function or equation.", input);
      return;
    }

    try {
      let result = null;

      const engine = window.NOVERA_GRAPH;

      if (engine) {
        if (
          typeof engine.plot === "function"
        ) {
          result = engine.plot(
            expression,
            state.graphMode
          );
        } else if (
          typeof engine.generate === "function"
        ) {
          result = engine.generate(
            expression,
            state.graphMode
          );
        } else if (
          typeof engine.solve === "function"
        ) {
          result = engine.solve(
            expression,
            state.graphMode
          );
        }
      }

      const answer = getAnswerBox($("#panel-graph"));

      if (answer) {
        displayAnswer(
          answer,
          result || "Graph generated."
        );
      }

      addHistory(
        "Graph",
        expression,
        result || "Graph generated."
      );
    } catch (error) {
      showError(
        error.message || "Could not generate graph.",
        input
      );
    }
  }

  /* ========================================================
     PHYSICS
  ======================================================== */

  const physicsFields = {
    speed: [
      ["distance", "Distance"],
      ["time", "Time"]
    ],

    force: [
      ["mass", "Mass"],
      ["acceleration", "Acceleration"]
    ],

    energy: [
      ["mass", "Mass"],
      ["velocity", "Velocity"]
    ],

    power: [
      ["energy", "Energy"],
      ["time", "Time"]
    ],

    electricity: [
      ["voltage", "Voltage"],
      ["resistance", "Resistance"]
    ]
  };

  function renderPhysicsFields() {
    const container = $("#physicsFields");

    if (!container) return;

    const fields =
      physicsFields[state.physicsMode] ||
      physicsFields.speed;

    container.innerHTML = "";

    fields.forEach(([name, label]) => {
      const wrapper = document.createElement("div");
      wrapper.className = "field";

      const title = document.createElement("label");
      title.textContent = label;

      const input = document.createElement("input");
      input.type = "number";
      input.step = "any";
      input.dataset.field = name;
      input.placeholder = label;

      wrapper.appendChild(title);
      wrapper.appendChild(input);

      container.appendChild(wrapper);
    });
  }

  function calculatePhysics() {
    const engine = window.NOVERA_PHYSICS;
    const container = $("#physicsFields");

    if (!container) return;

    const values = {};

    container.querySelectorAll("[data-field]").forEach((input) => {
      values[input.dataset.field] =
        safeNumber(input.value);
    });

    try {
      let result = null;

      if (engine) {
        const mode = state.physicsMode;

        if (
          mode === "speed" &&
          typeof engine.speed === "function"
        ) {
          result = engine.speed(
            values.distance,
            values.time
          );
        } else if (
          mode === "force" &&
          typeof engine.force === "function"
        ) {
          result = engine.force(
            values.mass,
            values.acceleration
          );
        } else if (
          mode === "energy" &&
          typeof engine.kineticEnergy === "function"
        ) {
          result = engine.kineticEnergy(
            values.mass,
            values.velocity
          );
        } else if (
          mode === "power" &&
          typeof engine.power === "function"
        ) {
          result = engine.power(
            values.energy,
            values.time
          );
        } else if (
          mode === "electricity" &&
          typeof engine.electricalPower === "function"
        ) {
          result = engine.electricalPower(
            values.voltage,
            values.resistance
          );
        }
      }

      if (result === null) {
        result = "Enter valid values.";
      }

      displayAnswer(
        getAnswerBox($("#panel-physics")),
        result
      );

      addHistory(
        "Physics",
        state.physicsMode,
        result
      );
    } catch (error) {
      showError(
        error.message || "Could not calculate.",
        container
      );
    }
  }

  function setupPhysics() {
    $$(".physics-selector [data-physics-mode], .physics-selector [data-mode]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          state.physicsMode =
            button.dataset.physicsMode ||
            button.dataset.mode ||
            state.physicsMode;

          $$(".physics-selector button").forEach((b) => {
            b.classList.toggle("active", b === button);
          });

          renderPhysicsFields();
        });
      });

    const button =
      $("#calculatePhysics") ||
      $('[data-action="calculate-physics"]');

    if (button) {
      button.addEventListener(
        "click",
        calculatePhysics
      );
    }

    renderPhysicsFields();
  }

  /* ========================================================
     CHEMISTRY
  ======================================================== */

  const chemistryFields = {
    moles: [
      ["mass", "Mass"],
      ["molarMass", "Molar mass"]
    ],

    molarity: [
      ["moles", "Moles"],
      ["volume", "Volume"]
    ],

    gas: [
      ["pressure", "Pressure"],
      ["volume", "Volume"],
      ["temperature", "Temperature"]
    ],

    ph: [
      ["concentration", "Concentration"]
    ],

    heat: [
      ["mass", "Mass"],
      ["specificHeat", "Specific heat"],
      ["deltaTemperature", "Temperature change"]
    ]
  };

  function renderChemistryFields() {
    const container = $("#chemistryFields");

    if (!container) return;

    const fields =
      chemistryFields[state.chemistryMode] ||
      chemistryFields.moles;

    container.innerHTML = "";

    fields.forEach(([name, label]) => {
      const wrapper = document.createElement("div");
      wrapper.className = "field";

      const title = document.createElement("label");
      title.textContent = label;

      const input = document.createElement("input");
      input.type = "number";
      input.step = "any";
      input.dataset.field = name;
      input.placeholder = label;

      wrapper.appendChild(title);
      wrapper.appendChild(input);

      container.appendChild(wrapper);
    });
  }

  function calculateChemistry() {
    const engine = window.NOVERA_CHEMISTRY;
    const container = $("#chemistryFields");

    if (!container) return;

    const values = {};

    container.querySelectorAll("[data-field]").forEach((input) => {
      values[input.dataset.field] =
        safeNumber(input.value);
    });

    try {
      let result = null;

      if (engine) {
        const mode = state.chemistryMode;

        if (
          mode === "moles" &&
          typeof engine.molesFromMass === "function"
        ) {
          result = engine.molesFromMass(
            values.mass,
            values.molarMass
          );
        } else if (
          mode === "molarity" &&
          typeof engine.molarity === "function"
        ) {
          result = engine.molarity(
            values.moles,
            values.volume
          );
        } else if (
          mode === "gas" &&
          typeof engine.idealGasVolume === "function"
        ) {
          result = engine.idealGasVolume(
            values.pressure,
            values.temperature
          );
        } else if (
          mode === "ph" &&
          typeof engine.pH === "function"
        ) {
          result = engine.pH(
            values.concentration
          );
        } else if (
          mode === "heat" &&
          typeof engine.heat === "function"
        ) {
          result = engine.heat(
            values.mass,
            values.specificHeat,
            values.deltaTemperature
          );
        }
      }

      if (result === null) {
        result = "Enter valid values.";
      }

      displayAnswer(
        getAnswerBox($("#panel-chemistry")),
        result
      );

      addHistory(
        "Chemistry",
        state.chemistryMode,
        result
      );
    } catch (error) {
      showError(
        error.message || "Could not calculate.",
        container
      );
    }
  }

  function setupChemistry() {
    $$(".chemistry-selector [data-chemistry-mode], .chemistry-selector [data-mode]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          state.chemistryMode =
            button.dataset.chemistryMode ||
            button.dataset.mode ||
            state.chemistryMode;

          $$(".chemistry-selector button").forEach((b) => {
            b.classList.toggle("active", b === button);
          });

          renderChemistryFields();
        });
      });

    const button =
      $("#calculateChemistry") ||
      $('[data-action="calculate-chemistry"]');

    if (button) {
      button.addEventListener(
        "click",
        calculateChemistry
      );
    }

    renderChemistryFields();
  }

  /* ========================================================
     STATISTICS
  ======================================================== */

  function parseNumbers(value) {
    return String(value || "")
      .split(/[\s,;]+/)
      .map(Number)
      .filter(Number.isFinite);
  }

  function calculateStatistics() {
    const input = $("#statisticsInput");
    if (!input) return;

    const numbers = parseNumbers(input.value);

    if (!numbers.length) {
      showError(
        "Enter numbers separated by commas.",
        input
      );
      return;
    }

    try {
      let result = null;
      const engine = window.NOVERA_STATISTICS;

      if (engine) {
        const mode = state.statisticsMode;

        if (
          mode === "mean" &&
          typeof engine.mean === "function"
        ) {
          result = engine.mean(numbers);
        } else if (
          mode === "median" &&
          typeof engine.median === "function"
        ) {
          result = engine.median(numbers);
        } else if (
          mode === "mode" &&
          typeof engine.mode === "function"
        ) {
          result = engine.mode(numbers);
        } else if (
          mode === "range" &&
          typeof engine.range === "function"
        ) {
          result = engine.range(numbers);
        } else if (
          mode === "sd" &&
          typeof engine.standardDeviation === "function"
        ) {
          result = engine.standardDeviation(numbers);
        }
      }

      if (result === null) {
        const sum = numbers.reduce(
          (a, b) => a + b,
          0
        );

        if (state.statisticsMode === "mean") {
          result = sum / numbers.length;
        } else if (
          state.statisticsMode === "median"
        ) {
          const sorted = [...numbers].sort(
            (a, b) => a - b
          );

          const middle =
            Math.floor(sorted.length / 2);

          result =
            sorted.length % 2
              ? sorted[middle]
              : (sorted[middle - 1] +
                  sorted[middle]) /
                2;
        } else if (
          state.statisticsMode === "range"
        ) {
          result =
            Math.max(...numbers) -
            Math.min(...numbers);
        } else if (
          state.statisticsMode === "mode"
        ) {
          const counts = {};

          numbers.forEach((n) => {
            counts[n] =
              (counts[n] || 0) + 1;
          });

          const max =
            Math.max(...Object.values(counts));

          result = Object.keys(counts)
            .filter(
              (key) =>
                counts[key] === max
            )
            .join(", ");
        } else if (
          state.statisticsMode === "sd"
        ) {
          const mean =
            sum / numbers.length;

          result = Math.sqrt(
            numbers.reduce(
              (total, n) =>
                total +
                Math.pow(n - mean, 2),
              0
            ) / numbers.length
          );
        }
      }

      displayAnswer(
        getAnswerBox($("#panel-statistics")),
        result
      );

      addHistory(
        "Statistics",
        input.value,
        result
      );
    } catch (error) {
      showError(
        error.message || "Could not analyse data.",
        input
      );
    }
  }

  function setupStatistics() {
    $$(".statistics-selector [data-statistics-mode], .statistics-selector [data-mode]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          state.statisticsMode =
            button.dataset.statisticsMode ||
            button.dataset.mode ||
            state.statisticsMode;

          $$(".statistics-selector button").forEach((b) => {
            b.classList.toggle("active", b === button);
          });
        });
      });

    const button =
      $("#analyseStatistics") ||
      $("#statisticsAnalyse") ||
      $("#calculateStatistics") ||
      $('[data-action="calculate-statistics"]');

    if (button) {
      button.addEventListener(
        "click",
        calculateStatistics
      );
    }

    const input = $("#statisticsInput");

    if (input) {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          calculateStatistics();
        }
      });
    }
  }

  /* ========================================================
     THEME
  ======================================================== */

  function setupTheme() {
    const button = $("#themeToggle");

    if (!button) return;

    button.addEventListener("click", () => {
      const current =
        document.documentElement.dataset.theme ||
        document.body.dataset.theme;

      const next =
        current === "light"
          ? "dark"
          : "light";

      document.documentElement.dataset.theme =
        next;

      document.body.dataset.theme = next;

      try {
        localStorage.setItem(
          "novera_theme",
          next
        );
      } catch (error) {}

      updateThemeIcon();
    });

    try {
      const saved =
        localStorage.getItem(
          "novera_theme"
        );

      if (saved) {
        document.documentElement.dataset.theme =
          saved;

        document.body.dataset.theme =
          saved;
      }
    } catch (error) {}

    updateThemeIcon();
  }

  function updateThemeIcon() {
    const icon = $("#themeIcon");

    if (!icon) return;

    const theme =
      document.documentElement.dataset.theme ||
      document.body.dataset.theme ||
      "dark";

    icon.textContent =
      theme === "light"
        ? "☀"
        : "☾";
  }

  /* ========================================================
     HERO BUTTONS
  ======================================================== */

  function setupHeroButtons() {
    const start = $("#startToolkit");

    if (start) {
      start.addEventListener("click", () => {
        activateTool("calculator");
      });
    }

    const all = $("#showAllTools");

    if (all) {
      all.addEventListener("click", () => {
        const section =
          $(".tool-grid") ||
          $(".tool-cards") ||
          $(".tools-section");

        if (section) {
          section.scrollIntoView({
            behavior: "smooth"
          });
        }
      });
    }
  }

  /* ========================================================
     CLEAR WORKSPACE
  ======================================================== */

  function setupClearWorkspace() {
    const button = $("#clearWorkspace");

    if (!button) return;

    button.addEventListener("click", () => {
      const panel =
        findPanel(state.activeTool);

      if (!panel) return;

      panel
        .querySelectorAll("input, textarea")
        .forEach((input) => {
          input.value = "";
        });

      panel
        .querySelectorAll(
          ".result-value, .tool-result, .result, [data-result], .answer"
        )
        .forEach((result) => {
          result.textContent = "";
        });

      if (state.activeTool === "physics") {
        renderPhysicsFields();
      }

      if (state.activeTool === "chemistry") {
        renderChemistryFields();
      }
    });
  }

  /* ========================================================
     MOBILE MENU
  ======================================================== */

  function setupMobileMenu() {
    const button =
      $("#menuToggle") ||
      $("#mobileMenuToggle");

    const menu =
      $("#mobileMenu") ||
      $(".mobile-menu");

    if (!button || !menu) return;

    button.addEventListener("click", () => {
      menu.classList.toggle("open");
      button.classList.toggle("open");
    });
  }

  /* ========================================================
     REVEAL ANIMATION
  ======================================================== */

  function setupReveal() {
    const elements = $$(".reveal");

    if (!elements.length) return;

    if (
      !("IntersectionObserver" in window)
    ) {
      elements.forEach((el) =>
        el.classList.add("revealed")
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                "revealed"
              );

              observer.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.08
        }
      );

    elements.forEach((el) =>
      observer.observe(el)
    );
  }

  /* ========================================================
     KEYBOARD
  ======================================================== */

  function setupKeyboard() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.ctrlKey &&
          event.key === "Enter"
        ) {
          event.preventDefault();

          if (
            state.activeTool ===
            "calculator"
          ) {
            calculateCalculator();
          }

          if (
            state.activeTool ===
            "algebra"
          ) {
            solveAlgebra();
          }

          if (
            state.activeTool ===
            "physics"
          ) {
            calculatePhysics();
          }

          if (
            state.activeTool ===
            "chemistry"
          ) {
            calculateChemistry();
          }

          if (
            state.activeTool ===
            "statistics"
          ) {
            calculateStatistics();
          }
        }
      }
    );
  }

  /* ========================================================
     INIT
  ======================================================== */

  function init() {
    setupToolCards();

    setupCalculator();
    setupAlgebra();
    setupGraph();
    setupPhysics();
    setupChemistry();
    setupStatistics();

    setupTheme();
    setupHeroButtons();
    setupClearWorkspace();
    setupMobileMenu();
    setupReveal();
    setupKeyboard();

    loadHistory();

    activateTool("calculator");
  }

  /* ========================================================
     PUBLIC API
  ======================================================== */

  window.NOVERA_TOOLKIT = {
    state,
    activateTool,
    calculateCalculator,
    solveAlgebra,
    plotGraph,
    calculatePhysics,
    calculateChemistry,
    calculateStatistics,
    clearHistory
  };

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();
