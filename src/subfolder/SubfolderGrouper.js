export default class SubfolderGrouper {

    group(units) {
        units.sort((u1, u2) => u1[0].localeCompare(u2[0]));
        const groups = [];
        let field = units[0][0];
        let i = 0, prev = 0;
        for (; i < units.length; i++) {
            if (field !== units[i][0]) {
                const subgroup = units.slice(prev, i);
                groups.push(subgroup.map(u => this.transform(u)));
                field = units[i][0];
                prev = i;
            }
        }
        const subgroup = units.slice(prev, i);
        groups.push(subgroup.map(u => this.transform(u)));
        return groups;
    }

    transform(unit) {
        unit[process.env.TRANSFORM] = unit[1] + unit[2];
        return unit;
    }

}
