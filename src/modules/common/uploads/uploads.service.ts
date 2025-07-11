import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async uploadImage(file: Express.Multer.File, agencyName: string) {
    const safeAgencyName = agencyName.replace(/\s+/g, '-').toLowerCase();
    const folderPath = `cars/${safeAgencyName}`;
    const filename = file.originalname.split('.')[0];

    return this.cloudinary.uploadImage(file.buffer, filename, folderPath);
  }

  async deleteCarImages(public_id: string) {
    try {
      await this.cloudinary.deleteFolder(`cars/${public_id}`);
    } catch (error) {
      console.error(`Erreur suppression images voiture ${public_id} :`, error);
      throw error;
    }
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
