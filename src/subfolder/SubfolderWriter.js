import UnitSerializer from '../utils/UnitSerializer.js';
import * as crypto from 'crypto';
import { join, resolve } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

export default class SubfolderWriter {

    #unitSerializer = new UnitSerializer();
    #publishClient = (bucket, key, data) => {
        const dest = join(resolve(), process.env.DEST);
        if (!existsSync(dest))
            mkdirSync(dest);
        if (!existsSync(join(dest, bucket)))
            mkdirSync(join(dest, bucket));
        const path = join(dest, bucket, key);
        writeFileSync(path, data);
        const date = new Date().toISOString();
        console.log(`Publish to ${bucket}/${key} at ${date}`);
    };

    writeToDestination(filtered) {
        for (const f of filtered) {
            const field = f[0].field;
            const uuid = crypto.randomBytes(10).toString('hex');
            const date = new Date().toISOString();
            const key = `${field}_${uuid}_${date}`;
            const payload = f
                .map(u => this.#unitSerializer.toPayload(u))
                .join('\n');
            this.#publishClient(field, key, payload);
        }
    }

}
