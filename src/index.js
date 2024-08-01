
import dotenv from "dotenv"
import connectDb from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: '.env'
})

connectDb()
.then(() => {
    app.on("Error", (error) => {
        console.log("Error: ", error)
        throw error
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at Port: ${process.env.PORT}`)
    })  
})    
.catch((err)=> {
    console.log('Database connection failed', err)
})