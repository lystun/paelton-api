const slugify = require('slugify');
const multer = require('multer');
const aws = require('./../utils/aws');

const Audio = require('./../models/audioModel');
const AppError = require('./../utils/appError');

const crudHandler = require('./crudHandler');
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

const uploadFileToS3 = catchAsync( async (req, fileName, next) => {

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
    req.body.link = process.env.AWS_URL+'audios/'+fileName;

    uploadFileToS3(req, fileName, next)
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
        req.body.link = process.env.AWS_URL+'audios/'+fileName;

        uploadFileToS3(req, fileName, next)
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

exports.getAudios = crudHandler.getAll(Audio)
exports.getAudio = crudHandler.getOne(Audio)
exports.deleteAudio = crudHandler.deleteOne(Audio)


