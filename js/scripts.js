// Show/hide Back-to-Top button based on scroll position
const backToTopButton = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopButton.classList.add("show");
  } else {
    backToTopButton.classList.remove("show");
  }
});

// Smooth scroll back to top
backToTopButton.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Scroll Progress Indicator
window.addEventListener('scroll', function () {
  let scroll = document.documentElement.scrollTop || document.body.scrollTop;
  let scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  let progress = (scroll / scrollHeight) * 100;
  document.getElementById('progress-bar').style.width = progress + '%';
});