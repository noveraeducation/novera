/* ========================================================
   NOVERA STATISTICS ENGINE
   Universal educational statistics calculator
   Version 1.0
======================================================== */

(function () {
  "use strict";

  const NOVERA_STATISTICS = {

    version: "1.0",

    /* ----------------------------------------------------
       BASIC HELPERS
    ---------------------------------------------------- */

    number(value) {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    },

    cleanData(data) {
      if (!Array.isArray(data)) return [];

      return data
        .map(Number)
        .filter(Number.isFinite);
    },

    result(value, formula, steps = [], unit = "") {
      return {
        value,
        formula,
        steps,
        unit
      };
    },


    /* ----------------------------------------------------
       SUM / COUNT
    ---------------------------------------------------- */

    sum(data) {
      const values = this.cleanData(data);

      if (!values.length) return null;

      const value = values.reduce(
        (total, x) => total + x,
        0
      );

      return this.result(
        value,
        "Σx",
        [
          `Number of values = ${values.length}`,
          `Σx = ${value}`
        ]
      );
    },

    count(data) {
      const values = this.cleanData(data);

      return this.result(
        values.length,
        "n = number of observations",
        [
          `Observations = ${values.length}`
        ]
      );
    },


    /* ----------------------------------------------------
       MEAN
    ---------------------------------------------------- */

    mean(data) {
      const values = this.cleanData(data);

      if (!values.length) return null;

      const total = values.reduce(
        (sum, x) => sum + x,
        0
      );

      const value = total / values.length;

      return this.result(
        value,
        "Mean = Σx / n",
        [
          `Σx = ${total}`,
          `n = ${values.length}`,
          `Mean = ${total} / ${values.length}`
        ]
      );
    },


    /* ----------------------------------------------------
       MEDIAN
    ---------------------------------------------------- */

    median(data) {
      const values = this.cleanData(data)
        .sort((a, b) => a - b);

      if (!values.length) return null;

      const n = values.length;
      let value;

      if (n % 2 === 1) {
        value = values[Math.floor(n / 2)];

        return this.result(
          value,
          "Median = middle value",
          [
            `Sorted data = ${values.join(", ")}`,
            `n = ${n}`,
            "Since n is odd, take the middle value."
          ]
        );
      }

      const left = values[n / 2 - 1];
      const right = values[n / 2];

      value = (left + right) / 2;

      return this.result(
        value,
        "Median = (middle₁ + middle₂) / 2",
        [
          `Sorted data = ${values.join(", ")}`,
          `Middle values = ${left} and ${right}`,
          `Median = (${left} + ${right}) / 2`
        ]
      );
    },


    /* ----------------------------------------------------
       MODE
    ---------------------------------------------------- */

    mode(data) {
      const values = this.cleanData(data);

      if (!values.length) return null;

      const frequency = {};

      values.forEach(value => {
        frequency[value] =
          (frequency[value] || 0) + 1;
      });

      const highest = Math.max(
        ...Object.values(frequency)
      );

      if (highest === 1) {
        return {
          value: null,
          modes: [],
          frequency: 1,
          formula: "Mode = most frequent value",
          steps: ["No mode: every value occurs once."]
        };
      }

      const modes = Object.keys(frequency)
        .filter(key => frequency[key] === highest)
        .map(Number);

      return {
        value: modes.length === 1
          ? modes[0]
          : modes,
        modes,
        frequency: highest,
        formula: "Mode = most frequent value",
        steps: [
          `Highest frequency = ${highest}`,
          `Mode = ${modes.join(", ")}`
        ]
      };
    },


    /* ----------------------------------------------------
       RANGE
    ---------------------------------------------------- */

    range(data) {
      const values = this.cleanData(data);

      if (!values.length) return null;

      const minimum = Math.min(...values);
      const maximum = Math.max(...values);
      const value = maximum - minimum;

      return this.result(
        value,
        "Range = Maximum − Minimum",
        [
          `Maximum = ${maximum}`,
          `Minimum = ${minimum}`,
          `Range = ${maximum} − ${minimum}`
        ]
      );
    },


    /* ----------------------------------------------------
       VARIANCE
    ---------------------------------------------------- */

    variance(data) {
      const values = this.cleanData(data);

      if (!values.length) return null;

      const average =
        values.reduce((a, b) => a + b, 0) /
        values.length;

      const squaredDifferences =
        values.map(x =>
          Math.pow(x - average, 2)
        );

      const value =
        squaredDifferences.reduce(
          (a, b) => a + b,
          0
        ) / values.length;

      return this.result(
        value,
        "σ² = Σ(x − x̄)² / n",
        [
          `Mean = ${average}`,
          `Squared differences calculated for ${values.length} values`,
          `Variance = ${value}`
        ]
      );
    },


    /* ----------------------------------------------------
       STANDARD DEVIATION
    ---------------------------------------------------- */

    standardDeviation(data) {
      const varianceResult =
        this.variance(data);

      if (!varianceResult) return null;

      const value =
        Math.sqrt(varianceResult.value);

      return this.result(
        value,
        "σ = √variance",
        [
          `Variance = ${varianceResult.value}`,
          `σ = √${varianceResult.value}`
        ]
      );
    },


    /* ----------------------------------------------------
       POPULATION / SAMPLE VARIANCE
    ---------------------------------------------------- */

    sampleVariance(data) {
      const values = this.cleanData(data);

      if (values.length < 2) return null;

      const average =
        values.reduce((a, b) => a + b, 0) /
        values.length;

      const squaredDifferences =
        values.map(x =>
          Math.pow(x - average, 2)
        );

      const value =
        squaredDifferences.reduce(
          (a, b) => a + b,
          0
        ) / (values.length - 1);

      return this.result(
        value,
        "s² = Σ(x − x̄)² / (n − 1)",
        [
          `Mean = ${average}`,
          `n = ${values.length}`,
          `Sample variance = ${value}`
        ]
      );
    },

    sampleStandardDeviation(data) {
      const varianceResult =
        this.sampleVariance(data);

      if (!varianceResult) return null;

      const value =
        Math.sqrt(varianceResult.value);

      return this.result(
        value,
        "s = √s²",
        [
          `Sample variance = ${varianceResult.value}`,
          `Sample standard deviation = ${value}`
        ]
      );
    },


    /* ----------------------------------------------------
       WEIGHTED MEAN
    ---------------------------------------------------- */

    weightedMean(values, weights) {
      const x = this.cleanData(values);
      const w = this.cleanData(weights);

      if (
        !x.length ||
        x.length !== w.length
      ) return null;

      const weightedSum = x.reduce(
        (sum, value, i) =>
          sum + value * w[i],
        0
      );

      const weightTotal = w.reduce(
        (sum, value) => sum + value,
        0
      );

      if (weightTotal === 0) return null;

      const value =
        weightedSum / weightTotal;

      return this.result(
        value,
        "Weighted Mean = Σ(wx) / Σw",
        [
          `Σ(wx) = ${weightedSum}`,
          `Σw = ${weightTotal}`,
          `Weighted mean = ${weightedSum} / ${weightTotal}`
        ]
      );
    },


    /* ----------------------------------------------------
       FREQUENCY TABLE
    ---------------------------------------------------- */

    frequencyTable(data) {
      const values = this.cleanData(data);

      if (!values.length) return null;

      const frequency = {};

      values.forEach(value => {
        frequency[value] =
          (frequency[value] || 0) + 1;
      });

      return Object.keys(frequency)
        .map(Number)
        .sort((a, b) => a - b)
        .map(value => ({
          value,
          frequency: frequency[value]
        }));
    },


    /* ----------------------------------------------------
       CUMULATIVE FREQUENCY
    ---------------------------------------------------- */

    cumulativeFrequency(frequencies) {
      const values =
        this.cleanData(frequencies);

      if (!values.length) return [];

      let running = 0;

      return values.map(frequency => {
        running += frequency;

        return {
          frequency,
          cumulativeFrequency: running
        };
      });
    },


    /* ----------------------------------------------------
       GROUPED DATA MEAN
    ---------------------------------------------------- */

    groupedMean(midpoints, frequencies) {
      const x = this.cleanData(midpoints);
      const f = this.cleanData(frequencies);

      if (
        !x.length ||
        x.length !== f.length
      ) return null;

      const fx = x.reduce(
        (sum, midpoint, i) =>
          sum + midpoint * f[i],
        0
      );

      const totalFrequency = f.reduce(
        (sum, value) => sum + value,
        0
      );

      if (totalFrequency === 0) return null;

      const value =
        fx / totalFrequency;

      return this.result(
        value,
        "Mean = Σ(fx) / Σf",
        [
          `Σ(fx) = ${fx}`,
          `Σf = ${totalFrequency}`,
          `Mean = ${fx} / ${totalFrequency}`
        ]
      );
    },


    /* ----------------------------------------------------
       GROUPED DATA MEDIAN
       Formula:
       Median = l + [(n/2 − cf) / f] × h
    ---------------------------------------------------- */

    groupedMedian(
      lowerBoundary,
      totalFrequency,
      cumulativeFrequencyBefore,
      medianFrequency,
      classWidth
    ) {
      const l = this.number(lowerBoundary);
      const n = this.number(totalFrequency);
      const cf = this.number(cumulativeFrequencyBefore);
      const f = this.number(medianFrequency);
      const h = this.number(classWidth);

      if (
        l === null ||
        n === null ||
        cf === null ||
        f === null ||
        h === null ||
        f === 0
      ) return null;

      const value =
        l +
        ((n / 2 - cf) / f) * h;

      return this.result(
        value,
        "Median = l + [(n/2 − cf) / f] × h",
        [
          `l = ${l}`,
          `n = ${n}`,
          `cf = ${cf}`,
          `f = ${f}`,
          `h = ${h}`,
          `Median = ${value}`
        ]
      );
    },


    /* ----------------------------------------------------
       GROUPED DATA MODE
       Formula:
       Mode = l + [(f₁ − f₀)/(2f₁ − f₀ − f₂)] × h
    ---------------------------------------------------- */

    groupedMode(
      lowerBoundary,
      modalFrequency,
      previousFrequency,
      nextFrequency,
      classWidth
    ) {
      const l = this.number(lowerBoundary);
      const f1 = this.number(modalFrequency);
      const f0 = this.number(previousFrequency);
      const f2 = this.number(nextFrequency);
      const h = this.number(classWidth);

      if (
        l === null ||
        f1 === null ||
        f0 === null ||
        f2 === null ||
        h === null
      ) return null;

      const denominator =
        2 * f1 - f0 - f2;

      if (denominator === 0) return null;

      const value =
        l +
        ((f1 - f0) / denominator) * h;

      return this.result(
        value,
        "Mode = l + [(f₁ − f₀)/(2f₁ − f₀ − f₂)] × h",
        [
          `l = ${l}`,
          `f₁ = ${f1}`,
          `f₀ = ${f0}`,
          `f₂ = ${f2}`,
          `h = ${h}`,
          `Mode = ${value}`
        ]
      );
    },


    /* ----------------------------------------------------
       PERCENTILE
    ---------------------------------------------------- */

    percentile(data, percentile) {
      const values = this.cleanData(data)
        .sort((a, b) => a - b);

      const p = this.number(percentile);

      if (
        !values.length ||
        p === null ||
        p < 0 ||
        p > 100
      ) return null;

      const position =
        (p / 100) * (values.length - 1);

      const lower =
        Math.floor(position);

      const upper =
        Math.ceil(position);

      let value;

      if (lower === upper) {
        value = values[lower];
      } else {
        const fraction =
          position - lower;

        value =
          values[lower] +
          fraction *
          (values[upper] - values[lower]);
      }

      return this.result(
        value,
        "Percentile position = p(n − 1) / 100",
        [
          `p = ${p}`,
          `Sorted data = ${values.join(", ")}`,
          `Position = ${position}`,
          `Percentile = ${value}`
        ]
      );
    },


    /* ----------------------------------------------------
       QUARTILES
    ---------------------------------------------------- */

    quartiles(data) {
      const values = this.cleanData(data)
        .sort((a, b) => a - b);

      if (!values.length) return null;

      return {
        Q1: this.percentile(values, 25).value,
        Q2: this.percentile(values, 50).value,
        Q3: this.percentile(values, 75).value
      };
    },


    /* ----------------------------------------------------
       INTERQUARTILE RANGE
    ---------------------------------------------------- */

    interquartileRange(data) {
      const q = this.quartiles(data);

      if (!q) return null;

      const value = q.Q3 - q.Q1;

      return this.result(
        value,
        "IQR = Q₃ − Q₁",
        [
          `Q₁ = ${q.Q1}`,
          `Q₃ = ${q.Q3}`,
          `IQR = ${q.Q3} − ${q.Q1}`
        ]
      );
    },


    /* ----------------------------------------------------
       Z-SCORE
    ---------------------------------------------------- */

    zScore(value, mean, standardDeviation) {
      const x = this.number(value);
      const m = this.number(mean);
      const sd = this.number(standardDeviation);

      if (
        x === null ||
        m === null ||
        sd === null ||
        sd === 0
      ) return null;

      const z = (x - m) / sd;

      return this.result(
        z,
        "z = (x − μ) / σ",
        [
          `x = ${x}`,
          `Mean = ${m}`,
          `Standard deviation = ${sd}`,
          `z = (${x} − ${m}) / ${sd}`
        ]
      );
    },


    /* ----------------------------------------------------
       CORRELATION
    ---------------------------------------------------- */

    correlation(xData, yData) {
      const x = this.cleanData(xData);
      const y = this.cleanData(yData);

      if (
        !x.length ||
        x.length !== y.length
      ) return null;

      const xMean =
        x.reduce((a, b) => a + b, 0) / x.length;

      const yMean =
        y.reduce((a, b) => a + b, 0) / y.length;

      let numerator = 0;
      let xSquared = 0;
      let ySquared = 0;

      for (let i = 0; i < x.length; i++) {
        const dx = x[i] - xMean;
        const dy = y[i] - yMean;

        numerator += dx * dy;
        xSquared += dx * dx;
        ySquared += dy * dy;
      }

      const denominator =
        Math.sqrt(xSquared * ySquared);

      if (denominator === 0) return null;

      const value =
        numerator / denominator;

      return this.result(
        value,
        "r = Σ[(x−x̄)(y−ȳ)] / √[Σ(x−x̄)²Σ(y−ȳ)²]",
        [
          `x̄ = ${xMean}`,
          `ȳ = ${yMean}`,
          `Correlation coefficient = ${value}`
        ]
      );
    },


    /* ----------------------------------------------------
       LINEAR REGRESSION
    ---------------------------------------------------- */

    linearRegression(xData, yData) {
      const x = this.cleanData(xData);
      const y = this.cleanData(yData);

      if (
        !x.length ||
        x.length !== y.length
      ) return null;

      const xMean =
        x.reduce((a, b) => a + b, 0) / x.length;

      const yMean =
        y.reduce((a, b) => a + b, 0) / y.length;

      let numerator = 0;
      let denominator = 0;

      for (let i = 0; i < x.length; i++) {
        numerator +=
          (x[i] - xMean) *
          (y[i] - yMean);

        denominator +=
          Math.pow(x[i] - xMean, 2);
      }

      if (denominator === 0) return null;

      const slope =
        numerator / denominator;

      const intercept =
        yMean - slope * xMean;

      return {
        slope,
        intercept,
        equation:
          `y = ${slope}x + ${intercept}`,
        steps: [
          `x̄ = ${xMean}`,
          `ȳ = ${yMean}`,
          `Slope = ${slope}`,
          `Intercept = ${intercept}`
        ]
      };
    },


    /* ----------------------------------------------------
       PROBABILITY
    ---------------------------------------------------- */

    probability(favourable, total) {
      const f = this.number(favourable);
      const t = this.number(total);

      if (
        f === null ||
        t === null ||
        t === 0
      ) return null;

      const value = f / t;

      return this.result(
        value,
        "P(E) = favourable outcomes / total outcomes",
        [
          `Favourable outcomes = ${f}`,
          `Total outcomes = ${t}`,
          `P(E) = ${f} / ${t}`
        ]
      );
    },


    /* ----------------------------------------------------
       COMPLEMENTARY PROBABILITY
    ---------------------------------------------------- */

    complementProbability(probability) {
      const p = this.number(probability);

      if (
        p === null ||
        p < 0 ||
        p > 1
      ) return null;

      return this.result(
        1 - p,
        "P(not E) = 1 − P(E)",
        [
          `P(E) = ${p}`,
          `P(not E) = 1 − ${p}`
        ]
      );
    },


    /* ----------------------------------------------------
       COMBINATIONS
    ---------------------------------------------------- */

    factorial(n) {
      const value = this.number(n);

      if (
        value === null ||
        value < 0 ||
        !Number.isInteger(value)
      ) return null;

      let result = 1;

      for (let i = 2; i <= value; i++) {
        result *= i;
      }

      return result;
    },

    permutations(n, r) {
      const N = this.number(n);
      const R = this.number(r);

      if (
        N === null ||
        R === null ||
        R < 0 ||
        N < R ||
        !Number.isInteger(N) ||
        !Number.isInteger(R)
      ) return null;

      const value =
        this.factorial(N) /
        this.factorial(N - R);

      return this.result(
        value,
        "nPr = n! / (n − r)!",
        [
          `n = ${N}`,
          `r = ${R}`,
          `nPr = ${value}`
        ]
      );
    },

    combinations(n, r) {
      const N = this.number(n);
      const R = this.number(r);

      if (
        N === null ||
        R === null ||
        R < 0 ||
        N < R ||
        !Number.isInteger(N) ||
        !Number.isInteger(R)
      ) return null;

      const value =
        this.factorial(N) /
        (
          this.factorial(R) *
          this.factorial(N - R)
        );

      return this.result(
        value,
        "nCr = n! / [r!(n − r)!]",
        [
          `n = ${N}`,
          `r = ${R}`,
          `nCr = ${value}`
        ]
      );
    },


    /* ----------------------------------------------------
       FORMAT
    ---------------------------------------------------- */

    format(value, significantFigures = 6) {
      const n = Number(value);

      if (!Number.isFinite(n)) {
        return "Invalid";
      }

      if (n === 0) return "0";

      return Number(
        n.toPrecision(significantFigures)
      ).toString();
    }

  };


  /* ------------------------------------------------------
     GLOBAL EXPORT
  ------------------------------------------------------ */

  window.NOVERA_STATISTICS = NOVERA_STATISTICS;

})();
