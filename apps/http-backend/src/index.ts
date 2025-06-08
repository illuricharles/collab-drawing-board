import dotenv from "dotenv"
import path from "path"
import express from "express"
import userRouter from "./routes/userRouter"
import roomRouter from "./routes/roomRouter"
dotenv.config({path: path.resolve(__dirname, "../../../.env")})
dotenv.config({path: path.resolve(__dirname, "../.env")})

const app = express()
app.use(express.json())
app.use('/api/v1/user', userRouter)
app.use('/api/v1/room', roomRouter)


app.listen(process.env.HTTP_PORT, (err) => {
    if(err) {
        console.log(err)
    }
    else {
        console.log(`server runs on http://localhost:${process.env.HTTP_PORT}`)
    }
})