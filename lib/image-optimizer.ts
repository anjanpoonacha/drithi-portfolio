/**
 * Image optimization and compression utilities
 * @module image-optimizer
 */

import { IMAGE_OPTIMIZATION, BLOB_STORAGE } from './constants';

/**
 * Compress image before upload (browser-based)
 * @param file - Original image file
 * @returns Compressed image file
 */
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Resize if too large
        if (width > IMAGE_OPTIMIZATION.MAX_WIDTH) {
          height = (height * IMAGE_OPTIMIZATION.MAX_WIDTH) / width;
          width = IMAGE_OPTIMIZATION.MAX_WIDTH;
        }
        if (height > IMAGE_OPTIMIZATION.MAX_HEIGHT) {
          width = (width * IMAGE_OPTIMIZATION.MAX_HEIGHT) / height;
          height = IMAGE_OPTIMIZATION.MAX_HEIGHT;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          IMAGE_OPTIMIZATION.QUALITY
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

/**
 * Validate file size and type
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!IMAGE_OPTIMIZATION.FORMATS.includes(file.type as any)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPG, PNG, or WebP images.',
    };
  }
  
  if (file.size > BLOB_STORAGE.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${BLOB_STORAGE.MAX_FILE_SIZE / 1024 / 1024}MB.`,
    };
  }
  
  return { valid: true };
}

/**
 * Format bytes to human readable string
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
