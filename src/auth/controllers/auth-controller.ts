import * as jwt from 'jsonwebtoken';
import { TYPES } from '../../containers/types';
import UserService from '../services/user-service';
import {
  controller,
  BaseHttpController,
  httpGet,
  request,
  response,
  httpPost,
  next
} from 'inversify-express-utils';
import { inject } from 'inversify';
import ConfigService from '../../config/config-service';
import { NextFunction, Request, Response } from 'express';
import IUser from '../../database/interfaces/user/user-interface';
import BaseControllerError from '../../base/errors/base-controller-error';
import User from '../../database/models/user-model';

@controller('/api/v1/auth')
class AuthController extends BaseHttpController {
  constructor(
    @inject(TYPES.UserService) private readonly _userService: UserService,
    @inject(TYPES.ConfigService) private readonly _configService: ConfigService
  ) {
    super();
  }

  @httpPost('/signup')
  public async signup(
    @request() req: Request,
    @response() res: Response,
    @next() next: NextFunction
  ) {
    const newUser = await this._userService.createUser(
      req.body.email,
      req.body.password
    );
    if (!newUser) {
      return res.formatter.unauthorized('This name is already taken');
    }

    return this._sendToken(newUser, 201, req, res);
  }

  @httpPost('/login')
  public async login(
    @request() req: Request,
    @response() res: Response,
    @next() next: NextFunction
  ) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.formatter.unauthorized('Empty username or password');
    }
    const user = await this._userService.authenticateUser(email, password);
    if (!user || !(await User.correctPassword(password, user.password))) {
      return res.formatter.unauthorized('Incorrect username or password');
    }
    return this._sendToken(user, 200, req, res);
  }

  @httpPost('/login-oauth')
  public async loginOauth(
    @request() req: Request,
    @response() res: Response,
    @next() next: NextFunction
  ) {
    const { user: u, token } = req.body;

    if (!u || !token) {
      return res.formatter.unauthorized('Incorrect data');
    }
    const user = await this._userService.authenticateUserOauth(u, token);
    if (!user) {
      return res.formatter.unauthorized('Invalid username or password');
    }
    return this._sendToken(user, 200, req, res);
  }

  @httpGet('/logout')
  public async logout(@request() req: Request, @response() res: Response) {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.formatter.ok({ status: 'success' });
  }

  private _sendToken(
    user: IUser,
    statusCode: number,
    req: Request,
    res: Response
  ) {
    const token = jwt.sign({ id: user._id }, this._configService.JWT_SECRET, {
      expiresIn: this._configService.JWT_EXPIRES_IN
    });

    res.cookie('jwt', token, {
      expires: new Date(
        ((Date.now() + this._configService.JWT_COOKIE_EXPIRES_IN) as any) *
          24 *
          60 *
          60 *
          1000
      ),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });
    user.password = undefined;

    res.status(statusCode).json({
      status: 'success',
      token,
      expiresIn: +this._configService.JWT_EXPIRES_IN,
      data: {
        user
      }
    });
  }
}
export default AuthController;
