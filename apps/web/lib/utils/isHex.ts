export default function isHex(roomId: string, length?: number): boolean {
  const hexRegex = length
    ? new RegExp(`^[a-fA-F0-9]{${length}}$`)
    : /^[a-fA-F0-9]+$/
  return hexRegex.test(roomId)
}