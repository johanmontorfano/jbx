import {
    Name, 
    WritableName, 
    parse as parseName, 
    create as createName,
    resolve as resolveName,
    increment as incrementName,
    publish as publishRevision,
    from as fromName,
    v0
} from "w3name";
import {Metadata} from "./metadata";
import {decryptAES, encryptAES} from "../../crypto/aes";
import {FS3} from "..";
import {Crypto} from "./crypto";
import {StaticReference} from "./staticref";

const PRIV_KEY_META = new Metadata("web3name_mutkey", "");

/** A reference instance is used to manage a decentralized resource. */
export class Reference {
    // @ts-ignore
    private crypto: Crypto;
    private uploadableFiles: [Metadata, string][] = [];
    // @ts-ignore
    private w3name: Name | WritableName;
    // @ts-ignore
    private isNew: boolean;
    // @ts-ignore
    private FS3Instance: FS3;

    /** This object must not be instantiated using the constructor. */
    constructor() {}

    /** Please use `Armageddon.reference` to initialize such an object, as it 
     * will properly provide it the right parameters. And the documentation
     * about what to do with the parameters below will be much more precise.
     *
     * @param encryptionKey Key used to encrypt sensitive data.
     * @param fs3 FS3 instance used by the Armageddon instance.
     * @param ref Reference to the target item.
     */
    static async create(encryptionKey: string, fs3: FS3, ref?: string) {
        let output = new Reference();

        output.crypto = new Crypto(encryptionKey);
        output.FS3Instance = fs3;
        output.isNew = ref === undefined;

        // By default, the item is loaded readonly and a writable version is 
        // loaded whenever `commit` is called. This does not apply to `v0` that
        // already throws a writable version of the resource.
        output.w3name = 
            ref !== undefined ? parseName(ref) : await createName();
    
        return output;
    }

    /** Adds a dataset that can be uploaded. 
    *
    * @param data Any data that have to be stored.
    * @param metadata The `Metadata` class instance of this data. 
    * @param encrypt Should this dataset be encrypted. The instance that will
    * decrypt it will have to be instantiated with the same encryption key. 
    * (default: `false`) */
    add(data: string, metadata: Metadata, encrypt: boolean = false) {
        if (encrypt) data = this.crypto.encryptData(data);
    
        this.uploadableFiles.push([metadata, data]);
    
        return this;
    }

    /** Retrieve data from the current reference. When data is loaded from the
    * `Web3File.text` function, it's automatically decrypted. */
    async retrieve() {
        if (this.isNew)
            throw new Error("Cannot retrieve data from a new resource.");
        
        // Get the latest revision from a mutable resource. That's why only 
        // mutables resources with IPNS can be used.
        const latestRevision = await resolveName(this.w3name);
        
        return await new StaticReference(
            this.crypto.key, this.FS3Instance, latestRevision.value
        ).retrieve();
    }

    /** Upload data that needs to be uploaded to the blockchain. */
    async commit() {
        // If we are working with a new reference, the private key is already 
        // provided locally. Otherwise, we need to retrieve it back from the 
        // blockchain.
        // 
        // We need to perform this operation here to properly encrypt and load
        // the correct private key with the data that needs to be uploaded.
        const referencePrivateKey = this.isNew ? 
            String.fromCharCode(...(this.w3name as WritableName).key.bytes) :
            await this.retrieveMutabilityPrivateKey();

        if (referencePrivateKey === null)
            throw new Error("Failed to retrieve the reference's private key.");

        // Upload a new dataset and get the dataset's CID, then changes the 
        // reference of `this.w3name` with this CID.
        const uploadCID = await this.FS3Instance.uploadFiles(
            [...this.uploadableFiles.map(b => ({...b[0], content: b[1]})),
            {
                ...PRIV_KEY_META,
                content: encryptAES(this.crypto.key, referencePrivateKey) 
            }],
            "arma-mut-upload"
        );

        // If the current reference is new, we do not have to go through the 
        // revision retrieving process and only have to use `v0`.
        const rev = this.isNew ? await v0(this.w3name, uploadCID) :
            await incrementName(await resolveName(this.w3name), uploadCID);
      
        await publishRevision(
            rev, 
            (await fromName(new Uint8Array(
                referencePrivateKey.split("").map(b => b.charCodeAt(0)))
            )).key
        ).catch(function () { 
            throw new Error("Failed to update the `w3name` reference.")
        });

        return this.w3name.toString();
    }

    /** Extracts the mutability private key and decrypts it. It's the key used
    * to load a `WritableName` instance from an existing resource. */
    private async retrieveMutabilityPrivateKey() {
        const data = await this.retrieve(); 
        
        if (data === null)
            throw new Error("Failed to load reference's data.");

        // Encrypted key found, needs to be decrypted later.
        let foundKey: string | null = null;

        await data.forEachFile(async (file: any) => {
            if (file.name === PRIV_KEY_META.join()) { 
                foundKey = await file.text(); 
            }
        });

        return foundKey !== null ? decryptAES(this.crypto.key, foundKey) : null;
    }
}
