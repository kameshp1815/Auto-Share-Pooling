// central API configuration for client
// Reads from Vite env: VITE_BACKEND_URL
const raw = import.meta.env.VITE_BACKEND_URL || "";
// normalize: remove trailing slash
const trimmed = typeof raw === "string" ? raw.replace(/\/$/, "") : "";

export const API_BASE_URL = trimmed;

// Optional: build absolute file URL from backend relative upload paths
export function fileUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path)
    .replace(/^[A-Za-z]:.*uploads[\\\/]*/i, "uploads/")
    .replace(/\\/g, "/");
  const withLeading = normalized.startsWith("uploads/")
    ? `/${normalized}`
    : normalized.startsWith("/uploads/")
    ? normalized
    : `/uploads/${normalized}`;
  return `${API_BASE_URL}${withLeading}`;
}
