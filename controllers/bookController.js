const sharp = require('sharp');
const multer = require('multer');
const slugify = require('slugify');
const aws = require('../utils/aws');

const Book = require('../models/bookModel');
const AppError = require('../utils/appError');

const crudhandler = require('./crudhandler');
const catchAsync = require('../utils/catchAsync');

//Handle image upload from client and store in memory.
const multerStorage = multer.memoryStorage()
const multerFilterImage = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else {
        cb(new AppError('Not an Image! Please upload only images', 400), false)
    }
}

const multerFilterBook = (req, file, cb) => {
    if(file.mimetype.startsWith('application/pdf')){
        cb(null, true)
    }else {
        cb(new AppError('Please upload files in PDF Format only', 400), false)
    }
}

const multerUploadImage = multer({
    storage: multerStorage,
    fileFilter: multerFilterImage,
})

const multerUploadBook = multer({
    storage: multerStorage,
    fileFilter: multerFilterBook,
})

exports.handleImageFromCLient = multerUploadImage.single('image')
exports.handleBookFromCLient = multerUploadBook.single('book')

//upload files to AWS storage bucket
const uploadFileToS3 = catchAsync( async (req, fileName) => {

    const uploadedFile = await sharp(req.file.buffer).toFormat('jpeg').jpeg({ quality: 90 })
    
    const params = {
        Bucket: 'paelton/books-images',
        Key: fileName,
        Body: uploadedFile
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
        Body: req.file.buffer
    }
    
    aws.upload(params, (error, data) => {
        if(error){
            next(new AppError(error.message, 400))
        }
    })
}

exports.testBook = catchAsync(async (req, res, next) => {

    if (!req.file) return next();

    const title_slug = slugify(req.body.title, { lower: true })
    const fileName =`book-${title_slug}.pdf`;
    
    req.body.link = fileName

    const book = await Book.create(req.body)
    uploadBookToS3(req, fileName)

    res.status(201).json({
        status: "success",
        data : {
            book
        }
    })
})

exports.createBook = catchAsync(async (req, res, next) => {
    
    // if (!req.file) return next();
    console.log(req.file);


    // const title_slug = slugify(req.body.title, { lower: true })

    // const fileImageName = `book-${title_slug}.jpeg`;
    // req.body.image = fileImageName;

    // const fileBookName = `book-${title_slug}.pdf`;
    // req.body.link = fileBookName;

    // console.log(title_slug);

    // const book = await Book.create(req.body)
    
    // uploadFileToS3(req, fileImageName)
    // uploadBookToS3(req, fileBookName)

    res.status(201).json({
        status: "success",
        data : {
            // book
        }
    })
})

exports.updateBook = catchAsync(async (req, res, next) => {

    if(req.file){
        const fileName = `book-${Date.now()}.jpeg`;
        req.body.image = fileName;
        uploadFileToS3(req, fileName)
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

exports.getBooks = crudhandler.getAll(Book)
exports.getBook = crudhandler.getOne(Book)
exports.deleteBook = crudhandler.deleteOne(Book)