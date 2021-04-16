const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const helpers = require('../_helpers')
const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })


const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  res.redirect('/signin')
}

const authenticateAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)


router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticateAdmin, commentController.deleteComment)

router.get('/users/top', authenticated, userController.getTopUser)
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
router.post('/like/:restaurantId', authenticated, userController.likeRestaurant)
router.delete('/like/:restaurantId', authenticated, userController.unlikeRestaurant)

router.get('/admin', authenticateAdmin, (req, res) => { res.redirect('/admin/restaurants') })
router.get('/admin/restaurants', authenticateAdmin, adminController.getRestaurants)
router.get('/admin/users', authenticateAdmin, adminController.getUsers)
router.put('/admin/users/:id/toggleAdmin', authenticateAdmin, adminController.toggleAdmin)
router.get('/admin/restaurants/create', authenticateAdmin, adminController.createRestaurant)
router.post('/admin/restaurants', authenticateAdmin, upload.single('image'), adminController.postRestaurant)
router.get('/admin/restaurants/:id', authenticateAdmin, adminController.getRestaurant)
router.get('/admin/restaurants/:id/edit', authenticateAdmin, adminController.editRestaurant)
router.put('/admin/restaurants/:id', authenticateAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticateAdmin, adminController.deleteRestaurant)

router.get('/admin/categories', authenticateAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticateAdmin, categoryController.postCategories)
router.get('/admin/categories/:id', authenticateAdmin, categoryController.getCategories)
router.put('/admin/categories/:id', authenticateAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticateAdmin, categoryController.deleteCategory) //refactor

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)

module.exports = router