const mongoose = require('mongoose');
const crypto = require('crypto');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "cannot be blank"],
      match: [/^[a-zA-Z0-9\s]+$/, "is invalid"],
      index: true
    },
    name: String,
    age: Number,
    admin: Boolean,
    hash: String,
    salt: String
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator, { message: "should be unique" });

// use ES5 function to prevent `this` from becoming undefined
userSchema.methods.setHashedPassword = function (password) {
  this.salt = generateSalt();
  this.hash = hashPassword(password, this.salt);
};

// use ES5 function to prevent `this` from becoming undefined
userSchema.methods.validatePassword = function (password) {
  return this.hash === hashPassword(password, this.salt);
};

const generateSalt = () => {
  return crypto.randomBytes(16).toString("hex");
};

const hashPassword = (password, salt) => {
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 512, "sha512")
    .toString("hex");
  return hash;
};

const User = mongoose.model('User', userSchema)

module.exports = User