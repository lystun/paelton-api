const aws = require('../utils/aws');
const Article = require('../models/articleModel');
const AppError = require('../utils/appError');

const crudhandler = require('./crudhandler');
const catchAsync = require('../utils/catchAsync');

exports.createArticle = catchAsync(async(req, res, next) => {

    const newArticle = await Article.create(req.body)

    res.status(201).json({
        status: "success",
        data : {
            article: newArticle
        }
    })
})

exports.getArticles = crudhandler.getAll(Article)
exports.getArticle = crudhandler.getOne(Article)