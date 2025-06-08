export default function AuthHeading({title, subTitle}: {
    title: string,
    subTitle: string
}) {
    return <div className="text-center p-4">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-gray-600 font-semibold">{subTitle}</p>
    </div>
}