/*
========================================================
NOVERA — NCERT CLASS 10
PART 1 — MATHEMATICS
========================================================

Current NCERT Class 10 Mathematics structure.
Rationalised content is excluded from the core concept
navigation.

Official textbook:
https://ncert.nic.in/textbook.php?hemh1=ps-4

Used by:
window.NCERT_CLASS_10
========================================================
*/

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

    textbook:
      "https://ncert.nic.in/textbook.php?hemh1=ps-4",

    chapters: [

      /* =================================================
         CHAPTER 1
      ================================================= */

      {
        id: "real-numbers",
        number: 1,
        name: "Real Numbers",

        sections: [

          {
            id: "fundamental-theorem",
            name: "The Fundamental Theorem of Arithmetic",

            concepts: [

              {
                id: "prime-factorisation",
                name: "Prime Factorisation",

                subtopics: [
                  "Prime numbers",
                  "Composite numbers",
                  "Prime factorisation",
                  "Writing a number as a product of primes",
                  "Unique prime factorisation"
                ]
              },

              {
                id: "fundamental-theorem-of-arithmetic",
                name: "Fundamental Theorem of Arithmetic",

                subtopics: [
                  "Statement of the theorem",
                  "Uniqueness of prime factorisation",
                  "Applications of the theorem",
                  "Using prime factorisation in calculations"
                ]
              },

              {
                id: "hcf-lcm-prime-factorisation",
                name: "HCF and LCM Using Prime Factorisation",

                subtopics: [
                  "Common prime factors",
                  "Highest powers and lowest powers",
                  "Finding HCF",
                  "Finding LCM",
                  "Relationship between HCF and LCM"
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
                  "Lowest form",
                  "Examples"
                ]
              },

              {
                id: "irrational-numbers",
                name: "Irrational Numbers",

                subtopics: [
                  "Definition",
                  "Examples",
                  "Non-terminating decimals",
                  "Non-repeating decimals",
                  "Difference between rational and irrational numbers"
                ]
              },

              {
                id: "real-number-system",
                name: "Real Numbers",

                subtopics: [
                  "Rational numbers as real numbers",
                  "Irrational numbers as real numbers",
                  "Real number line",
                  "Relationship between rational, irrational and real numbers"
                ]
              },

              {
                id: "irrationality-proofs",
                name: "Proving Irrationality",

                subtopics: [
                  "Proof by contradiction",
                  "Assuming a number is rational",
                  "Lowest-form representation",
                  "Deriving a contradiction",
                  "Proof that √2 is irrational",
                  "Similar irrationality proofs"
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
      },


      /* =================================================
         CHAPTER 2
      ================================================= */

      {
        id: "polynomials",
        number: 2,
        name: "Polynomials",

        sections: [

          {
            id: "polynomial-zeroes",
            name: "Zeroes of a Polynomial",

            concepts: [

              {
                id: "zeroes-polynomial",
                name: "Zeroes of a Polynomial",

                subtopics: [
                  "Meaning of a zero",
                  "Finding zeroes",
                  "Polynomial equations",
                  "Graphical interpretation"
                ]
              },

              {
                id: "geometrical-meaning-zeroes",
                name: "Geometrical Meaning of the Zeroes",

                subtopics: [
                  "Graph of a polynomial",
                  "Zeroes as x-intercepts",
                  "Number of zeroes",
                  "Linear polynomial",
                  "Quadratic polynomial"
                ]
              }

            ]
          },

          {
            id: "relationship-zeroes-coefficients",
            name: "Relationship Between Zeroes and Coefficients",

            concepts: [

              {
                id: "quadratic-zeroes-coefficients",
                name: "Quadratic Polynomial",

                subtopics: [
                  "Standard quadratic polynomial",
                  "Zeroes",
                  "Coefficients",
                  "Sum of zeroes",
                  "Product of zeroes"
                ]
              },

              {
                id: "finding-zeroes",
                name: "Finding Zeroes Using Relationships",

                subtopics: [
                  "Sum of zeroes",
                  "Product of zeroes",
                  "Finding unknown coefficients",
                  "Verifying relationships"
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
      },


      /* =================================================
         CHAPTER 3
      ================================================= */

      {
        id: "pair-linear-equations",
        number: 3,
        name: "Pair of Linear Equations in Two Variables",

        sections: [

          {
            id: "graphical-method",
            name: "Graphical Method",

            concepts: [

              {
                id: "pair-linear-equations-graph",
                name: "Graph of a Pair of Linear Equations",

                subtopics: [
                  "Linear equation in two variables",
                  "Graph of a linear equation",
                  "Pair of equations",
                  "Intersection of lines"
                ]
              },

              {
                id: "number-solutions",
                name: "Number of Solutions",

                subtopics: [
                  "Unique solution",
                  "No solution",
                  "Infinitely many solutions",
                  "Geometrical interpretation"
                ]
              }

            ]
          },

          {
            id: "algebraic-methods",
            name: "Algebraic Methods",

            concepts: [

              {
                id: "substitution-method",
                name: "Substitution Method",

                subtopics: [
                  "Rearranging an equation",
                  "Substitution",
                  "Solving for one variable",
                  "Finding the second variable",
                  "Checking the solution"
                ]
              },

              {
                id: "elimination-method",
                name: "Elimination Method",

                subtopics: [
                  "Eliminating a variable",
                  "Multiplying equations",
                  "Adding or subtracting equations",
                  "Finding the solution",
                  "Verification"
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
      },


      /* =================================================
         CHAPTER 4
      ================================================= */

      {
        id: "quadratic-equations",
        number: 4,
        name: "Quadratic Equations",

        sections: [

          {
            id: "quadratic-equations-section",
            name: "Quadratic Equations",

            concepts: [

              {
                id: "standard-quadratic-equation",
                name: "Quadratic Equations",

                subtopics: [
                  "Definition",
                  "Standard form",
                  "Coefficients",
                  "Roots of a quadratic equation"
                ]
              },

              {
                id: "factorisation-quadratic",
                name: "Solution by Factorisation",

                subtopics: [
                  "Factorisation",
                  "Splitting the middle term",
                  "Zero-product property",
                  "Finding roots",
                  "Checking roots"
                ]
              },

              {
                id: "nature-of-roots",
                name: "Nature of Roots",

                subtopics: [
                  "Discriminant",
                  "Two distinct real roots",
                  "Equal real roots",
                  "No real roots",
                  "Relationship between discriminant and roots"
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
      },


      /* =================================================
         CHAPTER 5
      ================================================= */

      {
        id: "arithmetic-progressions",
        number: 5,
        name: "Arithmetic Progressions",

        sections: [

          {
            id: "ap-introduction",
            name: "Introduction to Arithmetic Progressions",

            concepts: [

              {
                id: "sequence",
                name: "Sequences",

                subtopics: [
                  "Sequence",
                  "Terms of a sequence",
                  "Pattern recognition",
                  "Finite and infinite sequences"
                ]
              },

              {
                id: "arithmetic-progression",
                name: "Arithmetic Progression",

                subtopics: [
                  "Definition",
                  "Common difference",
                  "Recognising an AP",
                  "Writing an AP",
                  "Finding the common difference"
                ]
              }

            ]
          },

          {
            id: "nth-term",
            name: "nth Term of an AP",

            concepts: [

              {
                id: "nth-term-formula",
                name: "Formula for the nth Term",

                subtopics: [
                  "First term",
                  "Common difference",
                  "nth term formula",
                  "Finding a particular term",
                  "Finding the position of a term"
                ]
              }

            ]
          },

          {
            id: "sum-ap",
            name: "Sum of the First n Terms",

            concepts: [

              {
                id: "sum-n-terms",
                name: "Sum of an AP",

                subtopics: [
                  "Sum formula",
                  "First term",
                  "Last term",
                  "Number of terms",
                  "Applications",
                  "Word problems"
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
      },


      /* =================================================
         CHAPTER 6
      ================================================= */

      {
        id: "triangles",
        number: 6,
        name: "Triangles",

        sections: [

          {
            id: "similarity",
            name: "Similarity of Triangles",

            concepts: [

              {
                id: "similar-figures",
                name: "Similar Figures",

                subtopics: [
                  "Meaning of similarity",
                  "Corresponding angles",
                  "Corresponding sides",
                  "Scale factor"
                ]
              },

              {
                id: "basic-proportionality-theorem",
                name: "Basic Proportionality Theorem",

                subtopics: [
                  "Statement",
                  "Proportional division",
                  "Applications",
                  "Using the theorem"
                ]
              },

              {
                id: "similarity-criteria",
                name: "Criteria for Similarity of Triangles",

                subtopics: [
                  "AA similarity",
                  "SAS similarity",
                  "SSS similarity",
                  "Identifying corresponding parts",
                  "Using similarity in problems"
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
      },


      /* =================================================
         CHAPTER 7
      ================================================= */

      {
        id: "coordinate-geometry",
        number: 7,
        name: "Coordinate Geometry",

        sections: [

          {
            id: "coordinate-methods",
            name: "Coordinate Methods",

            concepts: [

              {
                id: "distance-formula",
                name: "Distance Formula",

                subtopics: [
                  "Coordinate plane",
                  "Distance between two points",
                  "Distance formula",
                  "Applications"
                ]
              },

              {
                id: "section-formula",
                name: "Section Formula",

                subtopics: [
                  "Internal division",
                  "Ratio of division",
                  "Coordinates of a dividing point",
                  "Applications"
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
      },


      /* =================================================
         CHAPTER 8
      ================================================= */

      {
        id: "introduction-trigonometry",
        number: 8,
        name: "Introduction to Trigonometry",

        sections: [

          {
            id: "trigonometric-ratios",
            name: "Trigonometric Ratios",

            concepts: [

              {
                id: "basic-trig-ratios",
                name: "Trigonometric Ratios",

                subtopics: [
                  "Right-angled triangle",
                  "Opposite side",
                  "Adjacent side",
                  "Hypotenuse",
                  "Sine",
                  "Cosine",
                  "Tangent"
                ]
              },

              {
                id: "reciprocal-ratios",
                name: "Reciprocal Trigonometric Ratios",

                subtopics: [
                  "Cosecant",
                  "Secant",
                  "Cotangent",
                  "Reciprocal relationships"
                ]
              }

            ]
          },

          {
            id: "specific-angles",
            name: "Trigonometric Ratios of Specific Angles",

            concepts: [

              {
                id: "standard-angle-values",
                name: "Standard Angle Values",

                subtopics: [
                  "0°",
                  "30°",
                  "45°",
                  "60°",
                  "90°",
                  "Standard trigonometric values"
                ]
              }

            ]
          },

          {
            id: "trig-identities",
            name: "Trigonometric Identities",

            concepts: [

              {
                id: "basic-identities",
                name: "Basic Trigonometric Identities",

                subtopics: [
                  "Identity meaning",
                  "Basic identities",
                  "Simplification",
                  "Verification of identities"
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
      },


      /* =================================================
         CHAPTER 9
      ================================================= */

      {
        id: "applications-trigonometry",
        number: 9,
        name: "Some Applications of Trigonometry",

        sections: [

          {
            id: "heights-distances",
            name: "Heights and Distances",

            concepts: [

              {
                id: "line-of-sight",
                name: "Line of Sight",

                subtopics: [
                  "Observer",
                  "Object",
                  "Line of sight",
                  "Horizontal line"
                ]
              },

              {
                id: "angle-elevation",
                name: "Angle of Elevation",

                subtopics: [
                  "Definition",
                  "Diagram construction",
                  "Using trigonometric ratios",
                  "Applications"
                ]
              },

              {
                id: "angle-depression",
                name: "Angle of Depression",

                subtopics: [
                  "Definition",
                  "Horizontal reference",
                  "Diagram construction",
                  "Applications"
                ]
              },

              {
                id: "heights-distances-problems",
                name: "Heights and Distances Problems",

                subtopics: [
                  "Drawing diagrams",
                  "Choosing a trigonometric ratio",
                  "Finding height",
                  "Finding distance",
                  "Word problems"
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
      },


      /* =================================================
         CHAPTER 10
      ================================================= */

      {
        id: "circles",
        number: 10,
        name: "Circles",

        sections: [

          {
            id: "tangent",
            name: "Tangent to a Circle",

            concepts: [

              {
                id: "tangent-circle",
                name: "Tangent to a Circle",

                subtopics: [
                  "Circle",
                  "Tangent",
                  "Point of contact",
                  "Radius",
                  "Tangent properties"
                ]
              },

              {
                id: "tangent-radius",
                name: "Radius and Tangent",

                subtopics: [
                  "Radius through point of contact",
                  "Perpendicular relationship",
                  "Using the theorem"
                ]
              },

              {
                id: "tangents-external-point",
                name: "Tangents from an External Point",

                subtopics: [
                  "External point",
                  "Two tangents",
                  "Equal tangents",
                  "Applications"
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
      },


      /* =================================================
         CHAPTER 11
         CONSTRUCTIONS — CURRENT CORE REMOVED
      ================================================= */

      {
        id: "constructions",
        number: 11,
        name: "Constructions",

        sections: [

          {
            id: "rationalised",
            name: "Rationalised Content",

            concepts: [

              {
                id: "constructions-rationalised",
                name: "Chapter Removed from Current Core",

                subtopics: [
                  "This chapter is not included in the current core syllabus dataset."
                ]
              }

            ]
          }

        ],

        resources: {

          official: [

            {
              title: "NCERT Class 10 Rationalised Content",
              provider: "NCERT",
              type: "official-rationalisation",
              url: "https://www.ncert.nic.in/pdf/BookletClass10.pdf",
              language: "English",
              free: true,
              verified: true
            }

          ]

        },

        excludedFromCore: true
      },


      /* =================================================
         CHAPTER 12
      ================================================= */

      {
        id: "areas-related-circles",
        number: 12,
        name: "Areas Related to Circles",

        sections: [

          {
            id: "sector-segment",
            name: "Areas of Sectors and Segments",

            concepts: [

              {
                id: "circumference-area",
                name: "Circumference and Area of a Circle",

                subtopics: [
                  "Radius",
                  "Diameter",
                  "Circumference",
                  "Area",
                  "Applications"
                ]
              },

              {
                id: "sector",
                name: "Area of a Sector",

                subtopics: [
                  "Central angle",
                  "Arc",
                  "Sector",
                  "Area of a sector"
                ]
              },

              {
                id: "segment",
                name: "Area of a Segment",

                subtopics: [
                  "Minor segment",
                  "Major segment",
                  "Sector and triangle relationship",
                  "Area calculations"
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
      },


      /* =================================================
         CHAPTER 13
      ================================================= */

      {
        id: "surface-areas-volumes",
        number: 13,
        name: "Surface Areas and Volumes",

        sections: [

          {
            id: "combinations-solids",
            name: "Combinations of Solids",

            concepts: [

              {
                id: "surface-combinations",
                name: "Surface Areas of Combinations of Solids",

                subtopics: [
                  "Combination of solids",
                  "Cylinder",
                  "Cone",
                  "Sphere",
                  "Hemisphere",
                  "Exposed surfaces",
                  "Total surface area"
                ]
              },

              {
                id: "volume-combinations",
                name: "Volumes of Combinations of Solids",

                subtopics: [
                  "Volume of composite solids",
                  "Cylinder",
                  "Cone",
                  "Sphere",
                  "Hemisphere",
                  "Adding volumes",
                  "Subtracting volumes"
                ]
              },

              {
                id: "conversion-solids",
                name: "Conversion of Solids",

                subtopics: [
                  "Volume conservation",
                  "Recasting solids",
                  "Changing shape",
                  "Finding unknown dimensions"
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
      },


      /* =================================================
         CHAPTER 14
      ================================================= */

      {
        id: "statistics",
        number: 14,
        name: "Statistics",

        sections: [

          {
            id: "grouped-data",
            name: "Grouped Data",

            concepts: [

              {
                id: "frequency-distribution",
                name: "Frequency Distribution",

                subtopics: [
                  "Class intervals",
                  "Frequency",
                  "Class marks",
                  "Grouped data"
                ]
              },

              {
                id: "mean-statistics",
                name: "Mean of Grouped Data",

                subtopics: [
                  "Direct method",
                  "Assumed mean method",
                  "Step-deviation method",
                  "Class mark",
                  "Frequency"
                ]
              },

              {
                id: "median-statistics",
                name: "Median of Grouped Data",

                subtopics: [
                  "Cumulative frequency",
                  "Median class",
                  "Median formula",
                  "Finding median"
                ]
              },

              {
                id: "mode-statistics",
                name: "Mode of Grouped Data",

                subtopics: [
                  "Modal class",
                  "Mode formula",
                  "Frequency distribution"
                ]
              }

            ]
          },

          {
            id: "empirical-relation",
            name: "Empirical Relationship",

            concepts: [

              {
                id: "mean-median-mode",
                name: "Relationship Between Mean, Median and Mode",

                subtopics: [
                  "Mean",
                  "Median",
                  "Mode",
                  "Empirical relationship",
                  "Using the relationship"
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
      },


      /* =================================================
         CHAPTER 15
      ================================================= */

      {
        id: "probability",
        number: 15,
        name: "Probability",

        sections: [

          {
            id: "theoretical-probability",
            name: "A Theoretical Approach",

            concepts: [

              {
                id: "random-experiment",
                name: "Random Experiments",

                subtopics: [
                  "Random experiment",
                  "Outcome",
                  "Sample space",
                  "Event"
                ]
              },

              {
                id: "classical-probability",
                name: "Theoretical Probability",

                subtopics: [
                  "Definition",
                  "Favourable outcomes",
                  "Total outcomes",
                  "Probability formula",
                  "Simple probability problems"
                ]
              },

              {
                id: "probability-properties",
                name: "Properties of Probability",

                subtopics: [
                  "Probability range",
                  "Impossible event",
                  "Certain event",
                  "Complementary events",
                  "Applications"
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


/*
========================================================
MAKE DATABASE AVAILABLE TO NOVERA APP
========================================================
*/

window.NCERT_CLASS_10 = NCERT_CLASS_10;
