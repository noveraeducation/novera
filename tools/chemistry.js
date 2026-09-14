/* ========================================================
   NOVERA CHEMISTRY ENGINE
   Universal educational chemistry calculator
   Version 1.0
======================================================== */

(function () {
  "use strict";

  const NOVERA_CHEMISTRY = {

    version: "1.0",

    /* ----------------------------------------------------
       CONSTANTS
    ---------------------------------------------------- */

    constants: {
      avogadro: 6.02214076e23,
      gasConstant: 8.314462618,
      faradayConstant: 96485.33212,
      standardTemperature: 273.15,
      standardPressure: 1,
      waterMolarMass: 18.01528
    },


    /* ----------------------------------------------------
       HELPERS
    ---------------------------------------------------- */

    number(value) {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
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
       MOLES / MASS / MOLAR MASS
    ---------------------------------------------------- */

    molesFromMass(mass, molarMass) {
      const m = this.number(mass);
      const M = this.number(molarMass);

      if (m === null || M === null || M === 0) return null;

      return this.result(
        m / M,
        "n = m / M",
        [
          `Mass = ${m} g`,
          `Molar mass = ${M} g/mol`,
          `n = ${m} / ${M}`
        ],
        "mol"
      );
    },

    massFromMoles(moles, molarMass) {
      const n = this.number(moles);
      const M = this.number(molarMass);

      if (n === null || M === null) return null;

      return this.result(
        n * M,
        "m = n × M",
        [
          `Moles = ${n} mol`,
          `Molar mass = ${M} g/mol`,
          `m = ${n} × ${M}`
        ],
        "g"
      );
    },

    molarMassFromMassAndMoles(mass, moles) {
      const m = this.number(mass);
      const n = this.number(moles);

      if (m === null || n === null || n === 0) return null;

      return this.result(
        m / n,
        "M = m / n",
        [
          `Mass = ${m} g`,
          `Moles = ${n} mol`,
          `M = ${m} / ${n}`
        ],
        "g/mol"
      );
    },


    /* ----------------------------------------------------
       PARTICLES / MOLES
    ---------------------------------------------------- */

    particlesFromMoles(moles) {
      const n = this.number(moles);

      if (n === null) return null;

      const value = n * this.constants.avogadro;

      return this.result(
        value,
        "N = n × Nₐ",
        [
          `Moles = ${n} mol`,
          `Avogadro constant = ${this.constants.avogadro}`,
          `N = ${n} × Nₐ`
        ],
        "particles"
      );
    },

    molesFromParticles(particles) {
      const N = this.number(particles);

      if (N === null || N === 0) return null;

      return this.result(
        N / this.constants.avogadro,
        "n = N / Nₐ",
        [
          `Particles = ${N}`,
          `n = N / Nₐ`
        ],
        "mol"
      );
    },


    /* ----------------------------------------------------
       CONCENTRATION
    ---------------------------------------------------- */

    molarity(moles, volumeLitres) {
      const n = this.number(moles);
      const V = this.number(volumeLitres);

      if (n === null || V === null || V === 0) return null;

      return this.result(
        n / V,
        "C = n / V",
        [
          `Moles = ${n} mol`,
          `Volume = ${V} L`,
          `C = ${n} / ${V}`
        ],
        "mol/L"
      );
    },

    molesFromMolarity(molarity, volumeLitres) {
      const C = this.number(molarity);
      const V = this.number(volumeLitres);

      if (C === null || V === null) return null;

      return this.result(
        C * V,
        "n = C × V",
        [
          `Concentration = ${C} mol/L`,
          `Volume = ${V} L`,
          `n = ${C} × ${V}`
        ],
        "mol"
      );
    },

    dilution(initialConcentration, initialVolume, finalVolume) {
      const C1 = this.number(initialConcentration);
      const V1 = this.number(initialVolume);
      const V2 = this.number(finalVolume);

      if (
        C1 === null ||
        V1 === null ||
        V2 === null ||
        V2 === 0
      ) return null;

      return this.result(
        (C1 * V1) / V2,
        "C₁V₁ = C₂V₂",
        [
          `C₁ = ${C1}`,
          `V₁ = ${V1}`,
          `V₂ = ${V2}`,
          `C₂ = (C₁V₁) / V₂`
        ],
        "mol/L"
      );
    },


    /* ----------------------------------------------------
       GAS LAWS
    ---------------------------------------------------- */

    boyleLawPressure(P1, V1, V2) {
      const p1 = this.number(P1);
      const v1 = this.number(V1);
      const v2 = this.number(V2);

      if (
        p1 === null ||
        v1 === null ||
        v2 === null ||
        v2 === 0
      ) return null;

      return this.result(
        (p1 * v1) / v2,
        "P₁V₁ = P₂V₂",
        [
          `P₁ = ${p1}`,
          `V₁ = ${v1}`,
          `V₂ = ${v2}`,
          `P₂ = (P₁V₁) / V₂`
        ],
        "pressure"
      );
    },

    charlesLawVolume(V1, T1, T2) {
      const v1 = this.number(V1);
      const t1 = this.number(T1);
      const t2 = this.number(T2);

      if (
        v1 === null ||
        t1 === null ||
        t2 === null ||
        t1 === 0
      ) return null;

      return this.result(
        v1 * (t2 / t1),
        "V₁/T₁ = V₂/T₂",
        [
          `V₁ = ${v1}`,
          `T₁ = ${t1} K`,
          `T₂ = ${t2} K`,
          `V₂ = V₁ × T₂/T₁`
        ],
        "volume"
      );
    },

    idealGasPressure(moles, temperature, volume) {
      const n = this.number(moles);
      const T = this.number(temperature);
      const V = this.number(volume);

      if (
        n === null ||
        T === null ||
        V === null ||
        V === 0
      ) return null;

      return this.result(
        (n * this.constants.gasConstant * T) / V,
        "PV = nRT",
        [
          `n = ${n} mol`,
          `T = ${T} K`,
          `V = ${V} L`,
          `P = nRT / V`
        ],
        "kPa"
      );
    },

    idealGasVolume(moles, temperature, pressure) {
      const n = this.number(moles);
      const T = this.number(temperature);
      const P = this.number(pressure);

      if (
        n === null ||
        T === null ||
        P === null ||
        P === 0
      ) return null;

      return this.result(
        (n * this.constants.gasConstant * T) / P,
        "PV = nRT",
        [
          `n = ${n} mol`,
          `T = ${T} K`,
          `P = ${P}`,
          `V = nRT / P`
        ],
        "L"
      );
    },


    /* ----------------------------------------------------
       TEMPERATURE
    ---------------------------------------------------- */

    celsiusToKelvin(celsius) {
      const C = this.number(celsius);

      if (C === null) return null;

      return this.result(
        C + 273.15,
        "K = °C + 273.15",
        [
          `Temperature = ${C} °C`,
          `K = ${C} + 273.15`
        ],
        "K"
      );
    },

    kelvinToCelsius(kelvin) {
      const K = this.number(kelvin);

      if (K === null) return null;

      return this.result(
        K - 273.15,
        "°C = K − 273.15",
        [
          `Temperature = ${K} K`,
          `°C = ${K} − 273.15`
        ],
        "°C"
      );
    },

    celsiusToFahrenheit(celsius) {
      const C = this.number(celsius);

      if (C === null) return null;

      return this.result(
        (C * 9 / 5) + 32,
        "°F = (°C × 9/5) + 32",
        [
          `Temperature = ${C} °C`,
          `°F = (${C} × 9/5) + 32`
        ],
        "°F"
      );
    },

    fahrenheitToCelsius(fahrenheit) {
      const F = this.number(fahrenheit);

      if (F === null) return null;

      return this.result(
        (F - 32) * 5 / 9,
        "°C = (°F − 32) × 5/9",
        [
          `Temperature = ${F} °F`,
          `°C = (${F} − 32) × 5/9`
        ],
        "°C"
      );
    },


    /* ----------------------------------------------------
       pH / pOH
    ---------------------------------------------------- */

    pHFromHydrogenIon(hydrogenIon) {
      const H = this.number(hydrogenIon);

      if (H === null || H <= 0) return null;

      return this.result(
        -Math.log10(H),
        "pH = −log[H⁺]",
        [
          `[H⁺] = ${H} mol/L`,
          `pH = −log₁₀(${H})`
        ],
        "pH"
      );
    },

    hydrogenIonFromPH(pH) {
      const value = this.number(pH);

      if (value === null) return null;

      return this.result(
        Math.pow(10, -value),
        "[H⁺] = 10⁻ᵖᴴ",
        [
          `pH = ${value}`,
          `[H⁺] = 10⁻${value}`
        ],
        "mol/L"
      );
    },

    pOHFromHydroxideIon(hydroxideIon) {
      const OH = this.number(hydroxideIon);

      if (OH === null || OH <= 0) return null;

      return this.result(
        -Math.log10(OH),
        "pOH = −log[OH⁻]",
        [
          `[OH⁻] = ${OH} mol/L`,
          `pOH = −log₁₀(${OH})`
        ],
        "pOH"
      );
    },

    pHFromPOH(pOH) {
      const value = this.number(pOH);

      if (value === null) return null;

      return this.result(
        14 - value,
        "pH + pOH = 14",
        [
          `pOH = ${value}`,
          `pH = 14 − ${value}`
        ],
        "pH"
      );
    },


    /* ----------------------------------------------------
       PERCENTAGE COMPOSITION
    ---------------------------------------------------- */

    percentageByMass(elementMass, compoundMolarMass) {
      const e = this.number(elementMass);
      const M = this.number(compoundMolarMass);

      if (
        e === null ||
        M === null ||
        M === 0
      ) return null;

      return this.result(
        (e / M) * 100,
        "% by mass = (element mass / molar mass) × 100",
        [
          `Element mass = ${e}`,
          `Compound molar mass = ${M}`,
          `% = (${e}/${M}) × 100`
        ],
        "%"
      );
    },


    /* ----------------------------------------------------
       EMPIRICAL FORMULA
    ---------------------------------------------------- */

    empiricalRatio(masses, atomicMasses) {
      if (
        !Array.isArray(masses) ||
        !Array.isArray(atomicMasses) ||
        masses.length !== atomicMasses.length ||
        masses.length === 0
      ) return null;

      const ratios = masses.map((mass, i) => {
        const m = this.number(mass);
        const a = this.number(atomicMasses[i]);

        if (m === null || a === null || a === 0) {
          return null;
        }

        return m / a;
      });

      if (ratios.some(x => x === null)) return null;

      const minimum = Math.min(...ratios);
      const normalized = ratios.map(x => x / minimum);

      return {
        ratios,
        normalized,
        formula: "Simplify the normalized mole ratio to the nearest whole-number ratio.",
        steps: [
          "Convert each mass to moles.",
          "Divide every mole value by the smallest mole value.",
          "Convert the ratio to the simplest whole numbers."
        ]
      };
    },


    /* ----------------------------------------------------
       STOICHIOMETRY
    ---------------------------------------------------- */

    stoichiometricMoles(
      knownMoles,
      knownCoefficient,
      unknownCoefficient
    ) {
      const n = this.number(knownMoles);
      const a = this.number(knownCoefficient);
      const b = this.number(unknownCoefficient);

      if (
        n === null ||
        a === null ||
        b === null ||
        a === 0
      ) return null;

      return this.result(
        n * (b / a),
        "n₂ = n₁ × coefficient₂/coefficient₁",
        [
          `Known moles = ${n}`,
          `Known coefficient = ${a}`,
          `Unknown coefficient = ${b}`,
          `n₂ = ${n} × (${b}/${a})`
        ],
        "mol"
      );
    },


    /* ----------------------------------------------------
       ELECTROCHEMISTRY
    ---------------------------------------------------- */

    chargeFromCurrentTime(current, timeSeconds) {
      const I = this.number(current);
      const t = this.number(timeSeconds);

      if (I === null || t === null) return null;

      return this.result(
        I * t,
        "Q = It",
        [
          `Current = ${I} A`,
          `Time = ${t} s`,
          `Q = ${I} × ${t}`
        ],
        "C"
      );
    },

    molesElectronsFromCharge(charge) {
      const Q = this.number(charge);

      if (Q === null) return null;

      return this.result(
        Q / this.constants.faradayConstant,
        "n(e⁻) = Q/F",
        [
          `Charge = ${Q} C`,
          `Faraday constant = ${this.constants.faradayConstant} C/mol`,
          `n(e⁻) = Q/F`
        ],
        "mol e⁻"
      );
    },


    /* ----------------------------------------------------
       HEAT / ENERGY
    ---------------------------------------------------- */

    heat(mass, specificHeat, temperatureChange) {
      const m = this.number(mass);
      const c = this.number(specificHeat);
      const dT = this.number(temperatureChange);

      if (
        m === null ||
        c === null ||
        dT === null
      ) return null;

      return this.result(
        m * c * dT,
        "Q = mcΔT",
        [
          `Mass = ${m}`,
          `Specific heat = ${c}`,
          `Temperature change = ${dT}`,
          `Q = ${m} × ${c} × ${dT}`
        ],
        "J"
      );
    },

    energyFromMoles(moles, molarEnergy) {
      const n = this.number(moles);
      const E = this.number(molarEnergy);

      if (n === null || E === null) return null;

      return this.result(
        n * E,
        "Energy = n × molar energy",
        [
          `Moles = ${n}`,
          `Molar energy = ${E}`,
          `Energy = ${n} × ${E}`
        ],
        "J"
      );
    },


    /* ----------------------------------------------------
       DENSITY
    ---------------------------------------------------- */

    density(mass, volume) {
      const m = this.number(mass);
      const V = this.number(volume);

      if (
        m === null ||
        V === null ||
        V === 0
      ) return null;

      return this.result(
        m / V,
        "ρ = m/V",
        [
          `Mass = ${m}`,
          `Volume = ${V}`,
          `ρ = ${m}/${V}`
        ],
        "density"
      );
    },

    massFromDensity(density, volume) {
      const rho = this.number(density);
      const V = this.number(volume);

      if (rho === null || V === null) return null;

      return this.result(
        rho * V,
        "m = ρV",
        [
          `Density = ${rho}`,
          `Volume = ${V}`,
          `m = ${rho} × ${V}`
        ],
        "mass"
      );
    },


    /* ----------------------------------------------------
       UNIT CONVERSIONS
    ---------------------------------------------------- */

    conversions: {

      gramsToKilograms(value) {
        return Number(value) / 1000;
      },

      kilogramsToGrams(value) {
        return Number(value) * 1000;
      },

      millilitresToLitres(value) {
        return Number(value) / 1000;
      },

      litresToMillilitres(value) {
        return Number(value) * 1000;
      },

      centimetresToMetres(value) {
        return Number(value) / 100;
      },

      metresToCentimetres(value) {
        return Number(value) * 100;
      },

      atmospheresToKPa(value) {
        return Number(value) * 101.325;
      },

      kPaToAtmospheres(value) {
        return Number(value) / 101.325;
      }
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

  window.NOVERA_CHEMISTRY = NOVERA_CHEMISTRY;

})();
