const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator')
const { createBook, editBook, getBook, deleteBook } = require('../../../validators/bookValidator')
const { toSlug } = require('../../../utils/string')

const { Book, User } = require('../../../models')

/*
* @api {get} /api/v1/hobby
* @apiName getHobbies
* @apiPermission public
* @apiDescription get all hobbies
*
* @apiParam {number} page : page number in pagination
* @apiParam {number} limit : limit data per page
* @apiParam {enum['asc','desc']} sort : sort type of data
*/
router.get('/', async (req, res) => {
    try {
        let { page, limit, sort, query } = req.query
        sort = sort == 'desc' ? -1 : 1
        query = query || ''
        let books = await Book.paginate({
            title: new RegExp(query, 'i')
        }, {
            pagination: page == 'all' ? false : true,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            populate: {
                path: 'author',
                select: '-books'
            },
            sort: {
                title: parseInt(sort)
            }
        })
        return res.status(200).json({
            status: true,
            data: books
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error',
            error: err.message
        })
    }
})

/*
* @api {get} /api/v1/book/:id
* @apiName getBook
* @apiPermission public
* @apiDescription get one book
*
* @apiParam {id} id : book unique id
*/
router.get('/:id', getBook, async (req, res) => {
    try {
        // if validation failed
        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: false,
                message: 'inputs not valid',
                errors: errors.array({ onlyFirstError: true })
            })
        }
        let { id } = req.params
        let book = await Book.findById(id).populate({ path: 'author', select: '-books' })
        // if book not found
        if (!book) {
            return res.status(200).json({
                status: false,
                message: 'book not found',
            })
        }
        return res.status(200).json({
            status: true,
            data: book
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error',
            error: err.message
        })
    }
})

/*
* @api {post} /api/v1/book
* @apiName addBook
* @apiPermission public
* @apiDescription add book
*
* @apiParam {string} title : book's title
* @apiParam {number} year : book's year
* @apiParam {id} authorId : book's author id
*/
router.post('/', createBook, async (req, res) => {
    try {
        // if validation failed
        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: false,
                message: 'inputs not valid',
                errors: errors.array({ onlyFirstError: true })
            })
        }
        // if validation has been successful
        let book = new Book
        book.title = req.body.title
        book.slug = toSlug(req.body.title)
        book.year = req.body.year
        book.author = req.body.author
        await book.save()
        // add book to author
        await addBookToAuthor(book, req.body.author)
        return res.status(200).json({
            status: true,
            data: await Book.findById(book._id).populate({ path: 'author', select: '-books' })
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error',
            error: err.message
        })
    }
})

/*
* @api {patch} /api/v1/book/:id
* @apiName editBook
* @apiPermission public
* @apiDescription edit book
*
* @apiParam {id} id : book unique id
* @apiParam {string} title : book's title
* @apiParam {number} year : book's year
* @apiParam {id} author : book's author id
*/
router.patch('/:id', editBook, async (req, res) => {
    try {
        // if validation failed
        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: false,
                message: 'inputs not valid',
                errors: errors.array({ onlyFirstError: true })
            })
        }
        // if validation has been successful
        let { id } = req.params
        let book = await Book.findById(id)
        // if book not found
        if (!book) {
            return res.status(200).json({
                status: false,
                message: 'book not found'
            })
        }
        book.title = req.body.title
        book.slug = toSlug(req.body.title)
        book.year = req.body.year
        // if author changed
        if (book.author != req.body.author) {
            // remove book from author before (if exists)
            await removeBookFromAuthor(book, book.author)
            // add book to new author
            await addBookToAuthor(book, req.body.author)
            book.author = req.body.author
        }
        await book.save()
        return res.status(200).json({
            status: true,
            data: await Book.findById(id).populate({ path: 'author', select: '-books' })
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error',
            error: err.message
        })
    }
})

/*
* @api {delete} /api/v1/book
* @apiName deleteBook
* @apiPermission public
* @apiDescription delete book
*
* @apiParam {number} id : book unique id
*/
router.delete('/:id', deleteBook, async (req, res) => {
    try {
        // if validation failed
        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: false,
                message: 'inputs not valid',
                errors: errors.array({ onlyFirstError: true })
            })
        }
        let { id } = req.params
        let book = await Book.findById(id).populate({ path: 'author', select: '-books' })
        // if book not found
        if (!book) {
            return res.status(200).json({
                status: false,
                message: 'book not found',
            })
        }
        await book.remove()
        // remove book from author
        await removeBookFromAuthor(book, book.author)
        return res.status(200).json({
            status: true,
            message: 'success delete book',
            data: book
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error',
            error: err.message
        })
    }
})

// add book to author function
let addBookToAuthor = async (book, authorId) => {
    let author = await User.findById(authorId)
    if (author) {
        author.books.push(book._id)
        await author.save()
    }
}

// remove book from author function
let removeBookFromAuthor = async (book, authorId) => {
    let author = await User.findById(authorId)
    if (author) {
        author.books = author.books.filter(bookId => !book._id.equals(bookId))
        await author.save()
    }
}

module.exports = router