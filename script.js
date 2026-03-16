  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

let lang = "en";

document.getElementById("langToggle").addEventListener("click", function(e) {
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
