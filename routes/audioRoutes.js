const express = require('express')
const router = express.Router()

const audioController = require('./../controllers/audioController')


router.route('/')
    .get(audioController.getAudios)


module.exports = router