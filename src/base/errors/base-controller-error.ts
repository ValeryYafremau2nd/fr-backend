class BaseControllerError {
  constructor(private message: string, private statusCode: number) {
    // super(message);
  }
  getCode() {
    return this.statusCode;
  }
  getMessage() {
    return this.message;
  }
}
export default BaseControllerError;
