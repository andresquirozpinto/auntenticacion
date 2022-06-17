const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const Usuario = require('./Usuario')

mongoose.connect('mongodb+srv://system:system@cluster0.jbnnh.mongodb.net/autenticacion?retryWrites=true&w=majority')

const app = express()

app.use(express.json())

//le pasamos el id y encriptamos
const encryptToken = _id => jwt.sign({_id: _id}, 'mi-string-secreto')

app.post('/register', async (req, res) => {
    const {body} = req
    console.log({body})
    //en caso de exito no opasa nada, si pasa algo captura el error
    try{
        const esUsuario = await Usuario.findOne({email: body.email})
        if (esUsuario){
            //403, osea no esta permitida la operacion, sin permiso parfa crear un usuario que ya existe
            return res.status(403).send('Usuario ya existe')
        }

        const salt = await bcrypt.genSalt()
        const passwordEncrypt = await bcrypt.hash(body.password, salt)
        const usuario = await Usuario.create({email: body.email, password: passwordEncrypt, salt})
        //encriptando id JWT(encriptar objeto que le pasemos), firmamos el JWT
        //const objetoEncryot = jwt.sign({_id: usuario._id}, 'mi-string-secreto')
        const objetoEncrypt = encryptToken(usuario._id)

        //res.send({_id: usuario._id})
        res.status(201).send(objetoEncrypt)

    }catch (error){
        console.log(error)
        res.status(500).send(error.message)
    }
})

app.post('/login', async (req, res) => {
    const {body} = req
    try{
        const usuario = await Usuario.findOne({email: body.email})
        //si NO existe un usuario
        if (!usuario){
            res.status(403).send('Usuario y/o password invalida')
        }else {
            //comparamos password que existe en el usuario con la password que recibimos de la peticion del post
            const esIgual = await bcrypt.compare(body.password, usuario.password)
            if (esIgual) {
                //enviamos el token firmado JWT
                const objetoEncrypt = encryptToken(usuario._id)
                res.status(200).send(objetoEncrypt)
            }else {
                res.status(403).send('Usuario y/o password invalida')
            }
        }
    } catch (error){
        res.status(500).send(error.message)
    }
})

app.listen(3000, () => {
    console.log('Corriendo aplicacion')
})

