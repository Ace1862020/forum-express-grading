'use strict';
const faker = require('faker');
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await User.findAll()
    const restaurants = await Restaurant.findAll()

    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 10 }).map((comment, index) =>
      ({
        id: index + 1,
        text: faker.lorem.sentence(),
        UserId: users[Math.floor(Math.random() * 3)].id,
        RestaurantId: restaurants[Math.floor(Math.random() * 50)].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
