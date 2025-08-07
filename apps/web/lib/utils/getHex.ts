export default function getHex() {
    return Array.from(crypto.getRandomValues((new Uint8Array(10)))).map(byte => byte.toString(16).padStart(2, '0')).join('')

}