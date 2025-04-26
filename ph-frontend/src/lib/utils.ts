import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fixes image URLs to ensure they work in production environments
 *
 * @param url The original image URL
 * @returns A fixed URL that should work in production
 */
export function fixImageUrl(url: string | undefined | null): string {
  if (!url) {
    // Return a default avatar if no URL provided
    return 'https://ui-avatars.com/api/?name=User&size=200&background=6366f1&color=ffffff';
  }

  // Check if the URL is a placeholder.co URL, which may not work
  if (url.includes('placehold.co')) {
    // Extract the text parameter if possible
    const textMatch = url.match(/text=([^&]+)/);
    const text = textMatch ? decodeURIComponent(textMatch[1]) : 'Image';

    // Replace with ui-avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&size=200&background=6366f1&color=ffffff`;
  }

  // Fix protocol-relative URLs
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  // If it's an internal Vercel URL, make sure it has the correct domain
  if (url.includes('portfolio-hubspot.vercel.app/_next/image')) {
    // Get the original image URL parameter
    const originalUrlMatch = url.match(/url=([^&]+)/);
    if (originalUrlMatch) {
      const originalUrl = decodeURIComponent(originalUrlMatch[1]);
      return originalUrl; // Return the original URL directly instead of through Next.js image
    }
  }

  return url;
}
