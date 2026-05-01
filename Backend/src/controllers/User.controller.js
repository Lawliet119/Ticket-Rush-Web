'use strict'
const UserService = require('../services/user.service')
const { OK } = require('../core/success.response')

class UserController {
  getProfile = async (req, res, next) => {
    new OK({
      message: 'Get profile success',
      metadata: await UserService.getProfile(req.userId)
    }).send(res)
  }

  updateProfile = async (req, res, next) => {
    const payload = req.body;
    if (req.file) {
      payload.avatar_url = req.file.path; // Multer Cloudinary storage puts the URL here
    }
    
    new OK({
      message: 'Profile updated',
      metadata: await UserService.updateProfile(req.userId, payload)
    }).send(res)
  }
}

module.exports = new UserController()
