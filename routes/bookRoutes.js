const express = require('express');
const bookController = require('./../controllers/bookController');
const authController = require('./../controllers/authController');

const router = express.Router()


router.route('/test')
    .post(
        authController.protect,
        bookController.handleBookFromCLient,
        bookController.testBook
    )

router.route('/')
    .get(bookController.getBooks)
    .post(
        authController.protect,
        bookController.handleImageFromCLient,
        bookController.handleBookFromCLient,
        bookController.createBook
    )

router.route('/:id')
    .get(bookController.getBook)
    .patch(
        authController.protect,
        bookController.handleImageFromCLient,
        bookController.updateBook
    )
    .delete(
        authController.protect,
        bookController.deleteBook
    )
    

module.exports = router