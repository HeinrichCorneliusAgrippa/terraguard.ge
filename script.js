  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

let lang = "en";

const langToggle = document.getElementById("langToggle");
if (langToggle) langToggle.addEventListener("click", function(e) {
  e.preventDefault();

  lang = lang === "en" ? "ka" : "en";

  document.documentElement.lang = lang;

  document.querySelectorAll("[data-en]").forEach(el => {
    const value = el.dataset[lang];

    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = value;
    } else {
      el.innerHTML = value;
    }
  });

  this.textContent = lang === "en" ? "ქართული" : "EN";
});

/* How It Works — scroll-driven steps.
   CSS decides whether the section is pinned; this only mirrors scroll
   progress onto the active step, and stays idle in the static layout. */
(function () {
  const section = document.getElementById("how");
  if (!section) return;

  const scroller = section.querySelector(".how-scroll");
  const steps = Array.from(section.querySelectorAll(".how-step"));
  const markers = Array.from(section.querySelectorAll(".how-nav-item"));
  const images = steps.map(step => step.querySelector("img"));
  if (!scroller || !steps.length) return;

  const pinned = window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
  let active = -1;
  let queued = false;

  /* A step whose image 404s still renders: hide the broken img, keep the frame. */
  images.forEach(img => {
    if (!img) return;
    if (img.complete && img.naturalWidth === 0) img.classList.add("is-missing");
    img.addEventListener("error", () => img.classList.add("is-missing"));
  });

  function preload(index) {
    const next = images[index + 1];
    if (next && !next.dataset.warmed) {
      next.dataset.warmed = "1";
      const warm = new Image();
      warm.src = next.currentSrc || next.src;
    }
  }

  function setActive(index) {
    if (index === active) return;
    active = index;
    steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
    markers.forEach((marker, i) => {
      marker.classList.toggle("is-active", i === index);
      marker.setAttribute("aria-current", i === index ? "true" : "false");
    });
    preload(index);
  }

  function travelDistance() {
    return scroller.getBoundingClientRect().height - window.innerHeight;
  }

  function update() {
    queued = false;
    const rect = scroller.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    if (travel <= 0) { setActive(0); return; }
    const progress = Math.min(Math.max(-rect.top / travel, 0), 1);
    scroller.style.setProperty("--how-progress", progress.toFixed(4));
    setActive(Math.min(steps.length - 1, Math.floor(progress * steps.length)));
  }

  /* Nav rows are real <button>s, so Enter/Space come for free. */
  markers.forEach(marker => {
    marker.addEventListener("click", () => {
      if (!pinned.matches) return;
      const index = Number(marker.dataset.stepIndex);
      const travel = travelDistance();
      if (!Number.isFinite(index) || travel <= 0) return;
      const top = scroller.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top + ((index + 0.5) / steps.length) * travel,
        behavior: "smooth"
      });
    });
  });

  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  function sync() {
    if (pinned.matches) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();
    } else {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      steps.forEach(step => step.classList.remove("is-active"));
      markers.forEach(marker => {
        marker.classList.remove("is-active");
        marker.removeAttribute("aria-current");
      });
      scroller.style.removeProperty("--how-progress");
      active = -1;
    }
  }

  sync();
  pinned.addEventListener("change", sync);
})();

/* Pilot application form — progressive enhancement over the existing
   Formspree POST. The action, method and field names are untouched; if
   this script never runs the form still submits natively. Keyed on
   .pilot-form, which only exists on the English page, so ka/ is unaffected. */
(function () {
  const form = document.querySelector(".pilot-form");
  if (!form) return;

  const submit = form.querySelector(".pilot-submit-btn");
  const status = form.querySelector(".pilot-form-status");
  const success = document.querySelector(".pilot-success");
  const fields = Array.from(form.querySelectorAll(".pilot-input"));
  const submitLabel = submit ? submit.textContent : "";
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* Messages come from data-msg-* so translated pages can supply their own;
     the English strings below stay the default when the attributes are absent. */
  const MSG = {
    required: form.dataset.msgRequired || "Please fill in this field.",
    select: form.dataset.msgSelect || "Please choose your vineyard size.",
    email: form.dataset.msgEmail || "Please enter a valid email address.",
    sending: form.dataset.msgSending || "Sending…",
    failed: form.dataset.msgFailed
      || "Something went wrong sending your application. Your details are still here — please try again."
  };

  /* Set here rather than in the markup so no-JS visitors keep native validation. */
  form.noValidate = true;

  function wrap(input) { return input.closest(".pilot-field"); }

  function validate(input) {
    const value = input.value.trim();
    /* Driven by the required attribute, so the optional vineyard
       description passes without needing a special case here. */
    let message = "";
    if (input.hasAttribute("required") && !value) {
      message = input.tagName === "SELECT" ? MSG.select : MSG.required;
    } else if (input.type === "email" && value && !EMAIL.test(value)) {
      message = MSG.email;
    }

    const field = wrap(input);
    const error = field && field.querySelector(".pilot-error");
    if (field) field.classList.toggle("has-error", Boolean(message));
    if (error) error.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  fields.forEach(input => {
    input.addEventListener("blur", () => validate(input));
    input.addEventListener("change", () => validate(input));
    input.addEventListener("input", () => {
      const field = wrap(input);
      if (field && field.classList.contains("has-error")) validate(input);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (status) status.textContent = "";

    const valid = fields.map(validate).every(Boolean);
    if (!valid) {
      const firstInvalid = fields.find(input => {
        const field = wrap(input);
        return field && field.classList.contains("has-error");
      });
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (submit) {
      submit.disabled = true;
      submit.textContent = MSG.sending;
    }

    fetch(form.action, {
      method: form.method || "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(response => {
        if (!response.ok) throw new Error("Submission failed");
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.focus();
        }
      })
      .catch(() => {
        /* Values stay in the form so the visitor can simply retry. */
        if (status) {
          status.textContent = MSG.failed;
        }
        if (submit) {
          submit.disabled = false;
          submit.textContent = submitLabel;
        }
      });
  });
})();

/* FAQ accordion — one panel open at a time. Triggers are real <button>s,
   so Enter/Space and focus come from the platform. Scoped to #faq, which
   only exists on the English page. */
(function () {
  const items = Array.from(document.querySelectorAll("#faq .faq-item"));
  if (!items.length) return;

  function close(item) {
    item.classList.remove("is-open");
    const trigger = item.querySelector(".faq-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  items.forEach(item => {
    const trigger = item.querySelector(".faq-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const wasOpen = item.classList.contains("is-open");
      items.forEach(close);
      if (!wasOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
})();

/* Site navigation: scroll state, active link, offset smooth-scroll and the
   mobile panel. Scoped to .site-nav, which only exists on the English page. */
(function () {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;

  const toggle = nav.querySelector(".site-nav-toggle");
  const links = Array.from(nav.querySelectorAll(".site-nav-link"));
  const hero = document.getElementById("hero");
  const mobile = window.matchMedia("(max-width: 900px)");

  /* Pair each link with its section, ordered by document position so the
     "last section passed" scan works regardless of nav link order. */
  const entries = links
    .map(link => {
      const id = link.getAttribute("href");
      const section = id && id.length > 1 ? document.querySelector(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  function navHeight() { return nav.getBoundingClientRect().height; }
  function pageY(el) { return el.getBoundingClientRect().top + window.scrollY; }

  function updateScrolled() {
    const threshold = hero ? Math.max(hero.offsetHeight - navHeight(), 40) : 40;
    nav.classList.toggle("is-scrolled", window.scrollY > threshold);
  }

  function updateActive() {
    const probe = window.scrollY + navHeight() + 24;
    const ordered = entries.slice().sort((a, b) => pageY(a.section) - pageY(b.section));
    let current = null;
    ordered.forEach(entry => {
      if (pageY(entry.section) <= probe) current = entry.link;
    });

    /* The last section is short enough that the page runs out of scroll
       before its top reaches the probe line, so bottom-of-page selects it. */
    const atBottom =
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atBottom && ordered.length) current = ordered[ordered.length - 1].link;
    links.forEach(link => {
      const on = link === current;
      link.classList.toggle("is-active", on);
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  let queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      updateScrolled();
      updateActive();
    });
  }

  /* Translated pages override these via data-label-open / data-label-close. */
  const menuLabel = {
    open: (toggle && toggle.dataset.labelOpen) || "Open menu",
    close: (toggle && toggle.dataset.labelClose) || "Close menu"
  };

  function openMenu() {
    nav.classList.add("is-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", menuLabel.close);
    }
  }
  function closeMenu() {
    nav.classList.remove("is-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", menuLabel.open);
    }
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
  }

  /* Offset the sticky bar so headings aren't hidden behind it. */
  nav.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !nav.contains(link)) return;
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();
    closeMenu();
    window.scrollTo({
      top: Math.max(pageY(target) - navHeight(), 0),
      behavior: "smooth"
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      if (toggle) toggle.focus();
    }
  });

  document.addEventListener("click", event => {
    if (!nav.classList.contains("is-open")) return;
    if (!nav.contains(event.target)) closeMenu();
  });

  mobile.addEventListener("change", () => { if (!mobile.matches) closeMenu(); });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateScrolled();
  updateActive();
})();
