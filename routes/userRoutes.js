const express = require('express')

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router()

router.post('/signup', authController.createUser)
router.post('/login', authController.loginUser)
router.get('/me', authController.me)

router
    .route('/')
    .get(userController.getUsers)

router.route('/count').get(userController.getDocCount)
router
    .route('/:id')
    .get(userController.getUser)
    .patch(    
        authController.protect, 
        userController.updateUser)
    .delete( authController.protect,  authController.restrictTo('admin'), userController.deleteUser)


module.exports = router