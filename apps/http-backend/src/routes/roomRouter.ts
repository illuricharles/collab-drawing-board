import { Router } from "express";
import { authMiddleware } from "../middleware";
import { CreateRoomSchema } from "@repo/zod-validations";
import { Prisma, prisma } from "@repo/db";
const router:Router = Router()

router.post('/create-room', authMiddleware, async(req, res) => {
    const {roomName} = req.body
    const checkValidation = CreateRoomSchema.safeParse({roomName})
    if(!checkValidation.success) {
        res.status(400).json({
            message: checkValidation.error.errors[0]?.message || "Invalid user data."
        })
        return 
    }
    if(!req.userId) {
        res.status(401).json({
            message: "user is unauthorized."
        })
        return
    }
    try {
        const response = await prisma.room.create({
            data: {
                slug: roomName,
                adminId: req.userId
            }
        })
        res.status(201).json({
            room: response
        })
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
                    message: `Room name should be unique`
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

router.get('/chats/:slug', authMiddleware, async(req, res) => {
    const {slug} = req.params
    
    try {
        const roomDetails = await prisma.room.findUnique({
            where: {
                slug
            }
        })

        if(roomDetails === null) {
            res.status(404).json({
                message: "Room not found"
            })
            return
        }

        const chat = await prisma.chats.findMany({
            where: {
                roomId: roomDetails.id
            },
            select: {
                id: true,
                message: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                }
            },
            take: 50,
            orderBy: {
                createdAt: 'desc'
            }
        })

        res.json({
        chat,
        roomDetails
        })
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
                    message: `Room name should be unique`
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

export default router