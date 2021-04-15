const adminService = require('../../service/adminService')
const db = require('../../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const adminController = {

  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.json({ data })
    })
  }

}

module.exports = adminController