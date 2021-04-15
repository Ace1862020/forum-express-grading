const categoryService = require('../../services/categoryService.js')
const db = require('../../models')
const Category = db.Category

let categoryController = {

  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.json({ data })
    })
  },


}

module.exports = categoryController