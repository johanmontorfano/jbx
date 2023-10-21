/** Manages data used to properly upload a resource through Armaggedon. */
export class Metadata {
    name: string;
    ext: string;

    constructor(name: string, extension?: string) {
        this.name = name;
        this.ext = extension || "";
    }

    join() { 
        return `${this.name}${this.ext !== "" ? "." + this.ext : ""}`; 
    }
}
