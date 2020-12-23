const express = require('express');
const testimonialController = require('./../controllers/testimonialController');
const authController = require('./../controllers/authController');

const router = express.Router()

router.route('/')
    .get(testimonialController.getTestimonials)
    .post(
        authController.protect,
        testimonialController.handleImageFromCLient,
        testimonialController.createTestimonial
    )
        
router.route('/:id')
    .get(testimonialController.getTestimonial)
    .patch(
        authController.protect,
        testimonialController.handleImageFromCLient,
        testimonialController.updateTestimonial
    )
    .delete(
        authController.protect,
        testimonialController.deleteTestimonial
    )
    

module.exports = router