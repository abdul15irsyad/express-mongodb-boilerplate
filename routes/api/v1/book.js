const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator')
const { create, edit } = require('../../../validators/bookValidator')

const Book = require('../../../models/Book')

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
            message: 'interal server error!',
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
router.get('/:id', async (req, res) => {
    try {
        let { id } = req.params
        let book = await Book.findById(id)
        // if book not found
        if (!book) {
            return res.status(200).json({
                status: false,
                message: 'book not found!',
            })
        }
        return res.status(200).json({
            status: true,
            data: book
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error!',
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
router.post('/', create, async (req, res) => {
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
        book.year = req.body.year
        book.authorId = req.body.authorId
        await book.save()
        return res.status(200).json({
            status: true,
            data: await Book.findById(book._id)
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error!',
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
* @apiParam {id} authorId : book's author id
*/
router.patch('/:id', edit, async (req, res) => {
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
                message: 'book not found!'
            })
        }
        book.title = req.body.title
        book.year = req.body.year
        book.authorId = req.body.authorId
        await book.save()
        return res.status(200).json({
            status: true,
            data: book
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error!',
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
router.delete('/:id', async (req, res) => {
    try {
        let { id } = req.params
        let book = await Book.findByIdAndRemove(id)
        // if book not found
        if (!book) {
            return res.status(200).json({
                status: false,
                message: 'book not found!',
            })
        }
        return res.status(200).json({
            status: true,
            message: 'success delete book!',
            data: book
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error!',
            error: err.message
        })
    }
})

module.exports = router