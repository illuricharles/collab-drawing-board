import dotenv from "dotenv"
import path from "path"
import express from "express"
import userRouter from "./routes/userRouter"
dotenv.config({path: path.resolve(__dirname, "../../../.env")})
dotenv.config({path: path.resolve(__dirname, "../.env")})

const app = express()
app.use(express.json())
app.use('/api/v1/user', userRouter)


app.listen(process.env.PORT, (err) => {
    if(err) {
        console.log(err)
    }
    else {
        console.log(`server runs on http://localhost:${process.env.PORT}`)
    }
})