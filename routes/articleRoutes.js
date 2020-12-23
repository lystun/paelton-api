const express = require('express');
const articleController = require('./../controllers/articleController');
const authController = require('./../controllers/authController');

const router = express.Router()

router.route('/')
    .get(articleController.getArticles)
    .post(
        authController.protect,
        articleController.handleImageFromCLient,
        articleController.createArticle
    )
        
router.route('/:id')
    .get(articleController.getArticle)
    .patch(
        authController.protect,
        articleController.handleImageFromCLient,
        articleController.updateArticle
    )
    .delete(
        authController.protect,
        articleController.deleteArticle
    )
    

module.exports = router