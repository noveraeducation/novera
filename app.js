"use strict";

/* =========================================================
   NOVERA — MAIN APPLICATION CONTROLLER
   Current live curriculum:
   NCERT → Class 10

   The actual Class 10 database is supplied by:
   data/ncert/class10/index.js

   That file must load BEFORE this file.
========================================================= */

(function () {
  /* =======================================================
     CONFIGURATION
  ======================================================= */

  const CONFIG = {
    currentCurriculum: "ncert",
    currentClass: "10",
    contactEmail: "novera.education@proton.me",
    whatsapp: "917699256003"
  };

  /* =======================================================
     STATE
  ======================================================= */

  const state = {
    curriculum: null,
    classLevel: null,
    subject: null,
    chapter: null,
    concept: null,

    bookmarks: [],
    history: []
  };

  /* =======================================================
     SAFE HELPERS
  ======================================================= */

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $$(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

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

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getName(item, fallback = "Untitled") {
    if (!item) return fallback;

    return (
      item.name ||
      item.title ||
      item.label ||
      item.subjectName ||
      item.chapterName ||
      item.conceptName ||
      fallback
    );
  }

  function toast(message) {
    let el = document.querySelector(".novera-toast");

    if (!el) {
      el = document.createElement("div");
      el.className = "novera-toast";
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.classList.add("show");

    clearTimeout(el._timer);

    el._timer = setTimeout(() => {
      el.classList.remove("show");
    }, 2600);
  }

  /* =======================================================
     LOCAL STORAGE
  ======================================================= */

  const STORAGE_KEY = "novera_state_v1";

  function loadSavedState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

      if (!saved) return;

      if (Array.isArray(saved.bookmarks)) {
        state.bookmarks = saved.bookmarks;
      }

      if (Array.isArray(saved.history)) {
        state.history = saved.history.slice(-30);
      }
    } catch (error) {
      console.warn("Novera saved state could not be loaded.", error);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          bookmarks: state.bookmarks,
          history: state.history
        })
      );
    } catch (error) {
      console.warn("Novera state could not be saved.", error);
    }
  }

  /* =======================================================
     CLASS 10 DATABASE
  ======================================================= */

  function getClass10Database() {
    if (
      typeof window.NCERT_CLASS_10 === "object" &&
      window.NCERT_CLASS_10 !== null
    ) {
      return window.NCERT_CLASS_10;
    }

    return null;
  }

  /*
    Your existing Class 10 database uses:

    {
      math: {...},
      science: {...},
      english: {...},
      socialScience: {...}
    }

    This function converts it into the navigation format
    used by Novera.
  */

  function convertClass10Database() {
    const database = getClass10Database();

    if (!database) {
      console.warn(
        "NCERT_CLASS_10 was not found. Check that data/ncert/class10/index.js loads before app.js."
      );

      return {};
    }

    const subjects = {};

    Object.keys(database).forEach((subjectKey) => {
      const subject = database[subjectKey];

      if (!subject || typeof subject !== "object") {
        return;
      }

      const subjectTitle =
        subject.title ||
        subject.name ||
        subject.label ||
        formatSubjectName(subjectKey);

      let chapters = [];

      /*
        Some databases use:

        chapters: [...]

        Others may use:

        books: [
          {
            chapters: [...]
          }
        ]
      */

      if (Array.isArray(subject.chapters)) {
        chapters = subject.chapters;
      }

      if (Array.isArray(subject.books)) {
        subject.books.forEach((book) => {
          if (Array.isArray(book.chapters)) {
            chapters.push(
              ...book.chapters.map((chapter) => ({
                ...chapter,
                bookTitle:
                  chapter.bookTitle ||
                  book.title ||
                  book.name ||
                  book.label ||
                  ""
              }))
            );
          }
        });
      }

      /*
        Normalize chapters and concepts.
      */

      chapters = chapters.map((chapter, chapterIndex) => {
        const normalized = {
          ...chapter,

          id:
            chapter.id ||
            chapter.slug ||
            `chapter-${chapterIndex + 1}`,

          title:
            chapter.title ||
            chapter.name ||
            chapter.label ||
            `Chapter ${chapterIndex + 1}`,

          concepts: []
        };

        /*
          Existing Class 10 database structure:
          chapter.sections[].concepts[]
        */

        if (Array.isArray(chapter.concepts)) {
          normalized.concepts.push(...chapter.concepts);
        }

        if (Array.isArray(chapter.sections)) {
          chapter.sections.forEach((section) => {
            if (Array.isArray(section.concepts)) {
              normalized.concepts.push(
                ...section.concepts.map((concept) => ({
                  ...concept,
                  sectionTitle:
                    concept.sectionTitle ||
                    section.title ||
                    section.name ||
                    ""
                }))
              );
            }
          });
        }

        /*
          Remove duplicate concepts while preserving order.
        */

        const seen = new Set();

        normalized.concepts = normalized.concepts.filter((concept, i) => {
          const key =
            concept.id ||
            concept.slug ||
            concept.title ||
            concept.name ||
            `concept-${i}`;

          if (seen.has(key)) return false;

          seen.add(key);
          return true;
        });

        return normalized;
      });

      /*
        Some subjects may contain books but no direct chapters.
        Keep books available as metadata.
      */

      subjects[subjectKey] = {
        ...subject,
        id: subjectKey,
        title: subjectTitle,
        chapters,
        books: safeArray(subject.books)
      };
    });

    return subjects;
  }

  function formatSubjectName(key) {
    const names = {
      math: "Mathematics",
      mathematics: "Mathematics",
      science: "Science",
      english: "English",
      hindi: "Hindi",
      socialScience: "Social Science",
      social_science: "Social Science",
      socialscience: "Social Science"
    };

    return (
      names[key] ||
      String(key)
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
        .trim()
    );
  }

  /* =======================================================
     DATABASE ACCESS
  ======================================================= */

  function getSubjects() {
    return convertClass10Database();
  }

  function getSubject(subjectId) {
    const subjects = getSubjects();

    return subjects[subjectId] || null;
  }

  function getChapter(subjectId, chapterId) {
    const subject = getSubject(subjectId);

    if (!subject) return null;

    return (
      subject.chapters.find(
        (chapter) =>
          String(chapter.id) === String(chapterId) ||
          slugify(chapter.title) === slugify(chapterId)
      ) || null
    );
  }

  function getConcept(subjectId, chapterId, conceptId) {
    const chapter = getChapter(subjectId, chapterId);

    if (!chapter) return null;

    return (
      chapter.concepts.find(
        (concept) =>
          String(
            concept.id ||
              concept.slug ||
              concept.title ||
              concept.name
          ) === String(conceptId) ||
          slugify(
            concept.title ||
              concept.name ||
              concept.label
          ) === slugify(conceptId)
      ) || null
    );
  }

  /* =======================================================
     NAVIGATION HISTORY
  ======================================================= */

  function snapshot() {
    return {
      curriculum: state.curriculum,
      classLevel: state.classLevel,
      subject: state.subject,
      chapter: state.chapter,
      concept: state.concept
    };
  }

  function pushHistory() {
    state.history.push(snapshot());

    if (state.history.length > 30) {
      state.history.shift();
    }

    saveState();
  }

  function restore(snapshotData) {
    if (!snapshotData) return;

    state.curriculum = snapshotData.curriculum || null;
    state.classLevel = snapshotData.classLevel || null;
    state.subject = snapshotData.subject || null;
    state.chapter = snapshotData.chapter || null;
    state.concept = snapshotData.concept || null;
  }

  function clearRoute() {
    state.curriculum = null;
    state.classLevel = null;
    state.subject = null;
    state.chapter = null;
    state.concept = null;
  }

  function goBack() {
    const previous = state.history.pop();

    if (!previous) {
      showHomepage();
      return;
    }

    restore(previous);
    saveState();

    renderCurrentRoute();
  }

  /* =======================================================
     PAGE ROOT
  ======================================================= */

  function removeDynamicPage() {
    $$(".novera-dynamic-page").forEach((page) => page.remove());
  }

  function createPage() {
    removeDynamicPage();

    const page = document.createElement("main");

    page.className =
      "novera-v2-page novera-dynamic-page";

    document.body.appendChild(page);

    return page;
  }

  function scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /* =======================================================
     HOMEPAGE
  ======================================================= */

  function showHomepage() {
    clearRoute();
    removeDynamicPage();

    const home = document.querySelector("main:not(.novera-dynamic-page)");

    if (home) {
      home.style.display = "";
    }

    scrollTop();
  }

  function hideHomepage() {
    const home = document.querySelector("main:not(.novera-dynamic-page)");

    if (home) {
      home.style.display = "none";
    }
  }

  /* =======================================================
     NCERT
  ======================================================= */

  function openNCERT() {
    pushHistory();

    state.curriculum = "ncert";
    state.classLevel = "10";
    state.subject = null;
    state.chapter = null;
    state.concept = null;

    renderNCERTClass10();
  }

  function renderNCERTClass10() {
    hideHomepage();

    const page = createPage();

    const subjects = getSubjects();

    const subjectEntries = Object.entries(subjects);

    page.innerHTML = `
      <div class="novera-v2-inner">

        <button class="novera-back-button" data-action="back">
          ← Back
        </button>

        <div class="novera-v2-eyebrow">
          NCERT · CLASS 10
        </div>

        <h1>Choose a subject.</h1>

        <p class="novera-v2-intro">
          Follow the curriculum from subject to chapter,
          concept and carefully selected resources.
        </p>

        <div class="novera-v2-grid">
          ${
            subjectEntries.length
              ? subjectEntries
                  .map(([id, subject], index) => {
                    const chapterCount = safeArray(
                      subject.chapters
                    ).length;

                    return `
                      <button
                        class="novera-v2-card"
                        data-subject="${escapeHTML(id)}"
                        type="button"
                      >
                        <span class="novera-v2-number">
                          ${String(index + 1).padStart(2, "0")}
                        </span>

                        <span class="novera-v2-card-content">
                          <strong>
                            ${escapeHTML(
                              subject.title ||
                                formatSubjectName(id)
                            )}
                          </strong>

                          <small>
                            ${chapterCount}
                            ${
                              chapterCount === 1
                                ? "chapter"
                                : "chapters"
                            }
                          </small>
                        </span>

                        <span class="novera-v2-arrow">
                          →
                        </span>
                      </button>
                    `;
                  })
                  .join("")
              : `
                <div class="novera-empty-state">
                  <h2>Class 10 data could not be loaded.</h2>
                  <p>
                    Make sure the Class 10 database file loads
                    before app.js.
                  </p>
                </div>
              `
          }
        </div>

      </div>
    `;

    bindPageActions(page);
    scrollTop();
  }

  /* =======================================================
     SUBJECT
  ======================================================= */

  function openSubject(subjectId) {
    const subject = getSubject(subjectId);

    if (!subject) {
      toast("This subject could not be found.");
      return;
    }

    pushHistory();

    state.subject = subjectId;
    state.chapter = null;
    state.concept = null;

    renderSubjectPage(subject);
  }

  function renderSubjectPage(subject) {
    hideHomepage();

    const page = createPage();

    const chapters = safeArray(subject.chapters);

    page.innerHTML = `
      <div class="novera-v2-inner">

        <button class="novera-back-button" data-action="back">
          ← Subjects
        </button>

        <div class="novera-v2-eyebrow">
          NCERT · CLASS 10
        </div>

        <h1>
          ${escapeHTML(subject.title)}
        </h1>

        <p class="novera-v2-intro">
          Choose a chapter to explore its concepts and resources.
        </p>

        <div class="novera-v2-grid">
          ${
            chapters.length
              ? chapters
                  .map((chapter, index) => {
                    const concepts = safeArray(
                      chapter.concepts
                    );

                    return `
                      <button
                        class="novera-v2-card"
                        data-chapter="${escapeHTML(
                          chapter.id ||
                            slugify(chapter.title)
                        )}"
                        type="button"
                      >

                        <span class="novera-v2-number">
                          ${String(index + 1).padStart(2, "0")}
                        </span>

                        <span class="novera-v2-card-content">

                          <strong>
                            ${escapeHTML(chapter.title)}
                          </strong>

                          <small>
                            ${concepts.length}
                            ${
                              concepts.length === 1
                                ? "concept"
                                : "concepts"
                            }
                          </small>

                        </span>

                        <span class="novera-v2-arrow">
                          →
                        </span>

                      </button>
                    `;
                  })
                  .join("")
              : `
                <div class="novera-empty-state">
                  <h2>No chapters available.</h2>
                  <p>
                    This subject does not currently contain
                    chapter data.
                  </p>
                </div>
              `
          }
        </div>

      </div>
    `;

    bindPageActions(page);
    scrollTop();
  }

  /* =======================================================
     CHAPTER
  ======================================================= */

  function openChapter(chapterId) {
    const chapter = getChapter(
      state.subject,
      chapterId
    );

    if (!chapter) {
      toast("This chapter could not be found.");
      return;
    }

    pushHistory();

    state.chapter =
      chapter.id || slugify(chapter.title);

    state.concept = null;

    renderChapterPage(chapter);
  }

  function renderChapterPage(chapter) {
    hideHomepage();

    const page = createPage();

    const concepts = safeArray(chapter.concepts);

    page.innerHTML = `
      <div class="novera-v2-inner">

        <button class="novera-back-button" data-action="back">
          ← ${escapeHTML(
            getName(getSubject(state.subject), "Subject")
          )}
        </button>

        <div class="novera-v2-eyebrow">
          CLASS 10 · CHAPTER
        </div>

        <h1>
          ${escapeHTML(chapter.title)}
        </h1>

        <p class="novera-v2-intro">
          Pick a concept. Each concept page brings together
          learning resources and useful tools.
        </p>

        <div class="novera-v2-grid">
          ${
            concepts.length
              ? concepts
                  .map((concept, index) => {
                    const conceptId =
                      concept.id ||
                      concept.slug ||
                      slugify(
                        concept.title ||
                          concept.name ||
                          `concept-${index + 1}`
                      );

                    return `
                      <button
                        class="novera-v2-card"
                        data-concept="${escapeHTML(
                          conceptId
                        )}"
                        type="button"
                      >

                        <span class="novera-v2-number">
                          ${String(index + 1).padStart(2, "0")}
                        </span>

                        <span class="novera-v2-card-content">

                          <strong>
                            ${escapeHTML(
                              concept.title ||
                                concept.name ||
                                concept.label ||
                                `Concept ${index + 1}`
                            )}
                          </strong>

                          ${
                            concept.description
                              ? `
                                <small>
                                  ${escapeHTML(
                                    concept.description
                                  )}
                                </small>
                              `
                              : ""
                          }

                        </span>

                        <span class="novera-v2-arrow">
                          →
                        </span>

                      </button>
                    `;
                  })
                  .join("")
              : `
                <div class="novera-empty-state">
                  <h2>No concepts available.</h2>
                  <p>
                    This chapter currently has no concept entries.
                  </p>
                </div>
              `
          }
        </div>

      </div>
    `;

    bindPageActions(page);
    scrollTop();
  }

  /* =======================================================
     CONCEPT
  ======================================================= */

  function openConcept(conceptId) {
    const concept = getConcept(
      state.subject,
      state.chapter,
      conceptId
    );

    if (!concept) {
      toast("This concept could not be found.");
      return;
    }

    pushHistory();

    state.concept =
      concept.id ||
      concept.slug ||
      concept.title ||
      concept.name;

    renderConceptPage(concept);
  }

  function renderConceptPage(concept) {
    hideHomepage();

    const page = createPage();

    const conceptTitle =
      concept.title ||
      concept.name ||
      concept.label ||
      "Concept";

    const bookmarked = isBookmarked();

    const resources = collectResources(concept);

    page.innerHTML = `
      <div class="novera-concept-page">

        <div class="novera-concept-intro">

          <button
            class="novera-back-button"
            data-action="back"
          >
            ← Back
          </button>

          <div class="novera-v2-eyebrow">
            ${escapeHTML(
              getName(
                getSubject(state.subject),
                "Subject"
              )
            )}
            ·
            ${escapeHTML(
              getName(
                getChapter(
                  state.subject,
                  state.chapter
                ),
                "Chapter"
              )
            )}
          </div>

          <h1>
            ${escapeHTML(conceptTitle)}
          </h1>

          ${
            concept.description
              ? `
                <p>
                  ${escapeHTML(concept.description)}
                </p>
              `
              : ""
          }

          <button
            class="novera-bookmark-button ${
              bookmarked ? "is-bookmarked" : ""
            }"
            data-action="bookmark"
            type="button"
          >
            ${bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
          </button>

        </div>

        <div class="novera-resource-grid">

          ${
            resources.length
              ? resources
                  .map((resource) =>
                    renderResource(resource)
                  )
                  .join("")
              : `
                <div class="novera-empty-state">
                  <h2>No resources found.</h2>
                  <p>
                    This concept currently has no linked
                    resources in the database.
                  </p>
                </div>
              `
          }

        </div>

      </div>
    `;

    bindPageActions(page);
    scrollTop();
  }

  /* =======================================================
     RESOURCE NORMALIZATION
  ======================================================= */

  function collectResources(concept) {
    const resources = [];

    function add(value, defaults = {}) {
      if (!value) return;

      if (Array.isArray(value)) {
        value.forEach((item) => add(item, defaults));
        return;
      }

      if (typeof value === "string") {
        resources.push({
          ...defaults,
          title: defaults.title || "Open resource",
          url: value
        });

        return;
      }

      if (typeof value === "object") {
        const url =
          value.url ||
          value.href ||
          value.link ||
          value.pdf ||
          value.video;

        if (!url) return;

        resources.push({
          ...defaults,
          ...value,
          url
        });
      }
    }

    /*
      Common resource containers.
    */

    add(concept.resources);

    add(concept.videos, {
      type: "video"
    });

    add(concept.video, {
      type: "video"
    });

    add(concept.pdfs, {
      type: "pdf"
    });

    add(concept.pdf, {
      type: "pdf"
    });

    add(concept.practice, {
      type: "practice"
    });

    add(concept.questionPapers, {
      type: "paper"
    });

    add(concept.questionPapers, {
      type: "paper"
    });

    add(concept.tools, {
      type: "tool"
    });

    /*
      Avoid duplicates.
    */

    const seen = new Set();

    return resources.filter((resource) => {
      const key =
        String(resource.url) +
        "|" +
        String(resource.title || "");

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }

  function resourceIcon(resource) {
    const type = String(
      resource.type ||
        resource.category ||
        ""
    ).toLowerCase();

    if (type.includes("video")) return "▶";
    if (type.includes("pdf")) return "▣";
    if (type.includes("practice")) return "✎";
    if (type.includes("paper")) return "◇";
    if (type.includes("tool")) return "⌘";

    return "↗";
  }

  function resourceTag(resource) {
    const type = String(
      resource.type ||
        resource.category ||
        ""
    ).toLowerCase();

    if (type.includes("video")) return "VIDEO";
    if (type.includes("pdf")) return "PDF";
    if (type.includes("practice")) return "PRACTICE";
    if (type.includes("paper")) return "PAPER";
    if (type.includes("tool")) return "TOOL";

    return "RESOURCE";
  }

  function renderResource(resource) {
    const title =
      resource.title ||
      resource.name ||
      "Open resource";

    const description =
      resource.description ||
      resource.note ||
      "";

    const source =
      resource.source ||
      resource.provider ||
      resource.channel ||
      "";

    return `
      <article class="novera-resource-item">

        <div class="resource-item-top">

          <span class="resource-item-icon">
            ${resourceIcon(resource)}
          </span>

          <span class="resource-item-tag">
            ${escapeHTML(
              resourceTag(resource)
            )}
          </span>

        </div>

        <h2>
          ${escapeHTML(title)}
        </h2>

        ${
          description
            ? `
              <p>
                ${escapeHTML(description)}
              </p>
            `
            : ""
        }

        ${
          source
            ? `
              <small>
                ${escapeHTML(source)}
              </small>
            `
            : ""
        }

        <button
          class="novera-resource-button"
          data-resource-url="${escapeHTML(
            resource.url
          )}"
          type="button"
        >
          Open resource →
        </button>

      </article>
    `;
  }

  /* =======================================================
     BOOKMARKS
  ======================================================= */

  function bookmarkKey() {
    return [
      state.curriculum,
      state.classLevel,
      state.subject,
      state.chapter,
      state.concept
    ]
      .filter(Boolean)
      .join("/");
  }

  function isBookmarked() {
    const key = bookmarkKey();

    return state.bookmarks.some(
      (item) => item.key === key
    );
  }

  function toggleBookmark() {
    const key = bookmarkKey();

    const index = state.bookmarks.findIndex(
      (item) => item.key === key
    );

    if (index >= 0) {
      state.bookmarks.splice(index, 1);
      toast("Removed from bookmarks.");
    } else {
      state.bookmarks.push({
        key,
        curriculum: state.curriculum,
        classLevel: state.classLevel,
        subject: state.subject,
        chapter: state.chapter,
        concept: state.concept,
        createdAt: Date.now()
      });

      toast("Bookmarked.");
    }

    saveState();

    const concept = getConcept(
      state.subject,
      state.chapter,
      state.concept
    );

    if (concept) {
      renderConceptPage(concept);
    }
  }

  /* =======================================================
     WBBSE / WBCHSE
  ======================================================= */

  /*
    These curricula are NOT built yet.

    We do not fake a chapter database.

    Instead, the buttons open a clean information page
    explaining what is currently available.
  */

  function openUnavailableCurriculum(curriculum) {
    pushHistory();

    state.curriculum = curriculum;
    state.classLevel = null;
    state.subject = null;
    state.chapter = null;
    state.concept = null;

    hideHomepage();

    const page = createPage();

    const title =
      curriculum === "wbbse"
        ? "West Bengal Board"
        : "West Bengal Higher Secondary";

    const short =
      curriculum === "wbbse"
        ? "WBBSE"
        : "WBCHSE";

    page.innerHTML = `
      <div class="novera-v2-inner">

        <button class="novera-back-button" data-action="back">
          ← Back
        </button>

        <div class="novera-v2-eyebrow">
          ${short}
        </div>

        <h1>
          ${escapeHTML(title)}
        </h1>

        <p class="novera-v2-intro">
          Novera currently has its full learning path
          connected for NCERT Class 10.
        </p>

        <div class="novera-v2-grid">

          <div class="novera-v2-card novera-static-card">
            <span class="novera-v2-number">01</span>

            <span class="novera-v2-card-content">
              <strong>NCERT Class 10</strong>
              <small>
                Fully connected and ready to explore.
              </small>
            </span>
          </div>

          <div class="novera-v2-card novera-static-card">
            <span class="novera-v2-number">02</span>

            <span class="novera-v2-card-content">
              <strong>Novera Toolkit</strong>
              <small>
                Free calculators and learning tools.
              </small>
            </span>
          </div>

        </div>

      </div>
    `;

    bindPageActions(page);
    scrollTop();
  }

  /* =======================================================
     TOOLKIT
  ======================================================= */

  function openToolkit() {
    window.location.href = "tools/";
  }

  /* =======================================================
     HOMEPAGE CURRICULUM BUTTONS
  ======================================================= */

  function initCurriculumCards() {
    $$(".curriculum-card").forEach((card) => {
      card.addEventListener("click", (event) => {
        event.preventDefault();

        const curriculum =
          card.dataset.curriculum ||
          card.getAttribute("data-curriculum");

        if (curriculum === "ncert") {
          openNCERT();
          return;
        }

        if (curriculum === "wbbse") {
          openUnavailableCurriculum("wbbse");
          return;
        }

        if (curriculum === "wbchse") {
          openUnavailableCurriculum("wbchse");
          return;
        }
      });
    });
  }

  /* =======================================================
     HOMEPAGE SUBJECT STRIP
  ======================================================= */

  function initSubjectCards() {
    $$(".subject-item").forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();

        /*
          Subject strip on homepage now takes the user directly
          into NCERT Class 10 and opens that subject if it exists.
        */

        const raw =
          item.dataset.subject ||
          item.dataset.subjectId ||
          item.getAttribute("data-subject") ||
          item.textContent ||
          "";

        const target = slugify(raw);

        const subjects = getSubjects();

        let subjectId = Object.keys(subjects).find(
          (id) =>
            id === raw ||
            slugify(id) === target ||
            slugify(subjects[id].title) === target
        );

        if (!subjectId) {
          /*
            Common display names.
          */

          const aliases = {
            mathematics: "math",
            math: "math",
            science: "science",
            english: "english",
            hindi: "hindi",
            economics: "economics",
            history: "history",
            "social-science": "socialScience"
          };

          subjectId = aliases[target];
        }

        if (subjectId && subjects[subjectId]) {
          pushHistory();

          state.curriculum = "ncert";
          state.classLevel = "10";
          state.subject = subjectId;
          state.chapter = null;
          state.concept = null;

          renderSubjectPage(subjects[subjectId]);
        } else {
          toast("This subject is not in the current Class 10 database.");
        }
      });
    });
  }

  /* =======================================================
     PAGE ACTIONS
  ======================================================= */

  function bindPageActions(root) {
    $$("[data-action]", root).forEach((element) => {
      element.addEventListener("click", (event) => {
        event.preventDefault();

        const action = element.dataset.action;

        if (action === "back") {
          goBack();
          return;
        }

        if (action === "bookmark") {
          toggleBookmark();
          return;
        }
      });
    });

    $$("[data-subject]", root).forEach((element) => {
      element.addEventListener("click", () => {
        openSubject(element.dataset.subject);
      });
    });

    $$("[data-chapter]", root).forEach((element) => {
      element.addEventListener("click", () => {
        openChapter(element.dataset.chapter);
      });
    });

    $$("[data-concept]", root).forEach((element) => {
      element.addEventListener("click", () => {
        openConcept(element.dataset.concept);
      });
    });

    $$("[data-resource-url]", root).forEach((element) => {
      element.addEventListener("click", () => {
        const url =
          element.dataset.resourceUrl;

        if (!url) {
          toast("Resource link unavailable.");
          return;
        }

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      });
    });
  }

  /* =======================================================
     HEADER
  ======================================================= */

  function initHeader() {
    const logo =
      document.querySelector(
        ".brand, .logo, .site-logo, [data-home]"
      );

    if (logo) {
      logo.addEventListener("click", (event) => {
        event.preventDefault();
        showHomepage();
      });
    }

    $$("a").forEach((link) => {
      const href =
        link.getAttribute("href");

      if (href === "#") {
        link.addEventListener("click", (event) => {
          event.preventDefault();
        });
      }
    });
  }

  /* =======================================================
     THEME
  ======================================================= */

  function initTheme() {
    const button =
      document.querySelector(
        "#themeToggle, .theme-toggle, [data-theme-toggle]"
      );

    if (!button) return;

    const saved =
      localStorage.getItem(
        "novera_theme"
      );

    if (saved === "light") {
      document.body.classList.add("light-mode");
    }

    button.addEventListener("click", () => {
      document.body.classList.toggle(
        "light-mode"
      );

      localStorage.setItem(
        "novera_theme",
        document.body.classList.contains(
          "light-mode"
        )
          ? "light"
          : "dark"
      );
    });
  }

  /* =======================================================
     MOBILE MENU
  ======================================================= */

  function initMobileMenu() {
    const toggle =
      document.querySelector(
        "#mobileMenuToggle, .mobile-menu-toggle, [data-menu-toggle]"
      );

    const menu =
      document.querySelector(
        "#mobileMenu, .mobile-menu, [data-mobile-menu]"
      );

    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open");
    });
  }

  /* =======================================================
     REVEAL ANIMATIONS
  ======================================================= */

  function initReveal() {
    const elements =
      $$(".reveal, .reveal-on-scroll");

    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("revealed");
      });

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
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
          threshold: 0.12
        }
      );

    elements.forEach((element) => {
      observer.observe(element);
    });
  }

  /* =======================================================
     SMOOTH ANCHORS
  ======================================================= */

  function initSmoothLinks() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const href =
          link.getAttribute("href");

        if (!href || href === "#") {
          return;
        }

        const target =
          document.querySelector(href);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
  }

  /* =======================================================
     ROUTE RENDERING
  ======================================================= */

  function renderCurrentRoute() {
    if (!state.curriculum) {
      showHomepage();
      return;
    }

    if (state.curriculum === "ncert") {
      if (!state.subject) {
        renderNCERTClass10();
        return;
      }

      if (!state.chapter) {
        const subject =
          getSubject(state.subject);

        if (subject) {
          renderSubjectPage(subject);
        } else {
          renderNCERTClass10();
        }

        return;
      }

      if (!state.concept) {
        const chapter =
          getChapter(
            state.subject,
            state.chapter
          );

        if (chapter) {
          renderChapterPage(chapter);
        } else {
          const subject =
            getSubject(state.subject);

          if (subject) {
            renderSubjectPage(subject);
          } else {
            renderNCERTClass10();
          }
        }

        return;
      }

      const concept =
        getConcept(
          state.subject,
          state.chapter,
          state.concept
        );

      if (concept) {
        renderConceptPage(concept);
      } else {
        renderChapterPage(
          getChapter(
            state.subject,
            state.chapter
          )
        );
      }

      return;
    }

    if (
      state.curriculum === "wbbse" ||
      state.curriculum === "wbchse"
    ) {
      openUnavailableCurriculum(
        state.curriculum
      );
    }
  }

  /* =======================================================
     GLOBAL PUBLIC API
  ======================================================= */

  window.NOVERA = {
    state,

    openNCERT,
    openSubject,
    openChapter,
    openConcept,
    openToolkit,

    goBack,
    showHomepage,

    getSubjects,
    getSubject,
    getChapter,
    getConcept,

    bookmark: toggleBookmark,

    toast
  };

  /* =======================================================
     INITIALIZATION
  ======================================================= */

  function init() {
    loadSavedState();

    initCurriculumCards();
    initSubjectCards();

    initHeader();
    initTheme();
    initMobileMenu();
    initReveal();
    initSmoothLinks();

    /*
      Toolkit button support.
    */

    $$(
      '[data-toolkit], .toolkit-link, a[href="tools/"]'
    ).forEach((element) => {
      element.addEventListener("click", (event) => {
        /*
          Let a normal tools/ link work naturally.
          Only prevent it when explicitly using data-toolkit.
        */

        if (
          element.hasAttribute("data-toolkit")
        ) {
          event.preventDefault();
          openToolkit();
        }
      });
    });

    /*
      Important:
      We deliberately start on the homepage.
      We do NOT attempt to restore a learning route
      automatically after refresh.
    */

    clearRoute();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();
