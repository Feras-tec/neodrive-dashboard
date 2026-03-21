import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({
  duration: 1000,
  once: true,
  easing: "ease-out-back",
});

const bookingCard = document.getElementById("booking-card");

const toggleBooking = (show = true) => {
  if (!bookingCard) return;
  if (show) {
    bookingCard.classList.remove("is-hidden");
    setTimeout(() => {
      bookingCard.classList.remove("is-shifted");
    }, 10);
  } else {
    bookingCard.classList.add("is-shifted");
    setTimeout(() => {
      bookingCard.classList.add("is-hidden");
    }, 500);
  }
};

window.toggleBooking = toggleBooking;

const setupModelColoring = () => {
  const modelViewer = document.querySelector("#car-model");
  const hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    return [r, g, b, 1];
  };

  if (modelViewer) {
    const applyColorLogic = () => {
      document.querySelectorAll("[data-color]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const colorHex = btn.getAttribute("data-color");
          if (modelViewer.model && colorHex) {
            const material = modelViewer.model.materials[0];
            if (material?.pbrMetallicRoughness) {
              material.pbrMetallicRoughness.setBaseColorFactor(
                hexToRgb(colorHex),
              );
            }
          }
        });
      });
    };

    if (modelViewer.loaded) {
      applyColorLogic();
    } else {
      modelViewer.addEventListener("load", applyColorLogic);
    }
  }
};

const setupDynamicModal = () => {
  const modal = document.getElementById("main-service-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-description");
  const modalBanner = document.getElementById("modal-banner");

  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => {
      const title = card.getAttribute("data-title");
      const desc = card.getAttribute("data-desc");
      const theme = card.getAttribute("data-theme");
      const img1 = card.getAttribute("data-img1");
      const img2 = card.getAttribute("data-img2");
      const img3 = card.getAttribute("data-img3");

      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;

      if (modalBanner) {
        modalBanner.style.backgroundImage = "none";
        modalBanner.className =
          "h-64 grid grid-cols-3 gap-1 overflow-hidden border-b border-base-content/10";
        modalBanner.innerHTML = `
          <img src="${img1}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          <img src="${img2}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          <img src="${img3}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
        `;

        if (theme === "primary")
          modalBanner.style.backgroundColor = "oklch(var(--p) / 0.1)";
        else if (theme === "blue")
          modalBanner.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
        else if (theme === "secondary")
          modalBanner.style.backgroundColor = "oklch(var(--s) / 0.1)";
      }
      modal.showModal();
    });
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.close();
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".open-booking").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleBooking(true);
    });
  });

  document.querySelector("#booking-close")?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleBooking(false);
  });

  setupDynamicModal();
  setupModelColoring();

  document.addEventListener("click", (e) => {
    if (
      bookingCard &&
      !bookingCard.contains(e.target) &&
      !e.target.closest(".open-booking") &&
      !bookingCard.classList.contains("is-hidden")
    ) {
      toggleBooking(false);
    }
  });
});

const themeToggle = document.querySelector("#theme-toggle");
const html = document.documentElement;

const applyTheme = (theme) => {
  html.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.checked = theme === "light";
  }
  localStorage.setItem("theme", theme);
};

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

themeToggle?.addEventListener("change", (e) => {
  const newTheme = e.target.checked ? "light" : "dark";
  applyTheme(newTheme);
});
