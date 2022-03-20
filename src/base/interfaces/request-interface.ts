import {Request} from 'express';
import IUser from '../../database/interfaces/user/user-interface';

export interface UserRequest extends Request
{
    user: IUser;
}