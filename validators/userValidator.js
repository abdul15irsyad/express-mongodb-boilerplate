const { body, param } = require("express-validator");
const { ObjectId } = require('mongoose').Types
const User = require('../models/User')

const validators = {
    id: param('id')
        .exists().withMessage('id is required')
        .custom(value => ObjectId.isValid(value)).withMessage('id is not valid'),
    name: body('name')
        .exists().withMessage('name is required'),
    age: body('age')
        .exists().withMessage('age is required')
        .isInt({ gt: 0 }).withMessage('age must be an integer and greater than 0'),
    username: body('username')
        .exists().withMessage('username is required')
        .isAlphanumeric().withMessage('username is only letters and numbers')
        .custom(async (username, { req }) => {
            let user = req.method == 'POST' ? await User.findOne({ username }) : await User.findOne({ username, _id: { $ne: req.params.id } })
            if (user !== null) return Promise.reject();
        }).withMessage('username already used'),
    email: body('email')
        .exists().withMessage('email is required')
        .isEmail().withMessage('email not valid')
        .custom(async (email, { req }) => {
            let user = req.method == 'POST' ? await User.findOne({ email }) : await User.findOne({ email, _id: { $ne: req.params.id } })
            if (user !== null) return Promise.reject();
        }).withMessage('email already used'),
    oldPassword: body('oldPassword')
        .exists().withMessage('old password is required'),
    newPassword: body('password')
        .exists().withMessage('password is required')
        .isLength({ min: 8 }).withMessage('password must be at least 8 characters')
        .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])./).withMessage('password must contain lowercase, uppercase, and number'),
    confirmPassword: body('confirmPassword')
        .custom((confirmPassword, { req }) => confirmPassword === req.body.password).withMessage('confirm password doesn\'t match')
}

module.exports = {
    getUser: [validators.id],
    createUser: [validators.name, validators.username, validators.email, validators.newPassword],
    editUser: [validators.id, validators.name, validators.username, validators.email],
    editUserPassword: [validators.id, validators.oldPassword, validators.newPassword, validators.confirmPassword],
    deleteUser: [validators.id]
}