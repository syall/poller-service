import UnitSerializer from '../dependencies/UnitSerializer.js';
import * as crypto from 'crypto';
import { join, resolve } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

export default class DestinationClient {

    #unitSerializer = new UnitSerializer();
    #publishClient = (bucket, key, data) => {
        const dest = join(resolve(), 'dest');
        if (!existsSync(dest))
            mkdirSync(dest);
        if (!existsSync(join(dest, bucket.lvl1)))
            mkdirSync(join(dest, bucket.lvl1));
        if (!existsSync(join(dest, bucket.lvl1, bucket.lvl2)))
            mkdirSync(join(dest, bucket.lvl1, bucket.lvl2));
        const path = `${join(dest, bucket.lvl1, bucket.lvl2)}/${key}`;
        writeFileSync(path, this.#unitSerializer.toPayload(data));
        const date = new Date().toISOString();
        console.log(`Publish to ${bucket.lvl1}/${bucket.lvl2} at ${date}`);
    };

    writeToDestination(filtered) {
        const bucket = {
            lvl1: filtered[0][0].params[1],
            lvl2: filtered[0][0].params[2]
        };
        const field = filtered[0][0].field;
        const uuid = crypto.randomBytes(10).toString('hex');
        const date = new Date().toISOString();
        const key = `${field}_${uuid}_${date}`;
        const payload = filtered.map(u => this.#unitSerializer.toPayload(u));
        this.#publishClient(bucket, key, payload);
    }

}
