// src/utils/uploadToCloudinary.ts
import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";

export const uploadToCloudinary = (fileBuffer: Buffer): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "usuarios" }, // 👈 opcional, puedes cambiar la carpeta
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
