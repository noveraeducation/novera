"use strict";

/* =========================================================
   NOVERA — MAIN APPLICATION
   Current live curriculum:
   NCERT Class 10 only
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

const NoveraState = {

  curriculum: null,

  classLevel: null,

  subject: null,

  chapter: null,

  concept: null,

  bookmarks: loadBookmarks(),

  history: loadHistory()

};


/* =========================================================
   DATABASE
========================================================= */

function getClass10Database() {

  if (
    typeof window !== "undefined" &&
    window.NCERT_CLASS_10
  ) {
    return window.NCERT_CLASS_10;
  }

  return null;
}


/* =========================================================
   SMALL UTILITIES
========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function safeArray(value) {

  return Array.isArray(value) ? value : [];

}


function slug(value) {

  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

}


function titleCase(value) {

  return String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());

}


function firstExisting(object, keys, fallback = "") {

  if (!object || typeof object !== "object") {
    return fallback;
  }

  for (const key of keys) {

    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }

  }

  return fallback;
}


function normalizeSubjectName(subjectKey, subjectData) {

  return firstExisting(
    subjectData,
    ["title", "name", "label", "subjectName"],
    titleCase(subjectKey)
  );

}


function normalizeChapterName(chapter, index) {

  if (typeof chapter === "string") {
    return chapter;
  }

  return firstExisting(
    chapter,
    ["title", "name", "label", "chapterName"],
    `Chapter ${index + 1}`
  );

}


function normalizeConceptName(concept, index) {

  if (typeof concept === "string") {
    return concept;
  }

  return firstExisting(
    concept,
    ["title", "name", "label", "conceptName"],
    `Concept ${index + 1}`
  );

}


/* =========================================================
   DATABASE NORMALIZATION

   The Class 10 database can use:

   subject
     chapters
       sections
         concepts

   or:

   subject
     chapters
       concepts

   This function makes both structures usable.
========================================================= */

function normalizeSubject(subjectKey, rawSubject) {

  const subject = {
    key: subjectKey,
    name: normalizeSubjectName(subjectKey, rawSubject),
    description: firstExisting(
      rawSubject,
      ["description", "subtitle", "intro"],
      ""
    ),
    chapters: []
  };


  let rawChapters = [];


  if (Array.isArray(rawSubject)) {

    rawChapters = rawSubject;

  } else if (rawSubject && Array.isArray(rawSubject.chapters)) {

    rawChapters = rawSubject.chapters;

  } else if (rawSubject && Array.isArray(rawSubject.units)) {

    rawChapters = rawSubject.units;

  }


  rawChapters.forEach((rawChapter, chapterIndex) => {

    const chapter = {

      index: chapterIndex,

      title: normalizeChapterName(
        rawChapter,
        chapterIndex
      ),

      description:
        typeof rawChapter === "object"
          ? firstExisting(
              rawChapter,
              ["description", "subtitle", "intro"],
              ""
            )
          : "",

      concepts: []

    };


    /*
      Direct concepts
    */

    if (
      rawChapter &&
      typeof rawChapter === "object" &&
      Array.isArray(rawChapter.concepts)
    ) {

      rawChapter.concepts.forEach(
        (rawConcept, conceptIndex) => {

          chapter.concepts.push(
            normalizeConcept(
              rawConcept,
              conceptIndex
            )
          );

        }
      );

    }


    /*
      Section-based concepts
    */

    if (
      rawChapter &&
      typeof rawChapter === "object" &&
      Array.isArray(rawChapter.sections)
    ) {

      rawChapter.sections.forEach(
        (section, sectionIndex) => {

          const sectionConcepts =
            safeArray(
              section && section.concepts
            );


          sectionConcepts.forEach(
            (rawConcept, conceptIndex) => {

              const normalized =
                normalizeConcept(
                  rawConcept,
                  chapter.concepts.length
                );


              normalized.section =
                firstExisting(
                  section,
                  ["title", "name", "label"],
                  `Section ${sectionIndex + 1}`
                );


              chapter.concepts.push(
                normalized
              );

            }
          );

        }
      );

    }


    /*
      If the chapter itself is a concept
      collection in another supported shape.
    */

    if (
      chapter.concepts.length === 0 &&
      rawChapter &&
      typeof rawChapter === "object" &&
      Array.isArray(rawChapter.items)
    ) {

      rawChapter.items.forEach(
        (item, itemIndex) => {

          chapter.concepts.push(
            normalizeConcept(
              item,
              itemIndex
            )
          );

        }
      );

    }


    subject.chapters.push(chapter);

  });


  return subject;

}


function normalizeConcept(rawConcept, index) {

  if (typeof rawConcept === "string") {

    return {

      index,

      title: rawConcept,

      description: "",

      resources: [],

      practice: [],

      revision: [],

      videos: [],

      official: []

    };

  }


  const concept =
    rawConcept && typeof rawConcept === "object"
      ? rawConcept
      : {};


  return {

    index,

    title: normalizeConceptName(
      concept,
      index
    ),

    description: firstExisting(
      concept,
      [
        "description",
        "summary",
        "intro",
        "overview"
      ],
      ""
    ),

    resources: safeArray(
      firstExisting(
        concept,
        ["resources", "links", "materials"],
        []
      )
    ),

    practice: safeArray(
      firstExisting(
        concept,
        ["practice", "questions", "practiceResources"],
        []
      )
    ),

    revision: safeArray(
      firstExisting(
        concept,
        ["revision", "revisionResources"],
        []
      )
    ),

    videos: safeArray(
      firstExisting(
        concept,
        ["videos", "videoResources", "teachingVideos"],
        []
      )
    ),

    official: safeArray(
      firstExisting(
        concept,
        ["official", "officialResources", "pdfs"],
        []
      )
    )

  };

}


function getNormalizedClass10Subjects() {

  const database = getClass10Database();

  if (!database) {
    return {};
  }


  const subjects = {};


  Object.keys(database).forEach(subjectKey => {

    /*
      Ignore accidental metadata keys.
    */

    if (
      [
        "class",
        "classLevel",
        "grade",
        "title",
        "name",
        "description",
        "metadata"
      ].includes(subjectKey)
    ) {
      return;
    }


    const rawSubject =
      database[subjectKey];


    if (
      rawSubject &&
      typeof rawSubject === "object"
    ) {

      subjects[subjectKey] =
        normalizeSubject(
          subjectKey,
          rawSubject
        );

    }

  });


  return subjects;

}


/* =========================================================
   BOOKMARKS
========================================================= */

function loadBookmarks() {

  try {

    const saved =
      localStorage.getItem(
        "novera-bookmarks"
      );

    return saved
      ? JSON.parse(saved)
      : [];

  } catch (error) {

    return [];

  }

}


function saveBookmarks() {

  try {

    localStorage.setItem(
      "novera-bookmarks",
      JSON.stringify(
        NoveraState.bookmarks
      )
    );

  } catch (error) {

    console.warn(
      "Novera bookmarks could not be saved."
    );

  }

}


function bookmarkId(
  subject,
  chapter,
  concept
) {

  return [
    slug(subject),
    slug(chapter),
    slug(concept)
  ].join("::");

}


function isBookmarked(
  subject,
  chapter,
  concept
) {

  const id =
    bookmarkId(
      subject,
      chapter,
      concept
    );

  return NoveraState.bookmarks.some(
    item => item.id === id
  );

}


function toggleBookmark(
  subject,
  chapter,
  concept
) {

  const id =
    bookmarkId(
      subject,
      chapter,
      concept
    );


  const existingIndex =
    NoveraState.bookmarks.findIndex(
      item => item.id === id
    );


  if (existingIndex >= 0) {

    NoveraState.bookmarks.splice(
      existingIndex,
      1
    );

    showToast(
      "Removed from bookmarks."
    );

  } else {

    NoveraState.bookmarks.push({

      id,

      subject,

      chapter,

      concept,

      savedAt:
        Date.now()

    });

    showToast(
      "Saved to bookmarks."
    );

  }


  saveBookmarks();

}


/* =========================================================
   HISTORY
========================================================= */

function loadHistory() {

  try {

    const saved =
      localStorage.getItem(
        "novera-history"
      );

    return saved
      ? JSON.parse(saved)
      : [];

  } catch (error) {

    return [];

  }

}


function saveHistory() {

  try {

    localStorage.setItem(
      "novera-history",
      JSON.stringify(
        NoveraState.history
      )
    );

  } catch (error) {

    console.warn(
      "Novera history could not be saved."
    );

  }

}


function addHistory(
  subject,
  chapter,
  concept
) {

  const item = {

    subject,

    chapter,

    concept,

    time: Date.now()

  };


  NoveraState.history =
    NoveraState.history.filter(
      entry =>
        !(
          entry.subject === subject &&
          entry.chapter === chapter &&
          entry.concept === concept
        )
    );


  NoveraState.history.unshift(
    item
  );


  NoveraState.history =
    NoveraState.history.slice(
      0,
      30
    );


  saveHistory();

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

  let toast =
    document.getElementById(
      "noveraToast"
    );


  if (!toast) {

    toast =
      document.createElement(
        "div"
      );

    toast.id =
      "noveraToast";

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
      "rgba(15,15,15,.94)";

    toast.style.color =
      "#fff";

    toast.style.fontSize =
      "14px";

    toast.style.zIndex =
      "99999";

    toast.style.opacity =
      "0";

    toast.style.pointerEvents =
      "none";

    toast.style.transition =
      "opacity .25s ease, transform .25s ease";

    document.body.appendChild(
      toast
    );

  }


  toast.textContent =
    message;


  requestAnimationFrame(() => {

    toast.style.opacity =
      "1";

    toast.style.transform =
      "translateX(-50%) translateY(0)";

  });


  clearTimeout(
    toast._timer
  );


  toast._timer =
    setTimeout(() => {

      toast.style.opacity =
        "0";

      toast.style.transform =
        "translateX(-50%) translateY(20px)";

    }, 2200);

}


/* =========================================================
   PAGE MANAGEMENT
========================================================= */

function getHomepage() {

  return document.getElementById(
    "homepage"
  );

}


function getDynamicPage() {

  return document.querySelector(
    ".novera-dynamic-page"
  );

}


function hideHomepage() {

  const homepage =
    getHomepage();

  if (homepage) {

    homepage.style.display =
      "none";

  }

}


function showHomepage() {

  const homepage =
    getHomepage();

  const dynamic =
    getDynamicPage();


  if (dynamic) {

    dynamic.remove();

  }


  if (homepage) {

    homepage.style.display =
      "";

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function createDynamicPage() {

  const existing =
    getDynamicPage();


  if (existing) {

    existing.remove();

  }


  const page =
    document.createElement(
      "main"
    );


  page.className =
    "novera-dynamic-page novera-v2-page";


  document.body.appendChild(
    page
  );


  return page;

}


function createBackButton() {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";

  button.className =
    "novera-back-button";

  button.innerHTML =
    "← Back";

  button.addEventListener(
    "click",
    goBack
  );


  return button;

}


function goBack() {

  const dynamic =
    getDynamicPage();


  if (!dynamic) {

    return;

  }


  if (
    NoveraState.concept
  ) {

    NoveraState.concept =
      null;

    renderChapterPage();

    return;

  }


  if (
    NoveraState.chapter
  ) {

    NoveraState.chapter =
      null;

    renderSubjectPage();

    return;

  }


  if (
    NoveraState.subject
  ) {

    NoveraState.subject =
      null;

    renderClassPage();

    return;

  }


  if (
    NoveraState.classLevel
  ) {

    NoveraState.classLevel =
      null;

    renderCurriculumPage();

    return;

  }


  NoveraState.curriculum =
    null;

  showHomepage();

}


/* =========================================================
   CURRICULUM
========================================================= */

function openCurriculum(
  curriculum
) {

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

    openNCERT();

    return;

  }


  /*
    WBBSE and WBCHSE are not
    falsely presented as available.
  */

  renderUnavailableCurriculum(
    curriculum
  );

}


function renderUnavailableCurriculum(
  curriculum
) {

  const page =
    createDynamicPage();


  page.appendChild(
    createBackButton()
  );


  const title =
    curriculum === "wbbse"
      ? "West Bengal Board"
      : "West Bengal Higher Secondary";


  const code =
    curriculum === "wbbse"
      ? "WBBSE"
      : "WBCHSE";


  page.innerHTML += `

    <div class="novera-v2-inner">

      <div class="novera-v2-eyebrow">
        ${escapeHTML(code)}
      </div>

      <h1 class="novera-v2-title">
        ${escapeHTML(title)}
      </h1>

      <p class="novera-v2-description">
        Novera is currently focused on its
        NCERT Class 10 learning path.
        This curriculum will be added only
        when its resources are properly built
        and verified.
      </p>

      <div class="novera-v2-grid">

        <div class="novera-v2-card">

          <div class="novera-v2-number">
            01
          </div>

          <div class="card-content">

            <h3>
              Currently unavailable
            </h3>

            <p>
              No empty or placeholder learning
              content is shown here.
            </p>

          </div>

        </div>

      </div>

    </div>

  `;


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   NCERT
========================================================= */

function openNCERT() {

  const database =
    getClass10Database();


  if (!database) {

    showToast(
      "NCERT Class 10 data could not be loaded."
    );

    return;

  }


  NoveraState.classLevel =
    "10";


  renderClassPage();

}


function renderCurriculumPage() {

  const page =
    createDynamicPage();


  page.appendChild(
    createBackButton()
  );


  page.innerHTML += `

    <div class="novera-v2-inner">

      <div class="novera-v2-eyebrow">
        NCERT
      </div>

      <h1 class="novera-v2-title">
        Choose your class.
      </h1>

      <p class="novera-v2-description">
        Select the class you want to explore.
      </p>

      <div class="novera-v2-grid">

        <button
          type="button"
          class="novera-v2-card novera-class-card"
          data-class="10"
        >

          <div class="novera-v2-number">
            01
          </div>

          <div class="card-content">

            <h3>
              Class 10
            </h3>

            <p>
              NCERT learning resources
            </p>

          </div>

          <div class="novera-v2-arrow">
            ↗
          </div>

        </button>

      </div>

    </div>

  `;


  const classButton =
    page.querySelector(
      ".novera-class-card"
    );


  if (classButton) {

    classButton.addEventListener(
      "click",
      () => {

        NoveraState.classLevel =
          "10";

        renderClassPage();

      }
    );

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   CLASS PAGE
========================================================= */

function renderClassPage() {

  const page =
    createDynamicPage();


  page.appendChild(
    createBackButton()
  );


  const subjects =
    getNormalizedClass10Subjects();


  const subjectKeys =
    Object.keys(subjects);


  let cards = "";


  subjectKeys.forEach(
    (subjectKey, index) => {

      const subject =
        subjects[subjectKey];


      cards += `

        <button
          type="button"
          class="novera-v2-card novera-subject-card"
          data-subject="${escapeHTML(subjectKey)}"
        >

          <div class="novera-v2-number">
            ${String(index + 1).padStart(2, "0")}
          </div>

          <div class="card-content">

            <h3>
              ${escapeHTML(subject.name)}
            </h3>

            <p>
              ${subject.chapters.length}
              ${
                subject.chapters.length === 1
                  ? "chapter"
                  : "chapters"
              }
            </p>

          </div>

          <div class="novera-v2-arrow">
            ↗
          </div>

        </button>

      `;

    }
  );


  page.innerHTML += `

    <div class="novera-v2-inner">

      <div class="novera-v2-eyebrow">
        NCERT · CLASS 10
      </div>

      <h1 class="novera-v2-title">
        Choose a subject.
      </h1>

      <p class="novera-v2-description">
        Start with a subject, then move
        chapter by chapter until you reach
        the exact concept you need.
      </p>

      <div class="novera-v2-grid">

        ${
          cards ||
          `
            <div class="novera-v2-card">

              <div class="card-content">

                <h3>
                  No subjects found
                </h3>

                <p>
                  The Class 10 database is empty
                  or could not be read.
                </p>

              </div>

            </div>
          `
        }

      </div>

    </div>

  `;


  page
    .querySelectorAll(
      ".novera-subject-card"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const key =
            button.dataset.subject;


          NoveraState.subject =
            key;

          NoveraState.chapter =
            null;

          NoveraState.concept =
            null;


          renderSubjectPage();

        }
      );

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   SUBJECT PAGE
========================================================= */

function renderSubjectPage() {

  const page =
    createDynamicPage();


  page.appendChild(
    createBackButton()
  );


  const subjects =
    getNormalizedClass10Subjects();


  const subject =
    subjects[
      NoveraState.subject
    ];


  if (!subject) {

    page.innerHTML += `

      <div class="novera-v2-inner">

        <h1 class="novera-v2-title">
          Subject not found.
        </h1>

        <p class="novera-v2-description">
          This subject does not exist in the
          current Class 10 database.
        </p>

      </div>

    `;

    return;

  }


  let cards = "";


  subject.chapters.forEach(
    (chapter, index) => {

      cards += `

        <button
          type="button"
          class="novera-v2-card novera-chapter-card"
          data-chapter="${index}"
        >

          <div class="novera-v2-number">
            ${String(index + 1).padStart(2, "0")}
          </div>

          <div class="card-content">

            <h3>
              ${escapeHTML(chapter.title)}
            </h3>

            <p>
              ${chapter.concepts.length}
              ${
                chapter.concepts.length === 1
                  ? "concept"
                  : "concepts"
              }
            </p>

          </div>

          <div class="novera-v2-arrow">
            ↗
          </div>

        </button>

      `;

    }
  );


  page.innerHTML += `

    <div class="novera-v2-inner">

      <div class="novera-v2-eyebrow">
        NCERT · CLASS 10 ·
        ${escapeHTML(subject.name)}
      </div>

      <h1 class="novera-v2-title">
        Choose a chapter.
      </h1>

      <p class="novera-v2-description">
        Every chapter leads to its individual
        concepts and learning resources.
      </p>

      <div class="novera-v2-grid">

        ${
          cards ||
          `
            <div class="novera-v2-card">

              <div class="card-content">

                <h3>
                  No chapters found
                </h3>

                <p>
                  This subject has no chapter
                  data yet.
                </p>

              </div>

            </div>
          `
        }

      </div>

    </div>

  `;


  page
    .querySelectorAll(
      ".novera-chapter-card"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          NoveraState.chapter =
            Number(
              button.dataset.chapter
            );

          NoveraState.concept =
            null;


          renderChapterPage();

        }
      );

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   CHAPTER PAGE
========================================================= */

function renderChapterPage() {

  const page =
    createDynamicPage();


  page.appendChild(
    createBackButton()
  );


  const subjects =
    getNormalizedClass10Subjects();


  const subject =
    subjects[
      NoveraState.subject
    ];


  const chapter =
    subject &&
    subject.chapters[
      NoveraState.chapter
    ];


  if (!subject || !chapter) {

    page.innerHTML += `

      <div class="novera-v2-inner">

        <h1 class="novera-v2-title">
          Chapter not found.
        </h1>

      </div>

    `;

    return;

  }


  let cards = "";


  chapter.concepts.forEach(
    (concept, index) => {

      cards += `

        <button
          type="button"
          class="novera-v2-card novera-concept-card"
          data-concept="${index}"
        >

          <div class="novera-v2-number">
            ${String(index + 1).padStart(2, "0")}
          </div>

          <div class="card-content">

            ${
              concept.section
                ? `
                  <small>
                    ${escapeHTML(concept.section)}
                  </small>
                `
                : ""
            }

            <h3>
              ${escapeHTML(concept.title)}
            </h3>

            <p>
              Explore learning resources
            </p>

          </div>

          <div class="novera-v2-arrow">
            ↗
          </div>

        </button>

      `;

    }
  );


  page.innerHTML += `

    <div class="novera-v2-inner">

      <div class="novera-v2-eyebrow">
        ${escapeHTML(subject.name)}
      </div>

      <h1 class="novera-v2-title">
        ${escapeHTML(chapter.title)}
      </h1>

      <p class="novera-v2-description">
        Choose a concept to find the resources
        that help you learn it.
      </p>

      <div class="novera-v2-grid">

        ${
          cards ||
          `
            <div class="novera-v2-card">

              <div class="card-content">

                <h3>
                  No concepts found
                </h3>

                <p>
                  This chapter currently has
                  no concept data.
                </p>

              </div>

            </div>
          `
        }

      </div>

    </div>

  `;


  page
    .querySelectorAll(
      ".novera-concept-card"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          NoveraState.concept =
            Number(
              button.dataset.concept
            );


          const concept =
            chapter.concepts[
              NoveraState.concept
            ];


          addHistory(
            subject.name,
            chapter.title,
            concept.title
          );


          renderConceptPage();

        }
      );

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   CONCEPT PAGE
========================================================= */

function renderConceptPage() {

  const page =
    createDynamicPage();


  page.appendChild(
    createBackButton()
  );


  const subjects =
    getNormalizedClass10Subjects();


  const subject =
    subjects[
      NoveraState.subject
    ];


  const chapter =
    subject &&
    subject.chapters[
      NoveraState.chapter
    ];


  const concept =
    chapter &&
    chapter.concepts[
      NoveraState.concept
    ];


  if (
    !subject ||
    !chapter ||
    !concept
  ) {

    page.innerHTML += `

      <div class="novera-v2-inner">

        <h1 class="novera-v2-title">
          Concept not found.
        </h1>

      </div>

    `;

    return;

  }


  const bookmarked =
    isBookmarked(
      subject.name,
      chapter.title,
      concept.title
    );


  const allResources =
    collectResources(
      concept
    );


  page.innerHTML += `

    <div class="novera-v2-inner novera-concept-page">

      <div class="novera-concept-intro">

        <div class="novera-v2-eyebrow">
          ${escapeHTML(subject.name)}
          ·
          ${escapeHTML(chapter.title)}
        </div>

        <h1 class="novera-v2-title">
          ${escapeHTML(concept.title)}
        </h1>

        ${
          concept.description
            ? `
              <p class="novera-v2-description">
                ${escapeHTML(
                  concept.description
                )}
              </p>
            `
            : `
              <p class="novera-v2-description">
                Learn the concept through
                carefully selected free resources.
              </p>
            `
        }

        <button
          type="button"
          class="novera-bookmark-button"
          id="conceptBookmark"
        >
          ${
            bookmarked
              ? "★ Saved"
              : "☆ Save this concept"
          }
        </button>

      </div>


      <div class="novera-resource-grid">

        ${
          allResources.length
            ? allResources
                .map(
                  resource =>
                    renderResource(
                      resource
                    )
                )
                .join("")
            : `
              <div class="novera-resource-item">

                <div class="resource-item-top">

                  <span class="resource-item-icon">
                    ○
                  </span>

                  <span class="resource-item-tag">
                    RESOURCE
                  </span>

                </div>

                <h3>
                  Resources are being curated
                </h3>

                <p>
                  This concept is present in the
                  curriculum database, but resources
                  have not been added yet.
                </p>

              </div>
            `
        }

      </div>

    </div>

  `;


  const bookmarkButton =
    page.querySelector(
      "#conceptBookmark"
    );


  if (bookmarkButton) {

    bookmarkButton.addEventListener(
      "click",
      () => {

        toggleBookmark(
          subject.name,
          chapter.title,
          concept.title
        );


        renderConceptPage();

      }
    );

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   RESOURCE COLLECTION
========================================================= */

function collectResources(
  concept
) {

  const result = [];


  function addMany(
    items,
    type,
    icon,
    label
  ) {

    safeArray(items).forEach(
      item => {

        if (
          typeof item === "string"
        ) {

          result.push({

            title: item,

            url: item,

            type,

            icon,

            label

          });

          return;

        }


        if (
          !item ||
          typeof item !== "object"
        ) {

          return;

        }


        const url =
          firstExisting(
            item,
            [
              "url",
              "link",
              "href"
            ],
            ""
          );


        if (!url) {

          return;

        }


        result.push({

          title:
            firstExisting(
              item,
              [
                "title",
                "name",
                "label"
              ],
              "Open resource"
            ),

          description:
            firstExisting(
              item,
              [
                "description",
                "summary"
              ],
              ""
            ),

          url,

          type,

          icon,

          label

        });

      }
    );

  }


  addMany(
    concept.official,
    "official",
    "▣",
    "OFFICIAL"
  );


  addMany(
    concept.videos,
    "video",
    "▶",
    "TEACHING"
  );


  addMany(
    concept.resources,
    "resource",
    "↗",
    "RESOURCE"
  );


  addMany(
    concept.practice,
    "practice",
    "✓",
    "PRACTICE"
  );


  addMany(
    concept.revision,
    "revision",
    "↻",
    "REVISION"
  );


  return result;

}


/* =========================================================
   RESOURCE RENDERER
========================================================= */

function renderResource(
  resource
) {

  return `

    <div class="novera-resource-item">

      <div class="resource-item-top">

        <span class="resource-item-icon">
          ${escapeHTML(resource.icon)}
        </span>

        <span class="resource-item-tag">
          ${escapeHTML(resource.label)}
        </span>

      </div>

      <h3>
        ${escapeHTML(resource.title)}
      </h3>

      ${
        resource.description
          ? `
            <p>
              ${escapeHTML(
                resource.description
              )}
            </p>
          `
          : ""
      }

      <button
        type="button"
        class="novera-resource-button"
        data-url="${escapeHTML(resource.url)}"
      >
        Open resource
        <span>↗</span>
      </button>

    </div>

  `;

}


/* =========================================================
   RESOURCE BUTTONS
========================================================= */

function openResource(
  url
) {

  if (!url) {

    return;

  }


  try {

    const parsed =
      new URL(
        url,
        window.location.href
      );


    /*
      Only http/https resources.
    */

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {

      showToast(
        "This resource link is not supported."
      );

      return;

    }


    window.open(
      parsed.href,
      "_blank",
      "noopener,noreferrer"
    );

  } catch (error) {

    showToast(
      "This resource link is invalid."
    );

  }

}


/* =========================================================
   HOMEPAGE CURRICULUM CARDS
========================================================= */

function initCurriculumCards() {

  document
    .querySelectorAll(
      ".curriculum-card"
    )
    .forEach(card => {

      card.addEventListener(
        "click",
        event => {

          event.preventDefault();


          const curriculum =
            card.dataset.curriculum;


          if (!curriculum) {

            return;

          }


          openCurriculum(
            curriculum
          );

        }
      );

    });

}


/* =========================================================
   HOMEPAGE SUBJECT CARDS
========================================================= */

function initHomepageSubjects() {

  document
    .querySelectorAll(
      ".subject-item"
    )
    .forEach(item => {

      item.addEventListener(
        "click",
        event => {

          event.preventDefault();


          const requested =
            item.dataset.subject;


          const subjects =
            getNormalizedClass10Subjects();


          /*
            Try exact key first.
          */

          let matchingKey =
            Object.keys(
              subjects
            ).find(
              key =>
                slug(key) ===
                slug(requested)
            );


          /*
            Then try subject title.
          */

          if (!matchingKey) {

            matchingKey =
              Object.keys(
                subjects
              ).find(
                key =>
                  slug(
                    subjects[key].name
                  ) ===
                  slug(requested)
              );

          }


          /*
            If found, open it.
          */

          if (matchingKey) {

            NoveraState.curriculum =
              "ncert";

            NoveraState.classLevel =
              "10";

            NoveraState.subject =
              matchingKey;

            NoveraState.chapter =
              null;

            NoveraState.concept =
              null;


            renderSubjectPage();

            return;

          }


          /*
            The homepage subject list is
            intentionally broader than the
            current database. Do not fake
            an unavailable subject.
          */

          showToast(
            "This subject is not available yet."
          );

        }
      );

    });

}


/* =========================================================
   RESOURCE BUTTON INITIALIZATION
========================================================= */

function initResourceButtons() {

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          ".novera-resource-button"
        );


      if (!button) {

        return;

      }


      const url =
        button.dataset.url;


      openResource(
        url
      );

    }
  );

}


/* =========================================================
   THEME
========================================================= */

function initTheme() {

  const button =
    document.getElementById(
      "themeToggle"
    );


  if (!button) {

    return;

  }


  let savedTheme =
    null;


  try {

    savedTheme =
      localStorage.getItem(
        "novera-theme"
      );

  } catch (error) {

    savedTheme =
      null;

  }


  if (savedTheme === "light") {

    document.body.classList.add(
      "light-theme"
    );

  }


  button.addEventListener(
    "click",
    () => {

      const isLight =
        document.body.classList.toggle(
          "light-theme"
        );


      try {

        localStorage.setItem(
          "novera-theme",
          isLight
            ? "light"
            : "dark"
        );

      } catch (error) {}

    }
  );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function initMobileMenu() {

  const button =
    document.getElementById(
      "menuToggle"
    );


  const menu =
    document.getElementById(
      "mobileNav"
    );


  if (
    !button ||
    !menu
  ) {

    return;

  }


  button.addEventListener(
    "click",
    () => {

      menu.classList.toggle(
        "open"
      );

    }
  );


  menu
    .querySelectorAll("a")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          menu.classList.remove(
            "open"
          );

        }
      );

    });

}


/* =========================================================
   HOMEPAGE BRAND
========================================================= */

function initBrand() {

  const brand =
    document.querySelector(
      ".brand"
    );


  if (!brand) {

    return;

  }


  brand.addEventListener(
    "click",
    event => {

      event.preventDefault();

      showHomepage();

    }
  );

}


/* =========================================================
   ANIMATED REVEALS
========================================================= */

function initRevealAnimations() {

  const elements =
    document.querySelectorAll(
      ".hero, .curriculum-section, .subjects-section, .resources-section, .tools-section, .about-section, .contact-section, .resource-feature, .curriculum-card, .subject-item"
    );


  if (
    !("IntersectionObserver" in window)
  ) {

    return;

  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (
            entry.isIntersecting
          ) {

            entry.target.classList.add(
              "revealed"
            );

            observer.unobserve(
              entry.target
            );

          }

        });

      },
      {
        threshold: 0.08
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
   SMOOTH ANCHOR LINKS
========================================================= */

function initSmoothLinks() {

  document.addEventListener(
    "click",
    event => {

      const link =
        event.target.closest(
          "a[href^='#']"
        );


      if (!link) {

        return;

      }


      const href =
        link.getAttribute(
          "href"
        );


      if (
        !href ||
        href === "#"
      ) {

        return;

      }


      const target =
        document.querySelector(
          href
        );


      if (!target) {

        return;

      }


      event.preventDefault();


      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }
  );

}


/* =========================================================
   DYNAMIC RESOURCE BUTTON SUPPORT
========================================================= */

function initGlobalDynamicEvents() {

  initResourceButtons();

}


/* =========================================================
   INITIALIZATION
========================================================= */

function initNovera() {

  initCurriculumCards();

  initHomepageSubjects();

  initTheme();

  initMobileMenu();

  initBrand();

  initRevealAnimations();

  initSmoothLinks();

  initGlobalDynamicEvents();


  /*
    Basic database check.
  */

  const database =
    getClass10Database();


  if (!database) {

    console.warn(
      "Novera: NCERT Class 10 database was not found."
    );

  } else {

    console.log(
      "Novera: NCERT Class 10 database loaded."
    );

  }

}


/* =========================================================
   START
========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initNovera
  );

} else {

  initNovera();

}
