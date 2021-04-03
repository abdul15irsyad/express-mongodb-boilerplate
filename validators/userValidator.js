const { body } = require("express-validator");

const validators = {
    name: body('name')
        .notEmpty().withMessage('name is required'),
    age: body('age')
        .notEmpty().withMessage('age is required')
        .isInt({ gt: 0 }).withMessage('age must be an integer and greater than 0'),
    username: body('username')
        .notEmpty().withMessage('username is required')
        .isAlphanumeric().withMessage('username is only letters and numbers'),
    email: body('email')
        .notEmpty().withMessage('email is required')
        .isEmail().withMessage('email not valid'),
    oldPassword: body('oldPassword')
        .notEmpty().withMessage('old password is required'),
    newPassword: body('password')
        .notEmpty().withMessage('password is required')
        .isLength({ min: 8 }).withMessage('password must be at least 8 characters')
        .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])./).withMessage('password must contain lowercase, uppercase, and number'),
    confirmPassword: body('confirmPassword')
        .custom((confirmPassword, { req }) => confirmPassword !== req.body.password).withMessage('confirm password doesn\'t match')
}

module.exports = {
    create: [validators.name, validators.username, validators.newPassword],
    edit: [validators.name, validators.username],
    editPassword: [validators.oldPassword, validators.newPassword, validators.confirmPassword]
}