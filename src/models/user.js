const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function() {

    const user = this.toObject()
    delete user.password
    delete user.tokens
    delete user.avatar
    return user

}

userSchema.methods.generateAuthToken = async function() {

    const token = jwt.sign({_id: this._id.toString()}, process.env.JWT_SECRET, {expiresIn: '7 days'})

    this.tokens = [...this.tokens, {token}]
    await this.save()
    return token

}

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isPassCorrect = await bcrypt.compare(password, user.password)

    if (!isPassCorrect) {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.pre('save', async function(next) {

    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

userSchema.pre('remove', async function(next) {

    await Task.deleteMany({owner: this._id})
    next()

})

const User = mongoose.model('User', userSchema)

module.exports = User