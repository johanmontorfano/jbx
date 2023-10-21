import { encryptAES, decryptAES } from "../../crypto/aes";

const ENC_DATA_MARKER = "armaenc+";

/** Crypto utils for decentralized items */
export class Crypto {
    key: string;

    constructor(key: string) {
        this.key = key;
    }

    /** Encrypts data when requested. A marker is added at the beginning to
    * make encrypted data automatically decrypted with the matching encryption
    * key. */
    encryptData(data: string): string {
        return `${ENC_DATA_MARKER}${encryptAES(this.key, data)}`;
    }

    /** Decrypts a dataset encrypted by `Reference.encryptData`. This function
    * will not fail and just return without alteration values passed that are
    * not encrypted with `Reference.encryptData`. */
    decryptData(data: string): string {
        if (!data.startsWith(ENC_DATA_MARKER)) return data; 
        return decryptAES(this.key, data.replace(ENC_DATA_MARKER, ""));
    }
}
