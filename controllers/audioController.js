const slugify = require('slugify');
const multer = require('multer');
const aws = require('./../utils/aws');

const Audio = require('./../models/audioModel');
const AppError = require('./../utils/appError');

const crudhandler = require('./crudhandler');
const catchAsync = require('./../utils/catchAsync');

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('audio')){
        cb(null, true)
    }else {
        cb(new AppError('Please upload an audio file', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.handleAudioFromClient = upload.single('audio')

const uploadFileToS3 = catchAsync( async (req, fileName) => {

    const params = {
        Bucket: 'paelton/audios',
        Key: fileName,
        Body: req.file.buffer
    }
    
    aws.upload(params, (error, data) => {
        if(error){
            next(new AppError(error.message, 400))
        }
    })
})

exports.createAudio = catchAsync( async (req, res, next) => {

    if (!req.file) return next();

    const title_slug = slugify(req.body.title, { lower: true })

    const fileName = `audio-${ title_slug }.mp3`;
    req.body.link = fileName

    uploadFileToS3(req, fileName)
    const audio  = await Audio.create(req.body)

    res.status(201).json({
        status: "success",
        data: {
            audio
        }
    })
})

exports.updateAudio = catchAsync( async (req, res, next) => {

    if(req.file){
        const title_slug = slugify(req.body.title, { lower: true })

        const fileName = `audio-${ title_slug }.mp3`;
        req.body.link = fileName

        uploadFileToS3(req, fileName)
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


