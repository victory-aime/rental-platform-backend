import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async uploadImage(file: Express.Multer.File, agencyName: string) {
    const safeAgencyName = agencyName.replace(/\s+/g, '-').toLowerCase(); // "My Agency" -> "my-agency"
    const folderPath = `cars/${safeAgencyName}`;
    const filename = file.originalname.split('.')[0];

    return this.cloudinary.uploadImage(file.buffer, filename, folderPath);
  }

  async uploadUsersImage(file: Express.Multer.File) {
    if (!file?.originalname) {
      throw new BadRequestException('Aucun fichier reçu ou fichier invalide');
    }

    const folderPath = `users`;
    const filename = file.originalname.split('.')[0];

    return this.cloudinary.uploadImage(file.buffer, filename, folderPath);
  }
}
