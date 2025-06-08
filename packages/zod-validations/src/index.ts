import { z } from "zod";

export const UserSignupSchema = z.object({
    username: z.string({message: "Username required"}).min(3, {message: "username should be minimum 3 characters required"}),
    password: z.string({message: "password required"}).min(8, {message: "password should be minimum 8 characters required"}),
    name: z.string({message: "name required"}).min(3, {message: "name should be minimum 3 characters required"})
})

export const UserSigninSchema = UserSignupSchema.omit({name: true})

export const CreateRoomSchema = z.object({
    roomName: z.string({message: "Room name required"})
})

export const UserSignupWithConfirmSchema = UserSignupSchema.extend({
    confirmPassword: z.string({message: "confirm password required"}).min(8, {message: "password should be minimum 8 characters required"})
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords did not matched.",
    path: ["confirmPassword"]
})