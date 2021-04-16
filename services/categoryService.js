const db = require('../models')
const Category = db.Category

let categoryService = {

  getCategories: (req, res, callback) => {
    return Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then((category) => {
              return res.render('admin/categories', { categories, category: category.toJSON() })
            })
        } else {
          callback({ categories })
        }
      })
  },
  postCategories: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: 'name didn\'t exist' })
    } else {
      return Category.create({
        name: req.body.name
      }).then(category => {
        callback({ status: 'success', message: 'new category was successfully create' })
      })
    }
  },

}

module.exports = categoryService