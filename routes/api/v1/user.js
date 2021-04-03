const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const { create, edit, editPassword } = require('../../../validators/userValidator')

const User = require('../../../models/User')

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
                { username: new RegExp(query, 'i') },]
        }, {
            pagination: page == 'all' ? false : true,
            // hide the password
            select: '-password',
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
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
            message: 'interal server error!',
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
router.get('/:id', async (req, res) => {
    try {
        let { id } = req.params
        let user = await User.findById(id).select('-password')
        // if user not found
        if (!user) {
            return res.status(200).json({
                status: false,
                message: 'user not found!',
            })
        }
        return res.status(200).json({
            status: true,
            data: user
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error!',
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
        let user = new User
        user.name = req.body.name
        user.username = req.body.username
        user.password = await bcrypt.hash(req.body.password, 10)
        await user.save()
        return res.status(200).json({
            status: true,
            data: await User.findById(user._id).select('-password')
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error!',
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
        let user = await User.findById(id).select('-password')
        // if user not found
        if (!user) {
            return res.status(200).json({
                status: false,
                message: 'user not found!'
            })
        }
        user.name = req.body.name
        user.username = req.body.username
        await user.save()
        return res.status(200).json({
            status: true,
            data: user
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error!',
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
router.patch('/:id/password', editPassword, async (req, res) => {
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
                message: 'user not found!'
            })
        }
        user.password = req.body.password
        await user.save()
        return res.status(200).json({
            status: true,
            data: user
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error!',
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
router.delete('/:id', async (req, res) => {
    try {
        let { id } = req.params
        let user = await User.findByIdAndRemove(id).select('-password')
        // if user not found
        if (!user) {
            return res.status(200).json({
                status: false,
                message: 'user not found!',
            })
        }
        return res.status(200).json({
            status: true,
            message: 'success delete user!',
            data: user
        })
    } catch (err) {
        return res.status(500).json({
            message: 'interal server error!',
            error: err.message
        })
    }
})

module.exports = router