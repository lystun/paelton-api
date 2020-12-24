const express = require('express');
const bookController = require('./../controllers/bookController');
const authController = require('./../controllers/authController');

const router = express.Router()


router.route('/')
    .get(bookController.getBooks)
    .post(
        authController.protect,
        bookController.handleFilesFromClient,
        bookController.createBook
    )

router.route('/:id')
    .get(bookController.getBook)
    .patch(
        authController.protect,
        bookController.handleFilesFromClient,
        bookController.updateBook
    )
    .delete(
        authController.protect,
        bookController.deleteBook
    )
    
module.exports = router