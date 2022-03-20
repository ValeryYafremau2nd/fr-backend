import * as jwt from 'jsonwebtoken';
import { TYPES } from '../../types/types';
import UserService from '../services/user-service';
import {
  controller,
  BaseHttpController,
  httpGet,
  request,
  response,
  httpPost
} from 'inversify-express-utils';
import { inject } from 'inversify';
import ConfigService from '../../config/config-service';
import { Response } from 'express';

@controller('/api/v1/auth')
class AuthController extends BaseHttpController {
  constructor(
    @inject(TYPES.UserService) private readonly _userService: UserService,
    @inject(TYPES.ConfigService) private readonly _configService: ConfigService
  ) {
    super();
  }

  @httpPost('/signup')
  public async signup(@request() req: any, @response() res: Response) {
    const newUser = await this._userService.createUser(
      req.body.email,
      req.body.password
    );
    if (!newUser) {
      return res.status(401).send('This username is already taken.');
    }

    return this._sendToken(newUser, 201, req, res);
  }

  @httpPost('/login')
  public async login(@request() req: any, @response() res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).send('Empty username or password');
      // return next(new AppError('Please provide email and password!', 400));
    }
    const user = await this._userService.authenticateUser(email, password);
    if (!user) {
      return res.status(401).send('Invalid username or password');
      // return next(new AppError('Incorrect email or password', 401));
    }
    return this._sendToken(user, 200, req, res);
  }

  @httpPost('/login-oauth')
  public async loginOauth(@request() req: any, @response() res: Response) {
    const { user: u, token } = req.body;

    if (!u || !token) {
      return res.status(401).send('Incorrect data');
      // return next(new AppError('Please provide email and password!', 400));
    }
    const user = await this._userService.authenticateUserOauth(u, token);
    if (!user) {
      return res.status(401).send('Invalid username or password');
      // return next(new AppError('Incorrect email or password', 401));
    }
    return this._sendToken(user, 200, req, res);
  }

  @httpGet('/logout', TYPES.ProtectMiddleware)
  public async logout(@request() req: any, @response() res: Response) {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  }

  private _sendToken(user: any, statusCode: any, req: any, res: Response) {
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

    // Remove password from output
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
