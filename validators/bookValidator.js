const { body, param } = require('express-validator');
const { ObjectId } = require('mongoose').Types
const { toSlug } = require('../utils/string')
const { Book, User } = require('../models')

const validators = {
    id: param('id')
        .exists().withMessage('id is required')
        .custom(id => ObjectId.isValid(id)).withMessage('id is not valid'),
    title: body('title')
        .exists().withMessage('title is required')
        .custom(async (title, { req }) => {
            let book = req.method == 'POST' ? await Book.findOne({ slug: toSlug(title) }) : await Book.findOne({ slug: toSlug(title), _id: { $ne: req.params.id } })
            if (book !== null) return Promise.reject();
        }).withMessage('book already exist'),
    year: body('year')
        .exists().withMessage('year is required')
        .isInt({ gte: 1970 }).withMessage('year must be an integer and greater than 1970'),
    author: body('author')
        .exists().withMessage('author id is required')
        .custom(authorId => ObjectId.isValid(authorId)).withMessage('author id is not valid')
        .custom(async authorId => {
            let user = await User.findById(authorId)
            if (user === null) return Promise.reject();
        }).withMessage('author not found')
}

const userValidator = {
    getBook: [validators.id],
    createBook: [validators.title, validators.year, validators.author],
    editBook: [validators.id, validators.title, validators.year, validators.author],
    deleteBook: [validators.id],
}

module.exports = userValidator