import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';

@Injectable()
export class StorageService {
  constructor() {
    // Cloudinary configuration would normally go here or in a module
    // For now, we provide the structure.
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    filePath: string,
  ): Promise<{ url: string; duration: number }> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'video', // 'video' covers audio files in Cloudinary
        folder: 'band-sync/recordings',
      });

      return {
        url: result.secure_url,
        duration: result.duration || 0,
      };
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new Error('Failed to upload file to cloud.');
    } finally {
      // Clean up local temp file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
}
