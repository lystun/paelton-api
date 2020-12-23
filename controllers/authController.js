
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel');
const AppError = require('../utils/appError');


const signToken = id => {
    return jwt.sign(
        {id}, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN } 
    )   
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)

    const cookieOptions = {
        expires: new Date( Date.now()+ process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000 ),
        httpOnly: true
    }

    if( process.env.NODE_ENV === 'production' ) cookieOptions.secure = true

    res.cookie('jwt', token, cookieOptions)

    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.protect = async(req, res, next) => {
    
    //1.Get the token and check if it exists
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    
    if(!token){
        return next(new AppError("You're not logged in. Please log in.", 401));
    };
    
    //2.verify the token
    const decoded = await promisify(jwt.verify) (token, process.env.JWT_SECRET)
    
    //3.check if user still exists
    const freshUser = await User.findById(decoded.id)

    if(!freshUser){
        return next(new AppError('The user belonging to the token no longer exists', 401))
    }

    //Grant access to protected route
    req.user = freshUser;
    next()
}

exports.restrictTo = (...roles) => {
    return async (req, res, next) => {  
        
        if( !roles.includes(req.user.role) ){
            return next(new AppError('You do not have permission to perform this action!', 403))
        }

        next()
    }
}

exports.createUser = async (req, res, next) => {
    try {

        if(req.body.firstName && req.body.lastName ){
            req.body.name = req.body.firstName+' '+req.body.lastName
        }

        const newUser = await User.create(req.body)

        createSendToken(newUser, 201, res)

    }catch(err){
        next(new AppError(err, 400))
        // next(new AppError("Unable to create user", 401))
    }
}

exports.loginUser = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        if(!email || !password) {
            return next(new AppError("Please, provide email and password", 400))
        }

        const user = await User.findOne({email}).select('+password')

        if(!user || ! await user.correctPassword(password, user.password) ){
            return next(new AppError('Incorrect email or password', 401))
        }
        
        createSendToken(user, 200, res)

    } catch (err) {
        next(new AppError("Unable to log in, Please try again", 401))
    }
}

exports.me = async(req, res, next) => {

    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    
    if(!token){
        return next(new AppError("You're not logged in. Please log in.", 401));
    };
    
    //2.verify the token
    const decoded = await promisify(jwt.verify) (token, process.env.JWT_SECRET)
    
    //3.check if user still exists
    const me = await User.findById(decoded.id)

    res.status(200).json({
        status: 'success',
        data: {
            me
        }
    })
}