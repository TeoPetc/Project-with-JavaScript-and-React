import { config } from 'dotenv';
import express, { json, urlencoded } from 'express'
import { resolve, join } from 'path'
import router from './router.mjs'
import { initialize } from './repository.mjs'
import session from 'express-session'

config()
const PORT = process.env.PORT || 8080
const SECRET = process.env.SECRET
express()
    .use(express.static(join(resolve('..'), 'client')))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(session({
        secret: SECRET,
        resave: false,
        saveUninitialized: true
    }))
    .use('/confapp', router)
    .listen(PORT, () => {
        try {
            initialize()
            console.log(`Server is running on port ${PORT}.`)
        } catch (error) {
            console.log(error)
        }
    });