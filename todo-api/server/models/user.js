const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      isAsync: false,
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  }],
})

// eslint-disable-next-line func-names
UserSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  return _.pick(userObject, ['_id', 'email'])
}

// eslint-disable-next-line func-names
UserSchema.methods.generateAuthToken = function () {
  const user = this
  const access = 'auth'
  const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString()

  user.tokens.push({ access, token })

  return user.save().then(() => token)
}

// eslint-disable-next-line func-names
UserSchema.methods.removeToken = function (token) {
  const user = this

  return user.update({
    $pull: { tokens: { token } },
  })
}

// eslint-disable-next-line func-names
UserSchema.statics.findByToken = function (token) {
  const User = this
  let decoded

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (e) {
    return Promise.reject({ name: 'HTTP Error 401', message: 'Unauthorized: Access is denied due to invalid credentials' })
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  })
}

// eslint-disable-next-line func-names
UserSchema.statics.findByCredentials = function (email, password) {
  const User = this

  return User.findOne({ email }).then((user) => {
    if (!user) {
      return Promise.reject()
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          return resolve(user)
        }
        return reject(err)
      })
    })
  })
}

// eslint-disable-next-line func-names
UserSchema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    bcrypt.genSalt(12, (saltErr, salt) => {
      bcrypt.hash(user.password, salt, (hashErr, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

const User = mongoose.model('User', UserSchema)

module.exports = { User }