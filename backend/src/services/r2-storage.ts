import { Env } from '../types';
import { generateUUID } from '../utils/crypto';

export interface UploadOptions {
  folder: 'categories' | 'dishes' | 'recipes' | 'general';
  originalFileName?: string;
  contentType?: string;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class R2StorageService {
  constructor(private env: Env) {}

  /**
   * Upload an ArrayBuffer or ReadableStream to Cloudflare R2
   */
  async uploadImage(
    data: ArrayBuffer | Uint8Array,
    options: UploadOptions
  ): Promise<UploadResult> {
    const size = data.byteLength;
    if (size > MAX_FILE_SIZE) {
      throw new Error(`File size (${(size / 1024 / 1024).toFixed(2)}MB) exceeds limit of 5MB`);
    }

    const mimeType = options.contentType || 'image/jpeg';
    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      throw new Error(`Unsupported image type: ${mimeType}. Allowed types: JPEG, PNG, WEBP, AVIF.`);
    }

    // Determine extension
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('avif')) ext = 'avif';

    const uniqueId = generateUUID();
    const objectKey = `wedding-feast/${options.folder}/${uniqueId}.${ext}`;

    await this.env.IMAGES_BUCKET.put(objectKey, data, {
      httpMetadata: {
        contentType: mimeType,
      },
      customMetadata: {
        originalName: options.originalFileName || 'image',
        uploadedAt: new Date().toISOString(),
      },
    });

    // Public URL served via Worker endpoint /api/images/:key
    const publicUrl = `/api/images/${objectKey}`;

    return {
      key: objectKey,
      url: publicUrl,
      size,
      mimeType,
    };
  }

  /**
   * Get an image stream and metadata from R2
   */
  async getImage(key: string): Promise<R2ObjectBody | null> {
    return await this.env.IMAGES_BUCKET.get(key);
  }

  /**
   * Delete an image from R2
   */
  async deleteImage(key: string): Promise<boolean> {
    try {
      await this.env.IMAGES_BUCKET.delete(key);
      return true;
    } catch {
      return false;
    }
  }
}
