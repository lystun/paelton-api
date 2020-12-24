const aws = require('../utils/aws');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Article = require('../models/articleModel');

exports.readOne = catchAsync(async (req, res, next) => {
    const doc = await Article.findById(req.params.id)

    if (!doc) {
        return next(new AppError(`No Document found with that ID`, 404));
    }

    const params = {
        Bucket: 'paelton',
        // Key: doc.image,
    }

    const response = await aws.listObjectsV2(
        params
    ).promise()

    console.log(response);

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});

exports.readAll = catchAsync(async (req, res, next) => {

    const doc = await Article.findById(req.params.id)

    if (!doc) {
        return next(new AppError(`No Document found with that ID`, 404));
    }
  
    const params = {
        Bucket: 'paelton/articles-images',
        Key: fileName,
        Body: uploadedFile
    }
    
    aws.getObject(params, (error, data) => {
        if(error){
            next(new AppError(error.message, 400))
        }
    })

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });

});