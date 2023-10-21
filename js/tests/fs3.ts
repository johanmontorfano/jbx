import test from "node:test";
import assert from "node:assert";
import dotenv from "dotenv";

import {FS3} from "../fs3";
import {Armageddon} from "../fs3/armageddon";
import {Metadata} from "../fs3/armageddon/metadata";

dotenv.config();

const fs3 = new FS3(process.env.WEB3_STORAGE_SECRET as any);
const arma = new Armageddon(process.env.WEB3_STORAGE_SECRET as any);

let upload_cid: string;
let static_cid_arma: string;
let mut_cid_w3name: string;

test("FS3 UPLOAD HELLO WORLD", async function() {
    upload_cid = await fs3.uploadFile("HELLO WORLD", "hello", "txt");
    assert.notEqual(upload_cid, null);
});

test("FS3 UPLOAD RANDOM", async function() {
    await fs3.uploadFile(Math.random().toString(), "rand", "txt");
});

test("FS3 GET UPLOADED ASSETS", async function() {
    assert.notEqual(fs3.getUploads(), null);
});

test("FS3 RETRIEVE FROM CID", async function() {
    const cid = await fs3.retrieveCID(upload_cid);
    assert.notEqual(cid, null);
    assert.equal(Array.isArray(await cid?.files()), true);
});

test("ARMAGEDDON STATIC UPLOAD", async function() {
    static_cid_arma = await arma.staticReference()
        .add("HELLO STATIC", new Metadata("hello"))
        .add("HELLO STATIC CRYPTO", new Metadata("crypto"), true)
        .commit();
    assert.notEqual(static_cid_arma, null);
});

test("ARMAGEDDON STATIC DOWNLOAD + CRYPTO TEST", async function() {
    const data = await arma.staticReference(static_cid_arma)
        .retrieve();
    const files: any[] = await data.files();

    assert.equal(await files[1].text(), "HELLO STATIC");
    assert.equal(await files[0].text(), "HELLO STATIC CRYPTO");
});

test("ARMAGEDDON STORE FILES WITHIN SAME CID", async function() {
   mut_cid_w3name = await (await arma.reference())
        .add("HELLO WORLD", new Metadata("english"))
        .add("BONJOUR MONDE", new Metadata("french"))
        .commit();
});

test("ARMAGEDDON MUTATE W3NAME REF", async function() {
    await (await arma.reference(mut_cid_w3name))
        .add("HELLO CRYPTO", new Metadata("crypted"), true)
        .commit();
});

test("ARMAGEDDON TEST RETRIEVE + MUTABILITY", async function() {
    const files = await (await (await arma.reference(mut_cid_w3name))
        .retrieve())
        .files();

    // WE ONLY EXPECT ONE FILE - _mut_key_.key excluded - WITH A PREDICTABLE 
    // CONTENT, SEE TEST "ARMAGGEDON MUTATE MUTABLE W3NAME REF".

    const file = (files as any[])[0];
    assert.equal(
        `${file.name} ${await file.text()}`, 
        "crypted HELLO CRYPTO"
    );
});
