import {FS3} from "..";
import {Reference} from "./reference";
import {StaticReference} from "./staticref";

/** This API is used to abstract the usage of web3.storage by using common 
* API-designs of SaaS storage services such as Firebase. */
export class Armageddon {
    private FS3Instance: FS3;
    private encryptionKey: string;

    /**
    * @param accessToken web3.storage account access token.
    * @param encryptionKey Custom encryption key to use to encrypt sensitive
    * infos, it's highly recommended to provide a custom encryption key as the
    * default one ("armaggedon") will be used otherwise (and everyone knows it
    * lol).
    * */
    constructor(accessToken: string, encryptionKey?: string) {
        this.FS3Instance = new FS3(accessToken);
        this.encryptionKey = encryptionKey || "armaggedon";

        if (encryptionKey === undefined) 
            console.warn("No encryption key has been provided.");
    }

    /** Allows to perform actions on a specific resource through the ref of a
    * resource. If no reference is provided, it will perform actions on a new 
    * resource and return a new reference ID.
    *
    * If you want to manipulate and save static resources that will never be 
    * updated, please use `staticReference` or `FS3` instead - `staticReference`
    * is meant to be more friendly and easy to use than `FS3` -
    * 
    * ⚠ Using the right method (either `reference` or `staticReference`) is 
    * important because web3.storage sets limits for requests on mutable
    * resources (which are managed by `reference`)
    *
    * Please take care to provide a IPNS reference of a `w3name`, that's the 
    * reference ID returned when creating a resource with this function.
    *
    * This function will use the instance's encryption key to protect every 
    * reference it had managed from being illegally modified. So don't worry
    * about anyone modifying this reference, as parts that could allow it are
    * encrypted.
    * 
    * @param ref Will be used to retrieve the data about this reference. Not 
    * providing any value for this parameter (undefined) will provoke the 
    * creation of a new resource.
    * @returns A `Reference` instance. */
    async reference(ref?: string): Promise<Reference> {
        return Reference.create(this.encryptionKey, this.FS3Instance, ref);
    }

    /** Allows to perform actions on static resources. Thus save or load a 
    * specific resource. 
    *
    * If you want to manipulate mutable resources, please use `reference`.
    *
    * Please take care to provide a CID reference. Any other kind of references,
    * such as `IPNS` references, may cause issues and unexpected behaviors.
    *
    * This function will use the instance's encryption key to protect every
    * resource saved/loaded. It will prevent senstive resources to have their
    * content readable by anyone. 
    *
    * @param cid Will be used to retrieve the data about this resource. Not
    * providing any value will lead to the creation of a new resource.
    * @returns A `StaticReference` instance.*/
    staticReference(cid?: string): StaticReference {
        return new StaticReference(this.encryptionKey, this.FS3Instance, cid);     
    }
}

