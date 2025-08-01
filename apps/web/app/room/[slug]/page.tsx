
import ChatInterface from "./components/ChatInterface"



export default async function Page({params}: {
    params: Promise<{slug: string}>
}) {
    const {slug} = await params
    // make client component  so that i can make the http request to the with token and get the chats
    // add input in the same to send the message 
    // connect ws and send the message

    return <div>
        {slug}
        <ChatInterface slug={slug}/>
    </div>
}