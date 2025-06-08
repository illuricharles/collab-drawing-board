import { Router } from "express";
import bcrypt from "bcrypt"
import {UserSigninSchema, UserSignupSchema} from "@repo/zod-validations"
import jwt from "jsonwebtoken"
import {prisma, Prisma} from "@repo/db"
import { authMiddleware } from "../middleware";
const router:Router = Router()

router.post('/signup', async (req, res) => {
    const {username, password, name} = req.body
    const userDetails = {username, password, name}
    const isUserDetailsValid = UserSignupSchema.safeParse(userDetails)
    
    if(!isUserDetailsValid.success) {
        res.status(400).json({
            message: "validation error",
            issue: isUserDetailsValid.error.issues[0]
        })
        return 
    }
    const {data} = isUserDetailsValid
    try {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const response = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name
            }
        })
        res.status(201).json({
            message: "user created successfully",
        })
        return
    }
    catch(e) {
        console.log(e)
        if( e instanceof Prisma.PrismaClientInitializationError) {
            res.status(500).json({
                message: "Database is currently unreachable. Please try again later."
            })
            return
        }
        else if(e instanceof Prisma.PrismaClientKnownRequestError) {
            if(e.code === 'P1017') {
                res.status(500).json({
                    message: "Database connection lost. Please try again later."
                })
                return
            }
            else if(e.code === 'P1001') {
                res.status(500).json({
                    message: "Database is currently unreachable. Please try again later."
                })
                return
            }
            else if(e.code === 'P2002') {
                res.status(400).json({
                    path: e.meta?.target || "",
                    message: `${e.meta?.target || ""} should be unique`
                })
                return
            }  
        }

        res.status(500).json({
            message: "Internal server error"
        })
        return
    }
})

router.post('/signin', async(req, res) => {
    const {username, password} = req.body
    const isUserDetailsValid = UserSigninSchema.safeParse({username, password})
    // checking the validation
    if(!isUserDetailsValid.success) {
        res.status(400).json({
            issue: isUserDetailsValid.error.issues[0],
            message: "validation error"
        })
        return 
    }
    const {data} = isUserDetailsValid
    // getting the user details to check the username exist or not and check the hash
    try {
        const userDetails = await prisma.user.findUnique({
            where: {
                username: data.username
            }
        })
        // check user exist or not 
        if(userDetails === null) {
            res.status(400).json({
                message: "username or password is invalid."
            })
            return 
        }
        const isPasswordMatch = await bcrypt.compare(data.password, userDetails.password)
        // check hash password
        if(!isPasswordMatch) {
            res.status(400).json({
                message: "username or password is invalid."
            })
            return 
        }
        const payload = {
            id: userDetails.id
        }
        // jwt secret not defined 
        if(process.env.JWT_SECRET === undefined) {
            console.log("jwt secret not defined")
            res.status(500).json({
                message: "Internal server error"
            })
            return
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET) 
        res.status(200).json({
            token
        })
        return
    }
    catch(error) {
        console.log(error)
        if( error instanceof Prisma.PrismaClientInitializationError) {
            res.status(500).json({
                message: "Database is currently unreachable. Please try again later."
            })
            return
        }
        else if(error instanceof Prisma.PrismaClientKnownRequestError) {
            if(error.code === 'P1017') {
                res.status(500).json({
                    message: "Database connection lost. Please try again later."
                })
                return
            }
            if(error.code === 'P1001') {
                res.status(500).json({
                    message: "Database is currently unreachable. Please try again later."
                })
                return
            }  
        }
        res.status(500).json({
            message: "Internal server error."
        })
        return
        
    }

})

router.post('/create-room', authMiddleware, async (req, res) => {
    console.log(req.userId)
    res.send("room created")
})


export default router