const mongoose = require("mongoose")

const Usuario = mongoose.model('Usuario', {
    email: {type: String, required: true},
    password: {type: String, required: true},
    salt: {type: String, required: true}
})

module.exports = Usuario
