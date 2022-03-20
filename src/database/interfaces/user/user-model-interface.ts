import { Model } from 'mongoose';
import IUser from './user-interface';

interface IUserModel extends Model<IUser> {
    correctPassword(pass1: string, pass2: string): boolean;
}
export default IUserModel;
