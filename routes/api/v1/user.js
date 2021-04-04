const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')

const { User, Book } = require('../../../models')
const { createUser, getUser, editUser, editUserPassword, deleteUser } = require('../../../validators/userValidator')

/*
* @api {get} /api/v1/user
* @apiName getUsers
* @apiPermission public
* @apiDescription get all users
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
        let users = await User.paginate({
            $or: [
                { name: new RegExp(query, 'i') },
                { username: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') },]
        }, {
            pagination: page == 'all' ? false : true,
            // hide the password
            select: '-password',
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            populate: {
                path: 'books',
                select: '-author'
            },
            sort: {
                name: parseInt(sort)
            }
        })
        return res.status(200).json({
            status: true,
            data: users
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error',
            error: err.message
        })
    }
})

/*
* @api {get} /api/v1/user/:id
* @apiName getUser
* @apiPermission public
* @apiDescription get one user
*
* @apiParam {id} id : user unique id
*/
router.get('/:id', getUser, async (req, res) => {
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
        let user = await User.findById(id).select('-password')
        // if user not found
        if (!user) {
            return res.status(200).json({
                status: false,
                message: 'user not found',
            })
        }
        return res.status(200).json({
            status: true,
            data: user
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error',
            error: err.message
        })
    }
})

/*
* @api {post} /api/v1/user
* @apiName addUser
* @apiPermission public
* @apiDescription add user
*
* @apiParam {string} name : user's name
* @apiParam {string} username : user's username
* @apiParam {string} password : user's password
* @apiParam {string} confirmPassword : confirm password
*/
router.post('/', createUser, async (req, res) => {
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
        let user = new User
        user.name = req.body.name
        user.username = req.body.username
        user.email = req.body.email
        user.password = await bcrypt.hash(req.body.password, 10)
        await user.save()
        return res.status(200).json({
            status: true,
            message: 'success add user',
            data: await User.findById(user._id).select('-password')
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error',
            error: err.message
        })
    }
})

/*
* @api {patch} /api/v1/user/:id
* @apiName editUser
* @apiPermission public
* @apiDescription edit user
*
* @apiParam {id} id : user unique id
* @apiParam {string} name : user's name
* @apiParam {string} username : user's username
*/
router.patch('/:id', editUser, async (req, res) => {
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
        let user = await User.findById(id).select('-password')
        // if user not found
        if (!user) {
            return res.status(200).json({
                status: false,
                message: 'user not found'
            })
        }
        user.name = req.body.name
        user.username = req.body.username
        user.email = req.body.email
        await user.save()
        return res.status(200).json({
            status: true,
            message: 'success update user',
            data: user
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error',
            error: err.message
        })
    }
})

/*
* @api {patch} /api/v1/user/:id/password
* @apiName editUserPassword
* @apiPermission public
* @apiDescription edit user
*
* @apiParam {id} id : user unique id
* @apiParam {string} oldPassword : user's old password
* @apiParam {string} password : user's password
* @apiParam {string} confirmPassword : confirm password
*/
router.patch('/:id/password', editUserPassword, async (req, res) => {
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
        let user = await User.findById(id)
        // if user not found
        if (!user) {
            return res.status(400).json({
                status: false,
                message: 'user not found'
            })
        }
        // if old password is incorrect
        if (!bcrypt.compareSync(req.body.oldPassword, user.password)) {
            return res.status(400).json({
                status: false,
                message: 'old password is incorrect'
            })
        }
        user.password = await bcrypt.hash(req.body.password, 10)
        await user.save()
        return res.status(200).json({
            status: true,
            message: 'success update user\'s password',
            data: await User.findById(id).select('-password')
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error',
            error: err.message
        })
    }
})

/*
* @api {delete} /api/v1/user
* @apiName deleteUser
* @apiPermission public
* @apiDescription delete user
*
* @apiParam {number} id : user unique id
*/
router.delete('/:id', deleteUser, async (req, res) => {
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
        let user = await User.findById(id).select('-password')
        // if user not found
        if (!user) {
            return res.status(200).json({
                status: false,
                message: 'user not found',
            })
        }
        await user.remove()
        // set book's author to null
        user.books.forEach(async bookId => {
            let book = await Book.findById(bookId)
            if (book) {
                book.author = null
                await book.save()
            }
        })
        return res.status(200).json({
            status: true,
            message: 'success delete user',
            data: user
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error',
            error: err.message
        })
    }
})

module.exports = router