import Crypto from "crypto-js";

export function encryptAES(key: string, data: any) {
    return Crypto.AES.encrypt(JSON.stringify(data), key).toString();
}

export function decryptAES(key: string, encchain: string): string {
    return JSON.parse(
        Crypto.AES.decrypt(encchain, key).toString(Crypto.enc.Utf8)
    );
}
