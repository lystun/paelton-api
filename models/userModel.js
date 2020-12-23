const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name : {
        type: String,
        required : [true, "Your name is required"]
    },
    email : {
        type: String,
        required : [true, "Your email is required"],
        unique: true,
        lowercase: true,
        validate : [ validator.isEmail, "Please enter a valid email" ]
    },
    password: {
        type: String,
        required : [true, "Password is required"],
        minLength: 8,
        select: false
    },
    passwordConfirm : {
        type: String,
        required: [true, "Please confirm your password"],
        validate : {
            validator: function(el){
                return el === this.password
            },
            message : "Passwords do not match"
        }
    },
    active : {
        type: Boolean,
        default: true,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

//query middleware
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined;

    next()
})

userSchema.pre(/^find/, function(next){
    this.find({ active: { $ne: false }})
    next()
})

//instance methods
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

const User = mongoose.model('User',  userSchema )
module.exports = User