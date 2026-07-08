const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("show");

    menuToggle.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (navLinks && menuToggle) {
      navLinks.classList.remove("show");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});