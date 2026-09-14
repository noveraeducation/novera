/* =========================================================
   NOVERA — UNIVERSAL ALGEBRA ENGINE
   Simple to use • Powerful underneath • No libraries
   ========================================================= */

(function () {
  "use strict";

  const NOVERA_ALGEBRA = {

    name: "Novera Algebra",
    version: "1.0",


    /* =====================================================
       BASIC ALGEBRA EVALUATION
    ===================================================== */

    evaluate(expression, values = {}) {

      if (typeof expression !== "string" || !expression.trim()) {
        throw new Error("Enter an expression.");
      }

      let exp = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/\^/g, "**");

      /*
       * Replace variables with supplied numerical values.
       */
      Object.keys(values).forEach(variable => {

        const value = Number(values[variable]);

        if (!Number.isFinite(value)) {
          throw new Error(`Invalid value for ${variable}.`);
        }

        const pattern = new RegExp(
          `\\b${variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "g"
        );

        exp = exp.replace(pattern, `(${value})`);
      });

      /*
       * Only mathematical characters and letters are allowed.
       */
      if (!/^[0-9a-zA-Z+\-*/().\s*]+$/.test(exp)) {
        throw new Error("Invalid algebraic expression.");
      }

      try {

        const result = Function(
          `"use strict"; return (${exp})`
        )();

        if (!Number.isFinite(result)) {
          throw new Error("Invalid result.");
        }

        return result;

      } catch {
        throw new Error("Unable to evaluate this expression.");
      }
    },


    /* =====================================================
       LINEAR EQUATION
       ax + b = c
    ===================================================== */

    solveLinear(a, b, c) {

      a = Number(a);
      b = Number(b);
      c = Number(c);

      if (!Number.isFinite(a) ||
          !Number.isFinite(b) ||
          !Number.isFinite(c)) {
        throw new Error("Enter valid numbers.");
      }

      if (a === 0) {

        if (b === c) {
          return {
            type: "infinite",
            message: "Infinitely many solutions."
          };
        }

        return {
          type: "none",
          message: "No solution."
        };
      }

      const x = (c - b) / a;

      return {
        type: "single",
        x,
        equation: `${a}x + ${b} = ${c}`,
        solution: `x = ${x}`
      };
    },


    /* =====================================================
       TWO LINEAR EQUATIONS

       a1x + b1y = c1
       a2x + b2y = c2
    ===================================================== */

    solveSimultaneous(
      a1, b1, c1,
      a2, b2, c2
    ) {

      a1 = Number(a1);
      b1 = Number(b1);
      c1 = Number(c1);

      a2 = Number(a2);
      b2 = Number(b2);
      c2 = Number(c2);

      const determinant =
        (a1 * b2) - (a2 * b1);

      if (determinant === 0) {

        const sameLine =
          (a1 * c2) === (a2 * c1) &&
          (b1 * c2) === (b2 * c1);

        if (sameLine) {
          return {
            type: "infinite",
            message: "Infinitely many solutions."
          };
        }

        return {
          type: "none",
          message: "No unique solution."
        };
      }

      const x =
        ((c1 * b2) - (c2 * b1)) /
        determinant;

      const y =
        ((a1 * c2) - (a2 * c1)) /
        determinant;

      return {
        type: "single",
        x,
        y,
        solution: `x = ${x}, y = ${y}`
      };
    },


    /* =====================================================
       QUADRATIC EQUATION

       ax² + bx + c = 0
    ===================================================== */

    solveQuadratic(a, b, c) {

      a = Number(a);
      b = Number(b);
      c = Number(c);

      if (a === 0) {
        return this.solveLinear(b, c, 0);
      }

      const discriminant =
        Math.pow(b, 2) - (4 * a * c);


      /* Two real roots */

      if (discriminant > 0) {

        const sqrtD = Math.sqrt(discriminant);

        const x1 =
          (-b + sqrtD) / (2 * a);

        const x2 =
          (-b - sqrtD) / (2 * a);

        return {
          type: "two-real",
          discriminant,
          x1,
          x2,
          roots: [x1, x2]
        };
      }


      /* One repeated real root */

      if (discriminant === 0) {

        const x =
          -b / (2 * a);

        return {
          type: "one-real",
          discriminant,
          x,
          roots: [x]
        };
      }


      /* Complex roots */

      const realPart =
        -b / (2 * a);

      const imaginaryPart =
        Math.sqrt(-discriminant) / Math.abs(2 * a);

      return {
        type: "complex",
        discriminant,
        realPart,
        imaginaryPart,
        roots: [
          {
            real: realPart,
            imaginary: imaginaryPart
          },
          {
            real: realPart,
            imaginary: -imaginaryPart
          }
        ]
      };
    },


    /* =====================================================
       DISCRIMINANT
    ===================================================== */

    discriminant(a, b, c) {

      return Math.pow(Number(b), 2) -
             (4 * Number(a) * Number(c));
    },


    /* =====================================================
       FACTOR PAIR
       Finds integer pairs whose product is c
    ===================================================== */

    factorPairs(number) {

      number = Math.trunc(Number(number));

      if (!Number.isFinite(number) || number === 0) {
        return [];
      }

      const pairs = [];

      const limit =
        Math.floor(Math.sqrt(Math.abs(number)));

      for (let i = 1; i <= limit; i++) {

        if (number % i === 0) {

          const j = number / i;

          pairs.push({
            positive: [i, j],
            negative: [-i, -j]
          });
        }
      }

      return pairs;
    },


    /* =====================================================
       GCD / LCM
    ===================================================== */

    gcd(a, b) {

      a = Math.abs(Math.trunc(Number(a)));
      b = Math.abs(Math.trunc(Number(b)));

      while (b !== 0) {

        const temp = b;

        b = a % b;
        a = temp;
      }

      return a;
    },

    lcm(a, b) {

      a = Math.trunc(Number(a));
      b = Math.trunc(Number(b));

      if (a === 0 || b === 0) {
        return 0;
      }

      return Math.abs(
        (a * b) / this.gcd(a, b)
      );
    },


    /* =====================================================
       RATIO
    ===================================================== */

    simplifyRatio(a, b) {

      a = Number(a);
      b = Number(b);

      if (b === 0) {
        throw new Error("Second ratio value cannot be zero.");
      }

      const divisor = this.gcd(a, b);

      return {
        first: a / divisor,
        second: b / divisor,
        text: `${a / divisor}:${b / divisor}`
      };
    },


    /* =====================================================
       DIRECT PROPORTION

       a / b = c / x

       x = bc / a
    ===================================================== */

    solveProportion(a, b, c) {

      a = Number(a);
      b = Number(b);
      c = Number(c);

      if (a === 0) {
        throw new Error("First value cannot be zero.");
      }

      return {
        x: (b * c) / a
      };
    },


    /* =====================================================
       PERCENTAGE ALGEBRA
    ===================================================== */

    percentageChange(oldValue, newValue) {

      oldValue = Number(oldValue);
      newValue = Number(newValue);

      if (oldValue === 0) {
        throw new Error("Original value cannot be zero.");
      }

      return (
        (newValue - oldValue) /
        oldValue
      ) * 100;
    },


    /* =====================================================
       EXPONENTS
    ===================================================== */

    exponent(base, power) {

      return Math.pow(
        Number(base),
        Number(power)
      );
    },

    exponentRules: {

      multiplySameBase(a, m, n) {
        return {
          expression: `a^${m} × a^${n}`,
          result: `a^${Number(m) + Number(n)}`
        };
      },

      divideSameBase(a, m, n) {
        return {
          expression: `a^${m} ÷ a^${n}`,
          result: `a^${Number(m) - Number(n)}`
        };
      },

      powerOfPower(a, m, n) {
        return {
          expression: `(a^${m})^${n}`,
          result: `a^${Number(m) * Number(n)}`
        };
      }
    },


    /* =====================================================
       SCIENTIFIC NOTATION
    ===================================================== */

    scientific(value) {

      value = Number(value);

      if (!Number.isFinite(value)) {
        throw new Error("Invalid number.");
      }

      return value.toExponential();
    },


    /* =====================================================
       ROUNDING
    ===================================================== */

    round(value, decimals = 4) {

      const factor =
        Math.pow(10, Number(decimals));

      return Math.round(
        (Number(value) + Number.EPSILON) *
        factor
      ) / factor;
    },


    /* =====================================================
       ABSOLUTE VALUE
    ===================================================== */

    absolute(value) {

      return Math.abs(Number(value));
    },


    /* =====================================================
       LINEAR FUNCTION
       y = mx + c
    ===================================================== */

    linearFunction(m, c, x) {

      m = Number(m);
      c = Number(c);
      x = Number(x);

      return {
        y: (m * x) + c
      };
    },


    /* =====================================================
       SLOPE BETWEEN TWO POINTS
    ===================================================== */

    slope(x1, y1, x2, y2) {

      x1 = Number(x1);
      y1 = Number(y1);
      x2 = Number(x2);
      y2 = Number(y2);

      if (x1 === x2) {

        return {
          type: "undefined",
          message: "The line is vertical."
        };
      }

      return {
        type: "defined",
        value:
          (y2 - y1) /
          (x2 - x1)
      };
    },


    /* =====================================================
       MIDPOINT
    ===================================================== */

    midpoint(x1, y1, x2, y2) {

      return {
        x:
          (Number(x1) + Number(x2)) / 2,

        y:
          (Number(y1) + Number(y2)) / 2
      };
    },


    /* =====================================================
       DISTANCE BETWEEN TWO POINTS
    ===================================================== */

    distance(x1, y1, x2, y2) {

      return Math.sqrt(
        Math.pow(Number(x2) - Number(x1), 2) +
        Math.pow(Number(y2) - Number(y1), 2)
      );
    },


    /* =====================================================
       FORMAT RESULT
    ===================================================== */

    format(value, decimals = 6) {

      if (typeof value === "object") {
        return value;
      }

      if (!Number.isFinite(Number(value))) {
        return "Error";
      }

      const rounded =
        this.round(value, decimals);

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

  window.NOVERA_ALGEBRA = NOVERA_ALGEBRA;

})();
