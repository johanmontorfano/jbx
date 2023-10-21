import { Web3Storage, File, CIDString } from "web3.storage";

/** Web3 FileSystem Utils
 * 
 * This class is used to make decentralized storage easy to use.
 * It uses Web3.storage, it may not be suitable for big projects.
 * */
export class FS3 {
    storageInstance: Web3Storage;

    constructor(accessToken: string) {
        this.storageInstance = new Web3Storage({ token: accessToken });
    }

    private makeFileName(name: string, extension: string) {
        return `${name}${extension === "" ? "" : `.${extension}`}`;
    }

    /** Upload multiple files and reurn their CID. */
    async uploadFiles(
        files: {name: string, ext: string, content: string}[],
        uploadName: string
    ) {
        const batch = files
            .map(f => new File([f.content], this.makeFileName(f.name, f.ext)));
        const cid = await this.storageInstance.put(batch, { name: uploadName });

        return cid;
    }

    /** Upload a file to the decentralized network and returns it's CID */
    async uploadFile(
        content: string, name: string, extension: string, uploadName?: string
    ) {
        const filename = this.makeFileName(name, extension);
        const file = new File([content], filename);
        const cid = await this.storageInstance.put(
            [file], 
            { name: uploadName || filename }
        );

        return cid;
    }

    /** Upload a file with upload progression tracking. */
    async uploadFileWithProgression(
        content: string, 
        name: string, 
        extension: string, 
        onRootCidReady: (cid: CIDString) => void,
        onStoredChunk: (size: number) => void
    ) {
        const filename = this.makeFileName(name, extension);
        return this.storageInstance.put(
            [new File([content], filename)], 
            { onRootCidReady, onStoredChunk, name: filename }
        );
    }

    /** Retrieve all resources linked to a CID. */
    async retrieveCID(cid: string) {
        return await this.storageInstance.get(cid);
    }

    /** Retrieve status of a CID. */
    async retrieveStatus(cid: string) {
        return await this.storageInstance.status(cid);
    }

    /** Retrieve all the user's uploads. */
    async getUploads() {
        return this.storageInstance.list();
    }
}

