/* =========================================================
   NOVERA — UNIVERSAL PHYSICS ENGINE
   Simple interface • Powerful calculations • No libraries
   ========================================================= */

(function () {
  "use strict";

  const NOVERA_PHYSICS = {

    name: "Novera Physics",
    version: "1.0",

    /* =====================================================
       CONSTANTS
    ===================================================== */

    constants: {
      g: 9.80665,
      speedOfLight: 299792458,
      gravitationalConstant: 6.67430e-11,
      planckConstant: 6.62607015e-34,
      elementaryCharge: 1.602176634e-19
    },


    /* =====================================================
       HELPER
    ===================================================== */

    number(value, name = "Value") {

      const n = Number(value);

      if (!Number.isFinite(n)) {
        throw new Error(`${name} must be a valid number.`);
      }

      return n;
    },


    result(value, formula, steps = []) {

      return {
        value,
        formula,
        steps
      };
    },


    /* =====================================================
       MOTION — BASIC KINEMATICS
    ===================================================== */

    speed(distance, time) {

      distance = this.number(distance, "Distance");
      time = this.number(time, "Time");

      if (time === 0) {
        throw new Error("Time cannot be zero.");
      }

      const value = distance / time;

      return this.result(
        value,
        "v = s / t",
        [
          `v = ${distance} / ${time}`,
          `v = ${value}`
        ]
      );
    },


    distanceFromSpeed(speed, time) {

      speed = this.number(speed, "Speed");
      time = this.number(time, "Time");

      const value = speed * time;

      return this.result(
        value,
        "s = vt",
        [
          `s = ${speed} × ${time}`,
          `s = ${value}`
        ]
      );
    },


    timeFromDistance(distance, speed) {

      distance = this.number(distance, "Distance");
      speed = this.number(speed, "Speed");

      if (speed === 0) {
        throw new Error("Speed cannot be zero.");
      }

      const value = distance / speed;

      return this.result(
        value,
        "t = s / v",
        [
          `t = ${distance} / ${speed}`,
          `t = ${value}`
        ]
      );
    },


    acceleration(finalVelocity, initialVelocity, time) {

      finalVelocity = this.number(
        finalVelocity,
        "Final velocity"
      );

      initialVelocity = this.number(
        initialVelocity,
        "Initial velocity"
      );

      time = this.number(time, "Time");

      if (time === 0) {
        throw new Error("Time cannot be zero.");
      }

      const value =
        (finalVelocity - initialVelocity) / time;

      return this.result(
        value,
        "a = (v - u) / t",
        [
          `a = (${finalVelocity} - ${initialVelocity}) / ${time}`,
          `a = ${value}`
        ]
      );
    },


    /* =====================================================
       EQUATIONS OF MOTION
    ===================================================== */

    displacementSUVAT(u, a, t) {

      u = this.number(u, "Initial velocity");
      a = this.number(a, "Acceleration");
      t = this.number(t, "Time");

      const value =
        (u * t) +
        (0.5 * a * Math.pow(t, 2));

      return this.result(
        value,
        "s = ut + ½at²",
        [
          `s = (${u} × ${t}) + ½(${a} × ${t}²)`,
          `s = ${value}`
        ]
      );
    },


    finalVelocitySUVAT(u, a, t) {

      u = this.number(u, "Initial velocity");
      a = this.number(a, "Acceleration");
      t = this.number(t, "Time");

      const value = u + (a * t);

      return this.result(
        value,
        "v = u + at",
        [
          `v = ${u} + (${a} × ${t})`,
          `v = ${value}`
        ]
      );
    },


    velocitySquared(u, a, s) {

      u = this.number(u, "Initial velocity");
      a = this.number(a, "Acceleration");
      s = this.number(s, "Displacement");

      const value =
        Math.pow(u, 2) + (2 * a * s);

      return this.result(
        value,
        "v² = u² + 2as",
        [
          `v² = ${u}² + 2(${a})(${s})`,
          `v² = ${value}`
        ]
      );
    },


    displacementAverageVelocity(u, v, t) {

      u = this.number(u, "Initial velocity");
      v = this.number(v, "Final velocity");
      t = this.number(t, "Time");

      const value =
        ((u + v) / 2) * t;

      return this.result(
        value,
        "s = ((u + v) / 2)t",
        [
          `s = ((${u} + ${v}) / 2) × ${t}`,
          `s = ${value}`
        ]
      );
    },


    /* =====================================================
       NEWTON'S LAWS / FORCE
    ===================================================== */

    force(mass, acceleration) {

      mass = this.number(mass, "Mass");
      acceleration =
        this.number(acceleration, "Acceleration");

      const value = mass * acceleration;

      return this.result(
        value,
        "F = ma",
        [
          `F = ${mass} × ${acceleration}`,
          `F = ${value} N`
        ]
      );
    },


    accelerationFromForce(force, mass) {

      force = this.number(force, "Force");
      mass = this.number(mass, "Mass");

      if (mass === 0) {
        throw new Error("Mass cannot be zero.");
      }

      const value = force / mass;

      return this.result(
        value,
        "a = F / m",
        [
          `a = ${force} / ${mass}`,
          `a = ${value} m/s²`
        ]
      );
    },


    weight(mass, g = this.constants.g) {

      mass = this.number(mass, "Mass");
      g = this.number(g, "Gravitational acceleration");

      const value = mass * g;

      return this.result(
        value,
        "W = mg",
        [
          `W = ${mass} × ${g}`,
          `W = ${value} N`
        ]
      );
    },


    /* =====================================================
       MOMENTUM
    ===================================================== */

    momentum(mass, velocity) {

      mass = this.number(mass, "Mass");
      velocity = this.number(velocity, "Velocity");

      const value = mass * velocity;

      return this.result(
        value,
        "p = mv",
        [
          `p = ${mass} × ${velocity}`,
          `p = ${value} kg·m/s`
        ]
      );
    },


    impulse(force, time) {

      force = this.number(force, "Force");
      time = this.number(time, "Time");

      const value = force * time;

      return this.result(
        value,
        "J = Ft",
        [
          `J = ${force} × ${time}`,
          `J = ${value} N·s`
        ]
      );
    },


    /* =====================================================
       WORK, ENERGY & POWER
    ===================================================== */

    work(force, displacement, angleDegrees = 0) {

      force = this.number(force, "Force");
      displacement =
        this.number(displacement, "Displacement");

      angleDegrees =
        this.number(angleDegrees, "Angle");

      const angleRadians =
        angleDegrees * Math.PI / 180;

      const value =
        force *
        displacement *
        Math.cos(angleRadians);

      return this.result(
        value,
        "W = Fs cos θ",
        [
          `W = ${force} × ${displacement} × cos(${angleDegrees}°)`,
          `W = ${value} J`
        ]
      );
    },


    kineticEnergy(mass, velocity) {

      mass = this.number(mass, "Mass");
      velocity = this.number(velocity, "Velocity");

      const value =
        0.5 *
        mass *
        Math.pow(velocity, 2);

      return this.result(
        value,
        "KE = ½mv²",
        [
          `KE = ½ × ${mass} × ${velocity}²`,
          `KE = ${value} J`
        ]
      );
    },


    gravitationalPotentialEnergy(
      mass,
      height,
      g = this.constants.g
    ) {

      mass = this.number(mass, "Mass");
      height = this.number(height, "Height");
      g = this.number(g, "Gravitational acceleration");

      const value = mass * g * height;

      return this.result(
        value,
        "PE = mgh",
        [
          `PE = ${mass} × ${g} × ${height}`,
          `PE = ${value} J`
        ]
      );
    },


    power(work, time) {

      work = this.number(work, "Work");
      time = this.number(time, "Time");

      if (time === 0) {
        throw new Error("Time cannot be zero.");
      }

      const value = work / time;

      return this.result(
        value,
        "P = W / t",
        [
          `P = ${work} / ${time}`,
          `P = ${value} W`
        ]
      );
    },


    /* =====================================================
       EFFICIENCY
    ===================================================== */

    efficiency(usefulOutput, totalInput) {

      usefulOutput =
        this.number(usefulOutput, "Useful output");

      totalInput =
        this.number(totalInput, "Total input");

      if (totalInput === 0) {
        throw new Error("Total input cannot be zero.");
      }

      const value =
        (usefulOutput / totalInput) * 100;

      return this.result(
        value,
        "Efficiency = (useful output / input) × 100",
        [
          `Efficiency = (${usefulOutput} / ${totalInput}) × 100`,
          `Efficiency = ${value}%`
        ]
      );
    },


    /* =====================================================
       GRAVITATION
    ===================================================== */

    gravitationalForce(
      mass1,
      mass2,
      distance
    ) {

      mass1 = this.number(mass1, "Mass 1");
      mass2 = this.number(mass2, "Mass 2");
      distance = this.number(distance, "Distance");

      if (distance === 0) {
        throw new Error("Distance cannot be zero.");
      }

      const G =
        this.constants.gravitationalConstant;

      const value =
        G *
        mass1 *
        mass2 /
        Math.pow(distance, 2);

      return this.result(
        value,
        "F = Gm₁m₂ / r²",
        [
          `F = (${G} × ${mass1} × ${mass2}) / ${distance}²`,
          `F = ${value} N`
        ]
      );
    },


    escapeVelocity(
      mass,
      radius
    ) {

      mass = this.number(mass, "Mass");
      radius = this.number(radius, "Radius");

      if (radius <= 0) {
        throw new Error("Radius must be positive.");
      }

      const G =
        this.constants.gravitationalConstant;

      const value =
        Math.sqrt(
          (2 * G * mass) / radius
        );

      return this.result(
        value,
        "vₑ = √(2GM / R)",
        [
          `vₑ = √(2 × ${G} × ${mass} / ${radius})`,
          `vₑ = ${value} m/s`
        ]
      );
    },


    /* =====================================================
       PRESSURE & DENSITY
    ===================================================== */

    pressure(force, area) {

      force = this.number(force, "Force");
      area = this.number(area, "Area");

      if (area === 0) {
        throw new Error("Area cannot be zero.");
      }

      const value = force / area;

      return this.result(
        value,
        "P = F / A",
        [
          `P = ${force} / ${area}`,
          `P = ${value} Pa`
        ]
      );
    },


    density(mass, volume) {

      mass = this.number(mass, "Mass");
      volume = this.number(volume, "Volume");

      if (volume === 0) {
        throw new Error("Volume cannot be zero.");
      }

      const value = mass / volume;

      return this.result(
        value,
        "ρ = m / V",
        [
          `ρ = ${mass} / ${volume}`,
          `ρ = ${value} kg/m³`
        ]
      );
    },


    /* =====================================================
       ELECTRICITY
    ===================================================== */

    current(charge, time) {

      charge = this.number(charge, "Charge");
      time = this.number(time, "Time");

      if (time === 0) {
        throw new Error("Time cannot be zero.");
      }

      const value = charge / time;

      return this.result(
        value,
        "I = Q / t",
        [
          `I = ${charge} / ${time}`,
          `I = ${value} A`
        ]
      );
    },


    voltage(current, resistance) {

      current = this.number(current, "Current");
      resistance =
        this.number(resistance, "Resistance");

      const value = current * resistance;

      return this.result(
        value,
        "V = IR",
        [
          `V = ${current} × ${resistance}`,
          `V = ${value} V`
        ]
      );
    },


    resistance(voltage, current) {

      voltage = this.number(voltage, "Voltage");
      current = this.number(current, "Current");

      if (current === 0) {
        throw new Error("Current cannot be zero.");
      }

      const value = voltage / current;

      return this.result(
        value,
        "R = V / I",
        [
          `R = ${voltage} / ${current}`,
          `R = ${value} Ω`
        ]
      );
    },


    electricalPower(voltage, current) {

      voltage = this.number(voltage, "Voltage");
      current = this.number(current, "Current");

      const value = voltage * current;

      return this.result(
        value,
        "P = VI",
        [
          `P = ${voltage} × ${current}`,
          `P = ${value} W`
        ]
      );
    },


    electricalEnergy(power, time) {

      power = this.number(power, "Power");
      time = this.number(time, "Time");

      const value = power * time;

      return this.result(
        value,
        "E = Pt",
        [
          `E = ${power} × ${time}`,
          `E = ${value} J`
        ]
      );
    },


    /* =====================================================
       RESISTORS
    ===================================================== */

    seriesResistance(resistances) {

      if (!Array.isArray(resistances) ||
          resistances.length === 0) {
        throw new Error("Enter resistor values.");
      }

      const values =
        resistances.map(value =>
          this.number(value, "Resistance")
        );

      const total =
        values.reduce(
          (sum, value) => sum + value,
          0
        );

      return this.result(
        total,
        "Rₜ = R₁ + R₂ + ...",
        [
          `Rₜ = ${values.join(" + ")}`,
          `Rₜ = ${total} Ω`
        ]
      );
    },


    parallelResistance(resistances) {

      if (!Array.isArray(resistances) ||
          resistances.length === 0) {
        throw new Error("Enter resistor values.");
      }

      const values =
        resistances.map(value =>
          this.number(value, "Resistance")
        );

      if (values.some(value => value === 0)) {
        throw new Error("Resistance cannot be zero.");
      }

      const reciprocal =
        values.reduce(
          (sum, value) =>
            sum + (1 / value),
          0
        );

      const total = 1 / reciprocal;

      return this.result(
        total,
        "1/Rₜ = 1/R₁ + 1/R₂ + ...",
        [
          `1/Rₜ = ${values.map(v => `1/${v}`).join(" + ")}`,
          `Rₜ = ${total} Ω`
        ]
      );
    },


    /* =====================================================
       WAVES
    ===================================================== */

    waveSpeed(frequency, wavelength) {

      frequency =
        this.number(frequency, "Frequency");

      wavelength =
        this.number(wavelength, "Wavelength");

      const value =
        frequency * wavelength;

      return this.result(
        value,
        "v = fλ",
        [
          `v = ${frequency} × ${wavelength}`,
          `v = ${value} m/s`
        ]
      );
    },


    frequency(waveSpeed, wavelength) {

      waveSpeed =
        this.number(waveSpeed, "Wave speed");

      wavelength =
        this.number(wavelength, "Wavelength");

      if (wavelength === 0) {
        throw new Error("Wavelength cannot be zero.");
      }

      const value =
        waveSpeed / wavelength;

      return this.result(
        value,
        "f = v / λ",
        [
          `f = ${waveSpeed} / ${wavelength}`,
          `f = ${value} Hz`
        ]
      );
    },


    /* =====================================================
       OPTICS
    ===================================================== */

    lensFormula(u, v) {

      u = this.number(u, "Object distance");
      v = this.number(v, "Image distance");

      if (u === 0 || v === 0) {
        throw new Error("Distances cannot be zero.");
      }

      const reciprocalF =
        (1 / v) - (1 / u);

      if (reciprocalF === 0) {
        return this.result(
          Infinity,
          "1/f = 1/v - 1/u"
        );
      }

      const f = 1 / reciprocalF;

      return this.result(
        f,
        "1/f = 1/v - 1/u",
        [
          `1/f = 1/${v} - 1/${u}`,
          `f = ${f}`
        ]
      );
    },


    magnification(imageHeight, objectHeight) {

      imageHeight =
        this.number(imageHeight, "Image height");

      objectHeight =
        this.number(objectHeight, "Object height");

      if (objectHeight === 0) {
        throw new Error("Object height cannot be zero.");
      }

      const value =
        imageHeight / objectHeight;

      return this.result(
        value,
        "m = hᵢ / hₒ",
        [
          `m = ${imageHeight} / ${objectHeight}`,
          `m = ${value}`
        ]
      );
    },


    /* =====================================================
       TEMPERATURE
    ===================================================== */

    celsiusToKelvin(celsius) {

      celsius =
        this.number(celsius, "Temperature");

      return this.result(
        celsius + 273.15,
        "K = °C + 273.15"
      );
    },


    kelvinToCelsius(kelvin) {

      kelvin =
        this.number(kelvin, "Temperature");

      return this.result(
        kelvin - 273.15,
        "°C = K - 273.15"
      );
    },


    celsiusToFahrenheit(celsius) {

      celsius =
        this.number(celsius, "Temperature");

      return this.result(
        (celsius * 9 / 5) + 32,
        "°F = (°C × 9/5) + 32"
      );
    },


    fahrenheitToCelsius(fahrenheit) {

      fahrenheit =
        this.number(fahrenheit, "Temperature");

      return this.result(
        (fahrenheit - 32) * 5 / 9,
        "°C = (°F - 32) × 5/9"
      );
    },


    /* =====================================================
       ENERGY / MASS RELATION
    ===================================================== */

    massEnergy(mass) {

      mass = this.number(mass, "Mass");

      const c =
        this.constants.speedOfLight;

      const value =
        mass * Math.pow(c, 2);

      return this.result(
        value,
        "E = mc²",
        [
          `E = ${mass} × c²`,
          `E = ${value} J`
        ]
      );
    },


    /* =====================================================
       UNIT CONVERSIONS
    ===================================================== */

    conversions: {

      kmhToMs(value) {
        return Number(value) / 3.6;
      },

      msToKmh(value) {
        return Number(value) * 3.6;
      },

      kmToM(value) {
        return Number(value) * 1000;
      },

      mToKm(value) {
        return Number(value) / 1000;
      },

      cmToM(value) {
        return Number(value) / 100;
      },

      mToCm(value) {
        return Number(value) * 100;
      },

      gToKg(value) {
        return Number(value) / 1000;
      },

      kgToG(value) {
        return Number(value) * 1000;
      },

      hourToSecond(value) {
        return Number(value) * 3600;
      },

      minuteToSecond(value) {
        return Number(value) * 60;
      }
    },


    /* =====================================================
       FORMAT RESULT
    ===================================================== */

    format(value, decimals = 6) {

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

  window.NOVERA_PHYSICS = NOVERA_PHYSICS;

})();
