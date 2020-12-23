
const User = require("../models/userModel")
const AppError = require("../utils/appError");

const filterObj = (obj, ...allowedFields) => {

    const newObj = {};

    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj
}

exports.getUsers = async (req, res) => {
    try {

        const users = await User.find()

        res.status(200).json({
            status: 'success',
            results: users.length,
            data : {
                users
            }
        })

    }catch(err){
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
    
}

exports.getDocCount = async (req, res, next) => {
    try {
        const count = await User.find({active: true}).countDocuments()

        res.status(200).json({
            status: "success",
            data: {
                count
            }
        })
    } catch (err) {
        next(new AppError(err.message, 401 ))
    }
}

exports.getUser = async (req, res, next) => {
    try {

        const id = req.params.id        
        const user = await User.findById(id)

        res.status(200).json({
            status: 'success',
            data : {
                user
            }
        })

    }catch(err){
        next(new AppError("Unable to find user", 404))
    }
    
}

exports.updateUser = async(req, res, next) => {
    try {  

        const filteredBody = filterObj(req.body, 'name', 'email' );

        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new : true,
            runValidators: true
        })

        res.status(200).json({
            status: 'success',
            data : {
                user: updatedUser,
            }
        });

    } catch (err) {
        next(new AppError("Unable to update user", 401))
    }
}

exports.deleteUser = async(req, res, next) => {
    try {

        await User.findByIdAndUpdate(req.params.id, {active: false})

        res.status(204).json({
            status: "success",
            data: null
        })
        
    } catch (err) {
        next(new AppError("Unable to delete user", 400))
    }
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next()
}