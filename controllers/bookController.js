const sharp = require('sharp');
const multer = require('multer');
const slugify = require('slugify');
const aws = require('../utils/aws');

const Book = require('../models/bookModel');
const AppError = require('../utils/appError');

const crudHandler = require('./crudHandler');
const catchAsync = require('../utils/catchAsync');

//Handle image upload from client and store in memory.
const multerStorage = multer.memoryStorage() 

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image') || file.mimetype.startsWith('application/pdf') ){
        cb(null, true)
    }else {
        cb(new AppError('Please upload relevant files! Images and PDFs only', 400), false)
    }
}

const multerUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.handleFilesFromClient = multerUpload.fields([
    { name: 'image' },
    { name: 'book' },
])


//upload image to AWS storage bucket
const uploadImageToS3 = catchAsync( async (req, fileName) => {

    const uploadedImage = await sharp(req.files.image[0].buffer).toFormat('jpeg').jpeg({ quality: 90 })
    
    const params = {
        Bucket: 'paelton/books-images',
        Key: fileName,
        Body: uploadedImage
    }
    
    aws.upload(params, (error, data) => {
        if(error){
            next(new AppError(error.message, 400))
        }
    })
})

//upload books to AWS storage bucket
const uploadBookToS3 = (req, fileName) => {
    const params = {
        Bucket: 'paelton/books-pdf',
        Key: fileName,
        Body: req.files.book[0].buffer
    }
    
    aws.upload(params, (error, data) => {
        if(error){
            next(new AppError(error.message, 400))
        }
    })
}

exports.createBook = catchAsync(async (req, res, next) => {
    
    const title_slug = slugify(req.body.title, { lower: true })

    const fileImageName = `book-${title_slug}.jpeg`;
    req.body.image = process.env.AWS_URL+fileImageName;

    const fileBookName = `book-${title_slug}.pdf`;
    req.body.link = process.env.AWS_URL+fileBookName;

    uploadImageToS3(req, fileImageName)
    uploadBookToS3(req, fileBookName)

    const book = await Book.create(req.body)

    res.status(201).json({
        status: "success",
        data : {
            book
        }
    })
})

exports.updateBook = catchAsync(async (req, res, next) => {

    if(req.file){

        if(!req.body.title) next(new AppError('Please enter enter title', 400))

        const title_slug = slugify(req.body.title, { lower: true })

        const fileImageName = `book-${title_slug}.jpeg`;
        req.body.image = process.env.AWS_URL+fileImageName;

        const fileBookName = `book-${title_slug}.pdf`;
        req.body.link = process.env.AWS_URL+fileBookName;

        uploadImageToS3(req, fileImageName)
        uploadBookToS3(req, fileBookName)
    }

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!book) {
        return next(new AppError('No Book found with that ID', 404));
    }

    res.status(201).json({
        status: "success",
        data: {
            book
        }
    })
})

exports.getBooks = crudHandler.getAll(Book)
exports.getBook = crudHandler.getOne(Book)
exports.deleteBook = crudHandler.deleteOne(Book)