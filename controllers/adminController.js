const adminService = require('../services/adminService')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const adminController = {
  // 後首頁:refactor
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },

  // 後台使用者名單頁
  getUsers: async (req, res) => {
    return User.findAll({ raw: true }).then((users) => {
      return res.render('admin/users', { users: users })
    })
  },

  // 更改管理權限
  toggleAdmin: (req, res) => {
    User.findByPk(req.params.id).then((user) => {
      return user.update({
        isAdmin: user.isAdmin ? 0 : 1
      }).then((user) => {
        req.flash('success_messages', `${user.name} has been successfully updated to ${user.isAdmin ? 'admin' : 'user'}`)
        return res.redirect('/admin/users')
      })
    })
  },

  // 建立餐廳頁
  createRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return res.render('admin/create', { categories: categories })
    })
  },
  // 建立新餐廳
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },

  // 查看特定餐廳頁
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
  },

  // 取得編輯特定餐廳表單
  editRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        return res.render('admin/create', {
          restaurant: restaurant.toJSON(),
          categories: categories
        })
      })
    })
  },
  // 編輯並更新
  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },

  // 刪除一筆餐廳
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  }

}

module.exports = adminController