class BaseControllerError extends Error {
    constructor(message: string, private statusCode: number) {
        super(message)
    }
    getCode() {
        return this.statusCode;
    }
    getMessage() {
        return this.message;
    }
}
export default BaseControllerError;