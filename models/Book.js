const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate-v2')

const bookSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    author: { type: Schema.Types.ObjectId, required: true },
}, { timestamps: true, versionKey: false })

bookSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("books", bookSchema)