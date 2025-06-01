import { json, NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
export function authMiddleware(req:Request, res:Response, next: NextFunction) {
    const authorization = req.headers.authorization
    if(authorization === undefined) {
        res.status(401).json({
            message: "missing or invalid token"
        })
        return
    }

    const token = authorization.split(' ')[1]
    if(token === undefined) {
        res.status(401).json({
            message: "missing or invalid token"
        })
        return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
        const {id} = decoded
        req.userId = id
        next()
    }
    catch(e) {
        res.status(500).json({
            message: "missing or invalid token."
        })
    }

    
}