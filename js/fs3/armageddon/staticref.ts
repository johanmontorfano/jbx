import {Web3File} from "web3.storage";
import {FS3} from "..";
import {Crypto} from "./crypto";
import {Metadata} from "./metadata";

/** A StaticReference instance of a non-mutable decentralized resource. */
export class StaticReference {
    private FS3Instance: FS3;
    private crypto: Crypto;
    private cid?: string;
    private uploadableFiles: [Metadata, string][] = [];

    /** Will create a new instance of StaticReference to manage a reference,
    * please use `Armageddon.staticReference` to initialize such an object, as
    * it will properly provide it the right parameters. and the documentation
    * about what to do with the parameters below will be much more complete.
    *
    * @param encryptionKey Key used to encrypt senstive data.
    * @param fs3 FS3 instance used by the Armageddon instance.
    * @param cid CID of the target item. */
    constructor(encryptionKey: string, fs3: FS3, cid?: string) {
        this.FS3Instance = fs3;
        this.crypto = new Crypto(encryptionKey);
        this.cid = cid;
    }
    
    /** When `cid` is provided in the constructor, it loads the data linked to
    * this CID. When data is loaded from the `Web3File.text` function, it's
    * automatically decrypted. */
    async retrieve() {
        if (this.cid === undefined)
            throw new Error("Cannot use `download`, no CID provided.");

        const data = await this.FS3Instance.retrieveCID(this.cid);

        if (data === null)
            throw new Error("FS3Instance failed to retrieve datasets.");

        (data as any).filesGetter = data.files;
        data.files = async (): Promise<Web3File[]> => {
            const files: Web3File[] = await (data as any).filesGetter();

            for (const fileRef in files) {
                const file: any = files[fileRef];
                (file as any).textGetter = file.text;
                file.text = async (): Promise<string> => {
                    const text: string = await (file as any).textGetter();
                    return this.crypto.decryptData(text);
                }
            }

            return files;

        };

        return {
            get data() { return data; },
            async files() { return await data?.files(); },
            async forEachFile(callback: (file: Web3File) => any) {
                const files = await data?.files();
                for (const fileRef in files) {
                    await callback(files[fileRef as any] as any);
                }
            }
        }
    }

    /** Add any kind of data that can be uploaded.
    * @param data Any data that have to be stored. 
    * @param metadata The `Metadata` class instance of this data. 
    * @param encrypt Should this dataset by encrypted. The instance that will
    * decrypt it will have to be instantiated with the same encryption key. 
    * (default: `false`) */
    add(data: string, metadata: Metadata, encrypt: boolean = false) {
        if (this.cid !== undefined)
            throw new Error("Tried to edit a already saved static resource.");
        if (encrypt) data = this.crypto.encryptData(data);

        this.uploadableFiles.push([metadata, data]);

        return this;
    }

    /** Upload data that needs to be uploaded to the blockchain.
     * @param name Name of the data uploaded. It can be used later to determine
     * what datasets corresponds to. It's however optional.
     * @returns The dataset identifier (CID) */
    async commit(name?: string) {
        if (this.cid !== undefined)
            throw new Error("Tried to edit a already saved static resource.");
        
        const cid = await this.FS3Instance.uploadFiles(
            [...this.uploadableFiles.map(b => ({...b[0], content: b[1]}))], 
            name || ""
        );

        return cid;
    }
}   
