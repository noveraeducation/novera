/* =========================================================
   NOVERA — CORE INTERACTION
   ========================================================= */


/* =========================================================
   MOBILE MENU
   ========================================================= */

const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");

if (menuButton && mobileMenu) {

  menuButton.addEventListener("click", () => {

    mobileMenu.classList.toggle("active");

    const isOpen =
      mobileMenu.classList.contains("active");

    menuButton.textContent =
      isOpen ? "×" : "☰";

  });


  document.querySelectorAll(".mobile-menu a")
    .forEach(link => {

      link.addEventListener("click", () => {

        mobileMenu.classList.remove("active");

        menuButton.textContent = "☰";

      });

    });

}


/* =========================================================
   DARK / LIGHT MODE
   ========================================================= */

const themeToggle =
  document.getElementById("themeToggle");

const savedTheme =
  localStorage.getItem("novera-theme");

if (savedTheme === "light") {
  document.body.classList.add("light");
}

function updateThemeIcon() {

  if (!themeToggle) return;

  themeToggle.textContent =
    document.body.classList.contains("light")
      ? "☀"
      : "◐";
}

updateThemeIcon();


if (themeToggle) {

  themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light");

    const theme =
      document.body.classList.contains("light")
        ? "light"
        : "dark";

    localStorage.setItem(
      "novera-theme",
      theme
    );

    updateThemeIcon();

  });

}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealElements =
  document.querySelectorAll(".reveal");

const revealObserver =
  new IntersectionObserver(
    (entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          revealObserver.unobserve(
            entry.target
          );

        }

      });

    },
    {
      threshold: 0.12
    }
  );


revealElements.forEach(element => {

  revealObserver.observe(element);

});


/* =========================================================
   CURRICULUM SELECTION
   ========================================================= */

const curriculumCards =
  document.querySelectorAll(
    ".curriculum-card"
  );


curriculumCards.forEach(card => {

  card.addEventListener("click", () => {

    const curriculum =
      card.dataset.curriculum;

    /*
      The real curriculum navigation
      will be connected here once the
      resource database is added.
    */

    if (curriculum === "ncert") {

      showNoveraMessage(
        "NCERT",
        "Your NCERT learning path will open here."
      );

    }

    if (curriculum === "wbbse") {

      showNoveraMessage(
        "West Bengal Board",
        "Your WBBSE learning path will open here."
      );

    }

    if (curriculum === "wbchse") {

      showNoveraMessage(
        "West Bengal Higher Secondary",
        "Your WBCHSE learning path will open here."
      );

    }

  });

});


/* =========================================================
   TEMPORARY NO-LOGIN MESSAGE
   ========================================================= */

function showNoveraMessage(title, message) {

  const existing =
    document.querySelector(
      ".novera-toast"
    );

  if (existing) {
    existing.remove();
  }


  const toast =
    document.createElement("div");

  toast.className =
    "novera-toast";


  toast.innerHTML = `
    <div class="novera-toast-inner">

      <div class="novera-toast-title">
        ${title}
      </div>

      <div class="novera-toast-message">
        ${message}
      </div>

      <button
        class="novera-toast-close"
        aria-label="Close"
      >
        ×
      </button>

    </div>
  `;


  document.body.appendChild(toast);


  requestAnimationFrame(() => {

    toast.classList.add("show");

  });


  const close =
    toast.querySelector(
      ".novera-toast-close"
    );


  close.addEventListener(
    "click",
    () => {

      toast.classList.remove("show");

      setTimeout(() => {

        toast.remove();

      }, 300);

    }
  );


  setTimeout(() => {

    if (!document.body.contains(toast)) {
      return;
    }

    toast.classList.remove("show");

    setTimeout(() => {

      if (document.body.contains(toast)) {
        toast.remove();
      }

    }, 300);

  }, 3500);

}


/* =========================================================
   SMOOTH INTERNAL NAVIGATION
   ========================================================= */

document
  .querySelectorAll('a[href^="#"]')
  .forEach(link => {

    link.addEventListener("click", event => {

      const targetId =
        link.getAttribute("href");

      if (
        !targetId ||
        targetId === "#"
      ) {
        return;
      }


      const target =
        document.querySelector(targetId);

      if (!target) {
        return;
      }


      event.preventDefault();


      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });


/* =========================================================
   BUTTON PRESS MICRO-INTERACTION
   ========================================================= */

document
  .querySelectorAll(
    "button, .primary-button, .secondary-button, .contact-button"
  )
  .forEach(element => {

    element.addEventListener(
      "pointerdown",
      () => {

        element.style.transform =
          "scale(.97)";

      }
    );


    element.addEventListener(
      "pointerup",
      () => {

        element.style.transform = "";

      }
    );


    element.addEventListener(
      "pointercancel",
      () => {

        element.style.transform = "";

      }
    );

  });


/* =========================================================
   HEADER SCROLL EFFECT
   ========================================================= */

const header =
  document.querySelector(
    ".site-header"
  );


window.addEventListener(
  "scroll",
  () => {

    if (!header) return;


    if (window.scrollY > 30) {

      header.style.boxShadow =
        "0 12px 40px rgba(0,0,0,.12)";

    } else {

      header.style.boxShadow = "none";

    }

  },
  {
    passive: true
  }
);


/* =========================================================
   KEYBOARD ACCESSIBILITY
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      mobileMenu
    ) {

      mobileMenu.classList.remove(
        "active"
      );

      if (menuButton) {
        menuButton.textContent = "☰";
      }

    }

  }
);


/* =========================================================
   INITIAL PAGE STATE
   ========================================================= */

window.addEventListener(
  "load",
  () => {

    document.body.classList.add(
      "page-loaded"
    );

  }
);
