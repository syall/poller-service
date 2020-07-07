export default class SubfolderGrouper {

    group(units) {
        const groups = [];
        const fields = [];
        let field = units[0][0];
        let i = 0, prev = 0;
        for (; i < units.length; i++) {
            if (field === units[i][0]) {
                continue;
            } else {
                const subgroup = units.slice(prev, i);
                groups.push(subgroup.map(u => this.transform(u)));
                fields.push(field);
                field = units[i][0];
                prev = i;
            }
        }
        if (groups.length === 0) {
            fields.push(field);
            groups.push(units.map(u => this.transform(u)));
        } else {
            const subgroup = units.slice(prev, i);
            groups.push(subgroup.map(u => this.transform(u)));
            fields.push(field);
        }
        return [fields, groups];
    }

    transform(unit) {
        delete unit[0];
        return unit;
    }

}
