/* =========================================================
   NOVERA — V2 CONTENT ENGINE
   External NCERT database + existing navigation
   ========================================================= */

"use strict";


/* =========================================================
   DATABASE CONNECTION
   ========================================================= */

const NCERT = {

  /* -------------------------------------------------------
     CLASS 9
     Temporary foundation until its external database
     is connected.
     ------------------------------------------------------- */

  "9": {

    name: "Class 9",

    subjects: {

      mathematics: {
        name: "Mathematics",
        chapters: []
      },

      science: {
        name: "Science",
        chapters: []
      },

      "social-science": {
        name: "Social Science",
        chapters: []
      },

      english: {
        name: "English",
        chapters: []
      }

    }

  },


  /* -------------------------------------------------------
     CLASS 10
     REAL EXTERNAL DATABASE
     Loaded from data/ncert/class10/index.js
     ------------------------------------------------------- */

  "10": {

    name: "Class 10",

    subjects:
      convertClass10Database()

  },


  /* -------------------------------------------------------
     CLASS 11
     Temporary foundation
     ------------------------------------------------------- */

  "11": {

    name: "Class 11",

    subjects: {

      mathematics: {
        name: "Mathematics",
        chapters: []
      },

      physics: {
        name: "Physics",
        chapters: []
      },

      chemistry: {
        name: "Chemistry",
        chapters: []
      },

      biology: {
        name: "Biology",
        chapters: []
      },

      english: {
        name: "English",
        chapters: []
      },

      economics: {
        name: "Economics",
        chapters: []
      }

    }

  },


  /* -------------------------------------------------------
     CLASS 12
     Temporary foundation
     ------------------------------------------------------- */

  "12": {

    name: "Class 12",

    subjects: {

      mathematics: {
        name: "Mathematics",
        chapters: []
      },

      physics: {
        name: "Physics",
        chapters: []
      },

      chemistry: {
        name: "Chemistry",
        chapters: []
      },

      biology: {
        name: "Biology",
        chapters: []
      },

      english: {
        name: "English",
        chapters: []
      },

      economics: {
        name: "Economics",
        chapters: []
      }

    }

  }

};


/* =========================================================
   CONVERT CLASS 10 DATABASE
   ========================================================= */

function convertClass10Database() {

  if (
    typeof window.NCERT_CLASS_10 === "undefined"
  ) {

    console.error(
      "Novera: Class 10 database was not loaded."
    );

    return {};

  }


  const source =
    window.NCERT_CLASS_10;


  const result = {};


  /*
   * The external database contains:
   *
   * Mathematics
   *   ↓
   * chapters
   *   ↓
   * sections
   *   ↓
   * concepts
   *
   * The current navigation is:
   *
   * Class
   *   ↓
   * Subject
   *   ↓
   * Chapter
   *   ↓
   * Concept
   *
   * Therefore we flatten sections into the
   * chapter's concept list while keeping the
   * complete section information attached.
   */

  Object.entries(source).forEach(
    ([subjectId, subjectData]) => {

      const chapters =
        (subjectData.chapters || [])
          .map(chapter => {

            const concepts = [];


            /*
             * Convert:
             *
             * section → concepts
             *
             * into:
             *
             * chapter → concepts
             *
             */

            (chapter.sections || [])
              .forEach(section => {

                (section.concepts || [])
                  .forEach(concept => {

                    concepts.push({

                      id: concept.id,

                      name: concept.name,

                      sectionId:
                        section.id,

                      sectionName:
                        section.name,

                      subtopics:
                        concept.subtopics || [],

                      resources:
                        concept.resources || {},

                      difficulty:
                        concept.difficulty || null,

                      prerequisites:
                        concept.prerequisites || [],

                      tools:
                        concept.tools || []

                    });

                  });

              });


            return {

              id: chapter.id,

              number: chapter.number,

              name: chapter.name,

              sections:
                chapter.sections || [],

              concepts,

              resources:
                chapter.resources || {}

            };

          });


      result[subjectId] = {

        id:
          subjectData.id ||
          subjectId,

        name:
          subjectData.name,

        book:
          subjectData.book || {},

        chapters

      };

    }
  );


  return result;

}


/* =========================================================
   STATE
   ========================================================= */

const NoveraState = {

  curriculum: null,

  classLevel: null,

  subject: null,

  chapter: null,

  concept: null,

  bookmarks: JSON.parse(
    localStorage.getItem(
      "noveraBookmarks"
    ) || "[]"
  ),

  history: []

};


/* =========================================================
   RESOURCE TYPES
   ========================================================= */

const RESOURCE_TYPES = {

  BEST: "Best overall",

  CONCEPT: "Conceptual",

  EXAM: "Exam focused",

  REVISION: "Quick revision",

  OFFICIAL: "Official resource",

  PRACTICE: "Practice",

  PAPER: "Question paper",

  TOOL: "Useful tool"

};


/* =========================================================
   UTILITIES
   ========================================================= */

function saveBookmarks() {

  localStorage.setItem(

    "noveraBookmarks",

    JSON.stringify(
      NoveraState.bookmarks
    )

  );

}


function slugify(text) {

  return text

    .toLowerCase()

    .trim()

    .replace(
      /[^a-z0-9]+/g,
      "-"
    )

    .replace(
      /^-+|-+$/g,
      "");

}


function escapeHTML(text) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    text == null
      ? ""
      : String(text);

  return div.innerHTML;

}


/* =========================================================
   FIND CURRENT CONCEPT
   ========================================================= */

function getCurrentConcept() {

  const classData =
    NCERT[
      NoveraState.classLevel
    ];

  if (!classData) return null;


  const subject =
    classData.subjects[
      NoveraState.subject
    ];

  if (!subject) return null;


  const chapter =
    subject.chapters.find(
      item =>
        item.id ===
        NoveraState.chapter
    );

  if (!chapter) return null;


  return chapter.concepts.find(
    concept =>
      concept.id ===
      NoveraState.concept
  ) || null;

}


/* =========================================================
   TOAST
   ========================================================= */

function showNoveraMessage(
  message
) {

  let toast =
    document.querySelector(
      ".novera-toast"
    );


  if (!toast) {

    toast =
      document.createElement(
        "div"
      );

    toast.className =
      "novera-toast";

    toast.style.position =
      "fixed";

    toast.style.left =
      "50%";

    toast.style.bottom =
      "24px";

    toast.style.transform =
      "translateX(-50%) translateY(20px)";

    toast.style.padding =
      "12px 18px";

    toast.style.borderRadius =
      "999px";

    toast.style.background =
      "rgba(15,20,17,.94)";

    toast.style.color =
      "#fff";

    toast.style.fontSize =
      "14px";

    toast.style.zIndex =
      "9999";

    toast.style.pointerEvents =
      "none";

    toast.style.transition =
      "opacity .25s ease, transform .25s ease";

    toast.style.opacity =
      "0";

    toast.style.boxShadow =
      "0 10px 35px rgba(0,0,0,.25)";

    document.body.appendChild(
      toast
    );

  }


  toast.textContent =
    message;


  requestAnimationFrame(
    () => {

      toast.style.opacity =
        "1";

      toast.style.transform =
        "translateX(-50%) translateY(0)";

    }
  );


  clearTimeout(
    toast._timer
  );


  toast._timer =
    setTimeout(
      () => {

        toast.style.opacity =
          "0";

        toast.style.transform =
          "translateX(-50%) translateY(20px)";

      },
      2200
    );

}


/* =========================================================
   HISTORY
   ========================================================= */

function pushHistory() {

  NoveraState.history.push({

    curriculum:
      NoveraState.curriculum,

    classLevel:
      NoveraState.classLevel,

    subject:
      NoveraState.subject,

    chapter:
      NoveraState.chapter,

    concept:
      NoveraState.concept

  });

}


function restoreState(
  state
) {

  NoveraState.curriculum =
    state.curriculum;

  NoveraState.classLevel =
    state.classLevel;

  NoveraState.subject =
    state.subject;

  NoveraState.chapter =
    state.chapter;

  NoveraState.concept =
    state.concept;

}


/* =========================================================
   BACK NAVIGATION
   ========================================================= */

function goBack() {

  const currentPage =
    document.querySelector(
      ".novera-v2-page"
    );


  if (currentPage) {

    currentPage.remove();

  }


  if (
    NoveraState.history.length === 0
  ) {

    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

    return;

  }


  const previous =
    NoveraState.history.pop();


  restoreState(
    previous
  );


  if (
    !previous.curriculum
  ) {

    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

    return;

  }


  if (

    previous.curriculum ===
      "ncert" &&

    !previous.classLevel

  ) {

    openNCERTClassSelector(
      false
    );

    return;

  }


  if (

    previous.curriculum ===
      "ncert" &&

    previous.classLevel &&

    !previous.subject

  ) {

    openNCERTClass(
      previous.classLevel,
      false
    );

    return;

  }


  if (

    previous.curriculum ===
      "ncert" &&

    previous.classLevel &&

    previous.subject &&

    !previous.chapter

  ) {

    openNCERTSubject(
      previous.subject,
      false
    );

    return;

  }


  if (

    previous.curriculum ===
      "ncert" &&

    previous.classLevel &&

    previous.subject &&

    previous.chapter &&

    !previous.concept

  ) {

    openChapter(
      previous.chapter,
      false
    );

    return;

  }


  if (

    previous.curriculum ===
      "ncert" &&

    previous.concept

  ) {

    openConcept(
      previous.concept,
      false
    );

  }

}


/* =========================================================
   CURRICULUM
   ========================================================= */

function openCurriculum(

  curriculum,

  addHistory = true

) {

  if (addHistory) {

    pushHistory();

  }


  NoveraState.curriculum =
    curriculum;

  NoveraState.classLevel =
    null;

  NoveraState.subject =
    null;

  NoveraState.chapter =
    null;

  NoveraState.concept =
    null;


  if (
    curriculum === "ncert"
  ) {

    openNCERTClassSelector(
      false
    );

    return;

  }


  showNoveraMessage(
    "This curriculum is being connected."
  );

}


/* =========================================================
   NCERT CLASS SELECTOR
   ========================================================= */

function openNCERTClassSelector(
  addHistory = false
) {

  if (addHistory) {

    pushHistory();

  }


  const classes =

    Object.entries(NCERT)

      .map(
        ([id, data]) => ({

          id,

          name:
            data.name

        })
      );


  renderLearningPage(

    "NCERT",

    "Choose your class",

    classes,

    "class"

  );

}


/* =========================================================
   CLASS
   ========================================================= */

function openNCERTClass(

  classLevel,

  addHistory = true

) {

  if (addHistory) {

    pushHistory();

  }


  NoveraState.classLevel =
    classLevel;

  NoveraState.subject =
    null;

  NoveraState.chapter =
    null;

  NoveraState.concept =
    null;


  const classData =
    NCERT[
      classLevel
    ];


  if (!classData) return;


  const subjects =

    Object.entries(
      classData.subjects
    )

      .map(
        ([id, data]) => ({

          id,

          name:
            data.name

        })
      );


  renderLearningPage(

    classData.name,

    "Choose your subject",

    subjects,

    "subject"

  );

}


/* =========================================================
   SUBJECT
   ========================================================= */

function openNCERTSubject(

  subjectId,

  addHistory = true

) {

  if (addHistory) {

    pushHistory();

  }


  const classData =
    NCERT[
      NoveraState.classLevel
    ];


  if (!classData) return;


  const subject =
    classData.subjects[
      subjectId
    ];


  if (!subject) return;


  NoveraState.subject =
    subjectId;

  NoveraState.chapter =
    null;

  NoveraState.concept =
    null;


  const chapters =
    subject.chapters || [];


  if (
    !chapters.length
  ) {

    renderEmptyLearningPage(

      subject.name,

      "Chapter resources are not connected yet."

    );

    return;

  }


  renderLearningPage(

    subject.name,

    "Choose a chapter",

    chapters,

    "chapter"

  );

}


/* =========================================================
   CHAPTER
   ========================================================= */

function openChapter(

  chapterId,

  addHistory = true

) {

  if (addHistory) {

    pushHistory();

  }


  const classData =
    NCERT[
      NoveraState.classLevel
    ];


  if (!classData) return;


  const subject =
    classData.subjects[
      NoveraState.subject
    ];


  if (!subject) return;


  const chapter =
    subject.chapters.find(

      item =>
        item.id ===
        chapterId

    );


  if (!chapter) return;


  NoveraState.chapter =
    chapterId;

  NoveraState.concept =
    null;


  const concepts =
    chapter.concepts || [];


  if (
    !concepts.length
  ) {

    renderEmptyLearningPage(

      chapter.name,

      "Concepts are not connected yet."

    );

    return;

  }


  renderLearningPage(

    chapter.name,

    "Choose a concept",

    concepts,

    "concept"

  );

}


/* =========================================================
   CONCEPT
   ========================================================= */

function openConcept(

  conceptId,

  addHistory = true

) {

  if (addHistory) {

    pushHistory();

  }


  NoveraState.concept =
    conceptId;


  const concept =
    getCurrentConcept();


  if (!concept) {

    showNoveraMessage(
      "Concept not found."
    );

    return;

  }


  renderConceptPage(
    concept
  );

}


/* =========================================================
   LEARNING PAGE
   ========================================================= */

function renderLearningPage(

  eyebrow,

  title,

  items,

  type

) {

  const existing =
    document.querySelector(
      ".novera-v2-page"
    );


  if (existing) {

    existing.remove();

  }


  const page =
    document.createElement(
      "section"
    );


  page.className =
    "novera-v2-page";


  page.innerHTML = `

    <div class="novera-v2-inner">

      <button
        class="novera-back-button"
        type="button"
      >
        ← Back
      </button>

      <span class="section-label">
        ${escapeHTML(eyebrow)}
      </span>

      <h1>
        ${escapeHTML(title)}
      </h1>

      <div class="novera-v2-grid">

        ${items.map(
          (item, index) => `

            <button
              class="novera-v2-card"
              type="button"
              data-type="${escapeHTML(type)}"
              data-id="${escapeHTML(item.id)}"
            >

              <span class="novera-v2-number">
                ${String(index + 1).padStart(2, "0")}
              </span>

              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <span class="novera-v2-arrow">
                ↗
              </span>

            </button>

          `
        ).join("")}

      </div>

    </div>

  `;


  document.body.appendChild(
    page
  );


  requestAnimationFrame(
    () => {

      page.classList.add(
        "active"
      );

    }
  );


  page
    .querySelector(
      ".novera-back-button"
    )
    .addEventListener(
      "click",
      goBack
    );


  page
    .querySelectorAll(
      ".novera-v2-card"
    )
    .forEach(
      card => {

        card.addEventListener(
          "click",
          () => {

            const id =
              card.dataset.id;


            if (
              type === "class"
            ) {

              openNCERTClass(
                id
              );

            }


            if (
              type === "subject"
            ) {

              openNCERTSubject(
                id
              );

            }


            if (
              type === "chapter"
            ) {

              openChapter(
                id
              );

            }


            if (
              type === "concept"
            ) {

              openConcept(
                id
              );

            }

          }
        );

      }
    );

}


/* =========================================================
   EMPTY PAGE
   ========================================================= */

function renderEmptyLearningPage(

  title,

  message

) {

  const existing =
    document.querySelector(
      ".novera-v2-page"
    );


  if (existing) {

    existing.remove();

  }


  const page =
    document.createElement(
      "section"
    );


  page.className =
    "novera-v2-page";


  page.innerHTML = `

    <div class="novera-v2-inner">

      <button
        class="novera-back-button"
        type="button"
      >
        ← Back
      </button>

      <span class="section-label">
        NOVERA
      </span>

      <h1>
        ${escapeHTML(title)}
      </h1>

      <div class="novera-empty">

        <div class="novera-empty-symbol">
          ◌
        </div>

        <h2>
          ${escapeHTML(message)}
        </h2>

      </div>

    </div>

  `;


  document.body.appendChild(
    page
  );


  requestAnimationFrame(
    () => {

      page.classList.add(
        "active"
      );

    }
  );


  page
    .querySelector(
      ".novera-back-button"
    )
    .addEventListener(
      "click",
      goBack
    );

}


/* =========================================================
   CONCEPT PAGE
   ========================================================= */

function renderConceptPage(
  concept
) {

  const existing =
    document.querySelector(
      ".novera-v2-page"
    );


  if (existing) {

    existing.remove();

  }


  const page =
    document.createElement(
      "section"
    );


  page.className =
    "novera-v2-page novera-concept-page";


  const bookmarkId = [

    NoveraState.classLevel,

    NoveraState.subject,

    NoveraState.chapter,

    NoveraState.concept

  ].join("/");


  const bookmarked =
    NoveraState.bookmarks.includes(
      bookmarkId
    );


  const subtopics =
    concept.subtopics || [];


  const prerequisites =
    concept.prerequisites || [];


  const tools =
    concept.tools || [];


  page.innerHTML = `

    <div class="novera-v2-inner">

      <button
        class="novera-back-button"
        type="button"
      >
        ← Back
      </button>

      <span class="section-label">
        ${escapeHTML(
          concept.sectionName ||
          "CONCEPT"
        )}
      </span>

      <h1>
        ${escapeHTML(
          concept.name
        )}
      </h1>

      <p class="novera-concept-intro">
        Understand the idea first.
        Then read, watch and practise.
      </p>

      <button
        class="novera-bookmark-button"
        type="button"
        data-bookmark="${escapeHTML(
          bookmarkId
        )}"
      >
        ${
          bookmarked
            ? "★ Saved"
            : "☆ Save concept"
        }
      </button>


      ${
        subtopics.length
          ? `

            <div
              class="novera-detail-block"
              style="
                margin:28px 0;
                padding:22px;
                border:1px solid rgba(128,128,128,.18);
                border-radius:20px;
                background:rgba(128,128,128,.06);
              "
            >

              <span
                class="section-label"
              >
                WHAT YOU'LL LEARN
              </span>

              <ul
                style="
                  margin:14px 0 0;
                  padding-left:20px;
                  line-height:1.8;
                "
              >

                ${subtopics.map(
                  item => `

                    <li>
                      ${escapeHTML(item)}
                    </li>

                  `
                ).join("")}

              </ul>

            </div>

          `
          : ""
      }


      ${
        prerequisites.length
          ? `

            <div
              class="novera-detail-block"
              style="
                margin:28px 0;
                padding:22px;
                border:1px solid rgba(128,128,128,.18);
                border-radius:20px;
                background:rgba(128,128,128,.06);
              "
            >

              <span
                class="section-label"
              >
                BEFORE THIS
              </span>

              <div
                style="
                  margin-top:14px;
                  display:flex;
                  flex-wrap:wrap;
                  gap:8px;
                "
              >

                ${prerequisites.map(
                  item => `

                    <span
                      style="
                        padding:8px 12px;
                        border-radius:999px;
                        background:rgba(128,128,128,.12);
                        font-size:13px;
                      "
                    >
                      ${escapeHTML(item)}
                    </span>

                  `
                ).join("")}

              </div>

            </div>

          `
          : ""
      }


      <div
        class="novera-resource-grid"
      >

        ${renderResources(
          concept.resources
        )}

      </div>


      ${
        tools.length
          ? `

            <div
              style="
                margin-top:30px;
              "
            >

              <span
                class="section-label"
              >
                USEFUL TOOLS
              </span>

              <div
                style="
                  margin-top:14px;
                  display:flex;
                  flex-wrap:wrap;
                  gap:10px;
                "
              >

                ${tools.map(
                  tool => `

                    <button
                      type="button"
                      class="novera-resource-button"
                      data-tool="${escapeHTML(tool)}"
                    >
                      ${escapeHTML(tool)}
                      →
                    </button>

                  `
                ).join("")}

              </div>

            </div>

          `
          : ""
      }

    </div>

  `;


  document.body.appendChild(
    page
  );


  requestAnimationFrame(
    () => {

      page.classList.add(
        "active"
      );

    }
  );


  page
    .querySelector(
      ".novera-back-button"
    )
    .addEventListener(
      "click",
      goBack
    );


  const bookmarkButton =
    page.querySelector(
      ".novera-bookmark-button"
    );


  bookmarkButton.addEventListener(
    "click",
    () => {

      const id =
        bookmarkButton.dataset.bookmark;


      const index =
        NoveraState.bookmarks.indexOf(
          id
        );


      if (index === -1) {

        NoveraState.bookmarks.push(
          id
        );

        bookmarkButton.textContent =
          "★ Saved";

        showNoveraMessage(
          "Saved to Novera."
        );

      } else {

        NoveraState.bookmarks.splice(
          index,
          1
        );

        bookmarkButton.textContent =
          "☆ Save concept";

        showNoveraMessage(
          "Removed from saved."
        );

      }


      saveBookmarks();

    }
  );


  page
    .querySelectorAll(
      "[data-tool]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            showNoveraMessage(
              "This tool will open when the Novera toolkit is connected."
            );

          }
        );

      }
    );

}


/* =========================================================
   RESOURCE RENDERER
   ========================================================= */

function renderResources(
  resources
) {

  if (
    !resources ||
    typeof resources !== "object"
  ) {

    return "";

  }


  const order = [

    {
      key: "best",
      icon: "🏆",
      title: "Best overall"
    },

    {
      key: "conceptual",
      icon: "🧠",
      title: "Conceptual"
    },

    {
      key: "exam",
      icon: "🎯",
      title: "Exam focused"
    },

    {
      key: "revision",
      icon: "⚡",
      title: "Quick revision"
    },

    {
      key: "official",
      icon: "📖",
      title: "Official resource"
    },

    {
      key: "practice",
      icon: "✎",
      title: "Practice"
    },

    {
      key: "paper",
      icon: "📝",
      title: "Question paper"
    }

  ];


  return order

    .map(
      category => {

        const list =
          resources[
            category.key
          ];


        if (
          !Array.isArray(list) ||
          !list.length
        ) {

          return "";

        }


        return list

          .map(
            resource => {

              const url =
                resource.url || "#";


              return `

                <article
                  class="novera-resource-item"
                >

                  <div
                    class="resource-item-top"
                  >

                    <span
                      class="resource-item-icon"
                    >
                      ${category.icon}
                    </span>

                    <span
                      class="resource-item-tag"
                    >
                      ${escapeHTML(
                        category.title
                      )}
                    </span>

                  </div>

                  <h2>
                    ${escapeHTML(
                      resource.title ||
                      category.title
                    )}
                  </h2>

                  <p>
                    ${escapeHTML(
                      resource.description ||
                      (
                        resource.provider
                          ? resource.provider
                          : "Selected learning resource."
                      )
                    )}
                  </p>

                  ${
                    url !== "#"
                      ? `

                        <a
                          class="novera-resource-button"
                          href="${escapeHTML(url)}"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open resource →
                        </a>

                      `
                      : ""
                  }

                </article>

              `;

            }
          )

          .join("");

      }
    )

    .join("");

}


/* =========================================================
   HOMEPAGE CURRICULUM
   ========================================================= */

function initCurriculumCards() {

  document

    .querySelectorAll(
      ".curriculum-card"
    )

    .forEach(
      card => {

        card.addEventListener(
          "click",
          () => {

            const curriculum =
              card.dataset.curriculum;


            NoveraState.history =
              [];


            openCurriculum(
              curriculum,
              false
            );

          }
        );

      }
    );

}


/* =========================================================
   HOMEPAGE SUBJECTS
   ========================================================= */

function initSubjectItems() {

  document

    .querySelectorAll(
      ".subject-item"
    )

    .forEach(
      item => {

        item.addEventListener(
          "click",
          () => {

            const text =
              item.querySelector(
                "strong"
              )?.textContent;


            if (!text) return;


            showNoveraMessage(
              `${text} will open through the NCERT learning path.`
            );

          }
        );

      }
    );

}


/* =========================================================
   THEME
   ========================================================= */

function initTheme() {

  const toggle =
    document.querySelector(
      "#themeToggle"
    );


  if (!toggle) return;


  const savedTheme =
    localStorage.getItem(
      "noveraTheme"
    );


  if (
    savedTheme === "light"
  ) {

    document.body.classList.add(
      "light-mode"
    );

  }


  toggle.addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "light-mode"
      );


      const isLight =
        document.body.classList.contains(
          "light-mode"
        );


      localStorage.setItem(

        "noveraTheme",

        isLight
          ? "light"
          : "dark"

      );

    }
  );

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initMobileMenu() {

  const button =
    document.querySelector(
      "#menuButton"
    );


  const menu =
    document.querySelector(
      "#mobileMenu"
    );


  if (
    !button ||
    !menu
  ) return;


  button.addEventListener(
    "click",
    () => {

      menu.classList.toggle(
        "active"
      );

    }
  );


  menu
    .querySelectorAll("a")
    .forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

            menu.classList.remove(
              "active"
            );

          }
        );

      }
    );

}


/* =========================================================
   REVEAL
   ========================================================= */

function initReveal() {

  const elements =
    document.querySelectorAll(
      ".reveal"
    );


  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    elements.forEach(
      element =>
        element.classList.add(
          "visible"
        )
    );

    return;

  }


  const observer =
    new IntersectionObserver(

      entries => {

        entries.forEach(
          entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "visible"
              );

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },

      {
        threshold: 0.12
      }

    );


  elements.forEach(
    element =>
      observer.observe(
        element
      )
  );

}


/* =========================================================
   SMOOTH LINKS
   ========================================================= */

function initSmoothLinks() {

  document

    .querySelectorAll(
      'a[href^="#"]'
    )

    .forEach(
      link => {

        link.addEventListener(
          "click",
          event => {

            const id =
              link.getAttribute(
                "href"
              );


            if (
              !id ||
              id === "#"
            ) return;


            const target =
              document.querySelector(
                id
              );


            if (!target) return;


            event.preventDefault();


            target.scrollIntoView({

              behavior:
                "smooth"

            });

          }
        );

      }
    );

}


/* =========================================================
   BUTTON EFFECTS
   ========================================================= */

function initButtonEffects() {

  document

    .querySelectorAll(
      "button, .primary-button, .secondary-button, .contact-button"
    )

    .forEach(
      button => {

        button.addEventListener(
          "pointerdown",
          () => {

            button.style.transform =
              "scale(.97)";

          }
        );


        button.addEventListener(
          "pointerup",
          () => {

            button.style.transform =
              "";

          }
        );


        button.addEventListener(
          "pointerleave",
          () => {

            button.style.transform =
              "";

          }
        );

      }
    );

}


/* =========================================================
   HEADER SCROLL
   ========================================================= */

function initHeaderScroll() {

  const header =
    document.querySelector(
      ".site-header"
    );


  if (!header) return;


  window.addEventListener(

    "scroll",

    () => {

      if (
        window.scrollY > 20
      ) {

        header.classList.add(
          "scrolled"
        );

      } else {

        header.classList.remove(
          "scrolled"
        );

      }

    },

    {
      passive: true
    }

  );

}


/* =========================================================
   INITIALISE
   ========================================================= */

document.addEventListener(

  "DOMContentLoaded",

  () => {

    initTheme();

    initMobileMenu();

    initReveal();

    initSmoothLinks();

    initButtonEffects();

    initHeaderScroll();

    initCurriculumCards();

    initSubjectItems();

    document.body.classList.add(
      "page-loaded"
    );

  }

);
