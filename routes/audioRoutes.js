const express = require('express')
const router = express.Router()

const audioController = require('./../controllers/audioController')
const authController = require('./../controllers/authController')


router.route('/')
    .get(audioController.getAudios)
    .post(
        authController.protect,
        audioController.handleAudioFromClient,
        audioController.createAudio
    )
        
router.route('/:id')
    .get(audioController.getAudio)
    .patch(
        authController.protect,
        audioController.handleAudioFromClient,
        audioController.updateAudio
    )
    .delete(
        authController.protect,
        audioController.deleteAudio
    )


module.exports = router