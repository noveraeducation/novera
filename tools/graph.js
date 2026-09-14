/* =========================================================
   NOVERA — UNIVERSAL GRAPH ENGINE
   Easy to use • Flexible • No external libraries
   ========================================================= */

(function () {
  "use strict";

  const NOVERA_GRAPH = {

    name: "Novera Graphing",
    version: "1.0",

    /* =====================================================
       BASIC POINT OPERATIONS
    ===================================================== */

    point(x, y) {
      return {
        x: Number(x),
        y: Number(y)
      };
    },

    distance(x1, y1, x2, y2) {
      return Math.sqrt(
        Math.pow(Number(x2) - Number(x1), 2) +
        Math.pow(Number(y2) - Number(y1), 2)
      );
    },

    midpoint(x1, y1, x2, y2) {
      return {
        x: (Number(x1) + Number(x2)) / 2,
        y: (Number(y1) + Number(y2)) / 2
      };
    },

    slope(x1, y1, x2, y2) {

      x1 = Number(x1);
      y1 = Number(y1);
      x2 = Number(x2);
      y2 = Number(y2);

      if (x1 === x2) {
        return {
          type: "undefined",
          value: null,
          message: "Vertical line"
        };
      }

      return {
        type: "defined",
        value: (y2 - y1) / (x2 - x1)
      };
    },


    /* =====================================================
       LINEAR FUNCTIONS
       y = mx + c
    ===================================================== */

    linear(m, c) {

      m = Number(m);
      c = Number(c);

      return {
        type: "linear",
        equation: `y = ${m}x + ${c}`,

        evaluate(x) {
          return (m * Number(x)) + c;
        },

        slope: m,
        yIntercept: c
      };
    },


    /* =====================================================
       QUADRATIC FUNCTIONS
       y = ax² + bx + c
    ===================================================== */

    quadratic(a, b, c) {

      a = Number(a);
      b = Number(b);
      c = Number(c);

      if (a === 0) {
        return this.linear(b, c);
      }

      const discriminant =
        Math.pow(b, 2) - (4 * a * c);

      const vertexX =
        -b / (2 * a);

      const vertexY =
        a * Math.pow(vertexX, 2) +
        b * vertexX +
        c;

      return {
        type: "quadratic",

        equation:
          `y = ${a}x² + ${b}x + ${c}`,

        evaluate(x) {

          x = Number(x);

          return (
            a * Math.pow(x, 2) +
            b * x +
            c
          );
        },

        vertex: {
          x: vertexX,
          y: vertexY
        },

        discriminant,

        opensUpward: a > 0,

        yIntercept: c
      };
    },


    /* =====================================================
       TRIGONOMETRIC FUNCTIONS
       ANGLES ARE IN RADIANS INTERNALLY
    ===================================================== */

    sine(amplitude = 1, frequency = 1, phase = 0) {

      return {
        type: "sine",

        evaluate(x) {
          return Number(amplitude) *
            Math.sin(
              Number(frequency) *
              Number(x) +
              Number(phase)
            );
        }
      };
    },

    cosine(amplitude = 1, frequency = 1, phase = 0) {

      return {
        type: "cosine",

        evaluate(x) {
          return Number(amplitude) *
            Math.cos(
              Number(frequency) *
              Number(x) +
              Number(phase)
            );
        }
      };
    },

    tangent(frequency = 1, phase = 0) {

      return {
        type: "tangent",

        evaluate(x) {
          return Math.tan(
            Number(frequency) *
            Number(x) +
            Number(phase)
          );
        }
      };
    },


    /* =====================================================
       EXPONENTIAL
       y = a × bˣ
    ===================================================== */

    exponential(a, b) {

      a = Number(a);
      b = Number(b);

      return {
        type: "exponential",

        equation: `y = ${a} × ${b}^x`,

        evaluate(x) {
          return a * Math.pow(b, Number(x));
        }
      };
    },


    /* =====================================================
       LOGARITHMIC
       y = a log_b(x)
    ===================================================== */

    logarithmic(a = 1, base = Math.E) {

      a = Number(a);
      base = Number(base);

      if (base <= 0 || base === 1) {
        throw new Error(
          "Logarithm base must be positive and not equal to 1."
        );
      }

      return {
        type: "logarithmic",

        evaluate(x) {

          x = Number(x);

          if (x <= 0) {
            return NaN;
          }

          return a *
            (Math.log(x) / Math.log(base));
        }
      };
    },


    /* =====================================================
       POLYNOMIAL
       coefficients:
       [a, b, c] → ax² + bx + c
    ===================================================== */

    polynomial(coefficients) {

      if (!Array.isArray(coefficients) ||
          coefficients.length === 0) {
        throw new Error("Enter polynomial coefficients.");
      }

      const values =
        coefficients.map(Number);

      return {

        type: "polynomial",

        evaluate(x) {

          x = Number(x);

          return values.reduce(
            (sum, coefficient) =>
              (sum * x) + coefficient,
            0
          );
        },

        degree: values.length - 1
      };
    },


    /* =====================================================
       INTERSECTION OF TWO LINEAR FUNCTIONS
    ===================================================== */

    linearIntersection(m1, c1, m2, c2) {

      m1 = Number(m1);
      c1 = Number(c1);
      m2 = Number(m2);
      c2 = Number(c2);

      if (m1 === m2) {

        if (c1 === c2) {
          return {
            type: "same-line",
            message: "The two lines overlap."
          };
        }

        return {
          type: "parallel",
          message: "The two lines are parallel."
        };
      }

      const x =
        (c2 - c1) / (m1 - m2);

      const y =
        (m1 * x) + c1;

      return {
        type: "single",
        point: { x, y }
      };
    },


    /* =====================================================
       X INTERCEPT OF A LINE
       y = mx + c
    ===================================================== */

    xIntercept(m, c) {

      m = Number(m);
      c = Number(c);

      if (m === 0) {

        if (c === 0) {
          return {
            type: "infinite"
          };
        }

        return {
          type: "none"
        };
      }

      return {
        x: -c / m,
        y: 0
      };
    },


    /* =====================================================
       Y INTERCEPT
    ===================================================== */

    yIntercept(m, c) {

      return {
        x: 0,
        y: Number(c)
      };
    },


    /* =====================================================
       QUADRATIC ROOTS
    ===================================================== */

    quadraticRoots(a, b, c) {

      a = Number(a);
      b = Number(b);
      c = Number(c);

      if (a === 0) {

        const linearRoot =
          this.xIntercept(b, c);

        return linearRoot;
      }

      const D =
        Math.pow(b, 2) -
        4 * a * c;

      if (D > 0) {

        const root =
          Math.sqrt(D);

        return {
          type: "two-real",

          roots: [
            (-b + root) / (2 * a),
            (-b - root) / (2 * a)
          ]
        };
      }

      if (D === 0) {

        return {
          type: "one-real",

          roots: [
            -b / (2 * a)
          ]
        };
      }

      const real =
        -b / (2 * a);

      const imaginary =
        Math.sqrt(-D) /
        Math.abs(2 * a);

      return {
        type: "complex",

        roots: [
          {
            real,
            imaginary
          },
          {
            real,
            imaginary: -imaginary
          }
        ]
      };
    },


    /* =====================================================
       CREATE GRAPH POINTS
       Used by the visual graph renderer later.
    ===================================================== */

    generatePoints(functionObject, start, end, step = 0.1) {

      if (!functionObject ||
          typeof functionObject.evaluate !== "function") {
        throw new Error("Invalid graph function.");
      }

      start = Number(start);
      end = Number(end);
      step = Number(step);

      if (!Number.isFinite(start) ||
          !Number.isFinite(end) ||
          !Number.isFinite(step) ||
          step <= 0) {
        throw new Error("Invalid graph range.");
      }

      const points = [];

      /*
       * Safety limit prevents accidentally generating
       * millions of points.
       */
      const maximumPoints = 10000;

      let count = 0;

      for (
        let x = start;
        x <= end && count < maximumPoints;
        x += step
      ) {

        let y;

        try {
          y = functionObject.evaluate(x);
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
    },


    /* =====================================================
       RANGE
    ===================================================== */

    range(start, end, step = 1) {

      start = Number(start);
      end = Number(end);
      step = Number(step);

      if (step <= 0) {
        throw new Error("Step must be greater than zero.");
      }

      const values = [];

      for (
        let value = start;
        value <= end;
        value += step
      ) {

        values.push(value);

        if (values.length > 10000) {
          break;
        }
      }

      return values;
    },


    /* =====================================================
       FORMAT NUMBER
    ===================================================== */

    format(value, decimals = 4) {

      if (!Number.isFinite(Number(value))) {
        return "Undefined";
      }

      const factor =
        Math.pow(10, Number(decimals));

      const rounded =
        Math.round(
          (Number(value) + Number.EPSILON) *
          factor
        ) / factor;

      return Number(rounded).toLocaleString(
        "en-IN",
        {
          maximumFractionDigits: decimals
        }
      );
    }

  };


  /* =======================================================
     MAKE AVAILABLE TO NOVERA
  ======================================================= */

  window.NOVERA_GRAPH = NOVERA_GRAPH;

})();
