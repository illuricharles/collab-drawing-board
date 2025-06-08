"use client"
import AuthContainer from "../../../components/authComponents/AuthContainer"
import AuthFooter from "../../../components/authComponents/AuthFooter"
import AuthHeading from "../../../components/authComponents/AuthHeading"
import FieldContainer from "../../../components/ui/form/FieldContainer"
import Form from "../../../components/ui/form/Form"
import FormButton from "../../../components/ui/form/FormButton"
import Input from "../../../components/ui/form/Input"
import Label from "../../../components/ui/form/Label"

export default function Signin() {
    return <AuthContainer>
        <AuthHeading title="Welcome Back" subTitle="Enter your Credentials to access your account"/>
        <Form>
            <FieldContainer>
                <Label  htmlFor="name">Name</Label>
                <Input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                />
            </FieldContainer>

            <FieldContainer>
                <Label htmlFor="username">Username</Label>
                <Input
                    type="text"
                    id="username"
                    placeholder="Enter your username"
                />
            </FieldContainer>

            <FieldContainer>
                <Label htmlFor="password">Password</Label>
                <Input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                />
            </FieldContainer>

            

            <FormButton className="">Sign up</FormButton>

            <AuthFooter actionHref="/signup" questionText="Don&apos;t have an account? " actionText="Signup"/>
        </Form>
    </AuthContainer>
}