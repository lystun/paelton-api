const express = require('express');
const articleController = require('./../controllers/articleController');

const router = express.Router()

router.route('/')
    .get(articleController.getArticles)
    .post(articleController.createArticle)


module.exports = router