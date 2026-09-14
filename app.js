/* =========================================================
   NOVERA V2 — CORE ENGINE
   Full NCERT + Tools Platform Foundation
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   NOVERA STATE
--------------------------------------------------------- */

const NoveraState = {
  curriculum: null,
  classLevel: null,
  subject: null,
  chapter: null,
  concept: null,

  bookmarks: JSON.parse(
    localStorage.getItem("noveraBookmarks") || "[]"
  )
};


/* ---------------------------------------------------------
   NCERT V2 DATA FOUNDATION
   We start with the structure.
   Content can be expanded without changing the engine.
--------------------------------------------------------- */

const NCERT = {

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

  "10": {
    name: "Class 10",
    subjects: {
      mathematics: {
        name: "Mathematics",
        chapters: [
          {
            id: "real-numbers",
            name: "Real Numbers",
            concepts: [
              "Euclid's Division Lemma",
              "Fundamental Theorem of Arithmetic",
              "Irrational Numbers",
              "Decimal Expansions",
              "HCF and LCM"
            ]
          }
        ]
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


/* ---------------------------------------------------------
   RESOURCE TYPES
--------------------------------------------------------- */

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


/* ---------------------------------------------------------
   UTILITY
--------------------------------------------------------- */

function saveBookmarks() {
  localStorage.setItem(
    "noveraBookmarks",
    JSON.stringify(NoveraState.bookmarks)
  );
}


function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}


/* ---------------------------------------------------------
   TOAST
--------------------------------------------------------- */

function showNoveraMessage(message) {

  let toast = document.querySelector(".novera-toast");

  if (!toast) {

    toast = document.createElement("div");

    toast.className = "novera-toast";

    toast.style.position = "fixed";
    toast.style.left = "50%";
    toast.style.bottom = "24px";
    toast.style.transform = "translateX(-50%) translateY(20px)";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "999px";
    toast.style.background = "rgba(15,20,17,.94)";
    toast.style.color = "#fff";
    toast.style.fontSize = "14px";
    toast.style.zIndex = "9999";
    toast.style.opacity = "0";
    toast.style.pointerEvents = "none";
    toast.style.transition =
      "opacity .25s ease, transform .25s ease";
    toast.style.boxShadow =
      "0 10px 35px rgba(0,0,0,.25)";

    document.body.appendChild(toast);
  }

  toast.textContent = message;

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform =
      "translateX(-50%) translateY(0)";
  });

  clearTimeout(toast._timer);

  toast._timer = setTimeout(() => {

    toast.style.opacity = "0";

    toast.style.transform =
      "translateX(-50%) translateY(20px)";

  }, 2200);
}


/* ---------------------------------------------------------
   NAVIGATION ENGINE
--------------------------------------------------------- */

function openCurriculum(curriculum) {

  NoveraState.curriculum = curriculum;

  if (curriculum === "ncert") {
    openNCERTClassSelector();
    return;
  }

  showNoveraMessage(
    "This curriculum will be connected in V3."
  );
}


function openNCERTClassSelector() {

  const classes = Object.entries(NCERT)
    .map(([id, data]) => ({
      id,
      name: data.name
    }));

  renderLearningPage(
    "NCERT",
    "Choose your class",
    classes,
    "class"
  );
}


function openNCERTClass(classLevel) {

  NoveraState.classLevel = classLevel;

  const classData = NCERT[classLevel];

  if (!classData) return;

  const subjects = Object.entries(
    classData.subjects
  ).map(([id, data]) => ({
    id,
    name: data.name
  }));

  renderLearningPage(
    classData.name,
    "Choose your subject",
    subjects,
    "subject"
  );
}


function openNCERTSubject(subjectId) {

  const classData = NCERT[
    NoveraState.classLevel
  ];

  if (!classData) return;

  const subject = classData.subjects[subjectId];

  if (!subject) return;

  NoveraState.subject = subjectId;

  const chapters = subject.chapters || [];

  if (!chapters.length) {

    renderEmptyLearningPage(
      subject.name,
      "Chapter resources are being connected."
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


function openChapter(chapterId) {

  const classData =
    NCERT[NoveraState.classLevel];

  if (!classData) return;

  const subject =
    classData.subjects[NoveraState.subject];

  if (!subject) return;

  const chapter =
    subject.chapters.find(
      chapter => chapter.id === chapterId
    );

  if (!chapter) return;

  NoveraState.chapter = chapterId;

  renderLearningPage(
    chapter.name,
    "Choose a concept",
    chapter.concepts.map(concept => ({
      id: slugify(concept),
      name: concept
    })),
    "concept"
  );
}


function openConcept(conceptId) {

  NoveraState.concept = conceptId;

  const title =
    conceptId
      .replace(/-/g, " ")
      .replace(/\b\w/g, letter =>
        letter.toUpperCase()
      );

  renderConceptPage(title);
}


/* ---------------------------------------------------------
   LEARNING PAGE RENDERER
--------------------------------------------------------- */

function renderLearningPage(
  eyebrow,
  title,
  items,
  type
) {

  const existing =
    document.querySelector(".novera-v2-page");

  if (existing) existing.remove();

  const page =
    document.createElement("section");

  page.className = "novera-v2-page";

  page.innerHTML = `

    <div class="novera-v2-inner">

      <button class="novera-back-button">
        ← Back
      </button>

      <span class="section-label">
        ${escapeHTML(eyebrow)}
      </span>

      <h1>
        ${escapeHTML(title)}
      </h1>

      <div class="novera-v2-grid">

        ${items.map((item, index) => `

          <button
            class="novera-v2-card"
            data-type="${type}"
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

        `).join("")}

      </div>

    </div>
  `;

  document.body.appendChild(page);

  requestAnimationFrame(() => {
    page.classList.add("active");
  });

  page.querySelector(".novera-back-button")
    .addEventListener("click", () => {

      page.remove();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    });

  page.querySelectorAll(".novera-v2-card")
    .forEach(card => {

      card.addEventListener("click", () => {

        const id =
          card.dataset.id;

        if (type === "class") {
          openNCERTClass(id);
        }

        if (type === "subject") {
          openNCERTSubject(id);
        }

        if (type === "chapter") {
          openChapter(id);
        }

        if (type === "concept") {
          openConcept(id);
        }

      });

    });
}


/* ---------------------------------------------------------
   EMPTY PAGE
--------------------------------------------------------- */

function renderEmptyLearningPage(
  title,
  message
) {

  const existing =
    document.querySelector(".novera-v2-page");

  if (existing) existing.remove();

  const page =
    document.createElement("section");

  page.className = "novera-v2-page";

  page.innerHTML = `

    <div class="novera-v2-inner">

      <button class="novera-back-button">
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

  document.body.appendChild(page);

  requestAnimationFrame(() => {
    page.classList.add("active");
  });

  page.querySelector(".novera-back-button")
    .addEventListener("click", () => {
      page.remove();
    });
}


/* ---------------------------------------------------------
   CONCEPT PAGE
--------------------------------------------------------- */

function renderConceptPage(title) {

  const existing =
    document.querySelector(".novera-v2-page");

  if (existing) existing.remove();

  const page =
    document.createElement("section");

  page.className =
    "novera-v2-page novera-concept-page";

  const bookmarkId =
    [
      NoveraState.classLevel,
      NoveraState.subject,
      NoveraState.chapter,
      NoveraState.concept
    ].join("/");

  const bookmarked =
    NoveraState.bookmarks.includes(bookmarkId);

  page.innerHTML = `

    <div class="novera-v2-inner">

      <button class="novera-back-button">
        ← Back
      </button>

      <span class="section-label">
        CONCEPT
      </span>

      <h1>
        ${escapeHTML(title)}
      </h1>

      <p class="novera-concept-intro">
        Understand the idea first.
        Then read, watch and practise.
      </p>

      <button
        class="novera-bookmark-button"
        data-bookmark="${escapeHTML(bookmarkId)}"
      >
        ${bookmarked ? "★ Saved" : "☆ Save concept"}
      </button>

      <div class="novera-resource-grid">

        ${createResourceCard(
          "🏆",
          RESOURCE_TYPES.BEST,
          "Best overall",
          "A carefully selected resource for understanding this concept."
        )}

        ${createResourceCard(
          "🧠",
          RESOURCE_TYPES.CONCEPT,
          "Conceptual",
          "A resource focused on understanding rather than memorising."
        )}

        ${createResourceCard(
          "🎯",
          RESOURCE_TYPES.EXAM,
          "Exam focused",
          "Useful after you understand the underlying idea."
        )}

        ${createResourceCard(
          "⚡",
          RESOURCE_TYPES.REVISION,
          "Quick revision",
          "A compact resource for refreshing the concept."
        )}

        ${createResourceCard(
          "📖",
          RESOURCE_TYPES.OFFICIAL,
          "Official resource",
          "Official textbook and learning material."
        )}

        ${createResourceCard(
          "✎",
          RESOURCE_TYPES.PRACTICE,
          "Practice",
          "Questions designed to help you check your understanding."
        )}

      </div>

    </div>
  `;

  document.body.appendChild(page);

  requestAnimationFrame(() => {
    page.classList.add("active");
  });

  page.querySelector(".novera-back-button")
    .addEventListener("click", () => {
      page.remove();
    });

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
        NoveraState.bookmarks.indexOf(id);

      if (index === -1) {

        NoveraState.bookmarks.push(id);

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
}


/* ---------------------------------------------------------
   RESOURCE CARD
--------------------------------------------------------- */

function createResourceCard(
  icon,
  tag,
  title,
  description
) {

  return `

    <article class="novera-resource-item">

      <div class="resource-item-top">

        <span class="resource-item-icon">
          ${icon}
        </span>

        <span class="resource-item-tag">
          ${escapeHTML(tag)}
        </span>

      </div>

      <h2>
        ${escapeHTML(title)}
      </h2>

      <p>
        ${escapeHTML(description)}
      </p>

      <button
        class="novera-resource-button"
        type="button"
        disabled
      >
        Resource connection →
      </button>

    </article>

  `;
}


/* ---------------------------------------------------------
   CURRICULUM CARDS
--------------------------------------------------------- */

function initCurriculumCards() {

  document
    .querySelectorAll(
      ".curriculum-card"
    )
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const curriculum =
            card.dataset.curriculum;

          openCurriculum(curriculum);

        }
      );

    });
}


/* ---------------------------------------------------------
   SUBJECT CARDS
--------------------------------------------------------- */

function initSubjectItems() {

  document
    .querySelectorAll(
      ".subject-item"
    )
    .forEach(item => {

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

    });
}


/* ---------------------------------------------------------
   THEME
--------------------------------------------------------- */

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

  if (savedTheme === "light") {
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


/* ---------------------------------------------------------
   MOBILE MENU
--------------------------------------------------------- */

function initMobileMenu() {

  const button =
    document.querySelector(
      "#menuButton"
    );

  const menu =
    document.querySelector(
      "#mobileMenu"
    );

  if (!button || !menu) return;

  button.addEventListener(
    "click",
    () => {

      menu.classList.toggle(
        "active"
      );

    }
  );

  menu.querySelectorAll("a")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {
          menu.classList.remove(
            "active"
          );
        }
      );

    });
}


/* ---------------------------------------------------------
   SCROLL REVEAL
--------------------------------------------------------- */

function initReveal() {

  const elements =
    document.querySelectorAll(
      ".reveal"
    );

  if (
    !("IntersectionObserver" in window)
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

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              "visible"
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

  elements.forEach(
    element =>
      observer.observe(element)
  );
}


/* ---------------------------------------------------------
   SMOOTH INTERNAL LINKS
--------------------------------------------------------- */

function initSmoothLinks() {

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const id =
            link.getAttribute(
              "href"
            );

          if (!id || id === "#")
            return;

          const target =
            document.querySelector(
              id
            );

          if (!target) return;

          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth"
          });

        }
      );

    });
}


/* ---------------------------------------------------------
   BUTTON PRESS EFFECT
--------------------------------------------------------- */

function initButtonEffects() {

  document
    .querySelectorAll(
      "button, .primary-button, .secondary-button, .contact-button"
    )
    .forEach(button => {

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

    });
}


/* ---------------------------------------------------------
   HEADER SCROLL EFFECT
--------------------------------------------------------- */

function initHeaderScroll() {

  const header =
    document.querySelector(
      ".site-header"
    );

  if (!header) return;

  window.addEventListener(
    "scroll",
    () => {

      if (window.scrollY > 20) {
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


/* ---------------------------------------------------------
   PAGE LOAD
--------------------------------------------------------- */

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
