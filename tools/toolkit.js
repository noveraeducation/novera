"use strict";

/* =========================================================
   NOVERA TOOLKIT CONTROLLER
   Calculator • Algebra • Graph • Physics • Chemistry • Stats

   Existing engine files are preserved.
   This controller provides robust adapters and fallbacks.
========================================================= */

(function () {

  /* =======================================================
     STATE
  ======================================================= */

  const state = {
    activeTool: "calculator",
    history: []
  };

  const MAX_HISTORY = 30;

  /* =======================================================
     HELPERS
  ======================================================= */

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $$(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function toast(message) {
    let el = document.querySelector(".novera-tool-toast");

    if (!el) {
      el = document.createElement("div");
      el.className = "novera-tool-toast";
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.classList.add("show");

    clearTimeout(el._timer);

    el._timer = setTimeout(() => {
      el.classList.remove("show");
    }, 2500);
  }

  function cleanNumber(value) {
    if (!Number.isFinite(value)) {
      return String(value);
    }

    if (Math.abs(value) < 1e-12) {
      return "0";
    }

    return Number(
      value.toPrecision(12)
    ).toString();
  }

  function parseNumber(value) {
    if (typeof value === "number") {
      return value;
    }

    const n = Number(
      String(value)
        .replace(/,/g, "")
        .trim()
    );

    return Number.isFinite(n)
      ? n
      : NaN;
  }

  /* =======================================================
     RESULT NORMALIZATION
  ======================================================= */

  /*
    Your calculator engine returns objects such as:

    {
      expression: "250 ÷ 5",
      answer: 50,
      display: "50",
      time: 1789379210523
    }

    We must NOT render the internal metadata.
  */

  function extractResult(result) {
    if (
      result === null ||
      result === undefined
    ) {
      return null;
    }

    if (
      typeof result === "number" ||
      typeof result === "string"
    ) {
      return result;
    }

    if (typeof result === "object") {

      const preferredKeys = [
        "display",
        "answer",
        "result",
        "value",
        "output"
      ];

      for (const key of preferredKeys) {
        if (
          Object.prototype.hasOwnProperty.call(
            result,
            key
          )
        ) {
          const value = result[key];

          if (
            typeof value === "number" ||
            typeof value === "string"
          ) {
            return value;
          }
        }
      }

      /*
        Some engines may return:
        { result: { answer: 5 } }
      */

      for (const key of preferredKeys) {
        if (
          result[key] &&
          typeof result[key] === "object"
        ) {
          const nested =
            extractResult(result[key]);

          if (
            nested !== null &&
            nested !== undefined
          ) {
            return nested;
          }
        }
      }
    }

    return null;
  }

  /* =======================================================
     HISTORY
  ======================================================= */

  function addHistory(tool, input, result) {
    const cleanResult =
      extractResult(result);

    if (
      cleanResult === null ||
      cleanResult === undefined
    ) {
      return;
    }

    state.history.push({
      tool,
      input: String(input ?? ""),
      result: String(cleanResult),
      time: Date.now()
    });

    if (
      state.history.length >
      MAX_HISTORY
    ) {
      state.history.shift();
    }

    renderHistory();
  }

  function renderHistory() {
    const container =
      document.querySelector(
        "#historyList, .history-list, [data-history]"
      );

    if (!container) return;

    if (!state.history.length) {
      container.innerHTML = `
        <div class="history-empty">
          No calculations yet.
        </div>
      `;

      return;
    }

    container.innerHTML =
      state.history
        .slice()
        .reverse()
        .map((item) => {
          return `
            <button
              class="history-item"
              data-history-tool="${escapeHTML(
                item.tool
              )}"
              data-history-input="${escapeHTML(
                item.input
              )}"
              type="button"
            >
              <span>
                ${escapeHTML(item.tool)}
              </span>

              <strong>
                ${escapeHTML(item.input)}
              </strong>

              <em>
                = ${escapeHTML(item.result)}
              </em>
            </button>
          `;
        })
        .join("");

    $$(".history-item", container)
      .forEach((item) => {
        item.addEventListener(
          "click",
          () => {
            const tool =
              item.dataset.historyTool;

            const input =
              item.dataset.historyInput;

            activateTool(tool);

            setToolInput(
              tool,
              input
            );
          }
        );
      });
  }

  function clearHistory() {
    state.history = [];
    renderHistory();
    toast("History cleared.");
  }

  /* =======================================================
     CALCULATOR
  ======================================================= */

  function normalizeExpression(expression) {
    return String(expression || "")
      .trim()
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/–/g, "-")
      .replace(/π/g, "PI")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .replace(/\s+/g, "");
  }

  /*
    Safe arithmetic fallback.

    Supports:
      +
      -
      *
      /
      ×
      ÷
      ^
      %
      π
      parentheses
      decimals
      unary minus

    No arbitrary JavaScript identifiers/functions.
  */

  function safeExpression(expression) {
    let expr =
      normalizeExpression(expression);

    if (!expr) {
      throw new Error(
        "Enter an expression."
      );
    }

    /*
      Percentage:
      50% → 0.5
    */

    expr = expr.replace(
      /(\d+(?:\.\d+)?)%/g,
      "($1/100)"
    );

    /*
      Validate allowed characters.
    */

    if (
      !/^[0-9+\-*/().^PI]+$/i.test(expr)
    ) {
      throw new Error(
        "Unsupported character or symbol."
      );
    }

    /*
      Replace PI with numeric constant.
    */

    expr = expr.replace(
      /\bPI\b/gi,
      String(Math.PI)
    );

    /*
      Convert power operator.

      We implement exponentiation using a parser,
      not Function().
    */

    const tokens = tokenize(expr);

    const parser = new ExpressionParser(
      tokens
    );

    const value =
      parser.parse();

    if (
      !Number.isFinite(value)
    ) {
      throw new Error(
        "Result is not a finite number."
      );
    }

    return cleanNumber(value);
  }

  function tokenize(expression) {
    const tokens = [];
    let i = 0;

    while (i < expression.length) {
      const char =
        expression[i];

      if (
        /[0-9.]/.test(char)
      ) {
        let number = "";

        while (
          i < expression.length &&
          /[0-9.]/.test(
            expression[i]
          )
        ) {
          number +=
            expression[i];
          i++;
        }

        if (
          (number.match(/\./g) || [])
            .length > 1
        ) {
          throw new Error(
            "Invalid number."
          );
        }

        tokens.push({
          type: "number",
          value: Number(number)
        });

        continue;
      }

      if (
        char === "+" ||
        char === "-" ||
        char === "*" ||
        char === "/" ||
        char === "^" ||
        char === "(" ||
        char === ")"
      ) {
        tokens.push({
          type: "operator",
          value: char
        });

        i++;
        continue;
      }

      throw new Error(
        "Invalid expression."
      );
    }

    return tokens;
  }

  class ExpressionParser {

    constructor(tokens) {
      this.tokens = tokens;
      this.position = 0;
    }

    current() {
      return this.tokens[
        this.position
      ];
    }

    consume(value) {
      const token =
        this.current();

      if (
        token &&
        token.value === value
      ) {
        this.position++;
        return true;
      }

      return false;
    }

    parse() {
      const result =
        this.parseAddSubtract();

      if (
        this.position <
        this.tokens.length
      ) {
        throw new Error(
          "Unexpected symbol."
        );
      }

      return result;
    }

    parseAddSubtract() {
      let value =
        this.parseMultiplyDivide();

      while (true) {
        if (this.consume("+")) {
          value +=
            this.parseMultiplyDivide();

        } else if (
          this.consume("-")
        ) {
          value -=
            this.parseMultiplyDivide();

        } else {
          break;
        }
      }

      return value;
    }

    parseMultiplyDivide() {
      let value =
        this.parsePower();

      while (true) {

        if (this.consume("*")) {
          value *=
            this.parsePower();

        } else if (
          this.consume("/")
        ) {
          const divisor =
            this.parsePower();

          if (divisor === 0) {
            throw new Error(
              "Cannot divide by zero."
            );
          }

          value /= divisor;

        } else {
          break;
        }
      }

      return value;
    }

    parsePower() {
      let value =
        this.parseUnary();

      if (this.consume("^")) {
        const exponent =
          this.parsePower();

        value =
          Math.pow(
            value,
            exponent
          );
      }

      return value;
    }

    parseUnary() {
      if (this.consume("+")) {
        return this.parseUnary();
      }

      if (this.consume("-")) {
        return -this.parseUnary();
      }

      return this.parsePrimary();
    }

    parsePrimary() {
      const token =
        this.current();

      if (!token) {
        throw new Error(
          "Incomplete expression."
        );
      }

      if (
        token.type === "number"
      ) {
        this.position++;
        return token.value;
      }

      if (this.consume("(")) {
        const value =
          this.parseAddSubtract();

        if (!this.consume(")")) {
          throw new Error(
            "Missing closing parenthesis."
          );
        }

        return value;
      }

      throw new Error(
        "Expected a number."
      );
    }
  }

  function calculate(expression) {
    const engine =
      window.NOVERA_CALCULATOR;

    /*
      Prefer your existing engine.
    */

    if (
      engine &&
      typeof engine.calculate ===
        "function"
    ) {
      try {
        const result =
          engine.calculate(
            expression
          );

        const extracted =
          extractResult(result);

        if (
          extracted !== null &&
          extracted !== undefined
        ) {
          return extracted;
        }
      } catch (error) {
        /*
          If engine rejects the expression,
          fallback handles basic arithmetic.
        */
      }
    }

    return safeExpression(
      expression
    );
  }

  function runCalculator() {
    const input =
      getToolInput("calculator");

    if (!input) {
      toast("Enter a calculation.");
      return;
    }

    try {
      const answer =
        calculate(input);

      showResult(
        answer,
        "calculator"
      );

      addHistory(
        "Calculator",
        input,
        answer
      );

    } catch (error) {
      showError(
        error.message ||
          "Invalid calculation."
      );
    }
  }

  /* =======================================================
     ALGEBRA
  ======================================================= */

  function parseLinearEquation(
    equation
  ) {
    const cleaned =
      equation
        .replace(/\s+/g, "")
        .replace(/−/g, "-");

    const parts =
      cleaned.split("=");

    if (parts.length !== 2) {
      throw new Error(
        "Use an equation such as 2x + 5 = 15."
      );
    }

    const left =
      linearCoefficients(parts[0]);

    const right =
      linearCoefficients(parts[1]);

    const a =
      left.a - right.a;

    const b =
      right.b - left.b;

    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) < 1e-12) {
        return "Every value of x satisfies the equation.";
      }

      return "No solution.";
    }

    return `x = ${cleanNumber(
      b / a
    )}`;
  }

  function linearCoefficients(side) {
    let expression =
      side
        .replace(/\*/g, "")
        .replace(/([0-9])x/gi, "$1*x");

    /*
      Convert subtraction to + negative.
    */

    expression =
      expression.replace(
        /-/g,
        "+-"
      );

    if (
      expression.startsWith("+")
    ) {
      expression =
        expression.slice(1);
    }

    const terms =
      expression.split("+");

    let a = 0;
    let b = 0;

    terms.forEach((term) => {
      if (!term) return;

      if (/x$/i.test(term)) {
        const coefficient =
          term
            .replace(/x$/i, "");

        if (
          coefficient === "" ||
          coefficient === "+"
        ) {
          a += 1;
        } else if (
          coefficient === "-"
        ) {
          a -= 1;
        } else {
          a += Number(
            coefficient
          );
        }

        return;
      }

      const xMatch =
        term.match(
          /^([+-]?\d*\.?\d*)\*x$/i
        );

      if (xMatch) {
        let coefficient =
          xMatch[1];

        if (
          coefficient === "" ||
          coefficient === "+"
        ) {
          coefficient = 1;
        }

        if (
          coefficient === "-"
        ) {
          coefficient = -1;
        }

        a += Number(
          coefficient
        );

        return;
      }

      const number =
        Number(term);

      if (!Number.isFinite(number)) {
        throw new Error(
          "Could not understand the equation."
        );
      }

      b += number;
    });

    return { a, b };
  }

  function quadraticCoefficients(
    equation
  ) {
    const cleaned =
      equation
        .replace(/\s+/g, "")
        .replace(/−/g, "-")
        .replace(/\^2/g, "²");

    const parts =
      cleaned.split("=");

    if (parts.length !== 2) {
      throw new Error(
        "Use an equation such as x² + 5x + 6 = 0."
      );
    }

    const expression =
      `${parts[0]}-(${parts[1]})`
        .replace(/²/g, "^2");

    const normalized =
      expression
        .replace(/-/g, "+-");

    const terms =
      normalized.split("+");

    let a = 0;
    let b = 0;
    let c = 0;

    terms.forEach((raw) => {
      const term =
        raw.replace(
          /^\+/,
          ""
        );

      if (!term) return;

      const squared =
        term.match(
          /^([+-]?\d*\.?\d*)x\^2$/i
        );

      if (squared) {
        let coefficient =
          squared[1];

        if (
          coefficient === "" ||
          coefficient === "+"
        ) {
          coefficient = 1;
        }

        if (
          coefficient === "-"
        ) {
          coefficient = -1;
        }

        a += Number(
          coefficient
        );

        return;
      }

      const linear =
        term.match(
          /^([+-]?\d*\.?\d*)x$/i
        );

      if (linear) {
        let coefficient =
          linear[1];

        if (
          coefficient === "" ||
          coefficient === "+"
        ) {
          coefficient = 1;
        }

        if (
          coefficient === "-"
        ) {
          coefficient = -1;
        }

        b += Number(
          coefficient
        );

        return;
      }

      const constant =
        Number(term);

      if (
        !Number.isFinite(
          constant
        )
      ) {
        throw new Error(
          "Could not understand the quadratic equation."
        );
      }

      c += constant;
    });

    return { a, b, c };
  }

  function solveQuadraticFallback(
    equation
  ) {
    const {
      a,
      b,
      c
    } =
      quadraticCoefficients(
        equation
      );

    if (
      Math.abs(a) < 1e-12
    ) {
      return parseLinearEquation(
        equation
      );
    }

    const discriminant =
      b * b - 4 * a * c;

    if (discriminant < 0) {
      const real =
        -b / (2 * a);

      const imaginary =
        Math.sqrt(
          -discriminant
        ) /
        Math.abs(2 * a);

      return `
        No real roots.<br>
        Complex roots:
        ${cleanNumber(real)}
        ± ${cleanNumber(imaginary)}i
      `;
    }

    if (
      Math.abs(discriminant) <
      1e-12
    ) {
      const root =
        -b / (2 * a);

      return `
        One repeated root:<br>
        x = ${cleanNumber(root)}
      `;
    }

    const root1 =
      (-b + Math.sqrt(discriminant)) /
      (2 * a);

    const root2 =
      (-b - Math.sqrt(discriminant)) /
      (2 * a);

    return `
      x₁ = ${cleanNumber(root1)}<br>
      x₂ = ${cleanNumber(root2)}
    `;
  }

  function solveSimultaneousFallback(
    eq1,
    eq2
  ) {
    const first =
      linearCoefficients(
        eq1.split("=")[0]
      );

    const firstRight =
      linearCoefficients(
        eq1.split("=")[1]
      );

    const second =
      linearCoefficients(
        eq2.split("=")[0]
      );

    const secondRight =
      linearCoefficients(
        eq2.split("=")[1]
      );

    const a1 =
      first.a - firstRight.a;

    const b1 =
      first.b - firstRight.b;

    const c1 =
      second.a - secondRight.a;

    const d1 =
      second.b - secondRight.b;

    /*
      a1*x + b1 = 0
      c1*x + d1 = 0

      This fallback handles one-variable
      simultaneous equations. For true
      x/y systems use the engine below.
    */

    const denominator =
      a1 * d1 -
      c1 * b1;

    if (
      Math.abs(denominator) <
      1e-12
    ) {
      return "No unique solution.";
    }

    return `
      x = ${cleanNumber(
        -b1 / a1
      )}
    `;
  }

  function runAlgebra() {
    const input =
      getToolInput("algebra");

    if (!input) {
      toast("Enter an equation.");
      return;
    }

    try {
      let result = null;

      const engine =
        window.NOVERA_ALGEBRA;

      if (engine) {

        /*
          Try common engine APIs.
        */

        if (
          typeof engine.solve ===
          "function"
        ) {
          try {
            result =
              engine.solve(input);
          } catch (_) {}
        }

        if (
          result == null &&
          typeof engine.solveLinear ===
          "function"
        ) {
          try {
            result =
              engine.solveLinear(
                input
              );
          } catch (_) {}
        }

        if (
          result == null &&
          typeof engine.solveQuadratic ===
          "function"
        ) {
          try {
            result =
              engine.solveQuadratic(
                input
              );
          } catch (_) {}
        }
      }

      const extracted =
        extractResult(result);

      if (
        extracted !== null &&
        extracted !== undefined
      ) {
        showResult(
          extracted,
          "algebra"
        );

        addHistory(
          "Algebra",
          input,
          extracted
        );

        return;
      }

      /*
        Fallback selection.
      */

      if (
        /x\^2|x²/i.test(input)
      ) {
        result =
          solveQuadraticFallback(
            input
          );
      } else {
        result =
          parseLinearEquation(
            input
          );
      }

      showResult(
        result,
        "algebra"
      );

      addHistory(
        "Algebra",
        input,
        result
      );

    } catch (error) {
      showError(
        error.message ||
          "Could not solve the equation."
      );
    }
  }

  /* =======================================================
     GRAPHING
  ======================================================= */

  function findGraphCanvas() {
    return (
      document.querySelector(
        "#graphCanvas"
      ) ||
      document.querySelector(
        "canvas[data-graph]"
      ) ||
      document.querySelector(
        ".graph-canvas"
      )
    );
  }

  function getGraphExpression() {
    return getToolInput(
      "graph"
    );
  }

  function evaluateGraphFunction(
    expression,
    x
  ) {
    let expr =
      String(expression || "")
        .trim();

    expr =
      expr
        .replace(/^y\s*=\s*/i, "")
        .replace(/^f\(x\)\s*=\s*/i, "")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/π/g, "Math.PI")
        .replace(/\^/g, "**")
        .replace(
          /\bsin\b/gi,
          "Math.sin"
        )
        .replace(
          /\bcos\b/gi,
          "Math.cos"
        )
        .replace(
          /\btan\b/gi,
          "Math.tan"
        )
        .replace(
          /\bsqrt\b/gi,
          "Math.sqrt"
        )
        .replace(
          /\blog\b/gi,
          "Math.log10"
        )
        .replace(
          /\bln\b/gi,
          "Math.log"
        )
        .replace(
          /\bexp\b/gi,
          "Math.exp"
        )
        .replace(
          /\be\b/g,
          "Math.E"
        );

    /*
      Degree-friendly trig.
      Users normally expect school graphing
      such as sin(x), so x is interpreted
      in radians unless degree notation is used.
    */

    if (
      /\bsin|cos|tan/i.test(
        expression
      )
    ) {
      /*
        Keep standard mathematical radians.
      */
    }

    /*
      Only permit safe mathematical characters.
    */

    if (
      !/^[0-9xX+\-*/().,%_*a-zA-Z]+$/.test(
        expr
      )
    ) {
      throw new Error(
        "Unsupported graph expression."
      );
    }

    /*
      Restrict identifiers to Math.* functions
      and x.
    */

    const allowed =
      expr.replace(
        /Math\.(sin|cos|tan|sqrt|log10|log|exp|PI|E)/g,
        ""
      );

    if (
      /[a-wyzA-WYZ_]/.test(
        allowed
      )
    ) {
      throw new Error(
        "Unknown graph function."
      );
    }

    try {
      const fn =
        new Function(
          "x",
          `"use strict"; return (${expr});`
        );

      const y =
        fn(x);

      if (
        typeof y !== "number" ||
        !Number.isFinite(y)
      ) {
        return null;
      }

      return y;

    } catch (error) {
      throw new Error(
        "Could not understand the graph expression."
      );
    }
  }

  function drawGraph(
    expression
  ) {
    const canvas =
      findGraphCanvas();

    if (!canvas) {
      /*
        If the current HTML has no canvas,
        create one inside the graph workspace.
      */

      const workspace =
        document.querySelector(
          "#graphWorkspace, .graph-workspace, [data-graph-workspace]"
        );

      if (!workspace) {
        throw new Error(
          "Graph workspace not found."
        );
      }

      canvas =
        document.createElement(
          "canvas"
        );

      canvas.id =
        "graphCanvas";

      canvas.className =
        "graph-canvas";

      workspace.appendChild(
        canvas
      );
    }

    const rect =
      canvas.getBoundingClientRect();

    const width =
      Math.max(
        320,
        Math.floor(
          rect.width ||
            canvas.clientWidth ||
            640
        )
      );

    const height =
      Math.max(
        320,
        Math.floor(
          rect.height ||
            canvas.clientHeight ||
            420
        )
      );

    const dpr =
      window.devicePixelRatio ||
      1;

    canvas.width =
      width * dpr;

    canvas.height =
      height * dpr;

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    const ctx =
      canvas.getContext(
        "2d"
      );

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    /*
      Coordinate system.
    */

    const xmin = -10;
    const xmax = 10;
    const ymin = -10;
    const ymax = 10;

    function px(x) {
      return (
        (x - xmin) /
          (xmax - xmin)
      ) * width;
    }

    function py(y) {
      return (
        1 -
          (y - ymin) /
            (ymax - ymin)
      ) * height;
    }

    /*
      Grid.
    */

    ctx.lineWidth = 1;

    for (
      let x = xmin;
      x <= xmax;
      x++
    ) {
      const screenX =
        px(x);

      ctx.beginPath();
      ctx.moveTo(
        screenX,
        0
      );
      ctx.lineTo(
        screenX,
        height
      );
      ctx.stroke();
    }

    for (
      let y = ymin;
      y <= ymax;
      y++
    ) {
      const screenY =
        py(y);

      ctx.beginPath();
      ctx.moveTo(
        0,
        screenY
      );
      ctx.lineTo(
        width,
        screenY
      );
      ctx.stroke();
    }

    /*
      Axes.
    */

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
      px(0),
      0
    );

    ctx.lineTo(
      px(0),
      height
    );

    ctx.moveTo(
      0,
      py(0)
    );

    ctx.lineTo(
      width,
      py(0)
    );

    ctx.stroke();

    /*
      Axis labels.
    */

    ctx.font =
      "12px sans-serif";

    for (
      let x = xmin;
      x <= xmax;
      x++
    ) {
      if (x === 0) continue;

      ctx.fillText(
        String(x),
        px(x) + 3,
        py(0) - 5
      );
    }

    for (
      let y = ymin;
      y <= ymax;
      y++
    ) {
      if (y === 0) continue;

      ctx.fillText(
        String(y),
        px(0) + 5,
        py(y) - 3
      );
    }

    /*
      Function.
    */

    ctx.lineWidth = 3;
    ctx.beginPath();

    let started =
      false;

    const steps =
      Math.max(
        600,
        width * 2
      );

    for (
      let i = 0;
      i <= steps;
      i++
    ) {
      const x =
        xmin +
        (xmax - xmin) *
          (i / steps);

      let y;

      try {
        y =
          evaluateGraphFunction(
            expression,
            x
          );
      } catch (error) {
        throw error;
      }

      if (
        y === null ||
        !Number.isFinite(y) ||
        Math.abs(y) > 100000
      ) {
        started = false;
        continue;
      }

      const screenX =
        px(x);

      const screenY =
        py(
          Math.max(
            ymin - 100,
            Math.min(
              ymax + 100,
              y
            )
          )
        );

      if (!started) {
        ctx.moveTo(
          screenX,
          screenY
        );

        started = true;
      } else {
        ctx.lineTo(
          screenX,
          screenY
        );
      }
    }

    ctx.stroke();

    return canvas;
  }

  function runGraph() {
    const expression =
      getGraphExpression();

    if (!expression) {
      toast(
        "Enter a function such as y = x²."
      );
      return;
    }

    try {
      const canvas =
        drawGraph(
          expression
        );

      showResult(
        `Graph plotted for ${escapeHTML(
          expression
        )}`,
        "graph"
      );

      addHistory(
        "Graph",
        expression,
        `Graph plotted`
      );

      canvas.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    } catch (error) {
      showError(
        error.message ||
          "Could not plot the graph."
      );
    }
  }

  /* =======================================================
     PHYSICS
  ======================================================= */

  function runPhysics() {
    const input =
      getToolInput(
        "physics"
      );

    if (!input) {
      toast(
        "Enter the required values."
      );
      return;
    }

    const engine =
      window.NOVERA_PHYSICS;

    try {
      let result = null;

      /*
        Try JSON-style command input first.
      */

      if (
        engine &&
        typeof engine.calculate ===
          "function"
      ) {
        try {
          result =
            engine.calculate(
              input
            );
        } catch (_) {}
      }

      /*
        Common simple format:
        speed: distance/time
      */

      if (
        result == null
      ) {
        const lower =
          input.toLowerCase();

        if (
          lower.includes("force")
        ) {
          const m =
            extractNamedNumber(
              input,
              "mass"
            );

          const a =
            extractNamedNumber(
              input,
              "acceleration"
            );

          if (
            Number.isFinite(m) &&
            Number.isFinite(a)
          ) {
            result =
              m * a;
          }
        }

        if (
          result == null &&
          lower.includes("speed")
        ) {
          const d =
            extractNamedNumber(
              input,
              "distance"
            );

          const t =
            extractNamedNumber(
              input,
              "time"
            );

          if (
            Number.isFinite(d) &&
            Number.isFinite(t) &&
            t !== 0
          ) {
            result =
              d / t;
          }
        }
      }

      if (
        result == null
      ) {
        result =
          tryPhysicsEngine(
            engine,
            input
          );
      }

      if (
        result == null
      ) {
        throw new Error(
          "Enter a supported physics calculation."
        );
      }

      const output =
        extractResult(
          result
        ) ??
        result;

      showResult(
        output,
        "physics"
      );

      addHistory(
        "Physics",
        input,
        output
      );

    } catch (error) {
      showError(
        error.message ||
          "Physics calculation failed."
      );
    }
  }

  function tryPhysicsEngine(
    engine,
    input
  ) {
    if (!engine) {
      return null;
    }

    const numberPattern =
      /-?\d+(?:\.\d+)?/g;

    const numbers =
      String(input).match(
        numberPattern
      ) || [];

    const values =
      numbers.map(Number);

    const lower =
      input.toLowerCase();

    try {
      if (
        lower.includes("speed") &&
        typeof engine.speed ===
          "function"
      ) {
        return engine.speed(
          values[0],
          values[1]
        );
      }

      if (
        lower.includes("force") &&
        typeof engine.force ===
          "function"
      ) {
        return engine.force(
          values[0],
          values[1]
        );
      }

      if (
        lower.includes("kinetic") &&
        typeof engine.kineticEnergy ===
          "function"
      ) {
        return engine.kineticEnergy(
          values[0],
          values[1]
        );
      }

      if (
        lower.includes("power") &&
        typeof engine.power ===
          "function"
      ) {
        return engine.power(
          values[0],
          values[1]
        );
      }

      if (
        lower.includes("electrical") &&
        typeof engine.electricalPower ===
          "function"
      ) {
        return engine.electricalPower(
          values[0],
          values[1]
        );
      }

    } catch (_) {}

    return null;
  }

  /* =======================================================
     CHEMISTRY
  ======================================================= */

  function runChemistry() {
    const input =
      getToolInput(
        "chemistry"
      );

    if (!input) {
      toast(
        "Enter the required values."
      );
      return;
    }

    const engine =
      window.NOVERA_CHEMISTRY;

    try {
      let result = null;

      if (
        engine &&
        typeof engine.calculate ===
          "function"
      ) {
        try {
          result =
            engine.calculate(
              input
            );
        } catch (_) {}
      }

      if (
        result == null
      ) {
        result =
          tryChemistryEngine(
            engine,
            input
          );
      }

      if (
        result == null
      ) {
        throw new Error(
          "Enter a supported chemistry calculation."
        );
      }

      const output =
        extractResult(
          result
        ) ??
        result;

      showResult(
        output,
        "chemistry"
      );

      addHistory(
        "Chemistry",
        input,
        output
      );

    } catch (error) {
      showError(
        error.message ||
          "Chemistry calculation failed."
      );
    }
  }

  function tryChemistryEngine(
    engine,
    input
  ) {
    if (!engine) {
      return null;
    }

    const values =
      (
        String(input).match(
          /-?\d+(?:\.\d+)?/g
        ) || []
      ).map(Number);

    const lower =
      input.toLowerCase();

    try {
      if (
        lower.includes("moles") &&
        lower.includes("mass") &&
        typeof engine.molesFromMass ===
          "function"
      ) {
        return engine.molesFromMass(
          values[0],
          values[1]
        );
      }

      if (
        lower.includes("molarity") &&
        typeof engine.molarity ===
          "function"
      ) {
        return engine.molarity(
          values[0],
          values[1]
        );
      }

      if (
        lower.includes("ph") &&
        typeof engine.pH ===
          "function"
      ) {
        return engine.pH(
          values[0]
        );
      }

      if (
        lower.includes("ideal gas") &&
        typeof engine.idealGasVolume ===
          "function"
      ) {
        return engine.idealGasVolume(
          values[0],
          values[1],
          values[2]
        );
      }

      if (
        lower.includes("heat") &&
        typeof engine.heat ===
          "function"
      ) {
        return engine.heat(
          values[0],
          values[1],
          values[2]
        );
      }

    } catch (_) {}

    return null;
  }

  /* =======================================================
     STATISTICS
  ======================================================= */

  function parseNumberList(
    input
  ) {
    const numbers =
      String(input)
        .split(/[\s,;]+/)
        .map(Number)
        .filter(
          Number.isFinite
        );

    if (!numbers.length) {
      throw new Error(
        "Enter numbers separated by commas."
      );
    }

    return numbers;
  }

  function runStatistics() {
    const input =
      getToolInput(
        "statistics"
      );

    if (!input) {
      toast(
        "Enter a data set."
      );
      return;
    }

    try {
      const numbers =
        parseNumberList(
          input
        );

      const engine =
        window.NOVERA_STATISTICS;

      let result = null;

      if (
        engine &&
        typeof engine.calculate ===
          "function"
      ) {
        try {
          result =
            engine.calculate(
              numbers
            );
        } catch (_) {}
      }

      if (
        result == null
      ) {
        result =
          statisticsFallback(
            numbers
          );
      }

      const output =
        extractResult(
          result
        ) ??
        result;

      showResult(
        output,
        "statistics"
      );

      addHistory(
        "Statistics",
        input,
        output
      );

    } catch (error) {
      showError(
        error.message ||
          "Statistics calculation failed."
      );
    }
  }

  function statisticsFallback(
    numbers
  ) {
    const sorted =
      [...numbers].sort(
        (a, b) => a - b
      );

    const sum =
      numbers.reduce(
        (a, b) => a + b,
        0
      );

    const mean =
      sum / numbers.length;

    const median =
      sorted.length % 2
        ? sorted[
            Math.floor(
              sorted.length / 2
            )
          ]
        : (
            sorted[
              sorted.length / 2 - 1
            ] +
            sorted[
              sorted.length / 2
            ]
          ) / 2;

    const frequencies =
      new Map();

    numbers.forEach(
      (number) => {
        frequencies.set(
          number,
          (frequencies.get(
            number
          ) || 0) + 1
        );
      }
    );

    const maxFrequency =
      Math.max(
        ...frequencies.values()
      );

    const modes =
      [...frequencies.entries()]
        .filter(
          ([, count]) =>
            count ===
            maxFrequency
        )
        .map(
          ([value]) =>
            value
        );

    const range =
      sorted[
        sorted.length - 1
      ] -
      sorted[0];

    const variance =
      numbers.reduce(
        (total, value) =>
          total +
          Math.pow(
            value - mean,
            2
          ),
        0
      ) /
      numbers.length;

    const standardDeviation =
      Math.sqrt(
        variance
      );

    return `
      <div class="stats-result">
        <strong>Mean:</strong>
        ${cleanNumber(mean)}
        <br>
        <strong>Median:</strong>
        ${cleanNumber(median)}
        <br>
        <strong>Mode:</strong>
        ${modes
          .map(cleanNumber)
          .join(", ")}
        <br>
        <strong>Range:</strong>
        ${cleanNumber(range)}
        <br>
        <strong>Population SD:</strong>
        ${cleanNumber(
          standardDeviation
        )}
      </div>
    `;
  }

  /* =======================================================
     NAMED NUMBER HELPER
  ======================================================= */

  function extractNamedNumber(
    input,
    name
  ) {
    const regex =
      new RegExp(
        `${name}\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)`,
        "i"
      );

    const match =
      String(input).match(
        regex
      );

    return match
      ? Number(match[1])
      : NaN;
  }

  /* =======================================================
     INPUT DETECTION
  ======================================================= */

  function toolSelectors(
    tool
  ) {
    const map = {
      calculator: [
        "#calculatorInput",
        "#calcInput",
        "[data-tool-input='calculator']",
        ".calculator-input"
      ],

      algebra: [
        "#algebraInput",
        "[data-tool-input='algebra']",
        ".algebra-input"
      ],

      graph: [
        "#graphInput",
        "#functionInput",
        "[data-tool-input='graph']",
        ".graph-input"
      ],

      physics: [
        "#physicsInput",
        "[data-tool-input='physics']",
        ".physics-input"
      ],

      chemistry: [
        "#chemistryInput",
        "[data-tool-input='chemistry']",
        ".chemistry-input"
      ],

      statistics: [
        "#statisticsInput",
        "#statsInput",
        "[data-tool-input='statistics']",
        ".statistics-input"
      ]
    };

    return map[tool] || [];
  }

  function getToolInput(
    tool
  ) {
    for (
      const selector of toolSelectors(
        tool
      )
    ) {
      const input =
        document.querySelector(
          selector
        );

      if (input) {
        return input.value.trim();
      }
    }

    /*
      Fallback:
      Find visible input/textarea inside active panel.
    */

    const panel =
      document.querySelector(
        `[data-tool-panel="${tool}"], #${tool}Panel, .tool-panel.active`
      );

    if (panel) {
      const input =
        panel.querySelector(
          "input:not([type='button']):not([type='submit']), textarea"
        );

      if (input) {
        return input.value.trim();
      }
    }

    return "";
  }

  function setToolInput(
    tool,
    value
  ) {
    for (
      const selector of toolSelectors(
        tool
      )
    ) {
      const input =
        document.querySelector(
          selector
        );

      if (input) {
        input.value =
          value;

        input.focus();

        return;
      }
    }
  }

  /* =======================================================
     RESULT DISPLAY
  ======================================================= */

  function findResultBox() {
    return (
      document.querySelector(
        "#toolResult"
      ) ||
      document.querySelector(
        "#result"
      ) ||
      document.querySelector(
        ".tool-result"
      ) ||
      document.querySelector(
        ".result-box"
      ) ||
      document.querySelector(
        "[data-result]"
      )
    );
  }

  function showResult(
    result,
    tool
  ) {
    const box =
      findResultBox();

    if (!box) {
      console.log(
        `[Novera ${tool}]`,
        result
      );

      return;
    }

    box.classList.remove(
      "error"
    );

    /*
      If result is HTML produced intentionally
      by our controller, render it.

      Otherwise escape the result.
    */

    if (
      typeof result === "string" &&
      /<(div|br|strong|span)[\s>]/i.test(
        result
      )
    ) {
      box.innerHTML = result;
    } else {
      box.textContent =
        String(result);
    }

    box.classList.add(
      "has-result"
    );
  }

  function showError(
    message
  ) {
    const box =
      findResultBox();

    if (!box) {
      toast(message);
      return;
    }

    box.classList.add(
      "error"
    );

    box.textContent =
      message;
  }

  /* =======================================================
     TOOL ACTIVATION
  ======================================================= */

  function normalizeToolName(
    value
  ) {
    const raw =
      String(value || "")
        .toLowerCase()
        .replace(/\s+/g, "");

    const aliases = {
      calc: "calculator",
      calculator: "calculator",

      algebra: "algebra",

      graph: "graph",
      graphing: "graph",

      physics: "physics",

      chemistry: "chemistry",
      chem: "chemistry",

      statistics: "statistics",
      statistic: "statistics",
      stats: "statistics"
    };

    return (
      aliases[raw] ||
      raw
    );
  }

  function activateTool(
    tool
  ) {
    const normalized =
      normalizeToolName(
        tool
      );

    state.activeTool =
      normalized;

    /*
      Common tab selectors.
    */

    $$(".tool-tab, .tool-nav button, [data-tool]")
      .forEach((button) => {
        const value =
          normalizeToolName(
            button.dataset.tool ||
              button.dataset.toolName ||
              button.textContent
          );

        button.classList.toggle(
          "active",
          value === normalized
        );
      });

    /*
      Common panels.
    */

    $$(".tool-panel").forEach(
      (panel) => {
        const value =
          normalizeToolName(
            panel.dataset.tool ||
              panel.dataset.toolPanel ||
              panel.id.replace(
                /Panel$/i,
                ""
              )
          );

        panel.classList.toggle(
          "active",
          value === normalized
        );
      }
    );

    /*
      Alternative panel structure.
    */

    $$("[data-tool-panel]").forEach(
      (panel) => {
        panel.classList.toggle(
          "active",
          normalizeToolName(
            panel.dataset.toolPanel
          ) === normalized
        );
      }
    );
  }

  /* =======================================================
     RUN BUTTONS
  ======================================================= */

  function runActiveTool() {
    switch (
      normalizeToolName(
        state.activeTool
      )
    ) {
      case "calculator":
        runCalculator();
        break;

      case "algebra":
        runAlgebra();
        break;

      case "graph":
        runGraph();
        break;

      case "physics":
        runPhysics();
        break;

      case "chemistry":
        runChemistry();
        break;

      case "statistics":
        runStatistics();
        break;

      default:
        toast(
          "Select a toolkit."
        );
    }
  }

  function initToolButtons() {
    /*
      Tabs.
    */

    $$(
      ".tool-tab, .tool-nav button, [data-tool]"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          const tool =
            button.dataset.tool ||
            button.dataset.toolName ||
            button.textContent;

          activateTool(tool);
        }
      );
    });

    /*
      Explicit run buttons.
    */

    $$(
      "[data-run-tool], .run-tool, #calculateButton, #solveButton, #graphButton"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          const tool =
            button.dataset.runTool;

          if (tool) {
            activateTool(tool);
          }

          runActiveTool();
        }
      );
    });

    /*
      Tool-specific buttons if present.
    */

    $$("[data-calculate]").forEach(
      (button) => {
        button.addEventListener(
          "click",
          (event) => {
            event.preventDefault();

            activateTool(
              button.dataset.calculate
            );

            runActiveTool();
          }
        );
      }
    );
  }

  /* =======================================================
     ENTER KEY
  ======================================================= */

  function initKeyboard() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key !== "Enter"
        ) {
          return;
        }

        const active =
          document.activeElement;

        if (
          !active ||
          !(
            active.tagName ===
              "INPUT" ||
            active.tagName ===
              "TEXTAREA"
          )
        ) {
          return;
        }

        event.preventDefault();

        runActiveTool();
      }
    );
  }

  /* =======================================================
     CALCULATOR QUICK CHIPS
  ======================================================= */

  function initCalculatorChips() {
    $$(
      "[data-calculation], .calculator-chip, .example-chip"
    ).forEach((chip) => {
      chip.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          const value =
            chip.dataset.calculation ||
            chip.dataset.expression ||
            chip.textContent.trim();

          /*
            Ignore labels that don't resemble
            a calculation.
          */

          if (
            !/[0-9]/.test(value)
          ) {
            return;
          }

          activateTool(
            "calculator"
          );

          setToolInput(
            "calculator",
            value
          );

          runCalculator();
        }
      );
    });
  }

  /* =======================================================
     CLEAR WORKSPACE
  ======================================================= */

  function clearWorkspace() {
    $$(
      "input, textarea"
    ).forEach((input) => {
      if (
        input.closest(
          ".tool-panel, .tool-workspace, main"
        )
      ) {
        input.value = "";
      }
    });

    const box =
      findResultBox();

    if (box) {
      box.textContent = "";
      box.classList.remove(
        "has-result",
        "error"
      );
    }

    toast(
      "Workspace cleared."
    );
  }

  function initClearButtons() {
    $$(
      "#clearButton, .clear-workspace, [data-clear]"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          clearWorkspace();
        }
      );
    });

    $$(
      "#clearHistory, [data-clear-history]"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          clearHistory();
        }
      );
    });
  }

  /* =======================================================
     THEME
  ======================================================= */

  function initTheme() {
    const toggle =
      document.querySelector(
        "#themeToggle, .theme-toggle, [data-theme-toggle]"
      );

    if (!toggle) return;

    const saved =
      localStorage.getItem(
        "novera_toolkit_theme"
      );

    if (
      saved === "light"
    ) {
      document.body.classList.add(
        "light-mode"
      );
    }

    toggle.addEventListener(
      "click",
      () => {
        document.body.classList.toggle(
          "light-mode"
        );

        localStorage.setItem(
          "novera_toolkit_theme",
          document.body.classList.contains(
            "light-mode"
          )
            ? "light"
            : "dark"
        );
      }
    );
  }

  /* =======================================================
     REVEAL
  ======================================================= */

  function initReveal() {
    const elements =
      $$(".reveal, .reveal-on-scroll");

    if (
      !elements.length
    ) {
      return;
    }

    if (
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      elements.forEach(
        (element) =>
          element.classList.add(
            "revealed"
          )
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                entry.target.classList.add(
                  "revealed"
                );

                observer.unobserve(
                  entry.target
                );
              }
            }
          );
        },
        {
          threshold: 0.1
        }
      );

    elements.forEach(
      (element) =>
        observer.observe(
          element
        )
    );
  }

  /* =======================================================
     RESPONSIVE GRAPH
  ======================================================= */

  function initResize() {
    let timer;

    window.addEventListener(
      "resize",
      () => {
        clearTimeout(timer);

        timer =
          setTimeout(() => {
            if (
              state.activeTool ===
              "graph"
            ) {
              const expression =
                getGraphExpression();

              if (
                expression
              ) {
                try {
                  drawGraph(
                    expression
                  );
                } catch (_) {}
              }
            }
          }, 150);
      }
    );
  }

  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.NOVERA_TOOLKIT = {
    state,

    activateTool,
    runActiveTool,

    calculate,
    safeExpression,

    runCalculator,
    runAlgebra,
    runGraph,
    runPhysics,
    runChemistry,
    runStatistics,

    clearHistory,
    clearWorkspace,

    getHistory: () =>
      state.history.slice()
  };

  /* =======================================================
     INIT
  ======================================================= */

  function init() {
    initToolButtons();
    initCalculatorChips();
    initClearButtons();

    initKeyboard();
    initTheme();
    initReveal();
    initResize();

    renderHistory();

    /*
      Default tool.
    */

    activateTool(
      "calculator"
    );
  }

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
