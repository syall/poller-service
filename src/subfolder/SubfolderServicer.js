import Service from '../external/Service.js';

export default class SubfolderServicer {

    #service = new Service();

    call(groups) {
        const calls = [];
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const subcalls = group.map(u => this.#service.call(u));
            calls.push(subcalls);
        }
        return calls;
    }

}
