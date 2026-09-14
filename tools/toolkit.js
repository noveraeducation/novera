/* ========================================================
   NOVERA TOOLKIT — CONTROLLER
   Version 2.0
   Connects the existing Novera tool engines to the UI.

   Works with:
   Calculator
   Algebra
   Graph
   Physics
   Chemistry
   Statistics

   No backend
   No API
   No external library
======================================================== */

(() => {
  "use strict";

  /* ======================================================
     STATE
  ====================================================== */

  const state = {
    activeTool: "calculator",
    calculatorMode: "basic",
    algebraMode: "linear",
    graphMode: "auto",
    physicsMode: "speed",
    chemistryMode: "moles",
    statisticsMode: "mean",
    history: [],
    memory: 0
  };

  const TOOL_NAMES = [
    "calculator",
    "algebra",
    "graph",
    "physics",
    "chemistry",
    "statistics"
  ];

  const HISTORY_KEY = "novera_toolkit_history_v2";
  const MEMORY_KEY = "novera_calculator_memory_v2";

  /* ======================================================
     DOM HELPERS
  ====================================================== */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  function byId(id) {
    return document.getElementById(id);
  }

  function text(value) {
    if (value === null || value === undefined) return "";
    return String(value);
  }

  function escapeHTML(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function number(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
  }

  function cleanNumber(value) {
    const n = Number(value);

    if (!Number.isFinite(n)) return value;

    if (Math.abs(n) < 1e-12) return 0;

    return Number(n.toFixed(12));
  }

  function formatNumber(value) {
    const n = Number(value);

    if (!Number.isFinite(n)) return text(value);

    if (Math.abs(n) >= 1e10 || (Math.abs(n) > 0 && Math.abs(n) < 1e-7)) {
      return n.toExponential(8);
    }

    return Number(n.toFixed(10)).toString();
  }

  /* ======================================================
     ENGINE ACCESS
  ====================================================== */

  function engine(name) {
    return window[name] || null;
  }

  const engines = {
    calculator: () => engine("NOVERA_CALCULATOR"),
    algebra: () => engine("NOVERA_ALGEBRA"),
    graph: () => engine("NOVERA_GRAPH"),
    physics: () => engine("NOVERA_PHYSICS"),
    chemistry: () => engine("NOVERA_CHEMISTRY"),
    statistics: () => engine("NOVERA_STATISTICS")
  };

  /* ======================================================
     INITIALIZATION
  ====================================================== */

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    loadState();
    setupLoader();
    setupHeader();
    setupTheme();
    setupToolCards();
    setupPanels();

    setupCalculator();
    setupAlgebra();
    setupGraph();
    setupPhysics();
    setupChemistry();
    setupStatistics();

    setupHistory();
    setupHeroButtons();
    setupWorkspaceControls();
    setupKeyboard();
    setupReveal();

    activateTool(state.activeTool);

    updateThemeIcon();
    renderHistory();

    window.setTimeout(() => {
      document.body.classList.add("toolkit-ready");
    }, 80);
  }

  /* ======================================================
     LOADER
  ====================================================== */

  function setupLoader() {
    const loader = $(".loader");

    if (!loader) return;

    window.setTimeout(() => {
      loader.classList.add("loaded");

      window.setTimeout(() => {
        loader.remove();
      }, 600);
    }, 350);
  }

  /* ======================================================
     HEADER / MOBILE MENU
  ====================================================== */

  function setupHeader() {
    const menuButton =
      $("#menuToggle") ||
      $(".menu-toggle") ||
      $(".mobile-menu-button");

    const mobileMenu =
      $("#mobileMenu") ||
      $(".mobile-menu") ||
      $(".nav-mobile");

    if (!menuButton || !mobileMenu) return;

    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
      menuButton.classList.toggle("active");
    });

    $$(".mobile-menu a, .nav-mobile a").forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        menuButton.classList.remove("active");
      });
    });
  }

  /* ======================================================
     THEME
  ====================================================== */

  function setupTheme() {
    const button = $("#themeToggle");

    if (!button) return;

    const savedTheme =
      localStorage.getItem("novera-toolkit-theme");

    if (savedTheme === "light") {
      document.documentElement.classList.add("light-theme");
      document.body.classList.add("light-theme");
    } else if (savedTheme === "dark") {
      document.documentElement.classList.remove("light-theme");
      document.body.classList.remove("light-theme");
    }

    button.addEventListener("click", () => {
      const light =
        document.documentElement.classList.toggle("light-theme");

      document.body.classList.toggle("light-theme", light);

      localStorage.setItem(
        "novera-toolkit-theme",
        light ? "light" : "dark"
      );

      updateThemeIcon();
    });
  }

  function updateThemeIcon() {
    const icon = $("#themeIcon");

    if (!icon) return;

    const isLight =
      document.documentElement.classList.contains("light-theme") ||
      document.body.classList.contains("light-theme");

    icon.textContent = isLight ? "☾" : "☼";
  }

  /* ======================================================
     TOOL CARDS
  ====================================================== */

  function setupToolCards() {
    $$(".tool-card").forEach(card => {
      const tool =
        card.dataset.tool ||
        card.getAttribute("data-tool");

      if (!TOOL_NAMES.includes(tool)) return;

      card.addEventListener("click", event => {
        event.preventDefault();
        activateTool(tool);
      });

      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateTool(tool);
        }
      });
    });
  }

  function activateTool(tool) {
    if (!TOOL_NAMES.includes(tool)) {
      tool = "calculator";
    }

    state.activeTool = tool;

    $$(".tool-card").forEach(card => {
      const cardTool =
        card.dataset.tool ||
        card.getAttribute("data-tool");

      card.classList.toggle(
        "active",
        cardTool === tool
      );
    });

    $$(".tool-panel").forEach(panel => {
      const panelTool =
        panel.dataset.tool ||
        panel.dataset.panel ||
        panel.id?.replace(/^panel-/, "");

      panel.classList.toggle(
        "active-panel",
        panelTool === tool
      );

      panel.classList.toggle(
        "active",
        panelTool === tool
      );
    });

    const workspace = $(".workspace-section");

    if (workspace && window.innerWidth < 900) {
      workspace.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    saveState();
  }

  /* ======================================================
     PANELS
  ====================================================== */

  function setupPanels() {
    // Compatibility layer.
    // Handles both data-tool and data-panel HTML.
    $$(".tool-panel").forEach(panel => {
      if (!panel.dataset.tool) {
        const detected =
          panel.dataset.panel ||
          panel.id?.replace(/^panel-/, "");

        if (detected) {
          panel.dataset.tool = detected;
        }
      }
    });
  }

  /* ======================================================
     HERO BUTTONS
  ====================================================== */

  function setupHeroButtons() {
    const start = $("#startToolkit");
    const all = $("#showAllTools");

    if (start) {
      start.addEventListener("click", event => {
        event.preventDefault();

        activateTool("calculator");

        const workspace =
          $(".workspace-section") ||
          $(".tool-workspace");

        if (workspace) {
          workspace.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    }

    if (all) {
      all.addEventListener("click", event => {
        event.preventDefault();

        const tools =
          $(".tool-selector") ||
          $(".tools-grid") ||
          $(".tool-cards");

        if (tools) {
          tools.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }
      });
    }
  }

  /* ======================================================
     CALCULATOR
  ====================================================== */

  function setupCalculator() {
    const input = $("#calculatorInput");

    const calculateButton =
      $("#calculateBasic") ||
      $("#calculateCalculator") ||
      $("#calculatorCalculate") ||
      $('[data-action="calculate-calculator"]');

    if (input && calculateButton) {
      calculateButton.addEventListener("click", calculateCalculator);
    }

    if (input) {
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          calculateCalculator();
        }
      });
    }

    $$("[data-calculator-mode]").forEach(button => {
      button.addEventListener("click", () => {
        const mode =
          button.dataset.calculatorMode;

        if (!mode) return;

        state.calculatorMode = mode;

        $$("[data-calculator-mode]").forEach(item => {
          item.classList.toggle(
            "active",
            item === button
          );
        });

        saveState();
      });
    });

    // Compatibility with older HTML.
    $$("[data-mode]").forEach(button => {
      if (
        button.closest("#panel-calculator") &&
        button.dataset.mode
      ) {
        button.addEventListener("click", () => {
          state.calculatorMode = button.dataset.mode;
          saveState();
        });
      }
    });

    $$(".quick-chip, [data-expression]").forEach(chip => {
      chip.addEventListener("click", () => {
        const value =
          chip.dataset.expression ||
          chip.dataset.value ||
          chip.textContent.trim();

        if (!input) return;

        input.value = value;
        input.focus();
      });
    });

    const memoryButtons = $$(
      "[data-calculator-memory], [data-memory]"
    );

    memoryButtons.forEach(button => {
      button.addEventListener("click", () => {
        const action =
          button.dataset.calculatorMemory ||
          button.dataset.memory;

        handleMemory(action);
      });
    });
  }

  function calculateCalculator() {
    const input = $("#calculatorInput");

    if (!input) return;

    const expression = input.value.trim();

    if (!expression) {
      showError(input, "Enter a calculation first.");
      return;
    }

    try {
      let result;

      const calc = engines.calculator();

      if (calc) {
        result = tryCalculatorEngine(
          calc,
          expression,
          state.calculatorMode
        );
      }

      if (
        result === undefined ||
        result === null ||
        (typeof result === "number" && !Number.isFinite(result))
      ) {
        result = calculateExpression(expression);
      }

      renderAnswer(
        findAnswerContainer("calculator"),
        result,
        "Result"
      );

      addHistory(
        "Calculator",
        expression,
        result
      );
    } catch (error) {
      showError(
        input,
        error.message || "Unable to calculate this expression."
      );
    }
  }

  function tryCalculatorEngine(calc, expression, mode) {
    const candidates = [
      ["calculate", [expression, mode]],
      ["evaluate", [expression]],
      ["basic", [expression]],
      ["solve", [expression]],
      ["calculateExpression", [expression]]
    ];

    for (const [method, args] of candidates) {
      if (typeof calc[method] === "function") {
        try {
          const result = calc[method](...args);

          if (result !== undefined) {
            return result;
          }
        } catch (_) {
          // Continue to local fallback.
        }
      }
    }

    return undefined;
  }

  /* ======================================================
     SAFE CALCULATOR
  ====================================================== */

  function calculateExpression(expression) {
    let expr = expression
      .replace(/π/g, "Math.PI")
      .replace(/pi/gi, "Math.PI")
      .replace(/\^/g, "**")
      .replace(/×/g, "*")
      .replace(/÷/g, "/");

    // Percentage:
    // 50% → 0.5
    expr = expr.replace(
      /(\d+(?:\.\d+)?)%/g,
      "($1/100)"
    );

    // Allow only safe mathematical syntax.
    if (
      !/^[0-9+\-*/%().,\sA-Za-z_]+$/.test(expr)
    ) {
      throw new Error("Unsupported characters.");
    }

    const allowedNames = [
      "Math.PI",
      "Math.E"
    ];

    let test = expr;

    allowedNames.forEach(name => {
      test = test.replaceAll(name, "");
    });

    if (/[A-Za-z_$]/.test(test)) {
      throw new Error("Unknown mathematical function.");
    }

    try {
      // The expression has already passed a strict character
      // whitelist and contains no user-controlled identifiers.
      const result = Function(
        `"use strict"; return (${expr});`
      )();

      if (!Number.isFinite(result)) {
        throw new Error("The result is not a finite number.");
      }

      return cleanNumber(result);
    } catch (_) {
      throw new Error("Invalid mathematical expression.");
    }
  }

  /* ======================================================
     MEMORY
  ====================================================== */

  function handleMemory(action) {
    const input = $("#calculatorInput");

    if (!action) return;

    if (action === "clear" || action === "mc") {
      state.memory = 0;
    }

    if (action === "recall" || action === "mr") {
      if (input) {
        input.value = formatNumber(state.memory);
      }
    }

    if (action === "add" || action === "m+") {
      const value = input
        ? calculateExpression(input.value)
        : 0;

      state.memory += Number(value) || 0;
    }

    if (action === "subtract" || action === "m-") {
      const value = input
        ? calculateExpression(input.value)
        : 0;

      state.memory -= Number(value) || 0;
    }

    localStorage.setItem(
      MEMORY_KEY,
      String(state.memory)
    );
  }

  /* ======================================================
     ALGEBRA
  ====================================================== */

  function setupAlgebra() {
    $$("[data-algebra-mode]").forEach(button => {
      button.addEventListener("click", () => {
        state.algebraMode =
          button.dataset.algebraMode;

        $$("[data-algebra-mode]").forEach(item => {
          item.classList.toggle(
            "active",
            item === button
          );
        });

        saveState();
      });
    });

    const solve =
      $("#solveAlgebra") ||
      $("#algebraSolve") ||
      $('[data-action="solve-algebra"]');

    if (solve) {
      solve.addEventListener("click", solveAlgebra);
    }

    const input = $("#algebraInput");

    if (input) {
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          solveAlgebra();
        }
      });
    }
  }

  function solveAlgebra() {
    const input = $("#algebraInput");

    if (!input) return;

    const value = input.value.trim();

    if (!value) {
      showError(input, "Enter an equation or expression.");
      return;
    }

    try {
      let result;

      const algebra = engines.algebra();

      if (algebra) {
        result = tryAlgebraEngine(
          algebra,
          value,
          state.algebraMode
        );
      }

      if (result === undefined) {
        result = localAlgebraSolver(
          value,
          state.algebraMode
        );
      }

      renderSmartAnswer(
        findAnswerContainer("algebra"),
        result,
        "Solution"
      );

      addHistory(
        "Algebra",
        value,
        result
      );
    } catch (error) {
      showError(
        input,
        error.message || "Unable to solve this."
      );
    }
  }

  function tryAlgebraEngine(algebra, input, mode) {
    const methods = [
      ["solve", [input, mode]],
      ["solveEquation", [input]],
      ["linearEquation", [input]],
      ["quadraticEquation", [input]],
      ["simultaneous", [input]],
      ["ratio", [input]]
    ];

    for (const [method, args] of methods) {
      if (typeof algebra[method] === "function") {
        try {
          const result = algebra[method](...args);

          if (result !== undefined) {
            return result;
          }
        } catch (_) {}
      }
    }

    return undefined;
  }

  function localAlgebraSolver(input, mode) {
    const clean = input
      .replace(/[−–—]/g, "-")
      .replace(/\s+/g, "");

    if (mode === "quadratic") {
      return solveQuadratic(clean);
    }

    if (mode === "simultaneous") {
      return solveSimultaneous(clean);
    }

    if (mode === "ratio") {
      return solveRatio(clean);
    }

    if (
      mode === "linear" ||
      clean.includes("=")
    ) {
      return solveLinear(clean);
    }

    return {
      expression: clean,
      value: calculateExpression(clean)
    };
  }

  function solveLinear(equation) {
    const parts = equation.split("=");

    if (parts.length !== 2) {
      throw new Error(
        "Use an equation such as 2x + 4 = 10."
      );
    }

    const left = parts[0];
    const right = parts[1];

    const a = coefficientOfX(left) -
              coefficientOfX(right);

    const b = constantOfExpression(left) -
              constantOfExpression(right);

    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) < 1e-12) {
        return { result: "Infinitely many solutions." };
      }

      return { result: "No solution." };
    }

    return {
      variable: "x",
      value: cleanNumber(-b / a),
      equation
    };
  }

  function coefficientOfX(expr) {
    const normalized = expr
      .replace(/\*/g, "")
      .replace(/-/g, "+-");

    let coefficient = 0;

    normalized
      .split("+")
      .forEach(term => {
        if (term.includes("x")) {
          const c = term.replace("x", "");

          if (c === "" || c === "+") {
            coefficient += 1;
          } else if (c === "-") {
            coefficient -= 1;
          } else {
            coefficient += Number(c);
          }
        }
      });

    return coefficient;
  }

  function constantOfExpression(expr) {
    const withoutX = expr
      .replace(/-?[\d.]*x/g, "")
      .replace(/\*/g, "");

    if (!withoutX) return 0;

    try {
      return Number(
        calculateExpression(withoutX)
      );
    } catch (_) {
      return 0;
    }
  }

  function solveQuadratic(equation) {
    const parts = equation.split("=");

    if (parts.length !== 2) {
      throw new Error(
        "Use an equation such as x² + 5x + 6 = 0."
      );
    }

    let expr =
      parts[0] +
      "-(" +
      parts[1] +
      ")";

    expr = expr
      .replace(/x²/g, "x^2")
      .replace(/\*\*/g, "^");

    const a = coefficientOfPower(expr, 2);
    const b = coefficientOfPower(expr, 1);
    const c = constantOfExpression(
      expr.replace(
        /[-+]?(?:[\d.]+|\d+\/\d+)\*?x(?:\^2)?/g,
        ""
      )
    );

    if (Math.abs(a) < 1e-12) {
      return solveLinear(equation);
    }

    const discriminant =
      b * b - 4 * a * c;

    if (discriminant < 0) {
      return {
        discriminant: cleanNumber(discriminant),
        result: "No real roots.",
        complex: true
      };
    }

    const root1 =
      (-b + Math.sqrt(discriminant)) /
      (2 * a);

    const root2 =
      (-b - Math.sqrt(discriminant)) /
      (2 * a);

    return {
      a: cleanNumber(a),
      b: cleanNumber(b),
      c: cleanNumber(c),
      discriminant: cleanNumber(discriminant),
      roots: [
        cleanNumber(root1),
        cleanNumber(root2)
      ]
    };
  }

  function coefficientOfPower(expr, power) {
    const regex =
      new RegExp(
        `([+-]?(?:\\\\d+(?:\\\\.\\\\d+)?))?\\\\*?x(?:\\\\^${power})`
      );

    const match = expr.match(regex);

    if (!match) {
      if (power === 1) {
        return coefficientOfX(expr);
      }

      return 0;
    }

    const c = match[1];

    if (!c || c === "+") return 1;
    if (c === "-") return -1;

    return Number(c);
  }

  function solveSimultaneous(input) {
    const equations = input
      .split(/[;\n]+/)
      .map(x => x.trim())
      .filter(Boolean);

    if (equations.length !== 2) {
      throw new Error(
        "Enter two equations separated by a semicolon."
      );
    }

    const p1 = equations[0].split("=");
    const p2 = equations[1].split("=");

    if (p1.length !== 2 || p2.length !== 2) {
      throw new Error("Both equations need = signs.");
    }

    const e1 =
      p1[0] +
      "-(" +
      p1[1] +
      ")";

    const e2 =
      p2[0] +
      "-(" +
      p2[1] +
      ")";

    const a1 = coefficientOfVariable(e1, "x");
    const b1 = coefficientOfVariable(e1, "y");
    const c1 = -constantOfExpression(e1);

    const a2 = coefficientOfVariable(e2, "x");
    const b2 = coefficientOfVariable(e2, "y");
    const c2 = -constantOfExpression(e2);

    const determinant =
      a1 * b2 - a2 * b1;

    if (Math.abs(determinant) < 1e-12) {
      throw new Error(
        "The equations do not have one unique solution."
      );
    }

    const x =
      (c1 * b2 - c2 * b1) /
      determinant;

    const y =
      (a1 * c2 - a2 * c1) /
      determinant;

    return {
      x: cleanNumber(x),
      y: cleanNumber(y)
    };
  }

  function coefficientOfVariable(expr, variable) {
    const cleaned = expr
      .replace(/\*/g, "")
      .replace(/-/g, "+-");

    let result = 0;

    cleaned.split("+").forEach(term => {
      if (!term.includes(variable)) return;

      const coefficient =
        term.replace(variable, "");

      if (coefficient === "") {
        result += 1;
      } else if (coefficient === "-") {
        result -= 1;
      } else {
        result += Number(coefficient);
      }
    });

    return result;
  }

  function solveRatio(input) {
    const parts = input.split(":");

    if (parts.length !== 2) {
      throw new Error(
        "Use a ratio such as 2:3 = x:12."
      );
    }

    const left = parts[0].split("=");

    if (left.length === 2) {
      const a = Number(left[0]);
      const b = Number(parts[1]);
      const c = Number(left[1]);

      if (
        Number.isFinite(a) &&
        Number.isFinite(b) &&
        Number.isFinite(c) &&
        a !== 0
      ) {
        return {
          x: cleanNumber((b * c) / a)
        };
      }
    }

    throw new Error("Could not understand the ratio.");
  }

  /* ======================================================
     GRAPH
  ====================================================== */

  function setupGraph() {
    $$("[data-graph-type]").forEach(button => {
      button.addEventListener("click", () => {
        state.graphMode =
          button.dataset.graphType;

        $$("[data-graph-type]").forEach(item => {
          item.classList.toggle(
            "active",
            item === button
          );
        });

        saveState();
      });
    });

    const plot =
      $("#plotGraph") ||
      $("#generateGraph") ||
      $('[data-action="plot-graph"]');

    if (plot) {
      plot.addEventListener("click", plotGraph);
    }

    const input = $("#graphInput");

    if (input) {
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          plotGraph();
        }
      });
    }
  }

  function plotGraph() {
    const input = $("#graphInput");

    if (!input) return;

    const expression = input.value.trim();

    if (!expression) {
      showError(
        input,
        "Enter a function such as y = 2x + 1."
      );
      return;
    }

    try {
      let result;

      const graph = engines.graph();

      if (graph) {
        result = tryGraphEngine(
          graph,
          expression,
          state.graphMode
        );
      }

      if (result === undefined) {
        result = localGraph(
          expression,
          state.graphMode
        );
      }

      renderGraph(result);

      addHistory(
        "Graph",
        expression,
        "Graph generated"
      );
    } catch (error) {
      showError(
        input,
        error.message || "Unable to generate graph."
      );
    }
  }

  function tryGraphEngine(graph, expression, mode) {
    const methods = [
      ["plot", [expression, mode]],
      ["graph", [expression, mode]],
      ["generate", [expression, mode]],
      ["generatePoints", [expression, mode]],
      ["linear", [expression]],
      ["quadratic", [expression]],
      ["trig", [expression]]
    ];

    for (const [method, args] of methods) {
      if (typeof graph[method] === "function") {
        try {
          const result = graph[method](...args);

          if (result !== undefined) {
            return result;
          }
        } catch (_) {}
      }
    }

    return undefined;
  }

  function localGraph(expression, mode) {
    const canvas =
      $("#graphCanvas") ||
      $(".graph-canvas");

    if (!canvas) {
      return {
        expression,
        message: "Graph generated."
      };
    }

    const fn = compileGraphFunction(
      expression
    );

    const points = [];

    for (let x = -10; x <= 10; x += 0.1) {
      try {
        const y = fn(x);

        if (Number.isFinite(y)) {
          points.push({
            x,
            y
          });
        }
      } catch (_) {}
    }

    return {
      expression,
      points
    };
  }

  function compileGraphFunction(expression) {
    let expr = expression
      .toLowerCase()
      .replace(/y\s*=/, "")
      .replace(/\^/g, "**")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "Math.PI");

    expr = expr.replace(
      /\bsin\b/g,
      "Math.sin"
    );

    expr = expr.replace(
      /\bcos\b/g,
      "Math.cos"
    );

    expr = expr.replace(
      /\btan\b/g,
      "Math.tan"
    );

    expr = expr.replace(
      /\bsqrt\b/g,
      "Math.sqrt"
    );

    expr = expr.replace(
      /\blog\b/g,
      "Math.log10"
    );

    expr = expr.replace(
      /\bln\b/g,
      "Math.log"
    );

    expr = expr.replace(
      /(?<![A-Za-z])e(?![A-Za-z])/g,
      "Math.E"
    );

    if (!/^[0-9x+\-*/().,\sA-Za-z_*]+$/.test(expr)) {
      throw new Error("Unsupported graph expression.");
    }

    const unknown =
      expr
        .replaceAll("Math.sin", "")
        .replaceAll("Math.cos", "")
        .replaceAll("Math.tan", "")
        .replaceAll("Math.sqrt", "")
        .replaceAll("Math.log10", "")
        .replaceAll("Math.log", "")
        .replaceAll("Math.PI", "")
        .replaceAll("Math.E", "")
        .replaceAll("x", "");

    if (/[A-Za-z_]/.test(unknown)) {
      throw new Error("Unknown graph function.");
    }

    return function(x) {
      return Function(
        "x",
        `"use strict"; return (${expr});`
      )(x);
    };
  }

  /* ======================================================
     GRAPH RENDERING
  ====================================================== */

  function renderGraph(result) {
    const container =
      $("#graphOutput") ||
      $("#graphResult") ||
      $(".graph-output") ||
      $(".graph-result");

    const canvas =
      $("#graphCanvas") ||
      $(".graph-canvas");

    if (canvas && canvas.tagName === "CANVAS") {
      drawGraphCanvas(canvas, result);
    }

    if (container) {
      const expression =
        result?.expression || "";

      const points =
        normalizePoints(result?.points);

      container.innerHTML = `
        <div class="answer-card">
          <div class="answer-label">GRAPH</div>
          <div class="answer-value">
            ${escapeHTML(expression || "Graph generated")}
          </div>
          ${
            points.length
              ? `<div class="answer-meta">${points.length} plotted points</div>`
              : ""
          }
        </div>
      `;
    }
  }

  function normalizePoints(points) {
    if (!Array.isArray(points)) return [];

    return points
      .map(point => {
        if (Array.isArray(point)) {
          return {
            x: Number(point[0]),
            y: Number(point[1])
          };
        }

        if (
          point &&
          Number.isFinite(Number(point.x)) &&
          Number.isFinite(Number(point.y))
        ) {
          return {
            x: Number(point.x),
            y: Number(point.y)
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  function drawGraphCanvas(canvas, result) {
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const width =
      canvas.clientWidth || 600;

    const height =
      canvas.clientHeight || 360;

    const ratio =
      window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    const points =
      normalizePoints(result?.points);

    if (!points.length) return;

    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const pad = 35;

    const scaleX =
      (width - pad * 2) /
      ((maxX - minX) || 1);

    const scaleY =
      (height - pad * 2) /
      ((maxY - minY) || 1);

    const mapX =
      x =>
        pad +
        (x - minX) * scaleX;

    const mapY =
      y =>
        height -
        pad -
        (y - minY) * scaleY;

    ctx.beginPath();

    points.forEach((point, index) => {
      const x = mapX(point.x);
      const y = mapY(point.y);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }

  /* ======================================================
     PHYSICS
  ====================================================== */

  function setupPhysics() {
    $$("[data-physics-mode]").forEach(button => {
      button.addEventListener("click", () => {
        state.physicsMode =
          button.dataset.physicsMode;

        $$("[data-physics-mode]").forEach(item => {
          item.classList.toggle(
            "active",
            item === button
          );
        });

        renderPhysicsFields();
        saveState();
      });
    });

    const calculate =
      $("#calculatePhysics") ||
      $("#solvePhysics") ||
      $('[data-action="calculate-physics"]');

    if (calculate) {
      calculate.addEventListener(
        "click",
        calculatePhysics
      );
    }

    renderPhysicsFields();
  }

  function renderPhysicsFields() {
    const container =
      $("#physicsFields");

    if (!container) return;

    const definitions = {
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
        ["work", "Work"],
        ["time", "Time"]
      ],

      electricity: [
        ["voltage", "Voltage"],
        ["resistance", "Resistance"]
      ]
    };

    const fields =
      definitions[state.physicsMode] ||
      definitions.speed;

    container.innerHTML = fields
      .map(([name, label]) => `
        <div class="input-group">
          <label for="physics-${name}">
            ${label}
          </label>
          <input
            id="physics-${name}"
            data-field="${name}"
            type="number"
            inputmode="decimal"
            step="any"
            placeholder="Enter ${label.toLowerCase()}"
          >
        </div>
      `)
      .join("");
  }

  function calculatePhysics() {
    const container =
      $("#physicsFields");

    if (!container) return;

    const values = {};

    $$("[data-field]", container).forEach(input => {
      const raw = input.value.trim();

      if (raw === "") {
        throwPhysicsError(
          input,
          "Enter a value."
        );
      }

      const n = number(raw);

      if (!Number.isFinite(n)) {
        throwPhysicsError(
          input,
          "Enter a valid number."
        );
      }

      values[input.dataset.field] = n;
    });

    try {
      let result;

      const physics = engines.physics();

      if (physics) {
        result = tryPhysicsEngine(
          physics,
          state.physicsMode,
          values
        );
      }

      if (result === undefined) {
        result =
          localPhysics(
            state.physicsMode,
            values
          );
      }

      renderSmartAnswer(
        findAnswerContainer("physics"),
        result,
        "Physics Result"
      );

      addHistory(
        "Physics",
        state.physicsMode,
        result
      );
    } catch (error) {
      const first =
        $("[data-field]", container);

      showError(
        first,
        error.message ||
          "Unable to calculate."
      );
    }
  }

  function throwPhysicsError(input, message) {
    throw new Error(message);
  }

  function tryPhysicsEngine(
    physics,
    mode,
    values
  ) {
    const candidates = [];

    if (mode === "speed") {
      candidates.push(
        ["speed", [values.distance, values.time]],
        ["calculateSpeed", [values.distance, values.time]]
      );
    }

    if (mode === "force") {
      candidates.push(
        ["force", [values.mass, values.acceleration]],
        ["calculateForce", [values.mass, values.acceleration]]
      );
    }

    if (mode === "energy") {
      candidates.push(
        ["kineticEnergy", [values.mass, values.velocity]],
        ["energy", [values.mass, values.velocity]]
      );
    }

    if (mode === "power") {
      candidates.push(
        ["power", [values.work, values.time]]
      );
    }

    if (mode === "electricity") {
      candidates.push(
        ["current", [values.voltage, values.resistance]]
      );
    }

    candidates.push(
      ["calculate", [mode, values]],
      ["solve", [mode, values]]
    );

    for (const [method, args] of candidates) {
      if (typeof physics[method] === "function") {
        try {
          const result = physics[method](...args);

          if (result !== undefined) {
            return result;
          }
        } catch (_) {}
      }
    }

    return undefined;
  }

  function localPhysics(mode, v) {
    switch (mode) {
      case "speed":
        if (v.time === 0) {
          throw new Error(
            "Time cannot be zero."
          );
        }

        return {
          formula: "speed = distance ÷ time",
          value: cleanNumber(
            v.distance / v.time
          )
        };

      case "force":
        return {
          formula: "F = ma",
          value: cleanNumber(
            v.mass * v.acceleration
          )
        };

      case "energy":
        return {
          formula: "KE = ½mv²",
          value: cleanNumber(
            0.5 *
            v.mass *
            v.velocity *
            v.velocity
          )
        };

      case "power":
        if (v.time === 0) {
          throw new Error(
            "Time cannot be zero."
          );
        }

        return {
          formula: "P = W ÷ t",
          value: cleanNumber(
            v.work / v.time
          )
        };

      case "electricity":
        if (v.resistance === 0) {
          throw new Error(
            "Resistance cannot be zero."
          );
        }

        return {
          formula: "I = V ÷ R",
          value: cleanNumber(
            v.voltage / v.resistance
          )
        };

      default:
        throw new Error(
          "Unknown physics mode."
        );
    }
  }

  /* ======================================================
     CHEMISTRY
  ====================================================== */

  function setupChemistry() {
    $$("[data-chemistry-mode]").forEach(button => {
      button.addEventListener("click", () => {
        state.chemistryMode =
          button.dataset.chemistryMode;

        $$("[data-chemistry-mode]").forEach(item => {
          item.classList.toggle(
            "active",
            item === button
          );
        });

        renderChemistryFields();
        saveState();
      });
    });

    const calculate =
      $("#calculateChemistry") ||
      $("#solveChemistry") ||
      $('[data-action="calculate-chemistry"]');

    if (calculate) {
      calculate.addEventListener(
        "click",
        calculateChemistry
      );
    }

    renderChemistryFields();
  }

  function renderChemistryFields() {
    const container =
      $("#chemistryFields");

    if (!container) return;

    const definitions = {
      moles: [
        ["mass", "Mass"],
        ["molarMass", "Molar Mass"]
      ],

      molarity: [
        ["moles", "Moles"],
        ["volume", "Volume"]
      ],

      gas: [
        ["pressure", "Pressure"],
        ["volume", "Volume"],
        ["moles", "Moles"],
        ["temperature", "Temperature"]
      ],

      ph: [
        ["concentration", "Concentration"]
      ],

      heat: [
        ["mass", "Mass"],
        ["specificHeat", "Specific Heat"],
        ["temperatureChange", "Temperature Change"]
      ]
    };

    const fields =
      definitions[state.chemistryMode] ||
      definitions.moles;

    container.innerHTML = fields
      .map(([name, label]) => `
        <div class="input-group">
          <label for="chemistry-${name}">
            ${label}
          </label>
          <input
            id="chemistry-${name}"
            data-field="${name}"
            type="number"
            inputmode="decimal"
            step="any"
            placeholder="Enter ${label.toLowerCase()}"
          >
        </div>
      `)
      .join("");
  }

  function calculateChemistry() {
    const container =
      $("#chemistryFields");

    if (!container) return;

    const values = {};

    $$("[data-field]", container).forEach(input => {
      const raw = input.value.trim();

      if (!raw) {
        throw new Error(
          `Enter ${input.previousElementSibling?.textContent || "a value"}.`
        );
      }

      const n = Number(raw);

      if (!Number.isFinite(n)) {
        throw new Error("Enter valid numbers.");
      }

      values[input.dataset.field] = n;
    });

    try {
      let result;

      const chemistry = engines.chemistry();

      if (chemistry) {
        result = tryChemistryEngine(
          chemistry,
          state.chemistryMode,
          values
        );
      }

      if (result === undefined) {
        result =
          localChemistry(
            state.chemistryMode,
            values
          );
      }

      renderSmartAnswer(
        findAnswerContainer("chemistry"),
        result,
        "Chemistry Result"
      );

      addHistory(
        "Chemistry",
        state.chemistryMode,
        result
      );
    } catch (error) {
      const first =
        $("[data-field]", container);

      showError(
        first,
        error.message ||
          "Unable to calculate."
      );
    }
  }

  function tryChemistryEngine(
    chemistry,
    mode,
    values
  ) {
    const candidates = [];

    if (mode === "moles") {
      candidates.push(
        ["molesFromMass", [
          values.mass,
          values.molarMass
        ]],
        ["moles", [
          values.mass,
          values.molarMass
        ]]
      );
    }

    if (mode === "molarity") {
      candidates.push(
        ["molarity", [
          values.moles,
          values.volume
        ]]
      );
    }

    if (mode === "gas") {
      candidates.push(
        ["idealGas", [
          values.pressure,
          values.volume,
          values.moles,
          values.temperature
        ]]
      );
    }

    if (mode === "ph") {
      candidates.push(
        ["pH", [
          values.concentration
        ]]
      );
    }

    if (mode === "heat") {
      candidates.push(
        ["heat", [
          values.mass,
          values.specificHeat,
          values.temperatureChange
        ]]
      );
    }

    candidates.push(
      ["calculate", [mode, values]],
      ["solve", [mode, values]]
    );

    for (const [method, args] of candidates) {
      if (typeof chemistry[method] === "function") {
        try {
          const result =
            chemistry[method](...args);

          if (result !== undefined) {
            return result;
          }
        } catch (_) {}
      }
    }

    return undefined;
  }

  function localChemistry(mode, v) {
    switch (mode) {
      case "moles":
        if (v.molarMass === 0) {
          throw new Error(
            "Molar mass cannot be zero."
          );
        }

        return {
          formula: "n = m ÷ M",
          value: cleanNumber(
            v.mass / v.molarMass
          ),
          unit: "mol"
        };

      case "molarity":
        if (v.volume === 0) {
          throw new Error(
            "Volume cannot be zero."
          );
        }

        return {
          formula: "M = n ÷ V",
          value: cleanNumber(
            v.moles / v.volume
          ),
          unit: "mol/L"
        };

      case "gas":
        if (
          v.temperature === 0 ||
          v.moles === 0
        ) {
          throw new Error(
            "Temperature and moles must be non-zero."
          );
        }

        // PV = nRT
        const R = 8.314;

        return {
          formula: "PV = nRT",
          value: cleanNumber(
            (
              v.moles *
              R *
              v.temperature
            ) /
            v.volume
          ),
          unit: "pressure"
        };

      case "ph":
        if (v.concentration <= 0) {
          throw new Error(
            "Concentration must be positive."
          );
        }

        return {
          formula: "pH = −log₁₀[H⁺]",
          value: cleanNumber(
            -Math.log10(v.concentration)
          )
        };

      case "heat":
        return {
          formula: "Q = mcΔT",
          value: cleanNumber(
            v.mass *
            v.specificHeat *
            v.temperatureChange
          ),
          unit: "J"
        };

      default:
        throw new Error(
          "Unknown chemistry mode."
        );
    }
  }

  /* ======================================================
     STATISTICS
  ====================================================== */

  function setupStatistics() {
    $$("[data-statistics-mode]").forEach(button => {
      button.addEventListener("click", () => {
        state.statisticsMode =
          button.dataset.statisticsMode;

        $$("[data-statistics-mode]").forEach(item => {
          item.classList.toggle(
            "active",
            item === button
          );
        });

        saveState();
      });
    });

    const calculate =
      $("#calculateStatistics") ||
      $("#analyseStatistics") ||
      $("#statisticsAnalyse") ||
      $('[data-action="calculate-statistics"]');

    if (calculate) {
      calculate.addEventListener(
        "click",
        calculateStatistics
      );
    }

    const input = $("#statisticsInput");

    if (input) {
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          calculateStatistics();
        }
      });
    }
  }

  function parseNumbers(value) {
    const numbers =
      value
        .split(/[,\s;]+/)
        .map(Number)
        .filter(Number.isFinite);

    if (!numbers.length) {
      throw new Error(
        "Enter numbers separated by commas."
      );
    }

    return numbers;
  }

  function calculateStatistics() {
    const input =
      $("#statisticsInput");

    if (!input) return;

    try {
      const numbers =
        parseNumbers(input.value.trim());

      let result;

      const statistics =
        engines.statistics();

      if (statistics) {
        result =
          tryStatisticsEngine(
            statistics,
            state.statisticsMode,
            numbers
          );
      }

      if (result === undefined) {
        result =
          localStatistics(
            state.statisticsMode,
            numbers
          );
      }

      renderSmartAnswer(
        findAnswerContainer("statistics"),
        result,
        "Statistics Result"
      );

      addHistory(
        "Statistics",
        input.value.trim(),
        result
      );
    } catch (error) {
      showError(
        input,
        error.message ||
          "Unable to analyse the data."
      );
    }
  }

  function tryStatisticsEngine(
    statistics,
    mode,
    numbers
  ) {
    const candidates = [];

    if (mode === "mean") {
      candidates.push(
        ["mean", [numbers]]
      );
    }

    if (mode === "median") {
      candidates.push(
        ["median", [numbers]]
      );
    }

    if (mode === "mode") {
      candidates.push(
        ["mode", [numbers]]
      );
    }

    if (mode === "range") {
      candidates.push(
        ["range", [numbers]]
      );
    }

    if (
      mode === "sd" ||
      mode === "standardDeviation"
    ) {
      candidates.push(
        ["standardDeviation", [numbers]],
        ["standardDeviationPopulation", [numbers]]
      );
    }

    candidates.push(
      ["calculate", [mode, numbers]],
      ["analyse", [mode, numbers]]
    );

    for (const [method, args] of candidates) {
      if (typeof statistics[method] === "function") {
        try {
          const result =
            statistics[method](...args);

          if (result !== undefined) {
            return result;
          }
        } catch (_) {}
      }
    }

    return undefined;
  }

  function localStatistics(mode, numbers) {
    const sorted =
      [...numbers].sort((a, b) => a - b);

    switch (mode) {
      case "mean":
        return {
          mean: cleanNumber(
            numbers.reduce(
              (sum, n) => sum + n,
              0
            ) / numbers.length
          ),
          count: numbers.length
        };

      case "median":
        return {
          median:
            sorted.length % 2
              ? sorted[
                  Math.floor(sorted.length / 2)
                ]
              : cleanNumber(
                  (
                    sorted[
                      sorted.length / 2 - 1
                    ] +
                    sorted[
                      sorted.length / 2
                    ]
                  ) / 2
                )
        };

      case "mode": {
        const frequency = {};

        numbers.forEach(n => {
          frequency[n] =
            (frequency[n] || 0) + 1;
        });

        const max =
          Math.max(
            ...Object.values(frequency)
          );

        const modes =
          Object.keys(frequency)
            .filter(
              key =>
                frequency[key] === max
            )
            .map(Number);

        return {
          mode:
            max === 1
              ? "No mode"
              : modes,
          frequency: max
        };
      }

      case "range":
        return {
          minimum: sorted[0],
          maximum: sorted[sorted.length - 1],
          range: cleanNumber(
            sorted[sorted.length - 1] -
            sorted[0]
          )
        };

      case "sd": {
        const mean =
          numbers.reduce(
            (s, n) => s + n,
            0
          ) / numbers.length;

        const variance =
          numbers.reduce(
            (s, n) =>
              s +
              Math.pow(n - mean, 2),
            0
          ) / numbers.length;

        return {
          mean: cleanNumber(mean),
          variance: cleanNumber(variance),
          standardDeviation:
            cleanNumber(
              Math.sqrt(variance)
            )
        };
      }

      default:
        throw new Error(
          "Unknown statistics mode."
        );
    }
  }

  /* ======================================================
     ANSWER RENDERING
  ====================================================== */

  function findAnswerContainer(tool) {
    const selectors = [
      `#${tool}Output`,
      `#${tool}Result`,
      `#${tool}Answer`,
      `.${tool}-output`,
      `.${tool}-result`,
      `.${tool}-answer`
    ];

    for (const selector of selectors) {
      const element = $(selector);

      if (element) return element;
    }

    const panel =
      $(`#panel-${tool}`);

    if (panel) {
      let answer =
        $(".answer-area", panel) ||
        $(".tool-answer", panel) ||
        $(".result-area", panel);

      if (answer) return answer;

      answer =
        document.createElement("div");

      answer.className =
        "tool-generated-answer";

      panel.appendChild(answer);

      return answer;
    }

    return null;
  }

  function renderAnswer(
    container,
    result,
    title
  ) {
    if (!container) return;

    let value = result;

    if (
      result &&
      typeof result === "object" &&
      "value" in result
    ) {
      value = result.value;
    }

    const unit =
      result &&
      typeof result === "object" &&
      result.unit
        ? ` ${escapeHTML(result.unit)}`
        : "";

    container.innerHTML = `
      <div class="answer-card">
        <div class="answer-label">
          ${escapeHTML(title)}
        </div>
        <div class="answer-value">
          ${escapeHTML(formatResult(value))}
          ${unit}
        </div>
      </div>
    `;

    container.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }

  function renderSmartAnswer(
    container,
    result,
    title
  ) {
    if (!container) return;

    if (
      result === null ||
      result === undefined
    ) {
      renderAnswer(
        container,
        "No result",
        title
      );

      return;
    }

    if (
      typeof result !== "object" ||
      Array.isArray(result)
    ) {
      renderAnswer(
        container,
        result,
        title
      );

      return;
    }

    const entries =
      Object.entries(result)
        .filter(
          ([, value]) =>
            value !== undefined &&
            value !== null
        );

    container.innerHTML = `
      <div class="answer-card">
        <div class="answer-label">
          ${escapeHTML(title)}
        </div>

        <div class="smart-answer-list">
          ${entries
            .map(([key, value]) => `
              <div class="smart-answer-row">
                <span>
                  ${escapeHTML(
                    humanize(key)
                  )}
                </span>

                <strong>
                  ${escapeHTML(
                    formatResult(value)
                  )}
                </strong>
              </div>
            `)
            .join("")}
        </div>
      </div>
    `;

    container.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }

  function formatResult(value) {
    if (typeof value === "number") {
      return formatNumber(value);
    }

    if (Array.isArray(value)) {
      return value
        .map(item =>
          typeof item === "number"
            ? formatNumber(item)
            : text(item)
        )
        .join(", ");
    }

    if (
      value &&
      typeof value === "object"
    ) {
      return Object.entries(value)
        .map(
          ([key, val]) =>
            `${humanize(key)}: ${formatResult(val)}`
        )
        .join(" • ");
    }

    return text(value);
  }

  function humanize(value) {
    return text(value)
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .replace(/^./, c => c.toUpperCase());
  }

  /* ======================================================
     HISTORY
  ====================================================== */

  function setupHistory() {
    const clear =
      $("#clearHistory");

    if (clear) {
      clear.addEventListener(
        "click",
        clearHistory
      );
    }
  }

  function loadState() {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            HISTORY_KEY
          ) || "[]"
        );

      if (Array.isArray(saved)) {
        state.history = saved;
      }
    } catch (_) {
      state.history = [];
    }

    const memory =
      Number(
        localStorage.getItem(
          MEMORY_KEY
        )
      );

    if (Number.isFinite(memory)) {
      state.memory = memory;
    }
  }

  function saveState() {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(
        state.history.slice(0, 50)
      )
    );
  }

  function addHistory(
    tool,
    input,
    result
  ) {
    const entry = {
      id:
        Date.now() +
        Math.random()
          .toString(16)
          .slice(2),

      tool,
      input: text(input),
      result:
        typeof result === "object"
          ? JSON.stringify(result)
          : text(result),

      time:
        new Date().toLocaleTimeString()
    };

    state.history.unshift(entry);

    state.history =
      state.history.slice(0, 50);

    saveState();
    renderHistory();
  }

  function renderHistory() {
    const list =
      $("#historyList");

    if (!list) return;

    if (!state.history.length) {
      list.innerHTML = `
        <div class="history-empty">
          No calculations yet.
        </div>
      `;

      return;
    }

    list.innerHTML =
      state.history
        .map(item => `
          <div
            class="history-item"
            data-history-id="${escapeHTML(item.id)}"
          >
            <div class="history-item-main">
              <strong>
                ${escapeHTML(item.tool)}
              </strong>

              <span>
                ${escapeHTML(item.input)}
              </span>
            </div>

            <div class="history-item-result">
              ${escapeHTML(
                historyResult(item.result)
              )}
            </div>

            <small>
              ${escapeHTML(item.time)}
            </small>
          </div>
        `)
        .join("");
  }

  function historyResult(result) {
    try {
      const parsed =
        JSON.parse(result);

      return formatResult(parsed);
    } catch (_) {
      return result;
    }
  }

  function clearHistory() {
    state.history = [];

    localStorage.removeItem(
      HISTORY_KEY
    );

    renderHistory();
  }

  /* ======================================================
     WORKSPACE CONTROLS
  ====================================================== */

  function setupWorkspaceControls() {
    const clear =
      $("#clearWorkspace");

    if (!clear) return;

    clear.addEventListener(
      "click",
      clearWorkspace
    );
  }

  function clearWorkspace() {
    const panel =
      $(".tool-panel.active-panel") ||
      $(".tool-panel.active");

    if (!panel) return;

    $$("input, textarea, select", panel)
      .forEach(input => {
        input.value = "";
      });

    $$(".answer-card, .tool-generated-answer", panel)
      .forEach(element => {
        if (
          element.classList.contains(
            "tool-generated-answer"
          )
        ) {
          element.innerHTML = "";
        } else {
          element.remove();
        }
      });
  }

  /* ======================================================
     ERRORS
  ====================================================== */

  function showError(
    input,
    message
  ) {
    if (!input) {
      alert(message);
      return;
    }

    const parent =
      input.parentElement || input;

    const old =
      $(".tool-error", parent);

    if (old) old.remove();

    const error =
      document.createElement("div");

    error.className =
      "tool-error";

    error.textContent = message;

    parent.appendChild(error);

    input.focus();

    window.setTimeout(() => {
      error.remove();
    }, 4000);
  }

  /* ======================================================
     KEYBOARD
  ====================================================== */

  function setupKeyboard() {
    document.addEventListener(
      "keydown",
      event => {
        if (
          event.ctrlKey ||
          event.metaKey ||
          event.altKey
        ) {
          return;
        }

        if (event.key === "Escape") {
          const error =
            $(".tool-error");

          if (error) {
            error.remove();
          }
        }
      }
    );
  }

  /* ======================================================
     REVEAL ANIMATION
  ====================================================== */

  function setupReveal() {
    const elements =
      $$(".reveal, [data-reveal]");

    if (!elements.length) return;

    if (
      !("IntersectionObserver" in window)
    ) {
      elements.forEach(element => {
        element.classList.add("visible");
      });

      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                "visible"
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

    elements.forEach(element => {
      observer.observe(element);
    });
  }

  /* ======================================================
     RESPONSIVE GRAPH
  ====================================================== */

  window.addEventListener(
    "resize",
    () => {
      const canvas =
        $("#graphCanvas");

      if (
        canvas &&
        state.activeTool === "graph"
      ) {
        const input =
          $("#graphInput");

        if (
          input &&
          input.value.trim()
        ) {
          try {
            const result =
              localGraph(
                input.value.trim(),
                state.graphMode
              );

            drawGraphCanvas(
              canvas,
              result
            );
          } catch (_) {}
        }
      }
    }
  );

  /* ======================================================
     PUBLIC API
  ====================================================== */

  window.NOVERA_TOOLKIT = {
    state,

    activateTool,

    calculateCalculator,

    solveAlgebra,

    plotGraph,

    calculatePhysics,

    calculateChemistry,

    calculateStatistics,

    clearHistory,

    clearWorkspace,

    renderHistory
  };

})();
