  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

const toggle = document.getElementById("langToggle");

let currentLang = "en";

toggle.addEventListener("click", () => {

  currentLang = currentLang === "en" ? "ka" : "en";

  document.querySelectorAll("[data-en]").forEach(el => {
    el.innerHTML = el.dataset[currentLang];
  });

  toggle.textContent = currentLang === "en" ? "ქართული" : "EN";

});
