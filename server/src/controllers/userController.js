import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';

/**
 * Get current user profile details
 * GET /api/users/profile
 */
export const getProfile = async (req, res) => {
  try {
    // req.user is already fetched in authMiddleware (without password)
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || ''
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat mengambil profil pengguna.'
    });
  }
};

/**
 * Update current user profile details
 * PUT /api/users/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      // Check if email already exists on another user
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar pada akun lain.'
        });
      }
      updateData.email = email.toLowerCase();
    }
    if (phone !== undefined) updateData.phone = phone;
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      }
    });

    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || ''
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat memperbarui profil pengguna.'
    });
  }
};
