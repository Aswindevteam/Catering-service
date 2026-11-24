import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  readonly fallbackDishImage = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
  readonly fallbackCategoryImage = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80';

  /**
   * Resolves any image URL (relative or absolute) to a fully qualified URL
   * that the browser can successfully load from anywhere (localhost, Cloudflare Pages, etc.).
   */
  resolveUrl(url: string | null | undefined, fallbackType: 'dish' | 'category' = 'dish'): string {
    if (!url || typeof url !== 'string' || !url.trim()) {
      return fallbackType === 'category' ? this.fallbackCategoryImage : this.fallbackDishImage;
    }

    const trimmed = url.trim();

    // Already an absolute HTTP/HTTPS or data URI
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }

    // Relative URL (e.g. /api/images/...)
    let backendOrigin = 'https://wedding-feast-backend.aswinsamidurai.workers.dev';
    try {
      const apiEndpoint = environment.apiUrl || '';
      if (apiEndpoint.startsWith('http://') || apiEndpoint.startsWith('https://')) {
        const parsed = new URL(apiEndpoint);
        backendOrigin = parsed.origin;
      }
    } catch {
      backendOrigin = 'https://wedding-feast-backend.aswinsamidurai.workers.dev';
    }

    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${backendOrigin}${cleanPath}`;
  }

  /**
   * Graceful fallback handler for img (error) events to prevent broken icon display
   */
  handleImageError(event: Event, fallbackType: 'dish' | 'category' = 'dish') {
    const target = event.target as HTMLImageElement;
    if (target) {
      const fallback = fallbackType === 'category' ? this.fallbackCategoryImage : this.fallbackDishImage;
      if (target.src !== fallback) {
        target.src = fallback;
      }
    }
  }
}
