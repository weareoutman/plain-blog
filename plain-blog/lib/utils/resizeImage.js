import sharp from "sharp";

/**
 * @param {Buffer} image
 * @returns {Promise<Buffer>}
 */
export default function resizeImage(image) {
  return sharp(image).resize(1400, null, { withoutEnlargement: true }).toBuffer();
}
