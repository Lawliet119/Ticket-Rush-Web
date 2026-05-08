'use strict'
const AccessService = require('../services/access.service')
const { OK, CREATED } = require('../core/success.response')
const { setRefreshTokenCookie } = require('../utils/authUtils')

class AccessController {

  /**
   * Get current authenticated user info
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  getMe = async (req, res, next) => {
    new OK({
      message: 'Get current user success',
      metadata: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        full_name: req.user.full_name,
        avatar_url: req.user.avatar_url
      }
    }).send(res)
  }
    
  /**
   * Handle user login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  logIn = async (req, res, next) => {
    const result = await AccessService.logIn(req.body);

    setRefreshTokenCookie(res, result.tokens.refreshToken);
    delete result.tokens.refreshToken;

    new OK({
      message: 'Logged In Successfully!',
      metadata: result
    }).send(res)
  }

  /**
   * Handle user registration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  signUp = async (req, res, next) => {
    const result = await AccessService.signUp(req.body);

    // Set HttpOnly Cookie
    setRefreshTokenCookie(res, result.tokens.refreshToken);

    // Remove refreshToken from the body sent to frontend
    delete result.tokens.refreshToken;

    new CREATED({
      message: 'Registered OK!',
      metadata: result
    }).send(res)
  }

  /**
   * Handle user logout
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  logout = async (req, res, next) => {
    const result = await AccessService.logout(req.userId);
    
    // Clear Cookie
    res.clearCookie('refreshToken');

    new OK({
      message: 'Logout Success!',
      metadata: result
    }).send(res)
  }

  /**
   * Handle forgot password request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  forgotPassword = async (req, res, next) => {
    new OK({
        message: 'Password reset email sent!',
        metadata: await AccessService.forgotPassword(req.body.email)
    }).send(res)
  }

  /**
   * Handle password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  resetPassword = async (req, res, next) => {
    new OK({
        message: 'Password reset successfully!',
        metadata: await AccessService.resetPassword(req.params.token, req.body.password)
    }).send(res)
  }

  /**
   * Handle token refresh using HttpOnly cookie
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  handleRefreshToken = async (req, res, next) => {
    // 1. Read refresh token from HttpOnly cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new (require('../core/error.response').AuthFailureError)('No refresh token provided');
    }

    // 2. Call service to verify + rotate
    const result = await AccessService.handleRefreshToken(refreshToken);

    // 3. Set new HttpOnly cookie with the rotated refresh token
    setRefreshTokenCookie(res, result.tokens.refreshToken)

    // 4. Return only access token to frontend (refresh token stays in cookie only)
    new OK({
      message: 'Token refreshed successfully!',
      metadata: {
        userId: result.userId,
        accessToken: result.tokens.accessToken
      }
    }).send(res)
  }

}

module.exports = new AccessController()
