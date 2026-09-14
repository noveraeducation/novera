const NCERT_CLASS_10 = {

  mathematics: {

    id: "mathematics",

    name: "Mathematics",

    book: {
      title: "Mathematics",
      publisher: "NCERT",
      classLevel: "10",
      medium: "English"
    },

    chapters: [

      {
        id: "real-numbers",
        number: 1,
        name: "Real Numbers",

        sections: [

          {
            id: "fundamental-theorem-of-arithmetic",
            name: "The Fundamental Theorem of Arithmetic",

            concepts: [

              {
                id: "prime-factorisation",
                name: "Prime Factorisation",

                subtopics: [
                  "Prime numbers",
                  "Composite numbers",
                  "Unique prime factorisation",
                  "Prime factorisation of a number",
                  "Writing numbers as products of primes",
                  "Using prime factorisation in calculations"
                ]
              },

              {
                id: "fundamental-theorem",
                name: "Fundamental Theorem of Arithmetic",

                subtopics: [
                  "Statement of the theorem",
                  "Meaning of unique factorisation",
                  "Prime factorisation representation",
                  "Applications of the theorem"
                ]
              },

              {
                id: "hcf-using-prime-factorisation",
                name: "Finding HCF Using Prime Factorisation",

                subtopics: [
                  "Prime factorisation method",
                  "Common prime factors",
                  "Lowest powers of common prime factors",
                  "Finding HCF of two numbers",
                  "Finding HCF of more than two numbers"
                ]
              },

              {
                id: "lcm-using-prime-factorisation",
                name: "Finding LCM Using Prime Factorisation",

                subtopics: [
                  "Prime factors",
                  "Highest powers of prime factors",
                  "Finding LCM of two numbers",
                  "Finding LCM of more than two numbers"
                ]
              },

              {
                id: "hcf-lcm-relationship",
                name: "Relationship Between HCF and LCM",

                subtopics: [
                  "Product of two positive integers",
                  "HCF × LCM relationship",
                  "Using the relationship to find an unknown value",
                  "Checking answers"
                ]
              },

              {
                id: "irrationality-proofs",
                name: "Proving Irrationality",

                subtopics: [
                  "Rational numbers",
                  "Irrational numbers",
                  "Proof by contradiction",
                  "Assuming a number is rational",
                  "Representing a rational number as p/q",
                  "Using lowest-form representation",
                  "Deriving a contradiction",
                  "Proving √2 is irrational",
                  "Similar irrationality proofs"
                ]
              }

            ]
          },


          {
            id: "irrational-numbers",
            name: "Revisiting Irrational Numbers",

            concepts: [

              {
                id: "rational-numbers",
                name: "Rational Numbers",

                subtopics: [
                  "Definition",
                  "Numerator and denominator",
                  "Lowest-form representation",
                  "Positive and negative rational numbers",
                  "Examples"
                ]
              },

              {
                id: "irrational-numbers",
                name: "Irrational Numbers",

                subtopics: [
                  "Definition",
                  "Examples",
                  "Non-terminating decimal representation",
                  "Non-repeating decimal representation",
                  "Difference between rational and irrational numbers"
                ]
              },

              {
                id: "real-numbers",
                name: "Real Numbers",

                subtopics: [
                  "Rational numbers as real numbers",
                  "Irrational numbers as real numbers",
                  "Number line representation",
                  "Relationship between rational, irrational and real numbers"
                ]
              }

            ]
          }

        ],

        resources: {

          official: [
            {
              title: "NCERT Mathematics — Class 10",
              provider: "NCERT",
              type: "official-textbook",
              url: "https://ncert.nic.in/textbook.php?hemh1=ps-4",
              language: "English",
              free: true,
              verified: true
            }
          ]

        }

      }

    ]

  }

};


window.NCERT_CLASS_10 = NCERT_CLASS_10;
