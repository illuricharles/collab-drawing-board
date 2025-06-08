export default function AuthFooter({questionText, actionText, actionHref}: {
    questionText: string,
    actionText: string,
    actionHref: string
}) {
    return <div className="text-center">
        <p className="text-sm text-gray-600 font-semibold">{questionText}
            <a href={actionHref} className="text-gray-900 hover:underline cursor-pointer">{ actionText}</a>
        </p>
    </div>
}