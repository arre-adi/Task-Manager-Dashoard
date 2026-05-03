const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function getAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return `${API_URL}${avatarUrl}`;
}
