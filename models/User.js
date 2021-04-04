const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate-v2')

const userSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    books: [{ type: mongoose.Types.ObjectId, ref: 'books' }]
}, { timestamps: true, versionKey: false })

userSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("users", userSchema)