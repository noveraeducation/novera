/* =========================================================
   NOVERA — UNIVERSAL CALCULATOR
   Simple interface • Powerful engine • No external libraries
   ========================================================= */

(function () {
  "use strict";

  const NOVERA_CALCULATOR = {

    name: "Novera Universal Calculator",
    version: "1.0",

    /* -----------------------------------------------------
       BASIC OPERATIONS
    ----------------------------------------------------- */

    add(a, b) {
      return Number(a) + Number(b);
    },

    subtract(a, b) {
      return Number(a) - Number(b);
    },

    multiply(a, b) {
      return Number(a) * Number(b);
    },

    divide(a, b) {
      if (Number(b) === 0) {
        throw new Error("Cannot divide by zero.");
      }

      return Number(a) / Number(b);
    },

    power(a, b) {
      return Math.pow(Number(a), Number(b));
    },

    square(a) {
      return Math.pow(Number(a), 2);
    },

    cube(a) {
      return Math.pow(Number(a), 3);
    },

    squareRoot(a) {
      if (Number(a) < 0) {
        throw new Error("Square root of a negative number is not real.");
      }

      return Math.sqrt(Number(a));
    },

    cubeRoot(a) {
      return Math.cbrt(Number(a));
    },

    absolute(a) {
      return Math.abs(Number(a));
    },


    /* -----------------------------------------------------
       PERCENTAGE
    ----------------------------------------------------- */

    percentage(value, percent) {
      return (Number(value) * Number(percent)) / 100;
    },

    percentageOf(part, whole) {
      if (Number(whole) === 0) {
        throw new Error("Whole cannot be zero.");
      }

      return (Number(part) / Number(whole)) * 100;
    },

    percentageIncrease(original, increase) {
      return Number(original) * (1 + Number(increase) / 100);
    },

    percentageDecrease(original, decrease) {
      return Number(original) * (1 - Number(decrease) / 100);
    },

    percentageChange(oldValue, newValue) {
      if (Number(oldValue) === 0) {
        throw new Error("Original value cannot be zero.");
      }

      return ((Number(newValue) - Number(oldValue)) / Number(oldValue)) * 100;
    },


    /* -----------------------------------------------------
       FRACTIONS
    ----------------------------------------------------- */

    gcd(a, b) {
      a = Math.abs(Math.trunc(a));
      b = Math.abs(Math.trunc(b));

      while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
      }

      return a;
    },

    simplifyFraction(numerator, denominator) {

      numerator = Number(numerator);
      denominator = Number(denominator);

      if (denominator === 0) {
        throw new Error("Denominator cannot be zero.");
      }

      const divisor = this.gcd(numerator, denominator);

      numerator /= divisor;
      denominator /= divisor;

      if (denominator < 0) {
        numerator *= -1;
        denominator *= -1;
      }

      return {
        numerator,
        denominator,
        text: `${numerator}/${denominator}`
      };
    },

    fractionToDecimal(numerator, denominator) {
      if (Number(denominator) === 0) {
        throw new Error("Denominator cannot be zero.");
      }

      return Number(numerator) / Number(denominator);
    },


    /* -----------------------------------------------------
       ROUNDING
    ----------------------------------------------------- */

    round(value, decimals = 2) {

      const factor = Math.pow(10, Number(decimals));

      return Math.round(
        (Number(value) + Number.EPSILON) * factor
      ) / factor;
    },

    floor(value) {
      return Math.floor(Number(value));
    },

    ceil(value) {
      return Math.ceil(Number(value));
    },


    /* -----------------------------------------------------
       LOGARITHMS & EXPONENTIALS
    ----------------------------------------------------- */

    naturalLog(value) {

      if (Number(value) <= 0) {
        throw new Error("Logarithm requires a positive number.");
      }

      return Math.log(Number(value));
    },

    log10(value) {

      if (Number(value) <= 0) {
        throw new Error("Logarithm requires a positive number.");
      }

      return Math.log10(Number(value));
    },

    exponential(value) {
      return Math.exp(Number(value));
    },


    /* -----------------------------------------------------
       TRIGONOMETRY
    ----------------------------------------------------- */

    toRadians(degrees) {
      return Number(degrees) * Math.PI / 180;
    },

    toDegrees(radians) {
      return Number(radians) * 180 / Math.PI;
    },

    sinDegrees(degrees) {
      return Math.sin(this.toRadians(degrees));
    },

    cosDegrees(degrees) {
      return Math.cos(this.toRadians(degrees));
    },

    tanDegrees(degrees) {
      return Math.tan(this.toRadians(degrees));
    },

    asinDegrees(value) {
      return this.toDegrees(Math.asin(Number(value)));
    },

    acosDegrees(value) {
      return this.toDegrees(Math.acos(Number(value)));
    },

    atanDegrees(value) {
      return this.toDegrees(Math.atan(Number(value)));
    },


    /* -----------------------------------------------------
       GEOMETRY
    ----------------------------------------------------- */

    circleArea(radius) {
      return Math.PI * Math.pow(Number(radius), 2);
    },

    circleCircumference(radius) {
      return 2 * Math.PI * Number(radius);
    },

    rectangleArea(length, width) {
      return Number(length) * Number(width);
    },

    rectanglePerimeter(length, width) {
      return 2 * (Number(length) + Number(width));
    },

    triangleArea(base, height) {
      return 0.5 * Number(base) * Number(height);
    },

    cubeVolume(side) {
      return Math.pow(Number(side), 3);
    },

    cuboidVolume(length, width, height) {
      return Number(length) *
             Number(width) *
             Number(height);
    },


    /* -----------------------------------------------------
       SCIENTIFIC NOTATION
    ----------------------------------------------------- */

    scientific(value) {

      const number = Number(value);

      if (!Number.isFinite(number)) {
        throw new Error("Invalid number.");
      }

      return number.toExponential();
    },


    /* -----------------------------------------------------
       UNIT CONVERSIONS
    ----------------------------------------------------- */

    conversions: {

      length: {
        metersToKilometers(value) {
          return Number(value) / 1000;
        },

        kilometersToMeters(value) {
          return Number(value) * 1000;
        },

        centimetersToMeters(value) {
          return Number(value) / 100;
        },

        metersToCentimeters(value) {
          return Number(value) * 100;
        }
      },

      mass: {
        gramsToKilograms(value) {
          return Number(value) / 1000;
        },

        kilogramsToGrams(value) {
          return Number(value) * 1000;
        }
      },

      time: {
        minutesToSeconds(value) {
          return Number(value) * 60;
        },

        hoursToMinutes(value) {
          return Number(value) * 60;
        },

        daysToHours(value) {
          return Number(value) * 24;
        }
      },

      temperature: {

        celsiusToFahrenheit(value) {
          return (Number(value) * 9 / 5) + 32;
        },

        fahrenheitToCelsius(value) {
          return (Number(value) - 32) * 5 / 9;
        },

        celsiusToKelvin(value) {
          return Number(value) + 273.15;
        },

        kelvinToCelsius(value) {
          return Number(value) - 273.15;
        }
      }
    },


    /* -----------------------------------------------------
       DISPLAY FORMAT
    ----------------------------------------------------- */

    format(value, decimals = 6) {

      if (!Number.isFinite(Number(value))) {
        return "Error";
      }

      const rounded = this.round(value, decimals);

      return Number(rounded).toLocaleString("en-IN", {
        maximumFractionDigits: decimals
      });
    },


    /* -----------------------------------------------------
       SAFE SIMPLE EXPRESSION CALCULATOR
       Supports:
       +  -  *  /  ^  ( )
    ----------------------------------------------------- */

    calculate(expression) {

      if (typeof expression !== "string") {
        throw new Error("Enter a calculation.");
      }

      let exp = expression.trim();

      if (!exp) {
        throw new Error("Enter a calculation.");
      }

      /* Convert common symbols */
      exp = exp
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/\^/g, "**");

      /*
       * Only allow numbers, operators, decimal points,
       * spaces and parentheses.
       */
      if (!/^[0-9+\-*/().\s*]+$/.test(exp)) {
        throw new Error("Only basic mathematical operations are allowed.");
      }

      /*
       * Prevent dangerous repeated operators.
       */
      if (/[*\/]{2,}/.test(exp)) {
        throw new Error("Invalid expression.");
      }

      try {

        const result = Function(
          `"use strict"; return (${exp})`
        )();

        if (!Number.isFinite(result)) {
          throw new Error("Invalid calculation.");
        }

        return result;

      } catch (error) {
        throw new Error("Unable to calculate this expression.");
      }
    },


    /* -----------------------------------------------------
       MEMORY
    ----------------------------------------------------- */

    memory: 0,

    memoryClear() {
      this.memory = 0;
      return this.memory;
    },

    memoryAdd(value) {
      this.memory += Number(value);
      return this.memory;
    },

    memorySubtract(value) {
      this.memory -= Number(value);
      return this.memory;
    },

    memoryRecall() {
      return this.memory;
    },


    /* -----------------------------------------------------
       CALCULATION HISTORY
    ----------------------------------------------------- */

    history: [],

    addHistory(expression, result) {

      this.history.unshift({
        expression: String(expression),
        result: result,
        time: new Date().toISOString()
      });

      /*
       * Keep the tool lightweight.
       */
      if (this.history.length > 50) {
        this.history = this.history.slice(0, 50);
      }

      return this.history;
    },

    clearHistory() {
      this.history = [];
      return this.history;
    },

    getHistory() {
      return [...this.history];
    }

  };


  /* -------------------------------------------------------
     MAKE AVAILABLE TO THE NOVERA WEBSITE
  ------------------------------------------------------- */

  window.NOVERA_CALCULATOR = NOVERA_CALCULATOR;

})();
