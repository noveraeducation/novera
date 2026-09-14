/* =========================================================
   NOVERA CALCULATOR ENGINE V2.0
   Universal expression calculator
========================================================= */

(function () {
  "use strict";

  const history = [];

  function cleanExpression(input) {
    let s = String(input || "").trim();

    s = s
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/π/g, "pi")
      .replace(/√/g, "sqrt")
      .replace(/\^/g, "**");

    return s;
  }

  function factorial(n) {
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      throw new Error("Factorial needs a non-negative integer.");
    }

    if (n > 170) {
      throw new Error("Number is too large.");
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
      result *= i;
    }

    return result;
  }

  function evaluate(expression) {
    let s = cleanExpression(expression);

    if (!s) {
      throw new Error("Enter an expression.");
    }

    // Percentage
    s = s.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

    // Factorial
    s = s.replace(/(\d+(?:\.\d+)?)!/g, "factorial($1)");

    // Protect against dangerous characters.
    if (!/^[0-9+\-*/().,\s_a-zA-Z**]+$/.test(s)) {
      throw new Error("Invalid characters.");
    }

    const allowed = {
      pi: Math.PI,
      e: Math.E,

      sqrt: Math.sqrt,
      abs: Math.abs,
      floor: Math.floor,
      ceil: Math.ceil,
      round: Math.round,

      sin: x => Math.sin(x * Math.PI / 180),
      cos: x => Math.cos(x * Math.PI / 180),
      tan: x => Math.tan(x * Math.PI / 180),

      asin: x => Math.asin(x) * 180 / Math.PI,
      acos: x => Math.acos(x) * 180 / Math.PI,
      atan: x => Math.atan(x) * 180 / Math.PI,

      log: Math.log10,
      ln: Math.log,
      exp: Math.exp,

      factorial
    };

    const names = Object.keys(allowed);
    const values = Object.values(allowed);

    let fn;

    try {
      fn = Function(
        ...names,
        `"use strict"; return (${s});`
      );
    } catch {
      throw new Error("Invalid expression.");
    }

    let answer;

    try {
      answer = fn(...values);
    } catch {
      throw new Error("Could not calculate.");
    }

    if (typeof answer !== "number" || !Number.isFinite(answer)) {
      throw new Error("Result is not a valid number.");
    }

    return answer;
  }

  function format(value, decimals = 10) {
    if (!Number.isFinite(value)) return "Error";

    if (Math.abs(value) < 1e-12) {
      value = 0;
    }

    const rounded = Number(value.toFixed(decimals));

    return rounded.toLocaleString("en-US", {
      maximumFractionDigits: decimals
    });
  }

  function calculate(expression) {
    const answer = evaluate(expression);

    const item = {
      expression: String(expression),
      answer,
      display: format(answer),
      time: Date.now()
    };

    history.unshift(item);

    if (history.length > 50) {
      history.pop();
    }

    return item;
  }

  function percentage(value, percent) {
    return Number(value) * Number(percent) / 100;
  }

  function fraction(numerator, denominator) {
    if (Number(denominator) === 0) {
      throw new Error("Cannot divide by zero.");
    }

    return Number(numerator) / Number(denominator);
  }

  function percentageChange(oldValue, newValue) {
    oldValue = Number(oldValue);
    newValue = Number(newValue);

    if (oldValue === 0) {
      throw new Error("Original value cannot be zero.");
    }

    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  }

  function unitConversion(value, from, to) {
    const conversions = {
      length: {
        m: 1,
        cm: 0.01,
        mm: 0.001,
        km: 1000,
        in: 0.0254,
        ft: 0.3048,
        yd: 0.9144,
        mile: 1609.344
      },

      mass: {
        kg: 1,
        g: 0.001,
        mg: 0.000001,
        lb: 0.45359237
      },

      time: {
        s: 1,
        min: 60,
        h: 3600,
        day: 86400
      }
    };

    for (const category of Object.values(conversions)) {
      if (category[from] !== undefined && category[to] !== undefined) {
        return Number(value) * category[from] / category[to];
      }
    }

    throw new Error("Unsupported unit conversion.");
  }

  window.NOVERA_CALCULATOR = {
    evaluate,
    calculate,
    format,
    percentage,
    fraction,
    percentageChange,
    unitConversion,
    factorial,
    history
  };
})();
