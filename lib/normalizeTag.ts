/**
 * Normalize a tag string:
 * 1. Lowercase
 * 2. Replace underscores and spaces with hyphens
 * 3. Strip all characters except a-z, 0-9, and hyphen
 * 4. Collapse multiple consecutive hyphens into one
 * 5. Trim leading/trailing hyphens
 */
export function normalizeTag(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[_ ]/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Normalize an array of tags, filtering out empty results and deduplicating.
 */
export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  return tags
    .map((t) => normalizeTag(t.trim()))
    .filter((t) => {
      if (t.length === 0 || seen.has(t)) return false;
      seen.add(t);
      return true;
    });
}
