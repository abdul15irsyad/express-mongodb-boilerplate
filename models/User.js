const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate-v2')

const userSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, index: true, unique: true },
    password: { type: String, required: true, select: false },
}, { timestamps: true, versionKey: false })

userSchema.plugin(mongoosePaginate)

const User = mongoose.model("users", userSchema)
module.exports = User