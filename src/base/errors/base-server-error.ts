class BaseControllerError extends Error {
    constructor(message: string, private statusCode: number) {
        super(message)
    }
}
export default BaseControllerError;