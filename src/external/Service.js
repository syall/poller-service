export default class Service {

    call(fields) {
        return {
            field: fields[0],
            params: { ...fields, 0: undefined }
        };
    }

}
