import {test} from "node:test";
import assert from "node:assert";
import dotenv from "dotenv";

import {decryptAES, encryptAES} from "../crypto/aes";

dotenv.config();

test("FROM .ENV ENCRYPTION", function() {
    const encdata = encryptAES(process.env.W3NAME_AES_KEY as string, "data");
    console.log("encrypted data:", encdata);

    assert.equal(
        decryptAES(process.env.W3NAME_AES_KEY as string, encdata),
        "data"
    );
});

