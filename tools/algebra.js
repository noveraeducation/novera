/* =========================================================
   NOVERA ALGEBRA ENGINE V2.0
========================================================= */

(function () {
  "use strict";

  function clean(s) {
    return String(s || "")
      .trim()
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/\s+/g, "");
  }

  function evaluate(expression, variables = {}) {
    let s = clean(expression);

    if (!s) {
      throw new Error("Enter an expression.");
    }

    if (!/^[0-9a-zA-Z+\-*/().^]+$/.test(s)) {
      throw new Error("Invalid expression.");
    }

    s = s.replace(/\^/g, "**");

    const names = Object.keys(variables);
    const values = Object.values(variables);

    let fn;

    try {
      fn = Function(
        ...names,
        `"use strict"; return (${s});`
      );
    } catch {
      throw new Error("Invalid algebraic expression.");
    }

    let result;

    try {
      result = fn(...values);
    } catch {
      throw new Error("Could not evaluate expression.");
    }

    if (typeof result !== "number" || !Number.isFinite(result)) {
      throw new Error("Result is not valid.");
    }

    return result;
  }

  function linearEquation(a, b) {
    a = Number(a);
    b = Number(b);

    if (a === 0) {
      if (b === 0) {
        return {
          type: "infinite",
          answer: null,
          message: "Infinitely many solutions."
        };
      }

      return {
        type: "none",
        answer: null,
        message: "No solution."
      };
    }

    const x = -b / a;

    return {
      type: "single",
      answer: x,
      message: `x = ${format(x)}`
    };
  }

  function solveLinearFromText(equation) {
    let s = clean(equation);

    const parts = s.split("=");

    if (parts.length !== 2) {
      throw new Error("Use an equation like 2x + 5 = 15.");
    }

    const left = parts[0];
    const right = parts[1];

    function coefficientSide(side) {
      let a = 0;
      let b = 0;

      const normalized = side
        .replace(/-/g, "+-")
        .replace(/^\+/, "");

      const terms = normalized.split("+").filter(Boolean);

      terms.forEach(term => {
        if (/x/.test(term)) {
          const coefficient = term
            .replace("x", "")
            .replace("*", "");

          if (coefficient === "" || coefficient === "+") {
            a += 1;
          } else if (coefficient === "-") {
            a -= 1;
          } else {
            a += Number(coefficient);
          }
        } else {
          b += Number(term);
        }
      });

      return { a, b };
    }

    const L = coefficientSide(left);
    const R = coefficientSide(right);

    return linearEquation(
      L.a - R.a,
      L.b - R.b
    );
  }

  function quadratic(a, b, c) {
    a = Number(a);
    b = Number(b);
    c = Number(c);

    if (a === 0) {
      return linearEquation(b, c);
    }

    const D = b * b - 4 * a * c;

    if (D > 0) {
      const x1 = (-b + Math.sqrt(D)) / (2 * a);
      const x2 = (-b - Math.sqrt(D)) / (2 * a);

      return {
        type: "two-real",
        discriminant: D,
        x1,
        x2,
        message: `x₁ = ${format(x1)}, x₂ = ${format(x2)}`
      };
    }

    if (D === 0) {
      const x = -b / (2 * a);

      return {
        type: "one-real",
        discriminant: D,
        x1: x,
        x2: x,
        message: `x = ${format(x)}`
      };
    }

    const real = -b / (2 * a);
    const imaginary = Math.sqrt(-D) / Math.abs(2 * a);

    return {
      type: "complex",
      discriminant: D,
      real,
      imaginary,
      message:
        `x = ${format(real)} ± ${format(imaginary)}i`
    };
  }

  function discriminant(a, b, c) {
    return Number(b) ** 2 -
      4 * Number(a) * Number(c);
  }

  function gcd(a, b) {
    a = Math.abs(Math.trunc(a));
    b = Math.abs(Math.trunc(b));

    while (b !== 0) {
      [a, b] = [b, a % b];
    }

    return a;
  }

  function lcm(a, b) {
    a = Number(a);
    b = Number(b);

    if (a === 0 || b === 0) return 0;

    return Math.abs(a * b) / gcd(a, b);
  }

  function ratio(a, b) {
    a = Number(a);
    b = Number(b);

    if (b === 0) {
      throw new Error("Ratio cannot use zero.");
    }

    const g = gcd(a, b);

    return {
      a: a / g,
      b: b / g,
      display: `${a / g} : ${b / g}`
    };
  }

  function proportion(a, b, c) {
    a = Number(a);
    b = Number(b);
    c = Number(c);

    if (a === 0) {
      throw new Error("Cannot divide by zero.");
    }

    return (b * c) / a;
  }

  function percentageChange(oldValue, newValue) {
    oldValue = Number(oldValue);
    newValue = Number(newValue);

    if (oldValue === 0) {
      throw new Error("Original value cannot be zero.");
    }

    return ((newValue - oldValue) /
      Math.abs(oldValue)) * 100;
  }

  function slope(x1, y1, x2, y2) {
    x1 = Number(x1);
    y1 = Number(y1);
    x2 = Number(x2);
    y2 = Number(y2);

    if (x2 === x1) {
      return Infinity;
    }

    return (y2 - y1) / (x2 - x1);
  }

  function midpoint(x1, y1, x2, y2) {
    return {
      x: (Number(x1) + Number(x2)) / 2,
      y: (Number(y1) + Number(y2)) / 2
    };
  }

  function distance(x1, y1, x2, y2) {
    return Math.sqrt(
      (Number(x2) - Number(x1)) ** 2 +
      (Number(y2) - Number(y1)) ** 2
    );
  }

  function exponent(base, power) {
    return Number(base) ** Number(power);
  }

  function format(value) {
    if (!Number.isFinite(value)) {
      return String(value);
    }

    if (Math.abs(value) < 1e-12) {
      value = 0;
    }

    return Number(value.toFixed(10)).toLocaleString(
      "en-US",
      {
        maximumFractionDigits: 10
      }
    );
  }

  window.NOVERA_ALGEBRA = {
    evaluate,
    linearEquation,
    solveLinearFromText,
    quadratic,
    discriminant,
    gcd,
    lcm,
    ratio,
    proportion,
    percentageChange,
    slope,
    midpoint,
    distance,
    exponent,
    format
  };
})();
