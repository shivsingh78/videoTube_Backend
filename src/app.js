import express from "express"
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express()

// Middleware to parse JSON request bodies
app.use(cors({
     origin: process.env.CORS_ORIGIN,
     cridentials:true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



export {app}