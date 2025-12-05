/**
 * Escapes HTML characters to prevent XSS attacks
 */
export function escapeHtml(unsafe: string): string {
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
export function calculateItemsPerPage(viewportWidth?: number): number {
  const width = viewportWidth ?? window.innerWidth;
  if (width >= 1920) return 12; // 4 columns * 3 rows
  if (width >= 1600) return 9; // 3 columns * 3 rows
  if (width >= 1200) return 6; // 2 columns * 3 rows
  return 3; // 1 column * 3 rows
}

export interface MenuItem {
  name: string;
  description: string;
  price: string;
  labels: string;
}

/**
 * Retrieves all menu items from settings
 * Note: This function depends on getSetting from @screenly/edge-apps
 */
export function getMenuItems(getSetting: (key: string) => any): MenuItem[] {
  const menuItems: MenuItem[] = [];

  for (let i = 1; i <= 25; i++) {
    const itemNum = String(i).padStart(2, "0");
    const name = getSetting(`item_${itemNum}_name`);
    if (name?.trim()) {
      menuItems.push({
        name: name.trim(),
        description: getSetting(`item_${itemNum}_description`)?.trim() || "",
        price: getSetting(`item_${itemNum}_price`)?.trim() || "",
        labels: getSetting(`item_${itemNum}_labels`)?.trim() || "",
      });
    }
  }

  return menuItems;
}
