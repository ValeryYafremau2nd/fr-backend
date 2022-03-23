import { Response, NextFunction, Request } from 'express';
import { promisify } from 'util';
import * as jwt from 'jsonwebtoken';
import User from '../../database/models/user-model';
import { BaseMiddleware, next } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import ConfigService from '../../config/config-service';
import { TYPES } from '../../containers/types';
import { UserRequest } from '../../base/interfaces/request-interface';
import BaseControllerError from '../../base/errors/base-controller-error';

@injectable()
class ProtectMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.ConfigService) private readonly _configService: ConfigService
  ) {
    super();
  }
  public async handler(
    req: UserRequest,
    res: Response,
    @next() next: NextFunction
  ) {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return res.formatter.forbidden(
        'You are not logged in! Please log in to get access'
      );
    }

    if (!jwt.decode(token)) {
      return res.formatter.forbidden('Token is empty');
    }

    if (Date.now() >= (jwt.decode(token) as any).exp * 1000) {
      return res.formatter.forbidden('Token expired');
    }

    const decoded = await (promisify(jwt.verify) as any)(
      token,
      this._configService.JWT_SECRET
    );
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.formatter.forbidden('User not found');
    }

    req.user = currentUser;
    next();
  }
}

export default ProtectMiddleware;
