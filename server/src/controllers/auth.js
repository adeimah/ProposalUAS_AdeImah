import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Register a new user.
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const emailExists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Registrasi gagal! Email sudah terdaftar.'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: '' // Initial phone number as empty string
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.'
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat melakukan registrasi.'
    });
  }
};

/**
 * Login user.
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Login gagal! Email atau password salah.'
      });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Login gagal! Email atau password salah.'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    // Return exact user session structure expected by frontend (AppContent/AppContext)
    return res.status(200).json({
      success: true,
      message: `Selamat datang kembali, ${user.name}!`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        token: token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat melakukan login.'
    });
  }
};

/**
 * Get current user profile.
 * GET /api/auth/profile
 */
export const getProfile = async (req, res) => {
  try {
    // req.user is already populated by authMiddleware (excluding the password)
    return res.status(200).json({
      success: true,
      message: 'Data profil berhasil diambil.',
      data: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat mengambil data profil.'
    });
  }
};
