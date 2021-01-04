const sharp = require('sharp');
const multer = require('multer');
const aws = require('../utils/aws');

const Testimonial = require('../models/testimonialModel');
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
        Bucket: 'paelton/testimonials-images',
        Key: fileName,
        Body: uploadedFile
    }
    
    aws.upload(params, (error, data) => {
        if(error){
            next(new AppError(error.message, 400))
        }
    })
})

exports.createTestimonial = catchAsync(async (req, res, next) => {

    console.log(req.body);

    if (!req.file) return next();

    const fileName = `testimonial-${Date.now()}.jpeg`;
    req.body.image = process.env.AWS_URL+'/testimonials-images/'+fileName;

    const testimonial = await Testimonial.create(req.body)
    uploadFileToS3(req, fileName)

    res.status(201).json({
        status: "success",
        data : {
            testimonial
        }
    })
})

exports.updateTestimonial = catchAsync(async (req, res, next) => {

    if(req.file){
        const fileName = `testimonial-${Date.now()}.jpeg`;
        req.body.image = process.env.AWS_URL+'/testimonials-images/'+fileName;
        uploadFileToS3(req, fileName)
    }

    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!testimonial) {
        return next(new AppError('No Testimonial found with that ID', 404));
    }

    res.status(201).json({
        status: "success",
        data: {
            testimonial
        }
    })
})

exports.getTestimonials = crudHandler.getAll(Testimonial)
exports.getTestimonial = crudHandler.getOne(Testimonial)
exports.deleteTestimonial = crudHandler.deleteOne(Testimonial)