const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate-v2')

const hobbySchema = new Schema({
    name: { type: String, required: true },
    desc: { type: String, required: false, default: null }
}, { timestamps: true, versionKey: false })

hobbySchema.plugin(mongoosePaginate)

module.exports = mongoose.model("hobbies", hobbySchema)