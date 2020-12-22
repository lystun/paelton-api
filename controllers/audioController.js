const sharp = require('sharp');
const multer = require('multer');
const aws = require('./../utils/aws');

const Audio = require('./../models/audioModel');
const AppError = require('./../utils/appError');

const crudhandler = require('./crudhandler');
const catchAsync = require('./../utils/catchAsync');

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else {
        cb(new AppError('Not an Image! Please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.handleImageFromClient = upload.single('image')

const uploadFileToS3 = catchAsync( async (req, fileName) => {

    const uploadedImage = await sharp(req.file.buffer).toFormat('jpeg').jpeg({ quality: 90 })
    
    const params = {
        Bucket: 'paelton/audios',
        Key: fileName,
        Body: uploadedImage
    }
    
    aws.upload(params, (error, data) => {
        if(error){
            next(new AppError(error.message, 400))
        }
    })
})

exports.createAudio = catchAsync( async (req, res, next) => {

    if (!req.file) return next();

    const fileName = `audio-${Date.now()}.mp3`;
    req.body.image = fileName;

    const audio  = await Audio.create(req.body)
    uploadFileToS3(req, fileName)

    res.status(201).json({
        status: "success",
        data: {
            audio
        }
    })
})

exports.updateAudio = catchAsync( async (req, res, next) => {

    if(req.file){
        const fileName = `audio-${Date.now()}.jpeg`;
        req.body.image = fileName;
        uploadImageToS3(req, fileName)
    }

    const audio = await Audio.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!audio) {
        return next(new AppError('No Audio found with that ID', 404));
    }

    res.status(201).json({
        status: "success",
        data: {
            audio
        }
    })
})

exports.getAudios = crudhandler.getAll(Audio)
exports.getAudio = crudhandler.getOne(Audio)
exports.deleteAudio = crudhandler.deleteOne(Audio)


