const bcrypt = require('bcryptjs')
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const db = require('../models')
const User = db.User

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if (req.body.password !== req.body.passwordCheck) {
      req.flash('error_messages', '密碼與密碼確認不符!')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } })
        .then(user => {
          if (user) {
            req.flash('error_messages', 'Email 已被註冊!')
            return res.redirect('/signup')
          } else {
            User.create({
              name: req.body.name,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
            }).then(user => {
              req.flash('success_messages', '註冊成功')
              return res.redirect('/signin')
            })
          }
        })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '登入成功！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    User.findByPk(req.params.id, { raw: true })
      .then(user => {
        return res.render('users/user', { user: user })
      })
  },

  editUser: (req, res) => {
    if (req.user.id.toString() !== req.params.id) {
      req.flash('error_messages', 'Sorry! you only modify yourself profile')
      return res.redirect(`/users/${req.user.id}`)
    } else {
      User.findByPk(req.user.id, { raw: true })
        .then(user => {
          return res.render('users/edit', { user: user })
        })
    }
  },

  putUser: (req, res) => {
    const { name } = req.body
    const { file } = req
    if (!name) {
      req.flash('error_messages', 'Please enter your name')
      return res.redirect('back')
    }

    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: name,
              image: file ? img.data.link : user.image
            }).then((user) => {
              req.flash('success_message', 'Avatar updated successfully')
              res.redirect(`/users/${user.id}`)
            })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: name,
            image: user.image
          }).then((user) => {
            req.flash('success_message', 'updated successfully')
            res.redirect(`/users/${user.id}`)
          })
        })
    }
  }
}

module.exports = userController