export default class SubfolderFilter {

    #criteria1 = process.env.CRITERIA1;
    #criteria2 = process.env.CRITERIA2;

    filter(calls) {
        return calls.map(g => g.filter(c => this.doesNotMeetCriteria(c)));
    }

    doesNotMeetCriteria({ params }) {
        return !(
            params[1] == this.#criteria1 &&
            params[2] == this.#criteria2
        );
    }

}
