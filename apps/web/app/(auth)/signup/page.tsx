"use client"
import { useForm } from "react-hook-form"
import AuthContainer from "../../../components/authComponents/AuthContainer"
import AuthFooter from "../../../components/authComponents/AuthFooter"
import AuthHeading from "../../../components/authComponents/AuthHeading"
import FieldContainer from "../../../components/ui/form/FieldContainer"
import Form from "../../../components/ui/form/Form"
import FormButton from "../../../components/ui/form/FormButton"
import Input from "../../../components/ui/form/Input"
import Label from "../../../components/ui/form/Label"
import { zodResolver } from "@hookform/resolvers/zod"
import {UserSignupWithConfirmSchema} from "@repo/zod-validations"
import { z } from "zod"
import FormErrorMessage from "../../../components/ui/form/FormErrorMessage"
import axios from "axios"

type UserSignupWithConfirmSchemaTypes = z.infer<typeof UserSignupWithConfirmSchema>

export default function Signup() {
    const {register, handleSubmit,setError, formState: {errors, isLoading}} = useForm<UserSignupWithConfirmSchemaTypes>({
        resolver: zodResolver(UserSignupWithConfirmSchema)
    })

    async function onSubmit(data: UserSignupWithConfirmSchemaTypes) {
        console.log(data)
        if(!process.env.HTTP_BACKEND) {
            console.error('missing HTTP_BACKEND or check next.config.ts file and make sure to set the env variables.')
            setError('root', {message: "Something went wrong. Please try again later."})
            return
        }

        try {
            const response = await axios.post(`${process.env.HTTP_BACKEND}/api/v1/user/signup`, data)
            console.log(response.data)
        }
        catch(e) {
            console.log(e)
            if(e instanceof Error) {
                setError('root', {message: `${e.message}. please try again later.`})
            }
            else {
                setError('root', {message: "Something went wrong. Please try again later." })
            }
        }
    }
    console.log(process.env.HTTP_BACKEND)

    return <AuthContainer className="sm:min-w-[360px]">
        <AuthHeading title="Create Account" subTitle="Enter your details to create a new account"/>
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FieldContainer>
                <Label  htmlFor="name">Name</Label>
                <Input
                    {...register('name')}
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    className=""
                />
                {errors.name?.message && <FormErrorMessage message={errors.name.message}/>}
            </FieldContainer>

            <FieldContainer>
                <Label htmlFor="username">Username</Label>
                <Input
                    {...register('username')}
                    type="text"
                    id="username"
                    placeholder="Enter your username"
                />
                {errors.username?.message && <FormErrorMessage message={errors.username.message}/>}
            </FieldContainer>

            <FieldContainer>
                <Label htmlFor="password">Password</Label>
                <Input
                    {...register('password')}
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                />
                {errors.password?.message && <FormErrorMessage message={errors.password.message}/>}
            </FieldContainer>
            <FieldContainer>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                    {...register('confirmPassword')}
                    type="password"
                    id="confirmPassword"
                    placeholder="Enter your password"
                />
                {errors.confirmPassword?.message && <FormErrorMessage message={errors.confirmPassword.message}/>}
            </FieldContainer>

            <FormButton type="submit" disabled={isLoading}>Sign up</FormButton>
            {errors.root?.message && <FormErrorMessage className="text-center -mt-3 text-base" message={errors.root.message || "Something went wrong"}/>}

            <AuthFooter actionHref="/signin" questionText="Already have an account? " actionText="Signin"/>
        </Form>
    </AuthContainer>
}