const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const user = await authService.register({ name, email, password });
      res.status(201).json({ status: 'success', data: { user } });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const deviceInfo = req.headers['user-agent'] || 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await authService.login({ email, password, deviceInfo, ipAddress });
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(401).json({ status: 'error', message: error.message });
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const deviceInfo = req.headers['user-agent'] || 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await authService.refreshToken({ token: refreshToken, deviceInfo, ipAddress });
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(401).json({ status: 'error', message: error.message });
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken && refreshToken.includes('.')) {
        const [sessionId] = refreshToken.split('.');
        await authService.logout(sessionId);
      }
      res.status(200).json({ status: 'success', message: 'Logged out successfully' });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getMe(req, res, next) {
    // req.user will be populated by the requireAuth middleware
    res.status(200).json({ status: 'success', data: { user: req.user } });
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);
      res.status(200).json({ status: 'success', message: 'Email verified' });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.status(200).json({ status: 'success', message: 'If email exists, a reset link will be sent.' });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      res.status(200).json({ status: 'success', message: 'Password reset successfully' });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new AuthController();
