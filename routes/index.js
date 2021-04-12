const helpers = require('../_helpers')
const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {

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

  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', authenticated, restController.getRestaurants)
  app.get('/restaurants/feeds', authenticated, restController.getFeeds)
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)
  app.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)

  app.post('/comments', authenticated, commentController.postComment)
  app.delete('/comments/:id', authenticateAdmin, commentController.deleteComment)

  app.get('/users/:id', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

  app.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
  app.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
  app.post('/like/:restaurantId', authenticated, userController.likeRestaurant)
  app.delete('/like/:restaurantId', authenticated, userController.unlikeRestaurant)

  app.get('/admin', authenticateAdmin, (req, res) => { res.redirect('/admin/restaurants') })
  app.get('/admin/restaurants', authenticateAdmin, adminController.getRestaurants)
  app.get('/admin/users', authenticateAdmin, adminController.getUsers) //users
  app.put('/admin/users/:id/toggleAdmin', authenticateAdmin, adminController.toggleAdmin)
  app.get('/admin/restaurants/create', authenticateAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', authenticateAdmin, upload.single('image'), adminController.postRestaurant)
  app.get('/admin/restaurants/:id', authenticateAdmin, adminController.getRestaurant)
  app.get('/admin/restaurants/:id/edit', authenticateAdmin, adminController.editRestaurant)
  app.put('/admin/restaurants/:id', authenticateAdmin, upload.single('image'), adminController.putRestaurant)
  app.delete('/admin/restaurants/:id', authenticateAdmin, adminController.deleteRestaurant)

  app.get('/admin/categories', authenticateAdmin, categoryController.getCategories)
  app.post('/admin/categories', authenticateAdmin, categoryController.postCategories)
  app.get('/admin/categories/:id', authenticateAdmin, categoryController.getCategories)
  app.put('/admin/categories/:id', authenticateAdmin, categoryController.putCategory)
  app.delete('/admin/categories/:id', authenticateAdmin, categoryController.deleteCategory)



  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)
}
