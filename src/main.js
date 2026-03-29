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
  let currentFinish = "gloss";

  const finishProfiles = {
    gloss: { roughness: 0.12, metallic: 0.55 },
    matte: { roughness: 0.78, metallic: 0.22 },
  };

  const hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    return [r, g, b, 1];
  };

  const setFinish = (finish) => {
    currentFinish = finish;
    try {
      if (modelViewer?.model?.materials) {
        const profile = finishProfiles[finish] || finishProfiles.gloss;
        modelViewer.model.materials.forEach((material) => {
          if (material?.pbrMetallicRoughness) {
            material.pbrMetallicRoughness.setRoughnessFactor(profile.roughness);
            material.pbrMetallicRoughness.setMetallicFactor(profile.metallic);
          }
        });
      }
    } catch (e) {
      console.error("Error setting finish:", e);
    }
  };

  const setColor = (colorHex) => {
    if (!modelViewer || !colorHex) return;

    try {
      const rgb = hexToRgb(colorHex);
      console.log("Setting color:", colorHex, "RGB:", rgb);

      if (!modelViewer.model?.materials) {
        console.warn("No materials found in model");
        return;
      }

      modelViewer.model.materials.forEach((material, index) => {
        console.log("Material", index, ":", material);
        if (material?.pbrMetallicRoughness) {
          if (material.pbrMetallicRoughness.setBaseColorFactor) {
            material.pbrMetallicRoughness.setBaseColorFactor(rgb);
            console.log("Applied color to material", index);
          } else {
            material.pbrMetallicRoughness.baseColorFactor = new Float32Array(
              rgb,
            );
            console.log("Applied color via baseColorFactor to material", index);
          }

          // Re-apply finish profile after color change to keep paint behavior realistic.
          const profile = finishProfiles[currentFinish] || finishProfiles.gloss;
          material.pbrMetallicRoughness.setRoughnessFactor(profile.roughness);
          material.pbrMetallicRoughness.setMetallicFactor(profile.metallic);
        }
      });
    } catch (e) {
      console.error("Error setting color:", e);
    }
  };

  if (modelViewer) {
    const applyColorLogic = () => {
      console.log("Model viewer found, setting up color logic");

      // Color button clicks
      document.querySelectorAll("[data-color]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const colorHex = btn.getAttribute("data-color");
          console.log("Color button clicked:", colorHex);
          setColor(colorHex);
        });
      });

      // Finish button clicks
      document.querySelectorAll("[data-finish]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const finish = btn.getAttribute("data-finish");
          console.log("Finish button clicked:", finish);
          setFinish(finish);

          document.querySelectorAll(".finish-btn").forEach((finishBtn) => {
            finishBtn.classList.remove(
              "bg-primary/20",
              "text-primary",
              "active",
            );
            finishBtn.classList.add("bg-white/5");
          });
          btn.classList.remove("bg-white/5");
          btn.classList.add("bg-primary/20", "text-primary", "active");
        });
      });

      setFinish(currentFinish);
    };

    if (modelViewer.loaded) {
      console.log("Model viewer already loaded");
      applyColorLogic();
    } else {
      console.log("Waiting for model viewer to load");
      modelViewer.addEventListener("load", () => {
        console.log("Model viewer loaded");
        applyColorLogic();
      });
    }
  } else {
    console.error("Model viewer element not found");
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

  // Clicking a pricing plan opens the related service modal.
  document.querySelectorAll(".pricing-card").forEach((planCard) => {
    planCard.addEventListener("click", () => {
      const serviceRef = planCard.getAttribute("data-service-ref");
      if (!serviceRef) return;

      const targetService = document.querySelector(
        `.service-card[data-service-ref="${serviceRef}"]`,
      );

      if (targetService) {
        targetService.click();
      }
    });
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.close();
    }
  });
};

// Language switching
let currentLanguage = localStorage.getItem("language") || "en";

const languageFlags = {
  en: "🇬🇧",
  de: "🇩🇪",
};

const switchLanguage = (lang) => {
  currentLanguage = lang;
  localStorage.setItem("language", lang);

  const languageFlag = document.getElementById("language-flag");
  if (languageFlag) {
    languageFlag.textContent = languageFlags[lang] || languageFlags.en;
  }

  // Update active state for language menu options.
  document.querySelectorAll("[data-set-lang]").forEach((option) => {
    const code = option.getAttribute("data-set-lang");
    if (!code) return;
    const isActive = code === lang;
    option.classList.toggle("text-primary", isActive);
    option.classList.toggle("bg-primary/10", isActive);
  });

  // Update all translatable elements
  document.querySelectorAll("[data-en]").forEach((element) => {
    const en = element.getAttribute("data-en");
    const de = element.getAttribute("data-de");
    if (en && de) {
      element.textContent = lang === "en" ? en : de;
    }
  });

  // Update HTML lang
  document.documentElement.lang = lang;
};

const initLanguageSwitcher = () => {
  const toggle = document.getElementById("language-toggle");
  if (!toggle) return;

  switchLanguage(currentLanguage);

  toggle.addEventListener("click", () => {
    const nextLanguage = currentLanguage === "en" ? "de" : "en";
    switchLanguage(nextLanguage);
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

  initLanguageSwitcher();
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
