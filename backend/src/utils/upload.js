import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadImage(file) {
  if (!file) return null;
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "small-shop-products" }, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
    stream.end(file.buffer);
  });

  return result.secure_url;
}
