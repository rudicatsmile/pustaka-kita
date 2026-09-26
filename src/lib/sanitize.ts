/**
 * HTML Sanitizer utility to prevent XSS in user-submitted book synopses and descriptions
 */

export function sanitizeHtml(input: string): string {
  if (!input) return "";

  // Strip script tags and their content
  let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Strip dangerous event handler attributes (onload, onerror, onclick, etc.)
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, "");
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*[^>\s]+/gi, "");

  // Strip javascript: pseudo-protocols
  cleaned = cleaned.replace(/javascript:[^"'\s]*/gi, "");

  // Strip dangerous embed elements
  cleaned = cleaned.replace(/<(iframe|object|embed|base)\b[^>]*>(.*?)<\/\1>/gi, "");
  cleaned = cleaned.replace(/<(iframe|object|embed|base)\b[^>]*\/?\s*>/gi, "");

  return cleaned.trim();
}

/**
 * Strips all HTML tags to return plain text for metadata description / OG tags
 */
export function stripHtml(input: string): string {
  if (!input) return "";
  return input.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ").trim();
}
