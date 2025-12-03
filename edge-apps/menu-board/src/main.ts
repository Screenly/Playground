import { getSetting, signalReady } from "@screenly/edge-apps";

interface MenuSettings {
  menu_title: string;
  accent_color: string;
  background_image: string;
  logo_url: string;
  slide_duration: string;
  [key: string]: string;
}

interface MenuItem {
  name: string;
  description: string;
  price: string;
  labels: string;
}

const DEFAULT_SETTINGS: MenuSettings = {
  menu_title: "Today's Menu",
  accent_color: "rgba(255, 255, 255, 0.95)",
  background_image: "assets/pizza.png",
  logo_url: "assets/screenly_food.svg",
  slide_duration: "10",
};

/**
 * Escapes HTML characters to prevent XSS attacks
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Calculates how many items should be displayed per page based on viewport width
 */
function calculateItemsPerPage(): number {
  const viewportWidth = window.innerWidth;
  if (viewportWidth >= 1920) return 12; // 4 columns * 3 rows
  if (viewportWidth >= 1600) return 9; // 3 columns * 3 rows
  if (viewportWidth >= 1200) return 6; // 2 columns * 3 rows
  return 3; // 1 column * 3 rows
}

/**
 * Retrieves all menu items from settings
 */
function getMenuItems(settings: MenuSettings): MenuItem[] {
  const menuItems: MenuItem[] = [];

  for (let i = 1; i <= 25; i++) {
    const name = settings[`item_${i}_name`];
    if (name?.trim()) {
      menuItems.push({
        name: name.trim(),
        description: settings[`item_${i}_description`]?.trim() || "",
        price: settings[`item_${i}_price`]?.trim() || "",
        labels: settings[`item_${i}_labels`]?.trim() || "",
      });
    }
  }

  return menuItems;
}

/**
 * Renders a specific page of menu items
 */
function renderPage(
  page: number,
  menuItems: MenuItem[],
  itemsPerPage: number,
): void {
  const start = page * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = menuItems.slice(start, end);

  const menuGrid = document.getElementById("menuGrid");
  if (!menuGrid) return;

  const fragment = document.createDocumentFragment();
  pageItems.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "menu-item";

    let labelsHtml = "";
    if (item.labels) {
      const labels = item.labels.split(",").map((label) => label.trim());
      labelsHtml = `
                <div class="labels">
                    ${labels.map((label) => `<span class="label ${label.toLowerCase()}">${escapeHtml(label)}</span>`).join("")}
                </div>
            `;
    }

    itemElement.innerHTML = `
            <h2>${escapeHtml(item.name)}</h2>
            <div class="content">
                <p>${escapeHtml(item.description)}</p>
            </div>
            <div class="price">${escapeHtml(item.price)}</div>
            ${labelsHtml}
        `;
    fragment.appendChild(itemElement);
  });

  // Update active page dot
  document.querySelectorAll(".page-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === page);
  });

  // Fade out, update content, fade in
  menuGrid.classList.add("fade-out");
  setTimeout(() => {
    menuGrid.innerHTML = "";
    menuGrid.appendChild(fragment);
    menuGrid.classList.remove("fade-out");
  }, 500);
}

/**
 * Creates pager dots for page navigation
 */
function createPager(totalPages: number): void {
  const pager = document.getElementById("pager");
  if (!pager) return;

  if (totalPages > 1) {
    pager.style.display = "flex";
    pager.innerHTML = Array(totalPages)
      .fill(null)
      .map(
        (_, i) =>
          `<div class="page-dot ${i === 0 ? "active" : ""}" data-page="${i}"></div>`,
      )
      .join("");
  } else {
    pager.style.display = "none";
  }
}

/**
 * Sets up auto-advance functionality for multiple pages
 */
function setupAutoAdvance(
  totalPages: number,
  menuItems: MenuItem[],
  itemsPerPage: number,
  slideDuration: number,
): void {
  if (totalPages <= 1) return;

  let currentPage = 0;
  setInterval(() => {
    currentPage = (currentPage + 1) % totalPages;
    renderPage(currentPage, menuItems, itemsPerPage);
  }, slideDuration * 1000);
}

/**
 * Initializes the menu board application
 */
function initializeMenuBoard(isDev = false): void {
  try {
    const settings = isDev
      ? DEFAULT_SETTINGS
      : {
          ...DEFAULT_SETTINGS,
          ...(screenly.settings as MenuSettings),
        };

    // Validate required settings
    if (!settings.menu_title) {
      throw new Error("Menu title is required");
    }

    // Set custom accent color if provided
    if (settings.accent_color) {
      document.documentElement.style.setProperty(
        "--accent-color",
        settings.accent_color,
      );
      document.documentElement.style.setProperty(
        "--purple-tint",
        settings.accent_color + "20",
      );
    }

    // Set background image with error handling
    const bgImage = document.getElementById("background") as HTMLImageElement;
    if (bgImage) {
      bgImage.onerror = () => {
        console.error("Failed to load background image");
        bgImage.style.display = "none";
      };
      bgImage.src = settings.background_image;
      bgImage.style.display = "block";
    }

    // Handle logo with error handling
    const logoElement = document.getElementById("logo") as HTMLImageElement;
    if (logoElement) {
      logoElement.onerror = () => {
        console.error("Failed to load logo");
        logoElement.style.display = "none";
        const header = document.querySelector(".header") as HTMLElement;
        if (header) {
          header.style.marginTop = "var(--spacing-md)";
        }
      };
      if (settings.logo_url) {
        logoElement.src = settings.logo_url;
        logoElement.style.display = "block";
      }
    }

    // Set menu title
    const titleElement = document.getElementById("title");
    if (titleElement) {
      titleElement.textContent = settings.menu_title;
    }

    // Get all menu items
    const menuItems = getMenuItems(settings);

    // Calculate items per page based on viewport
    const itemsPerPage = calculateItemsPerPage();
    const totalPages = Math.ceil(menuItems.length / itemsPerPage);

    // Create pager dots
    createPager(totalPages);

    // Initial render
    renderPage(0, menuItems, itemsPerPage);

    // Setup auto-advance
    const slideDuration =
      parseInt(settings.slide_duration) ||
      parseInt(DEFAULT_SETTINGS.slide_duration);
    setupAutoAdvance(totalPages, menuItems, itemsPerPage, slideDuration);

    // Signal that the app is ready
    if (!isDev) {
      signalReady();
    }
  } catch (error) {
    console.error("Failed to initialize menu board:", error);
    const errorState = document.getElementById("errorState");
    const menuGrid = document.getElementById("menuGrid");
    if (errorState) {
      errorState.style.display = "block";
    }
    if (menuGrid) {
      menuGrid.style.display = "none";
    }
  }
}

// Initialize when the page loads
window.addEventListener("load", () => {
  try {
    if (typeof screenly !== "undefined") {
      initializeMenuBoard(false);
    } else {
      console.warn("Screenly not found, running in dev mode...");
      initializeMenuBoard(true);
    }
  } catch (error) {
    console.error("Critical initialization error:", error);
    const errorState = document.getElementById("errorState");
    if (errorState) {
      errorState.style.display = "block";
    }
  }
});
