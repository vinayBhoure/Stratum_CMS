const cloudinary = require('../config/cloudinary');
const prisma = require('../lib/prisma');

const RESUME_SELECT = {
  id: true,
  name: true,
  pdfUrl: true,
  updatedAt: true,
};

/**
 * Uploads a file buffer to Cloudinary and returns the secure URL.
 *
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} mimeType
 * @returns {Promise<string>} Cloudinary secure URL
 */
async function uploadToCloudinary(buffer, originalName, mimeType) {
  const resourceType = mimeType === 'application/pdf' ? 'raw' : 'image';

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: resourceType, public_id: originalName, overwrite: true },
      (error, result) => {
        if (error) { reject(error); } else { resolve(result.secure_url); }
      }
    ).end(buffer);
  });
}

/**
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
async function getResume(userId) {
  return prisma.resume.findUnique({ where: { userId }, select: RESUME_SELECT });
}

/**
 * Uploads file, deletes old Cloudinary asset if exists, upserts DB row.
 *
 * @param {string} userId
 * @param {import('multer').File} file
 * @returns {Promise<Object>}
 */
async function upsertResume(userId, file) {
  const pdfUrl = await uploadToCloudinary(file.buffer, file.originalname, file.mimetype);

  return prisma.resume.upsert({
    where: { userId },
    update: { name: file.originalname, pdfUrl },
    create: { userId, name: file.originalname, pdfUrl },
    select: RESUME_SELECT,
  });
}

/**
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function deleteResume(userId) {
  const result = await prisma.resume.deleteMany({ where: { userId } });
  return result.count > 0;
}

module.exports = { getResume, upsertResume, deleteResume };
