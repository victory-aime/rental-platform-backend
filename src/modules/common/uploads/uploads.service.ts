import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { extractPublicIdFromUrl } from '_config/utils/extract-public-id';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async uploadImage(file: Express.Multer.File, agencyName: string) {
    const safeAgencyName = agencyName.replace(/\s+/g, '-').toLowerCase();
    const folderPath = `cars/${safeAgencyName}`;
    const filename = file.originalname.split('.')[0];

    return this.cloudinary.uploadImage(file.buffer, filename, folderPath);
  }

  async deleteCarImagesByUrls(urls: string[]): Promise<void> {
    for (const url of urls) {
      const publicId = extractPublicIdFromUrl(url);
      if (publicId) {
        try {
          await this.cloudinary.deleteImage(publicId);
        } catch (err) {
          console.error(
            `Erreur suppression image Cloudinary : ${publicId}`,
            err,
          );
        }
      }
    }
  }

  async deleteAllCarImagesOfAgency(agencyName: string): Promise<void> {
    const safeAgencyName = agencyName.replace(/\s+/g, '-').toLowerCase();
    const folderPath = `cars/${safeAgencyName}`;
    await this.cloudinary.deleteFolder(folderPath);
  }

  async uploadUsersImage(file: Express.Multer.File, keycloakId: string) {
    if (!file?.originalname) {
      throw new BadRequestException('Aucun fichier reçu ou fichier invalide');
    }

    const folderPath = `users/${keycloakId}`;
    const filename = file.originalname.split('.')[0];

    return this.cloudinary.uploadImage(file.buffer, filename, folderPath);
  }

  async deleteUsersImage(keycloakId: string): Promise<void> {
    const folderPath = `users/${keycloakId}`;
    await this.cloudinary.deleteFolder(folderPath);
  }
}
