import sharp from "sharp";

/**
 * @param {Buffer} image
 * @returns {Promise<{buffer: Buffer, link: boolean}>}
 */
export default async function refineImage(image) {
  const sharpImage = sharp(image);
  const { width, height } = await sharpImage.metadata();
  // For large images show as a link
  const link = width > 500 || height > 500;
  const buffer = await sharpImage.resize(1400, null, { withoutEnlargement: true }).toBuffer();
  return { buffer, link };
}
