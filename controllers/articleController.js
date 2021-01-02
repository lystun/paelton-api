const sharp = require('sharp');
const multer = require('multer');
const aws = require('../utils/aws');

const Article = require('../models/articleModel');
const AppError = require('../utils/appError');

const crudHandler = require('./crudHandler');
const catchAsync = require('../utils/catchAsync');

//Handle image upload from client and store in memory.
const multerStorage = multer.memoryStorage()
const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else {
        cb(new AppError('Not an Image! Please upload only images', 400), false)
    }
}

const multerUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.handleImageFromCLient = multerUpload.single('image')

//upload files to AWS storage bucket
const uploadFileToS3 = catchAsync( async (req, fileName) => {

    const uploadedFile = await sharp(req.file.buffer).toFormat('jpeg').jpeg({ quality: 90 })
    
    const params = {
        Bucket: 'paelton/articles-images',
        Key: fileName,
        Body: uploadedFile
    }
    
    aws.upload(params, (error, data) => {
        if(error){
            next(new AppError(error.message, 400))
        }
    })
})

exports.createArticle = catchAsync(async (req, res, next) => {

    if (!req.file) return next();

    const fileName = `article-${Date.now()}.jpeg`;
    req.body.image = process.env.AWS_URL+fileName;

    const article = await Article.create(req.body)
    // uploadFileToS3(req, fileName)

    res.status(201).json({
        status: "success",
        data : {
            article
        }
    })
})

exports.updateArticle = catchAsync(async (req, res, next) => {

    if(req.file){
        const fileName = `article-${Date.now()}.jpeg`;
        req.body.image = process.env.AWS_URL+fileName;
        uploadFileToS3(req, fileName)
    }

    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!article) {
        return next(new AppError('No Article found with that ID', 404));
    }

    res.status(201).json({
        status: "success",
        data: {
            article
        }
    })
})

exports.getArticles = crudHandler.getAll(Article)
exports.getArticle = crudHandler.getOne(Article)
exports.deleteArticle = crudHandler.deleteOne(Article)