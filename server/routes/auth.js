const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'faculty', 'student'])
    .withMessage('Role must be admin, faculty, or student'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, role, department } = req.body;

    // Only allow admin registration - restrict other roles
    if (role && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin accounts can be created through registration. Teachers and students receive credentials from admin.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'admin',
      department
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info('User registered successfully', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login and first login status
    user.lastLogin = new Date();
    if (user.isFirstLogin) {
      user.isFirstLogin = false;
    }
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info('User logged in successfully', {
      userId: user._id,
      email: user.email,
      lastLogin: user.lastLogin
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        preferences: user.preferences,
        mustChangePassword: user.mustChangePassword,
        isFirstLogin: user.isFirstLogin
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    logger.info('User logged out', { userId: req.user.userId });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile'
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be light or dark'),
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be boolean'),
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const updates = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (updates.name) user.name = updates.name;
    if (updates.department) user.department = updates.department;
    if (updates.preferences) {
      user.preferences = { ...user.preferences, ...updates.preferences };
    }

    await user.save();

    logger.info('User profile updated', { userId: user._id });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        preferences: user.preferences
      }
    });

  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating profile'
    });
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.isFirstLogin = false;
    user.mustChangePassword = false;
    await user.save();

    // Send password change confirmation email
    const emailSent = await emailService.sendPasswordChangeConfirmation({
      name: user.name,
      email: user.email,
      role: user.role
    });

    logger.info('User password changed', {
      userId: user._id,
      emailSent: emailSent
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
      emailSent
    });

  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while changing password'
    });
  }
});

/**
 * @route   PUT /api/auth/first-time-password-change
 * @desc    Change password for first-time users (no current password required)
 * @access  Private
 */
router.put('/first-time-password-change', authenticateToken, [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only allow this for users who must change their password
    if (!user.mustChangePassword && !user.isFirstLogin) {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only for first-time password changes'
      });
    }

    // Update password
    user.password = newPassword;
    user.isFirstLogin = false;
    user.mustChangePassword = false;
    await user.save();

    // Send password change confirmation email
    const emailSent = await emailService.sendPasswordChangeConfirmation({
      name: user.name,
      email: user.email,
      role: user.role
    });

    logger.info('First-time password changed', {
      userId: user._id,
      emailSent: emailSent
    });

    res.json({
      success: true,
      message: 'Password set successfully. You can now use all features of the system.',
      emailSent
    });

  } catch (error) {
    logger.error('First-time password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while changing password'
    });
  }
});

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify if token is valid
 * @access  Private
 */
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role
    }
  });
});

/**
 * Middleware to authenticate JWT token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

/**
 * @route   POST /api/auth/create-user
 * @desc    Admin creates teacher or student account
 * @access  Private (Admin only)
 */
router.post('/create-user', [
  authenticateToken,
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['faculty', 'student'])
    .withMessage('Role must be faculty or student'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create user accounts'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      department,
      mustChangePassword: true,
      isFirstLogin: true
    });

    await user.save();

    logger.info('User created by admin', {
      userId: user._id,
      email: user.email,
      role: user.role,
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: `${role === 'faculty' ? 'Teacher' : 'Student'} account created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      loginCredentials: {
        email: user.email,
        password: password // Send temporary password to admin
      }
    });

  } catch (error) {
    logger.error('User creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating user account'
    });
  }
});

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin only)
 */
router.get('/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view user accounts'
      });
    }

    const { role, department, page = 1, limit = 50 } = req.query;

    // Build filter
    let filter = {};
    if (role && ['admin', 'faculty', 'student'].includes(role)) {
      filter.role = role;
    }
    if (department) {
      filter.department = new RegExp(department, 'i');
    }

    const users = await User.find(filter)
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users'
    });
  }
});

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete user account (Admin only)
 * @access  Private (Admin only)
 */
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete user accounts'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting their own account
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    logger.info('User deleted by admin', {
      deletedUserId: req.params.id,
      deletedBy: req.user.userId
    });

    res.json({
      success: true,
      message: 'User account deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting user'
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset link
 * @access  Public
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const email = req.body.email.toLowerCase();
    let user = await User.findOne({ email });

    // If user not in authentication database, check profiles
    if (!user) {
      // Check Teachers
      const teacher = await Teacher.findOne({ email });
      if (teacher) {
        user = new User({
          name: teacher.name,
          email: teacher.email,
          password: Math.random().toString(36).slice(-10), // Random temp password
          role: 'faculty',
          department: teacher.department,
          mustChangePassword: true,
          isFirstLogin: true
        });
        await user.save();
        logger.info('Auto-created User record for Teacher profile', { email: user.email });
      } else {
        // Check Students
        const student = await Student.findOne({ 'personalInfo.email': email });
        if (student) {
          user = new User({
            name: `${student.personalInfo.firstName} ${student.personalInfo.lastName}`,
            email: student.personalInfo.email,
            password: Math.random().toString(36).slice(-10),
            role: 'student',
            department: student.academicInfo.department,
            mustChangePassword: true,
            isFirstLogin: true
          });
          await user.save();
          logger.info('Auto-created User record for Student profile', { email: user.email });
        }
      }
    }

    // Generate token and OTP (simulation fallback)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = jwt.sign(
      { userId: user?._id || 'dummy', type: 'reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    if (user) {
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000;
      user.resetOTP = otp;
      user.resetOTPExpires = Date.now() + 600000;
      await user.save();
    }

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Handle Simulation Mode (No Email Service)
    if (!emailService.isConfigured()) {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Account not found. Please check your email or register first.'
        });
      }

      logger.warn('Email service not configured. Returning OTP in simulation mode.', { email: req.body.email, otp });
      return res.json({
        success: true,
        message: 'Simulation Mode: Use the verification code below.',
        otp,
        resetLink,
        isSimulation: true,
        userExists: true
      });
    }

    // Handle Live Mode (Email Service Active)
    if (!user) {
      return res.json({ success: true, message: 'If an account exists with this email, a reset link has been sent.' });
    }

    await emailService.sendPasswordResetEmail(user, resetLink);
    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and return reset token
 * @access  Public
 */
router.post('/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Invalid verification code')
], async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const otp = req.body.otp;
    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    res.json({
      success: true,
      message: 'Code verified successfully',
      token: user.resetPasswordToken
    });
  } catch (error) {
    logger.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, password } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'reset') throw new Error('Invalid token type');
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.mustChangePassword = false;
    user.isFirstLogin = false;
    await user.save();

    logger.info('Password reset successful', { userId: user._id });

    res.json({ success: true, message: 'Password has been reset successfully. You can now login with your new password.' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Export the middleware for use in other routes
router.authenticateToken = authenticateToken;

module.exports = router;
