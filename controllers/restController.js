const db = require('../models')
const helper = require('../_helpers')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const Comment = db.Comment
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }

    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit
    }).then(result => {
      const reqUser = helper.getUser(req)
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > 1 ? pages : page + 1

      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name,
        isFavorited: reqUser.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: reqUser.LikedRestaurants.map(l => l.id).includes(r.id)
      }))
      Category.findAll({
        raw: true,
        nest: true
      }).then((categories) => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
    })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      if (!restaurant) {
        req.flash('error_messages', '沒有此餐廳')
        return res.redirect('/restaurants')
      }
      const reqUser = helper.getUser(req)
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(reqUser.id)
      const isLiked = restaurant.LikedUsers.map(l => l.id).includes(reqUser.id)
      restaurant.increment('viewCounts')
      res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        isFavorited: isFavorited,
        isLiked: isLiked
      })
    })
  },

  getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', {
        restaurants: restaurants,
        comments: comments
      })
    })
  },

  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] }
      ]
    }).then((restaurant) => {
      return res.render('dashboard', { restaurant: restaurant.toJSON() })
    })
  },

  getTopRestaurants: (req, res) => {
    const reqUser = helper.getUser(req)

    return Promise.all([
      User.findByPk(reqUser.id, {
        include: [{ model: Restaurant, as: 'FavoritedRestaurants' }]
      }),
      Restaurant.findAll({
        include: [
          Category,
          { model: User, as: 'FavoritedUsers' }
        ]
      })
    ])
      .then(([users, restaurants]) => {
        //console.log('users1:', users.dataValues.FavoritedRestaurants.length)
        restaurants = restaurants.map((restaurant) => ({
          ...restaurant.dataValues,
          description: restaurant.dataValues.description.substring(0, 50),
          favoritedCount: restaurant.FavoritedUsers.length,
          isFavorited: users.FavoritedRestaurants.map(d => d.id).includes(restaurant.dataValues.id)
        }))
        restaurants = restaurants.sort((a, b) => b.favoritedCount - a.favoritedCount)
        return res.render('topRestaurant', { restaurants: restaurants })
      })
  },

}

module.exports = restController