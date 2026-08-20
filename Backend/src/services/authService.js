const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const crypto = require('crypto');
const logger = require('../utils/logger');

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;

class AuthService {
  async register({ name, email, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
    };
  }

  async login({ email, password, deviceInfo, ipAddress }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    return this.createSessionAndTokens(user, deviceInfo, ipAddress);
  }

  async createSessionAndTokens(user, deviceInfo, ipAddress) {
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshTokenPlain = crypto.randomBytes(40).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const refreshTokenHash = await bcrypt.hash(refreshTokenPlain, salt);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

    const session = await Session.create({
      userId: user._id,
      refreshTokenHash,
      deviceInfo,
      ipAddress,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: `${session._id}.${refreshTokenPlain}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }
    };
  }

  async refreshToken({ token, deviceInfo, ipAddress }) {
    if (!token || !token.includes('.')) {
      throw new Error('Invalid refresh token');
    }

    const [sessionId, plainToken] = token.split('.');
    
    const session = await Session.findById(sessionId).populate('userId');
    if (!session || session.revokedAt || new Date() > session.expiresAt) {
      throw new Error('Invalid or expired refresh token');
    }

    const isMatch = await bcrypt.compare(plainToken, session.refreshTokenHash);
    if (!isMatch) {
      // Security concern: token reuse or theft. Revoke session.
      session.revokedAt = new Date();
      await session.save();
      throw new Error('Invalid refresh token');
    }

    // Revoke old session to rotate refresh token
    session.revokedAt = new Date();
    await session.save();

    return this.createSessionAndTokens(session.userId, deviceInfo, ipAddress);
  }

  async logout(sessionId) {
    if (sessionId) {
      await Session.findByIdAndUpdate(sessionId, { revokedAt: new Date() });
    }
  }

  async verifyEmail(token) {
    // Mock implementation
    logger.info(`Email verification token received: ${token}`);
    return true;
  }

  async forgotPassword(email) {
    // Mock implementation
    const user = await User.findOne({ email });
    if (user) {
      logger.info(`Password reset requested for email: ${email}`);
    }
  }

  async resetPassword(token, newPassword) {
    // Mock implementation
    logger.info(`Password reset token received: ${token}`);
    return true;
  }
}

module.exports = new AuthService();
