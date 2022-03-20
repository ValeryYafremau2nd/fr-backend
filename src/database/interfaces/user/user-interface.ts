interface IUser {
  _id: string;
  id: string;
  email: string;
  password: string;
  passwordConfirm: string;
  active: boolean;
}
export default IUser;
