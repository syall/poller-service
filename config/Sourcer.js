import Activity from '../src/Activity.js';

export default class Sourcer {

    #sourceName = process.env.SOURCE_NAME;
    #deadName = process.env.DEAD_NAME;

    #server = null;
    #interval = process.env.INTERVAL;
    #pollClient = () => {

        const stat = `Polling ${this.#sourceName}, Backup ${this.#deadName}`;
        console.log(`${stat}: ${new Date().toISOString()}`);

        const fields = [];
        const fieldCount = process.env.FIELD_COUNT;
        for (let i = 0; i < fieldCount; i++) fields.push(
            // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
            Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16)
        );

        const separator = ',';
        const delimiter = '|';
        const numFields = process.env.NUM_FIELDS;

        // u = a,b,c
        const createUnit = () => {
            let unitFields = numFields;
            // https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
            const result = new Array(unitFields);
            let len = fields.length;
            const taken = new Array(len);
            while (unitFields >= 0) {
                const x = Math.floor(Math.random() * len);
                result[unitFields - 1] = fields[x in taken ? taken[x] : x];
                taken[x] = --len in taken ? taken[len] : len;
                unitFields--;
            }
            return result.join(separator);
        };

        // m = a,b,c|d,e,f|g,h,i
        const createMessage = () => {
            const result = [];
            const numUnits = Math.floor(Math.random() * 10) + 4;
            for (let i = 0; i < numUnits; i++)
                result.push(createUnit());
            return result.join(delimiter);
        };

        // p = [m1,m2,m3]
        const createPoll = () => {
            const result = [];
            const numMessages = Math.floor(Math.random() * 10) + 4;
            for (let i = 0; i < numMessages; i++)
                result.push(createMessage());
            return result;
        };

        return createPoll();
    };

    start() {
        console.log(`Start Application: ${new Date().toISOString()}`);
        const serverAction = () => {
            const response = this.#pollClient();
            for (const r of response)
                new Activity().activate(r);
        };
        serverAction();
        this.#server = setInterval(serverAction, this.#interval);
        process.on('exit', this.stop);
        return this;
    }

    stop() {
        if (this.#server) {
            clearInterval(this.#server);
            this.#server = null;
            console.log(`Stop Application: ${new Date().toISOString()}`);
        }
    }

}
