const bcrypt = require('bcryptjs')
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const helper = require('../_helpers')

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

    User.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [{ model: Comment, include: [Restaurant] }]
    })
      .then((user) => {
        Comment.findAndCountAll({
          raw: true,
          nest: true,
          where: { UserId: req.params.id },
          include: [Restaurant]
        }).then((comment) => {
          return res.render('users/user', { user: user, commentNumber: comment.count, comments: comment.rows })
        })
      })
  },

  editUser: (req, res) => {
    const reqUser = helper.getUser(req)
    if (reqUser.id.toString() !== req.params.id) {
      req.flash('error_messages', 'Sorry! you only modify yourself profile')
      return res.redirect(`/users/${req.params.id}`)
    } else {
      User.findByPk(reqUser.id, { raw: true })
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
  },

  addFavorite: (req, res) => {
    const reqUser = helper.getUser(req)
    return Favorite.create({
      UserId: reqUser.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return res.redirect('back')
    })
  },

  removeFavorite: (req, res) => {
    const reqUser = helper.getUser(req)
    return Favorite.findOne({
      where: {
        UserId: reqUser.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(favorite => {
      favorite.destroy()
        .then((restaurant) => {
          return res.redirect('back')
        })
    })
  },

  likeRestaurant: (req, res) => {
    const reqUser = helper.getUser(req)
    return Like.create({
      UserId: reqUser.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return res.redirect('back')
    })
  },

  unlikeRestaurant: (req, res) => {
    const reqUser = helper.getUser(req)
    return Like.findOne({
      where: {
        UserId: reqUser.id,
        RestaurantId: req.params.restaurantId
      }
    }).then((like) => {
      like.destroy()
        .then(restaurant => {
          return res.redirect('back')
        })
    })
  },

  getTopUser: (req, res) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      const reqUser = helper.getUser(req)
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: reqUser.Followings.map(d => d.id).includes(user.dataValues.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  },

  addFollowing: (req, res) => {
    const reqUser = helper.getUser(req)
    return Followship.create({
      followerId: reqUser.id,
      followingId: req.params.userId
    })
      .then(followship => {
        return res.redirect('back')
      })
  },

  removeFollowing: (req, res) => {
    const reqUser = helper.getUser(req)
    return Followship.findOne({
      where: {
        followerId: reqUser.id,
        followingId: req.params.userId
      }
    })
      .then(followship => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      })
  },

}

module.exports = userController