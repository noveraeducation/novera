/* =========================================================
   NOVERA GRAPH ENGINE V2.0
========================================================= */

(function () {
  "use strict";

  function normalize(expression) {
    return String(expression || "")
      .trim()
      .replace(/^y\s*=/i, "")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/\^/g, "**")
      .replace(/π/g, "Math.PI")
      .replace(/\bsqrt\b/gi, "Math.sqrt")
      .replace(/\bsin\b/gi, "Math.sin")
      .replace(/\bcos\b/gi, "Math.cos")
      .replace(/\btan\b/gi, "Math.tan")
      .replace(/\blog\b/gi, "Math.log10")
      .replace(/\bln\b/gi, "Math.log");
  }

  function createFunction(expression) {
    const code = normalize(expression);

    if (!code) {
      throw new Error("Enter an equation.");
    }

    // x, numbers, operators and common Math expressions only.
    if (!/^[0-9xX+\-*/().,\sA-Za-z_*]+$/.test(code)) {
      throw new Error("Invalid graph expression.");
    }

    try {
      const fn = Function(
        "x",
        `"use strict"; return (${code});`
      );

      // Test once.
      const test = fn(0);

      if (
        typeof test !== "number" &&
        typeof test !== "undefined"
      ) {
        throw new Error();
      }

      return fn;
    } catch {
      throw new Error("Could not read this equation.");
    }
  }

  function generatePoints(expression, min = -10, max = 10, step = 0.5) {
    const fn = createFunction(expression);

    const points = [];

    min = Number(min);
    max = Number(max);
    step = Number(step);

    if (!Number.isFinite(min) ||
        !Number.isFinite(max) ||
        !Number.isFinite(step) ||
        step <= 0) {
      throw new Error("Invalid graph range.");
    }

    if (max <= min) {
      throw new Error("Maximum must be greater than minimum.");
    }

    const maxPoints = 5000;

    let count = 0;

    for (
      let x = min;
      x <= max + step / 2 && count < maxPoints;
      x += step
    ) {
      let y;

      try {
        y = fn(x);
      } catch {
        y = NaN;
      }

      if (Number.isFinite(y)) {
        points.push({
          x,
          y
        });
      }

      count++;
    }

    return points;
  }

  function point(x, y) {
    return {
      x: Number(x),
      y: Number(y)
    };
  }

  function distance(x1, y1, x2, y2) {
    return Math.sqrt(
      (Number(x2) - Number(x1)) ** 2 +
      (Number(y2) - Number(y1)) ** 2
    );
  }

  function midpoint(x1, y1, x2, y2) {
    return {
      x: (Number(x1) + Number(x2)) / 2,
      y: (Number(y1) + Number(y2)) / 2
    };
  }

  function slope(x1, y1, x2, y2) {
    x1 = Number(x1);
    y1 = Number(y1);
    x2 = Number(x2);
    y2 = Number(y2);

    if (x1 === x2) {
      return Infinity;
    }

    return (y2 - y1) / (x2 - x1);
  }

  function linear(a, b) {
    a = Number(a);
    b = Number(b);

    return createFunction(`${a}*x + ${b}`);
  }

  function quadratic(a, b, c) {
    a = Number(a);
    b = Number(b);
    c = Number(c);

    return createFunction(
      `${a}*x**2 + ${b}*x + ${c}`
    );
  }

  function quadraticRoots(a, b, c) {
    a = Number(a);
    b = Number(b);
    c = Number(c);

    if (a === 0) {
      if (b === 0) return [];

      return [-c / b];
    }

    const D = b * b - 4 * a * c;

    if (D < 0) {
      return [];
    }

    if (D === 0) {
      return [-b / (2 * a)];
    }

    return [
      (-b + Math.sqrt(D)) / (2 * a),
      (-b - Math.sqrt(D)) / (2 * a)
    ];
  }

  function intercepts(expression, min = -100, max = 100) {
    const fn = createFunction(expression);

    const roots = [];

    const step = 0.05;

    let previousX = min;
    let previousY = fn(previousX);

    for (
      let x = min + step;
      x <= max;
      x += step
    ) {
      const y = fn(x);

      if (
        Number.isFinite(previousY) &&
        Number.isFinite(y)
      ) {
        if (previousY === 0) {
          roots.push(previousX);
        }

        if (previousY * y < 0) {
          let left = previousX;
          let right = x;

          for (let i = 0; i < 50; i++) {
            const middle = (left + right) / 2;
            const value = fn(middle);

            if (previousY * value <= 0) {
              right = middle;
            } else {
              left = middle;
              previousY = value;
            }
          }

          roots.push((left + right) / 2);
        }
      }

      previousX = x;
      previousY = y;
    }

    return roots;
  }

  function intersection(
    expression1,
    expression2,
    min = -100,
    max = 100
  ) {
    const f1 = createFunction(expression1);
    const f2 = createFunction(expression2);

    const difference = x => f1(x) - f2(x);

    const roots = [];

    const step = 0.05;

    let previousX = min;
    let previousY = difference(previousX);

    for (
      let x = min + step;
      x <= max;
      x += step
    ) {
      const y = difference(x);

      if (
        Number.isFinite(previousY) &&
        Number.isFinite(y) &&
        previousY * y < 0
      ) {
        let left = previousX;
        let right = x;

        for (let i = 0; i < 50; i++) {
          const middle = (left + right) / 2;
          const value = difference(middle);

          if (previousY * value <= 0) {
            right = middle;
          } else {
            left = middle;
            previousY = value;
          }
        }

        const root = (left + right) / 2;

        roots.push({
          x: root,
          y: f1(root)
        });
      }

      previousX = x;
      previousY = y;
    }

    return roots;
  }

  function range(points) {
    if (!points.length) {
      return null;
    }

    const ys = points.map(p => p.y);

    return {
      min: Math.min(...ys),
      max: Math.max(...ys)
    };
  }

  function format(value) {
    if (!Number.isFinite(value)) {
      return String(value);
    }

    return Number(value.toFixed(8)).toLocaleString(
      "en-US",
      {
        maximumFractionDigits: 8
      }
    );
  }

  window.NOVERA_GRAPH = {
    createFunction,
    generatePoints,
    point,
    distance,
    midpoint,
    slope,
    linear,
    quadratic,
    quadraticRoots,
    intercepts,
    intersection,
    range,
    format
  };
})();
