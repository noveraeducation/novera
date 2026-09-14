/* ========================================================
   NOVERA TOOLKIT — UI ENGINE
   Version 1.0
   Connects:
   Calculator
   Algebra
   Graph
   Physics
   Chemistry
   Statistics
======================================================== */

(function () {
  "use strict";

  /* ======================================================
     SHORTCUTS
  ====================================================== */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const byId = (id) =>
    document.getElementById(id);


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
    history: loadHistory()
  };


  /* ======================================================
     DOM READY
  ====================================================== */

  document.addEventListener("DOMContentLoaded", init);


  function init() {

    setupPageLoader();
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
    setupKeyboard();
    setupRevealAnimations();

    renderHistory();

    activateTool("calculator");
  }


  /* ======================================================
     PAGE LOADER
  ====================================================== */

  function setupPageLoader() {

    const loader = $(".page-loader");

    if (!loader) return;

    window.addEventListener("load", function () {

      setTimeout(function () {
        loader.classList.add("loaded");
      }, 350);

    });

    setTimeout(function () {
      loader.classList.add("loaded");
    }, 1800);
  }


  /* ======================================================
     HEADER
  ====================================================== */

  function setupHeader() {

    const header = $(".toolkit-header");

    if (!header) return;

    function updateHeader() {

      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

    }

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );
  }


  /* ======================================================
     THEME
  ====================================================== */

  function setupTheme() {

    const toggle =
      $("#themeToggle") ||
      $(".theme-toggle") ||
      $("[data-theme-toggle]");

    const saved =
      localStorage.getItem("novera-toolkit-theme");

    if (saved === "dark") {
      document.body.classList.add("dark-theme");
    }

    if (!toggle) return;

    updateThemeButton(toggle);

    toggle.addEventListener("click", function () {

      document.body.classList.toggle("dark-theme");

      const dark =
        document.body.classList.contains("dark-theme");

      localStorage.setItem(
        "novera-toolkit-theme",
        dark ? "dark" : "light"
      );

      updateThemeButton(toggle);

    });
  }


  function updateThemeButton(button) {

    const dark =
      document.body.classList.contains("dark-theme");

    button.setAttribute(
      "aria-label",
      dark
        ? "Switch to light mode"
        : "Switch to dark mode"
    );

    const icon =
      button.querySelector("span") ||
      button;

    if (
      icon &&
      !icon.querySelector &&
      typeof icon.textContent === "string"
    ) {
      icon.textContent = dark ? "☀" : "◐";
    }
  }


  /* ======================================================
     TOOL CARDS
  ====================================================== */

  function setupToolCards() {

    const cards =
      $$(".tool-card");

    cards.forEach(function (card) {

      const tool =
        card.dataset.tool ||
        card.getAttribute("data-tool");

      if (!tool) return;

      card.addEventListener("click", function () {
        activateTool(tool);
      });

      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      card.addEventListener("keydown", function (event) {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          activateTool(tool);
        }

      });

    });
  }


  /* ======================================================
     TOOL ACTIVATION
  ====================================================== */

  function activateTool(tool) {

    const validTools = [
      "calculator",
      "algebra",
      "graph",
      "physics",
      "chemistry",
      "statistics"
    ];

    if (!validTools.includes(tool)) return;

    state.activeTool = tool;

    $$(".tool-card").forEach(function (card) {

      card.classList.toggle(
        "active",
        (
          card.dataset.tool === tool
        )
      );

    });

    $$(".tool-panel").forEach(function (panel) {

      const panelTool =
        panel.dataset.tool ||
        panel.id?.replace("panel-", "");

      panel.classList.toggle(
        "active-panel",
        panelTool === tool
      );

    });

    const workspace =
      $(".workspace-section");

    if (
      workspace &&
      window.innerWidth < 800
    ) {
      setTimeout(function () {

        workspace.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }, 80);
    }
  }


  /* ======================================================
     PANELS
  ====================================================== */

  function setupPanels() {

    $$("[data-tool-target]").forEach(function (button) {

      button.addEventListener("click", function () {

        const target =
          button.dataset.toolTarget;

        activateTool(target);

      });

    });

    $$("[data-scroll-tool]").forEach(function (button) {

      button.addEventListener("click", function () {

        const target =
          button.dataset.scrollTool;

        activateTool(target);

      });

    });
  }


  /* ======================================================
     CALCULATOR
  ====================================================== */

  function setupCalculator() {

    const input =
      $("#calculatorInput") ||
      $("#calcInput") ||
      $(".calculator-input");

    if (!input) return;

    const calculateButton =
      $("#calculateCalculator") ||
      $("#calculatorCalculate") ||
      $('[data-action="calculate-calculator"]');

    const chips =
      $$(".quick-chips button");

    chips.forEach(function (chip) {

      chip.addEventListener("click", function () {

        const value =
          chip.dataset.value ||
          chip.textContent.trim();

        if (!value) return;

        input.value = value;

        input.focus();

      });

    });

    $$(".calculator-modes button").forEach(function (button) {

      button.addEventListener("click", function () {

        $$(".calculator-modes button")
          .forEach(b =>
            b.classList.remove("active")
          );

        button.classList.add("active");

        state.calculatorMode =
          button.dataset.mode ||
          button.textContent
            .trim()
            .toLowerCase();

      });

    });

    if (calculateButton) {

      calculateButton.addEventListener(
        "click",
        calculateCalculator
      );

    }

    input.addEventListener("keydown", function (event) {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        calculateCalculator();
      }

    });
  }


  function calculateCalculator() {

    const input =
      $("#calculatorInput") ||
      $("#calcInput") ||
      $(".calculator-input");

    if (!input) return;

    const expression =
      input.value.trim();

    if (!expression) {

      showError(
        input,
        "Enter something to calculate."
      );

      return;
    }

    try {

      let result;

      const calc =
        window.NOVERA_CALCULATOR;

      if (!calc) {
        throw new Error(
          "Calculator engine unavailable."
        );
      }

      /*
       Try the engine's common interfaces.
      */

      if (
        typeof calc.evaluate === "function"
      ) {
        result =
          calc.evaluate(expression);
      }

      else if (
        typeof calc.calculate === "function"
      ) {
        result =
          calc.calculate(expression);
      }

      else if (
        typeof calc.expression === "function"
      ) {
        result =
          calc.expression(expression);
      }

      else {
        result =
          safeExpression(expression);
      }

      if (
        result &&
        typeof result === "object" &&
        "value" in result
      ) {
        result = result.value;
      }

      if (
        typeof result !== "number" &&
        typeof result !== "string"
      ) {
        result = String(result);
      }

      displayAnswer(
        "calculator",
        result,
        ""
      );

      addHistory(
        expression,
        result
      );

      clearError(input);

    } catch (error) {

      showError(
        input,
        "I couldn't read that expression."
      );

    }
  }


  /* ======================================================
     SAFE FALLBACK CALCULATOR
  ====================================================== */

  function safeExpression(expression) {

    let clean =
      String(expression)
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "Math.PI")
        .replace(/\^/g, "**");

    /*
      Only permit:
      numbers
      operators
      decimal points
      parentheses
      Math.PI
    */

    if (
      !/^[0-9+\-*/().\s%]*$/.test(
        clean.replace(/Math\.PI/g, "")
      )
    ) {
      throw new Error("Invalid expression");
    }

    clean =
      clean.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
      );

    const value =
      Function(
        '"use strict"; return (' +
        clean +
        ")"
      )();

    if (
      typeof value !== "number" ||
      !Number.isFinite(value)
    ) {
      throw new Error("Invalid result");
    }

    return value;
  }


  /* ======================================================
     ALGEBRA
  ====================================================== */

  function setupAlgebra() {

    const buttons =
      $$(".algebra-mode-selector button");

    buttons.forEach(function (button) {

      button.addEventListener("click", function () {

        buttons.forEach(b =>
          b.classList.remove("active")
        );

        button.classList.add("active");

        state.algebraMode =
          button.dataset.mode ||
          "linear";

        updateAlgebraInterface();

      });

    });

    const solveButton =
      $("#solveAlgebra") ||
      $("#algebraSolve") ||
      $('[data-action="solve-algebra"]');

    if (solveButton) {

      solveButton.addEventListener(
        "click",
        solveAlgebra
      );

    }

    updateAlgebraInterface();
  }


  function updateAlgebraInterface() {

    const input =
      $("#algebraInput") ||
      $("#equationInput") ||
      $(".algebra-input");

    if (!input) return;

    const placeholders = {

      linear:
        "Example: 2x + 5 = 17",

      quadratic:
        "Example: x² - 5x + 6 = 0",

      simultaneous:
        "Example: 2x + y = 7 ; x - y = 1",

      ratio:
        "Example: 2:3 = x:12"
    };

    input.placeholder =
      placeholders[state.algebraMode] ||
      placeholders.linear;
  }


  function solveAlgebra() {

    const input =
      $("#algebraInput") ||
      $("#equationInput") ||
      $(".algebra-input");

    if (!input) return;

    const equation =
      input.value.trim();

    if (!equation) {

      showError(
        input,
        "Enter an equation first."
      );

      return;
    }

    const algebra =
      window.NOVERA_ALGEBRA;

    if (!algebra) {

      showError(
        input,
        "Algebra engine unavailable."
      );

      return;
    }

    try {

      let result;

      switch (state.algebraMode) {

        case "quadratic":

          result =
            callFirst(
              algebra,
              [
                "quadratic",
                "solveQuadratic",
                "quadraticEquation"
              ],
              equation
            );

          break;

        case "simultaneous":

          result =
            callFirst(
              algebra,
              [
                "simultaneous",
                "solveSimultaneous",
                "simultaneousEquations"
              ],
              equation
            );

          break;

        case "ratio":

          result =
            callFirst(
              algebra,
              [
                "ratio",
                "solveRatio",
                "proportion"
              ],
              equation
            );

          break;

        default:

          result =
            callFirst(
              algebra,
              [
                "linear",
                "solveLinear",
                "linearEquation"
              ],
              equation
            );

      }

      if (
        result === undefined
      ) {

        /*
          Generic evaluation fallback.
        */

        result =
          callFirst(
            algebra,
            [
              "solve",
              "evaluate"
            ],
            equation
          );

      }

      if (
        result === undefined
      ) {
        throw new Error(
          "No compatible algebra method."
        );
      }

      displaySmartAnswer(
        "algebra",
        result
      );

      addHistory(
        equation,
        result
      );

      clearError(input);

    } catch (error) {

      showError(
        input,
        "Check the equation format and try again."
      );

    }
  }


  /* ======================================================
     GRAPH
  ====================================================== */

  function setupGraph() {

    const buttons =
      $$(".graph-options button");

    buttons.forEach(function (button) {

      button.addEventListener("click", function () {

        buttons.forEach(b =>
          b.classList.remove("active")
        );

        button.classList.add("active");

        state.graphMode =
          button.dataset.mode ||
          "auto";

      });

    });

    const plotButton =
      $("#plotGraph") ||
      $("#graphPlot") ||
      $('[data-action="plot-graph"]');

    if (plotButton) {

      plotButton.addEventListener(
        "click",
        plotGraph
      );

    }
  }


  function plotGraph() {

    const input =
      $("#graphInput") ||
      $("#functionInput") ||
      $(".graph-input");

    const display =
      $("#graphDisplay") ||
      $(".graph-display");

    if (!input || !display) return;

    const expression =
      input.value.trim();

    if (!expression) {

      showError(
        input,
        "Enter a function first."
      );

      return;
    }

    const graph =
      window.NOVERA_GRAPH;

    if (!graph) {

      showError(
        input,
        "Graph engine unavailable."
      );

      return;
    }

    try {

      let result;

      result =
        callFirst(
          graph,
          [
            "plot",
            "graph",
            "generate",
            "generatePoints"
          ],
          expression
        );

      if (
        result === undefined
      ) {

        result =
          graph.linear
            ? graph.linear(expression)
            : undefined;

      }

      renderGraphResult(
        display,
        result,
        expression
      );

      clearError(input);

    } catch (error) {

      showError(
        input,
        "That function couldn't be plotted."
      );

    }
  }


  function renderGraphResult(
    container,
    result,
    expression
  ) {

    /*
      If engine gives HTML/SVG,
      respect it.
    */

    if (
      typeof result === "string" &&
      (
        result.includes("<svg") ||
        result.includes("<canvas") ||
        result.includes("<div")
      )
    ) {

      container.innerHTML = result;

      return;
    }

    /*
      Otherwise create a lightweight
      visual graph from point data.
    */

    let points = [];

    if (
      Array.isArray(result)
    ) {
      points = result;
    }

    else if (
      result &&
      Array.isArray(result.points)
    ) {
      points = result.points;
    }

    if (!points.length) {

      container.innerHTML = `
        <div class="graph-empty-state">
          <div class="graph-empty-icon">∿</div>
          <p>Graph generated for <strong>${escapeHTML(expression)}</strong></p>
        </div>
      `;

      return;
    }

    drawSimpleGraph(
      container,
      points,
      expression
    );
  }


  function drawSimpleGraph(
    container,
    points,
    expression
  ) {

    const width =
      Math.max(
        300,
        container.clientWidth || 600
      );

    const height =
      Math.max(
        260,
        container.clientHeight || 340
      );

    const xs =
      points.map(p => Number(p[0]));

    const ys =
      points.map(p => Number(p[1]));

    const minX =
      Math.min(...xs);

    const maxX =
      Math.max(...xs);

    const minY =
      Math.min(...ys);

    const maxY =
      Math.max(...ys);

    const pad = 32;

    const scaleX =
      (width - pad * 2) /
      ((maxX - minX) || 1);

    const scaleY =
      (height - pad * 2) /
      ((maxY - minY) || 1);

    function px(x) {
      return (
        pad +
        (x - minX) *
        scaleX
      );
    }

    function py(y) {
      return (
        height -
        pad -
        (y - minY) *
        scaleY
      );
    }

    const path =
      points
        .map(function (p, index) {

          const x =
            px(Number(p[0]));

          const y =
            py(Number(p[1]));

          return (
            index === 0
              ? `M ${x} ${y}`
              : `L ${x} ${y}`
          );

        })
        .join(" ");

    const zeroX =
      minX <= 0 && maxX >= 0
        ? px(0)
        : null;

    const zeroY =
      minY <= 0 && maxY >= 0
        ? py(0)
        : null;

    container.innerHTML = `
      <svg
        viewBox="0 0 ${width} ${height}"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        aria-label="Graph of ${escapeHTML(expression)}"
      >

        ${
          zeroX !== null
            ? `<line
                x1="${zeroX}"
                y1="0"
                x2="${zeroX}"
                y2="${height}"
                stroke="currentColor"
                opacity=".18"
              />`
            : ""
        }

        ${
          zeroY !== null
            ? `<line
                x1="0"
                y1="${zeroY}"
                x2="${width}"
                y2="${zeroY}"
                stroke="currentColor"
                opacity=".18"
              />`
            : ""
        }

        <path
          d="${path}"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity=".9"
        />

      </svg>

      <div
        style="
          position:absolute;
          left:15px;
          top:12px;
          font-size:10px;
          font-weight:800;
          opacity:.55;
        "
      >
        ${escapeHTML(expression)}
      </div>
    `;
  }


  /* ======================================================
     PHYSICS
  ====================================================== */

  function setupPhysics() {

    const buttons =
      $$(".physics-selector button");

    buttons.forEach(function (button) {

      button.addEventListener("click", function () {

        buttons.forEach(b =>
          b.classList.remove("active")
        );

        button.classList.add("active");

        state.physicsMode =
          button.dataset.mode ||
          "speed";

        updatePhysicsFields();

      });

    });

    const calculateButton =
      $("#calculatePhysics") ||
      $("#physicsCalculate") ||
      $('[data-action="calculate-physics"]');

    if (calculateButton) {

      calculateButton.addEventListener(
        "click",
        calculatePhysics
      );

    }

    updatePhysicsFields();
  }


  function updatePhysicsFields() {

    const fields =
      $("#physicsFields") ||
      $(".physics-fields");

    if (!fields) return;

    const configs = {

      speed: [
        ["distance", "Distance", "e.g. 100", "m"],
        ["time", "Time", "e.g. 5", "s"]
      ],

      force: [
        ["mass", "Mass", "e.g. 10", "kg"],
        ["acceleration", "Acceleration", "e.g. 9.8", "m/s²"]
      ],

      energy: [
        ["mass", "Mass", "e.g. 5", "kg"],
        ["velocity", "Velocity", "e.g. 10", "m/s"]
      ],

      power: [
        ["energy", "Energy", "e.g. 500", "J"],
        ["time", "Time", "e.g. 10", "s"]
      ],

      electricity: [
        ["voltage", "Voltage", "e.g. 12", "V"],
        ["resistance", "Resistance", "e.g. 6", "Ω"]
      ]
    };

    const config =
      configs[state.physicsMode] ||
      configs.speed;

    fields.innerHTML =
      config
        .map(function (item) {

          return `
            <div class="input-group">
              <label for="physics-${item[0]}">
                ${item[1]}
              </label>

              <input
                id="physics-${item[0]}"
                class="main-input physics-field"
                data-field="${item[0]}"
                type="number"
                inputmode="decimal"
                placeholder="${item[2]}"
              >

              <span class="input-help">
                Unit: ${item[3]}
              </span>
            </div>
          `;

        })
        .join("");
  }


  function calculatePhysics() {

    const fields =
      $$(".physics-field");

    const values = {};

    fields.forEach(function (field) {

      values[field.dataset.field] =
        Number(field.value);

    });

    const engine =
      window.NOVERA_PHYSICS;

    if (!engine) return;

    try {

      let result;

      switch (state.physicsMode) {

        case "force":

          result =
            callFirst(
              engine,
              ["force"],
              values.mass,
              values.acceleration
            );

          break;

        case "energy":

          result =
            callFirst(
              engine,
              ["kineticEnergy", "energy"],
              values.mass,
              values.velocity
            );

          break;

        case "power":

          result =
            callFirst(
              engine,
              ["power"],
              values.energy,
              values.time
            );

          break;

        case "electricity":

          result =
            callFirst(
              engine,
              ["current"],
              values.voltage,
              values.resistance
            );

          break;

        default:

          result =
            callFirst(
              engine,
              ["speed"],
              values.distance,
              values.time
            );

      }

      if (
        result === undefined
      ) {
        throw new Error();
      }

      displaySmartAnswer(
        "physics",
        result
      );

      addHistory(
        state.physicsMode,
        result
      );

    } catch (error) {

      const first =
        fields[0];

      if (first) {

        showError(
          first,
          "Check the numbers and units."
        );

      }

    }
  }


  /* ======================================================
     CHEMISTRY
  ====================================================== */

  function setupChemistry() {

    const buttons =
      $$(".chemistry-selector button");

    buttons.forEach(function (button) {

      button.addEventListener("click", function () {

        buttons.forEach(b =>
          b.classList.remove("active")
        );

        button.classList.add("active");

        state.chemistryMode =
          button.dataset.mode ||
          "moles";

        updateChemistryFields();

      });

    });

    const calculateButton =
      $("#calculateChemistry") ||
      $("#chemistryCalculate") ||
      $('[data-action="calculate-chemistry"]');

    if (calculateButton) {

      calculateButton.addEventListener(
        "click",
        calculateChemistry
      );

    }

    updateChemistryFields();
  }


  function updateChemistryFields() {

    const fields =
      $("#chemistryFields") ||
      $(".chemistry-fields");

    if (!fields) return;

    const configs = {

      moles: [
        ["mass", "Mass", "e.g. 18", "g"],
        ["molarMass", "Molar mass", "e.g. 18", "g/mol"]
      ],

      molarity: [
        ["moles", "Moles", "e.g. 0.5", "mol"],
        ["volume", "Volume", "e.g. 2", "L"]
      ],

      gas: [
        ["pressure", "Pressure", "e.g. 101325", "Pa"],
        ["volume", "Volume", "e.g. 0.0224", "m³"],
        ["temperature", "Temperature", "e.g. 273.15", "K"]
      ],

      ph: [
        ["concentration", "Concentration", "e.g. 0.001", "mol/L"]
      ],

      heat: [
        ["mass", "Mass", "e.g. 2", "kg"],
        ["specificHeat", "Specific heat", "e.g. 4186", "J/kg·K"],
        ["deltaT", "Temperature change", "e.g. 10", "K"]
      ]
    };

    const config =
      configs[state.chemistryMode] ||
      configs.moles;

    fields.innerHTML =
      config
        .map(function (item) {

          return `
            <div class="input-group">
              <label for="chemistry-${item[0]}">
                ${item[1]}
              </label>

              <input
                id="chemistry-${item[0]}"
                class="main-input chemistry-field"
                data-field="${item[0]}"
                type="number"
                inputmode="decimal"
                placeholder="${item[2]}"
              >

              <span class="input-help">
                Unit: ${item[3]}
              </span>
            </div>
          `;

        })
        .join("");
  }


  function calculateChemistry() {

    const fields =
      $$(".chemistry-field");

    const values = {};

    fields.forEach(function (field) {

      values[field.dataset.field] =
        Number(field.value);

    });

    const engine =
      window.NOVERA_CHEMISTRY;

    if (!engine) return;

    try {

      let result;

      switch (state.chemistryMode) {

        case "molarity":

          result =
            callFirst(
              engine,
              ["molarity"],
              values.moles,
              values.volume
            );

          break;

        case "gas":

          result =
            callFirst(
              engine,
              ["idealGas"],
              values.pressure,
              values.volume,
              values.temperature
            );

          break;

        case "ph":

          result =
            callFirst(
              engine,
              ["pH", "ph"],
              values.concentration
            );

          break;

        case "heat":

          result =
            callFirst(
              engine,
              ["heat"],
              values.mass,
              values.specificHeat,
              values.deltaT
            );

          break;

        default:

          result =
            callFirst(
              engine,
              ["moles"],
              values.mass,
              values.molarMass
            );
      }

      if (
        result === undefined
      ) {
        throw new Error();
      }

      displaySmartAnswer(
        "chemistry",
        result
      );

      addHistory(
        state.chemistryMode,
        result
      );

    } catch (error) {

      const first =
        fields[0];

      if (first) {

        showError(
          first,
          "Check the chemistry values."
        );

      }

    }
  }


  /* ======================================================
     STATISTICS
  ====================================================== */

  function setupStatistics() {

    const buttons =
      $$(".statistics-selector button");

    buttons.forEach(function (button) {

      button.addEventListener("click", function () {

        buttons.forEach(b =>
          b.classList.remove("active")
        );

        button.classList.add("active");

        state.statisticsMode =
          button.dataset.mode ||
          "mean";

      });

    });

    const analyseButton =
      $("#analyseStatistics") ||
      $("#statisticsAnalyse") ||
      $('[data-action="analyse-statistics"]');

    if (analyseButton) {

      analyseButton.addEventListener(
        "click",
        analyseStatistics
      );

    }
  }


  function analyseStatistics() {

    const input =
      $("#statisticsInput") ||
      $("#dataInput") ||
      $(".statistics-input") ||
      $(".data-input");

    if (!input) return;

    const raw =
      input.value.trim();

    if (!raw) {

      showError(
        input,
        "Enter your numbers first."
      );

      return;
    }

    const data =
      parseNumbers(raw);

    if (!data.length) {

      showError(
        input,
        "I couldn't find any numbers."
      );

      return;
    }

    const engine =
      window.NOVERA_STATISTICS;

    if (!engine) return;

    try {

      let result;

      switch (state.statisticsMode) {

        case "median":

          result =
            callFirst(
              engine,
              ["median"],
              data
            );

          break;

        case "mode":

          result =
            callFirst(
              engine,
              ["mode"],
              data
            );

          break;

        case "range":

          result =
            callFirst(
              engine,
              ["range"],
              data
            );

          break;

        case "std":

        case "standardDeviation":

          result =
            callFirst(
              engine,
              ["standardDeviation", "stdDev"],
              data
            );

          break;

        default:

          result =
            callFirst(
              engine,
              ["mean", "average"],
              data
            );
      }

      if (
        result === undefined
      ) {
        throw new Error();
      }

      displaySmartAnswer(
        "statistics",
        result
      );

      addHistory(
        state.statisticsMode,
        result
      );

      clearError(input);

    } catch (error) {

      showError(
        input,
        "Something went wrong analysing the data."
      );

    }
  }


  /* ======================================================
     ANSWER DISPLAY
  ====================================================== */

  function displayAnswer(
    tool,
    value,
    unit
  ) {

    const panel =
      findPanel(tool);

    if (!panel) return;

    const card =
      $(".answer-card", panel);

    if (!card) return;

    const valueElement =
      $(".answer-value", card);

    const unitElement =
      $(".answer-unit", card);

    if (valueElement) {

      valueElement.textContent =
        formatResult(value);

    }

    if (unitElement) {

      unitElement.textContent =
        unit || "";
    }

    card.classList.remove(
      "has-result"
    );

    void card.offsetWidth;

    card.classList.add(
      "has-result"
    );
  }


  function displaySmartAnswer(
    tool,
    result
  ) {

    const panel =
      findPanel(tool);

    if (!panel) return;

    const card =
      $(".answer-card", panel);

    if (!card) return;

    const valueElement =
      $(".answer-value", card);

    const unitElement =
      $(".answer-unit", card);

    const formula =
      $(".answer-formula", card);

    if (
      result &&
      typeof result === "object"
    ) {

      const main =
        result.value ??
        result.result ??
        result.answer ??
        result.solution;

      if (valueElement) {

        valueElement.textContent =
          formatResult(
            main !== undefined
              ? main
              : JSON.stringify(result)
          );
      }

      if (unitElement) {

        unitElement.textContent =
          result.unit ||
          result.units ||
          "";
      }

      if (formula) {

        formula.textContent =
          result.formula ||
          result.explanation ||
          "";

      }

    } else {

      if (valueElement) {

        valueElement.textContent =
          formatResult(result);
      }

      if (unitElement) {

        unitElement.textContent =
          "";
      }

      if (formula) {

        formula.textContent =
          "";
      }
    }

    card.classList.remove(
      "has-result"
    );

    void card.offsetWidth;

    card.classList.add(
      "has-result"
    );
  }


  function findPanel(tool) {

    return (
      document.querySelector(
        `.tool-panel[data-tool="${tool}"]`
      ) ||
      byId(`panel-${tool}`) ||
      document.querySelector(
        `.tool-panel.${tool}-panel`
      )
    );
  }


  /* ======================================================
     HISTORY
  ====================================================== */

  function setupHistory() {

    const clear =
      $("#clearHistory") ||
      $(".clear-button");

    if (!clear) return;

    clear.addEventListener(
      "click",
      function () {

        state.history = [];

        saveHistory();

        renderHistory();

      }
    );
  }


  function addHistory(
    expression,
    result
  ) {

    state.history.unshift({

      expression:
        String(expression),

      result:
        formatResult(result),

      time:
        Date.now()

    });

    state.history =
      state.history.slice(0, 20);

    saveHistory();

    renderHistory();
  }


  function renderHistory() {

    const list =
      $("#historyList") ||
      $(".history-list");

    if (!list) return;

    if (!state.history.length) {

      list.innerHTML = `
        <div class="history-empty">
          <span>↺</span>
          <p>Your calculations will appear here.</p>
        </div>
      `;

      return;
    }

    list.innerHTML =
      state.history
        .map(function (item) {

          return `
            <div class="history-item">
              <span class="history-expression">
                ${escapeHTML(item.expression)}
              </span>

              <span class="history-result">
                ${escapeHTML(item.result)}
              </span>
            </div>
          `;

        })
        .join("");
  }


  function loadHistory() {

    try {

      return JSON.parse(
        localStorage.getItem(
          "novera-toolkit-history"
        ) || "[]"
      );

    } catch {

      return [];
    }
  }


  function saveHistory() {

    try {

      localStorage.setItem(
        "novera-toolkit-history",
        JSON.stringify(state.history)
      );

    } catch {
      /* Ignore storage failures */
    }
  }


  /* ======================================================
     KEYBOARD
  ====================================================== */

  function setupKeyboard() {

    document.addEventListener(
      "keydown",
      function (event) {

        /*
          Ctrl/Cmd + K
          focuses current tool input.
        */

        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "k"
        ) {

          event.preventDefault();

          const activePanel =
            $(".tool-panel.active-panel");

          if (!activePanel) return;

          const input =
            $("input, textarea", activePanel);

          if (input) input.focus();
        }

        /*
          Escape removes focus.
        */

        if (event.key === "Escape") {

          if (
            document.activeElement &&
            typeof document.activeElement.blur ===
            "function"
          ) {
            document.activeElement.blur();
          }
        }

      }
    );
  }


  /* ======================================================
     REVEAL ANIMATIONS
  ====================================================== */

  function setupRevealAnimations() {

    const elements =
      $$(".reveal");

    if (!elements.length) return;

    if (
      !("IntersectionObserver" in window)
    ) {

      elements.forEach(
        el => el.classList.add("visible")
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        function (entries) {

          entries.forEach(
            function (entry) {

              if (
                entry.isIntersecting
              ) {

                entry.target.classList.add(
                  "visible"
                );

                observer.unobserve(
                  entry.target
                );
              }

            }
          );

        },
        {
          threshold: 0.08
        }
      );

    elements.forEach(
      el => observer.observe(el)
    );
  }


  /* ======================================================
     HELPERS
  ====================================================== */

  function callFirst(
    object,
    methods,
    ...args
  ) {

    for (
      const method of methods
    ) {

      if (
        object &&
        typeof object[method] === "function"
      ) {

        return object[method](...args);
      }
    }

    return undefined;
  }


  function formatResult(value) {

    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    if (
      typeof value === "number"
    ) {

      if (!Number.isFinite(value)) {
        return "Undefined";
      }

      if (
        Math.abs(value) >= 1e9 ||
        (
          Math.abs(value) > 0 &&
          Math.abs(value) < 1e-7
        )
      ) {

        return value.toExponential(6);
      }

      return Number(
        value.toFixed(10)
      ).toString();
    }

    if (
      Array.isArray(value)
    ) {

      return value
        .map(formatResult)
        .join(", ");
    }

    if (
      typeof value === "object"
    ) {

      return (
        value.value ??
        value.result ??
        value.answer ??
        JSON.stringify(value)
      );
    }

    return String(value);
  }


  function parseNumbers(text) {

    return text
      .split(/[\s,;]+/)
      .map(Number)
      .filter(Number.isFinite);
  }


  function showError(
    element,
    message
  ) {

    if (!element) return;

    clearError(element);

    element.classList.add(
      "has-error"
    );

    const messageElement =
      document.createElement("div");

    messageElement.className =
      "error-message";

    messageElement.textContent =
      message;

    if (
      element.parentElement
    ) {

      element.parentElement.appendChild(
        messageElement
      );
    }

    setTimeout(function () {

      clearError(element);

    }, 3500);
  }


  function clearError(element) {

    if (!element) return;

    element.classList.remove(
      "has-error"
    );

    const parent =
      element.parentElement;

    if (!parent) return;

    const error =
      $(".error-message", parent);

    if (error) {
      error.remove();
    }
  }


  function escapeHTML(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /* ======================================================
     GLOBAL ACCESS
  ====================================================== */

  window.NOVERA_TOOLKIT = {

    activateTool,

    addHistory,

    renderHistory,

    calculateCalculator,

    solveAlgebra,

    plotGraph,

    calculatePhysics,

    calculateChemistry,

    analyseStatistics

  };

})();
