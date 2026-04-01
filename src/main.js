import AOS from "aos";
import "aos/dist/aos.css";
import "./register-sw.js";

// ===== CONSTANTS =====
const ANIMATION_CONFIG = {
  cardRevealDuration: 10,
  cardHideDuration: 500,
  aosDuration: 1000,
};

const FINISH_PROFILES = {
  gloss: { roughness: 0.12, metallic: 0.55 },
  matte: { roughness: 0.78, metallic: 0.22 },
};

const CAMERA_CONFIG = {
  fov: 50,
  near: 0.1,
  far: 600,
  positionX: 0,
  positionY: 4.2,
  positionZ: 14,
  targetX: 0,
  targetY: 1.8,
  targetZ: 0,
};

const CONTROLS_CONFIG = {
  maxDistance: 160,
  minDistance: 8,
  maxPolarAngle: Math.PI * 0.49,
  minPolarAngle: Math.PI * 0.1,
};

const LIGHTS_CONFIG = {
  ambientIntensity: 1.0,
  directionalIntensity: 4.0,
  purpleLightIntensity: 350,
  purpleLightDistance: 28,
  purpleLightDecay: 2,
  spotLightIntensity: 220,
  spotLightDistance: 38,
};

AOS.init({
  duration: ANIMATION_CONFIG.aosDuration,
  once: true,
  easing: "ease-out-back",
});

const bookingCard = document.getElementById("booking-card");
const DEBUG = false; // Set to true for logging

const toggleBooking = (show = true) => {
  if (!bookingCard) return;
  if (show) {
    bookingCard.classList.remove("is-hidden");
    setTimeout(() => {
      bookingCard.classList.remove("is-shifted");
    }, ANIMATION_CONFIG.cardRevealDuration);
  } else {
    bookingCard.classList.add("is-shifted");
    setTimeout(() => {
      bookingCard.classList.add("is-hidden");
    }, ANIMATION_CONFIG.cardHideDuration);
  }
};

window.toggleBooking = toggleBooking;

const setupModelColoring = () => {
  const modelViewer = document.querySelector("#car-model");
  if (!modelViewer) {
    if (DEBUG) console.warn("Model viewer element not found");
    return;
  }

  let currentFinish = "gloss";

  const hexToRgb = (hex) => {
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length !== 6) return [1, 1, 1, 1];

    const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
    return [r, g, b, 1];
  };

  const setFinish = (finish) => {
    currentFinish = finish;
    try {
      if (modelViewer?.model?.materials) {
        const profile = FINISH_PROFILES[finish] || FINISH_PROFILES.gloss;
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
      if (DEBUG) console.log("Setting color:", colorHex, "RGB:", rgb);

      if (!modelViewer.model?.materials) {
        if (DEBUG) console.warn("No materials found in model");
        return;
      }

      modelViewer.model.materials.forEach((material) => {
        if (material?.pbrMetallicRoughness) {
          if (material.pbrMetallicRoughness.setBaseColorFactor) {
            material.pbrMetallicRoughness.setBaseColorFactor(rgb);
          } else {
            material.pbrMetallicRoughness.baseColorFactor = new Float32Array(
              rgb,
            );
          }

          const profile =
            FINISH_PROFILES[currentFinish] || FINISH_PROFILES.gloss;
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
      if (DEBUG) console.log("Model viewer found, setting up color logic");

      document.querySelectorAll("[data-color]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const colorHex = btn.getAttribute("data-color");
          setColor(colorHex);
        });
      });

      document.querySelectorAll("[data-finish]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const finish = btn.getAttribute("data-finish");
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

  if (!modal || !modalBanner) return;

  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => {
      const title = card.getAttribute("data-title");
      const desc = card.getAttribute("data-desc");
      const theme = card.getAttribute("data-theme");
      const img1 = card.getAttribute("data-img1");
      const img2 = card.getAttribute("data-img2");
      const img3 = card.getAttribute("data-img3");

      if (modalTitle) modalTitle.textContent = title ?? "";
      if (modalDesc) modalDesc.textContent = desc ?? "";

      modalBanner.style.backgroundImage = "none";
      modalBanner.className =
        "h-64 grid grid-cols-3 gap-1 overflow-hidden border-b border-base-content/10";

      modalBanner.innerHTML = "";
      [img1, img2, img3].forEach((img) => {
        if (img) {
          const imgEl = document.createElement("img");
          imgEl.src = img;
          imgEl.className =
            "w-full h-full object-cover hover:scale-105 transition-transform duration-500";
          modalBanner.appendChild(imgEl);
        }
      });

      if (theme === "primary")
        modalBanner.style.backgroundColor = "oklch(var(--p) / 0.1)";
      else if (theme === "blue")
        modalBanner.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
      else if (theme === "secondary")
        modalBanner.style.backgroundColor = "oklch(var(--s) / 0.1)";

      modal.showModal();
    });
  });

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

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.close();
    }
  });
};

const setupThreePlazaShowcase = async () => {
  const mount = document.getElementById("plaza-three-canvas");
  if (!mount) return;
  if (mount.dataset.initialized === "true") return;

  const [
    THREE,
    { GLTFLoader },
    { DRACOLoader },
    { OrbitControls },
    { TransformControls },
  ] = await Promise.all([
    import("three"),
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/loaders/DRACOLoader.js"),
    import("three/examples/jsm/controls/OrbitControls.js"),
    import("three/examples/jsm/controls/TransformControls.js"),
  ]);

  mount.dataset.initialized = "true";

  mount.innerHTML = "";
  mount.style.position = "relative";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1020);

  const camera = new THREE.PerspectiveCamera(
    CAMERA_CONFIG.fov,
    mount.clientWidth / mount.clientHeight,
    CAMERA_CONFIG.near,
    CAMERA_CONFIG.far,
  );
  camera.position.set(
    CAMERA_CONFIG.positionX,
    CAMERA_CONFIG.positionY,
    CAMERA_CONFIG.positionZ,
  );
  camera.lookAt(
    CAMERA_CONFIG.targetX,
    CAMERA_CONFIG.targetY,
    CAMERA_CONFIG.targetZ,
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.domElement.style.touchAction = "none";
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  mount.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(
    CAMERA_CONFIG.targetX,
    CAMERA_CONFIG.targetY,
    CAMERA_CONFIG.targetZ,
  );
  controls.maxDistance = CONTROLS_CONFIG.maxDistance;
  controls.minDistance = CONTROLS_CONFIG.minDistance;
  controls.maxPolarAngle = CONTROLS_CONFIG.maxPolarAngle;
  controls.minPolarAngle = CONTROLS_CONFIG.minPolarAngle;

  const yOffset = 1.5;

  const transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.setMode("translate");
  transformControls.space = "world";
  transformControls.showY = true;
  transformControls.size = 1.25;
  scene.add(transformControls);

  transformControls.addEventListener("dragging-changed", (event) => {
    controls.enabled = !event.value;
  });

  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    LIGHTS_CONFIG.ambientIntensity,
  );
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    LIGHTS_CONFIG.directionalIntensity,
  );
  directionalLight.position.set(10, 18, 8);
  scene.add(directionalLight);

  const showcasePurpleLight = new THREE.PointLight(
    0x9945ff,
    LIGHTS_CONFIG.purpleLightIntensity,
    LIGHTS_CONFIG.purpleLightDistance,
    LIGHTS_CONFIG.purpleLightDecay,
  );
  showcasePurpleLight.position.set(0, 8, 0);
  scene.add(showcasePurpleLight);

  const showcaseSpotLight = new THREE.SpotLight(
    0xffffff,
    LIGHTS_CONFIG.spotLightIntensity,
    LIGHTS_CONFIG.spotLightDistance,
    0.14,
    0.25,
    1.8,
  );
  showcaseSpotLight.position.set(0, 22, 0);
  scene.add(showcaseSpotLight);
  scene.add(showcaseSpotLight.target);

  const loadingBadge = document.createElement("div");
  loadingBadge.style.cssText =
    "position:absolute;left:12px;bottom:12px;z-index:5;padding:6px 10px;border-radius:10px;background:rgba(10,12,25,0.75);color:#dbeafe;font:600 11px/1.2 sans-serif;letter-spacing:.06em;text-transform:uppercase;";
  loadingBadge.textContent = "Loading showcase...";
  mount.appendChild(loadingBadge);

  const loadingManager = new THREE.LoadingManager();
  loadingManager.onStart = (url, loaded, total) => {
    if (DEBUG)
      console.log(`[Showcase] loading started: ${url} (${loaded}/${total})`);
    loadingBadge.textContent = `Loading ${loaded}/${total}`;
  };
  loadingManager.onProgress = (url, loaded, total) => {
    if (DEBUG)
      console.log(`[Showcase] loading progress: ${url} (${loaded}/${total})`);
    loadingBadge.textContent = `Loading ${loaded}/${total}`;
  };
  loadingManager.onLoad = () => {
    if (DEBUG) console.log("[Showcase] all models loaded");
    loadingBadge.textContent = "Showcase ready";
    setTimeout(() => {
      if (loadingBadge.parentElement) loadingBadge.remove();
    }, 1200);
  };
  loadingManager.onError = (url) => {
    console.error(`[Showcase] loading error: ${url}`);
    loadingBadge.textContent = "Asset load error";
  };

  const loader = new GLTFLoader(loadingManager);
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const prepareModelVisibility = (root) => {
    root.traverse((node) => {
      if (!node.isMesh) return;
      node.frustumCulled = false;
      node.castShadow = true;
      node.receiveShadow = true;

      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];

      materials.forEach((mat) => {
        if (!mat) return;
        if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
        if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
        mat.needsUpdate = true;
      });
    });
  };

  const getBounds = (root) => {
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) {
      return {
        center: new THREE.Vector3(0, 0, 0),
        size: new THREE.Vector3(10, 2, 10),
        minY: 0,
      };
    }

    return {
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3()),
      minY: box.min.y,
    };
  };

  const moveModelToGround = (root, targetY) => {
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) return;
    root.position.y += targetY - box.min.y;
  };

  const centerModelXZ = (root) => {
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    root.position.x -= center.x;
    root.position.z -= center.z;
  };

  const autoScaleToMaxDimension = (root, targetMaxDimension) => {
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (!maxDim || !Number.isFinite(maxDim)) return;
    const uniformScale = targetMaxDimension / maxDim;
    root.scale.setScalar(uniformScale);
  };

  // Same visual size for every car regardless of how each GLB was authored.
  const unifiedCarMaxDimension = 4.8;

  const loadedCars = {
    mclaren: null,
    nfs: null,
    lego: null,
  };

  const draggableCars = [];
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  let activePlazaCenter = new THREE.Vector3(0, 0, 0);
  let activePlazaFloorY = 0;
  let activeInnerLimit = 6;

  transformControls.addEventListener("objectChange", () => {
    const obj = transformControls.object;
    if (!obj) return;

    obj.position.y = Math.max(yOffset, obj.position.y);
    obj.position.x = THREE.MathUtils.clamp(
      obj.position.x,
      activePlazaCenter.x - activeInnerLimit,
      activePlazaCenter.x + activeInnerLimit,
    );
    obj.position.z = THREE.MathUtils.clamp(
      obj.position.z,
      activePlazaCenter.z - activeInnerLimit,
      activePlazaCenter.z + activeInnerLimit,
    );
  });

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (transformControls.dragging) return;

    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(draggableCars, true);
    if (!intersects.length) {
      return;
    }

    let root = intersects[0].object;
    while (root.parent && !root.userData?.isDraggableCar) {
      root = root.parent;
    }

    if (root.userData?.isDraggableCar) {
      transformControls.attach(root);
    }
  });

  let carsPlaced = false;
  const placeCars = (plazaCenter, plazaFloorY, plazaSize) => {
    if (carsPlaced) return;
    carsPlaced = true;

    activePlazaCenter = plazaCenter.clone();
    activePlazaFloorY = plazaFloorY;
    activeInnerLimit = THREE.MathUtils.clamp(
      Math.min(plazaSize.x, plazaSize.z) * 0.22,
      4.5,
      7.5,
    );

    // Circular showcase between pillar arches.
    const radius = THREE.MathUtils.clamp(
      Math.min(plazaSize.x, plazaSize.z) * 0.18,
      5.2,
      6.8,
    );
    const baseAngle = -Math.PI * 0.5;

    const showcaseCars = [
      {
        key: "mclaren",
        path: "/mclaren.glb",
        angle: baseAngle,
      },
      {
        key: "nfs",
        path: "/lamborghini.glb",
        angle: baseAngle + Math.PI * 0.5,
      },
      {
        key: "lego",
        path: "/corvette.glb",
        angle: baseAngle + Math.PI,
      },
    ];

    const applyManualCarPositions = () => {
      // Temporary manual tuning section: edit these values whenever needed.
      if (loadedCars.mclaren)
        loadedCars.mclaren.position.set(
          plazaCenter.x,
          yOffset,
          plazaCenter.z - radius,
        );
      if (loadedCars.nfs)
        loadedCars.nfs.position.set(
          plazaCenter.x + radius,
          yOffset,
          plazaCenter.z,
        );
      if (loadedCars.lego)
        loadedCars.lego.position.set(
          plazaCenter.x,
          yOffset,
          plazaCenter.z + radius,
        );
    };

    showcaseCars.forEach((car) => {
      loader.load(
        car.path,
        (gltf) => {
          const carModel = gltf.scene;
          prepareModelVisibility(carModel);
          centerModelXZ(carModel);
          autoScaleToMaxDimension(carModel, unifiedCarMaxDimension);

          const offset = new THREE.Vector3(
            Math.cos(car.angle) * radius,
            0,
            Math.sin(car.angle) * radius,
          );

          const targetPosition = plazaCenter.clone().add(offset);
          carModel.position.set(targetPosition.x, yOffset, targetPosition.z);

          carModel.rotation.y = Math.atan2(offset.x, offset.z) + Math.PI;
          loadedCars[car.key] = carModel;
          carModel.userData.isDraggableCar = true;
          draggableCars.push(carModel);
          scene.add(carModel);

          if (!transformControls.object) {
            transformControls.attach(carModel);
          }

          applyManualCarPositions();
        },
        undefined,
        (error) => {
          console.error(`[Showcase] failed to load ${car.path}:`, error);
        },
      );
    });
  };

  const plazaPath = "/plaza.glb";
  loader.load(
    plazaPath,
    (gltf) => {
      const plaza = gltf.scene;
      plaza.scale.setScalar(1);
      plaza.position.y = 0;
      prepareModelVisibility(plaza);
      scene.add(plaza);

      const plazaBounds = getBounds(plaza);
      const plazaBox = new THREE.Box3().setFromObject(plaza);
      const plazaSphere = plazaBox.getBoundingSphere(new THREE.Sphere());
      const fitDistance = THREE.MathUtils.clamp(
        plazaSphere.radius * 1.02,
        10,
        14,
      );

      controls.target.set(
        plazaBounds.center.x,
        plazaBounds.minY + 1.8,
        plazaBounds.center.z,
      );
      camera.position.set(
        plazaBounds.center.x,
        plazaBounds.minY + 3.8,
        plazaBounds.center.z + fitDistance,
      );
      camera.lookAt(controls.target);
      showcasePurpleLight.position.set(
        plazaBounds.center.x,
        8,
        plazaBounds.center.z,
      );
      showcaseSpotLight.position.set(
        plazaBounds.center.x,
        plazaBounds.minY + 24,
        plazaBounds.center.z,
      );
      showcaseSpotLight.target.position.set(
        plazaBounds.center.x,
        plazaBounds.minY + 1.2,
        plazaBounds.center.z,
      );

      placeCars(plazaBounds.center, 0, plazaBounds.size);
    },
    undefined,
    (error) => {
      console.error(`[Showcase] failed to load ${plazaPath}:`, error);
      placeCars(new THREE.Vector3(0, 0, 0), 0, new THREE.Vector3(18, 2, 18));
    },
  );

  const onResize = () => {
    if (!mount.clientWidth || !mount.clientHeight) return;
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  };

  window.addEventListener("resize", onResize);

  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  // Cleanup function for hot reload and page unload
  const cleanup = () => {
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    if (mount.contains(renderer.domElement)) {
      mount.removeChild(renderer.domElement);
    }
  };

  window.addEventListener("beforeunload", cleanup);
  if (import.meta.hot) {
    import.meta.hot.dispose(cleanup);
  }
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
  // setupThreePlazaShowcase(); // Lazy load when section is visible

  // Lazy load plaza 3D scene
  const plazaSection = document.getElementById("plaza-section");
  if (plazaSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setupThreePlazaShowcase().catch((error) => {
              console.error("Failed to initialize 3D plaza showcase:", error);
            });
            observer.disconnect(); // Only load once
          }
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(plazaSection);
  }

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
