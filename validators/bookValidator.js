const { body } = require("express-validator");

const validators = {
    title: body('title')
        .notEmpty().withMessage('title is required'),
    year: body('year')
        .notEmpty().withMessage('year is required')
        .isInt({ gte: 1970 }).withMessage('year must be an integer and greater than 1970'),
    authorId: body('authorId')
        .notEmpty().withMessage('author id is required')
}

module.exports = {
    create: [validators.title, validators.year, validators.authorId],
    edit: [validators.title, validators.year, validators.authorId],
}