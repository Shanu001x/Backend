/* import express from "express"
import mongoose from "mongoose";
import { DB_NAME } from "./constant";


const app = express();

//Effy function
;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("Error", (error) => {
            console.log("Error: ", error)
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log("Server is running on port: ", process.env.PORT)
        })
    } catch (error) {
        console.log("Error", error)
        throw err 
    }

})() */
