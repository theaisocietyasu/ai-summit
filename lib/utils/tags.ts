/**
 * Tag normalization utilities for event categorization
 */

/**
 * Normalizes a tag to lowercase, alphanumeric + hyphens
 * - Converts to lowercase
 * - Replaces spaces and underscores with hyphens
 * - Removes non-alphanumeric characters except hyphens
 * - Removes consecutive hyphens
 * - Trims leading/trailing hyphens
 */
export function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeTags(tags: string[]): string[] {
  return tags
    .map(normalizeTag)
    .filter(tag => tag.length > 0);
}

export const SPECIAL_TAGS = {
  NETWORKING: 'networking',
  WORKSHOPS: 'workshops',
  RESOURCES: 'resources',
} as const;
