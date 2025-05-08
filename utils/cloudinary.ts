import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

interface MulterMemoryFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export async function uploadToCloudinary(
  files: MulterMemoryFile[],
  folder = "uploads"
): Promise<string[]> {
  const uploadPromises = files.map((file) => {
    const fileDataURI = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;
    return cloudinary.uploader
      .upload(fileDataURI, { folder })
      .then((result) => result.secure_url);
  });

  return await Promise.all(uploadPromises);
}
