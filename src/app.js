import express from "express"
const app = express()
import cors from "cors"
import cookieParser from "cookie-parser"

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(cookieParser())

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
    

//routes import - seggregation of file

import userRouter from './routes/user.routes.js'

//routes declaration

app.use("/api/v1/users", userRouter)
// https://localhost:8000/api/v1/users - means give the control to users route. lets go to user.route.js
export {app}