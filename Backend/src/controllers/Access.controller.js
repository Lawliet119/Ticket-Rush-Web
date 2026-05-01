'use strict'
const AccessService = require('../services/access.service')
const { OK, CREATED } = require('../core/success.response')

class AccessController {

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
    
  logIn = async (req, res, next) => {
    const result = await AccessService.logIn(req.body);

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

  
    delete result.tokens.refreshToken;

    new OK({
      message: 'Logged In Successfully!',
      metadata: result
    }).send(res)
  }

  signUp = async (req, res, next) => {
    const result = await AccessService.signUp(req.body);

    // Set HttpOnly Cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove refreshToken from the body sent to frontend
    delete result.tokens.refreshToken;

    new CREATED({
      message: 'Registered OK!',
      metadata: result
    }).send(res)
  }

  logout = async (req, res, next) => {
    const result = await AccessService.logout(req.userId);
    
    // Clear Cookie
    res.clearCookie('refreshToken');

    new OK({
      message: 'Logout Success!',
      metadata: result
    }).send(res)
  }

  forgotPassword = async (req, res, next) => {
    new OK({
        message: 'Password reset email sent!',
        metadata: await AccessService.forgotPassword(req.body.email)
    }).send(res)
  }

  resetPassword = async (req, res, next) => {
    new OK({
        message: 'Password reset successfully!',
        metadata: await AccessService.resetPassword(req.params.token, req.body.password)
    }).send(res)
  }

}

module.exports = new AccessController()
