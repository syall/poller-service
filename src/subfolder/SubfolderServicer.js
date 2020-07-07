import Service from '../external/Service.js';

export default class SubfolderServicer {

    #service = new Service();

    call(fields, groups) {
        const calls = [];
        for (let i = 0; i < fields.length && i < groups.length; i++) {
            const group = groups[i];
            const field = fields[i];
            const subcalls = group.map(u => this.#service.call(field, u));
            calls.push(subcalls);
        }
        return calls;
    }

}
