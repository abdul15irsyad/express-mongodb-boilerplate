module.exports = {
    APP_NAME: 'Express MongoDB Boilerplate',
    APP_DESC: 'Boilerplate REST API with express and mongodb (mongoose)',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/db_express',
    PORT: process.env.PORT || 4000
}