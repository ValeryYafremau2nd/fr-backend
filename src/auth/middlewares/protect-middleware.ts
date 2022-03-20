import { Response, NextFunction, Request } from 'express';
import { promisify } from 'util';
import * as jwt from 'jsonwebtoken';
import User from '../../database/models/user-model';
import { BaseMiddleware } from 'inversify-express-utils';
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
  public async handler(req: UserRequest, res: Response, next: NextFunction) {
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
      return next(
          new BaseControllerError('You are not logged in! Please log in to get access.', 401)
        );
    }

    if (!jwt.decode(token)) {
      return next(
          new BaseControllerError('Token is empty.', 401)
        );
    }

    if (Date.now() >= (jwt.decode(token) as any).exp * 1000) {
      return next(
          new BaseControllerError('Token expired.', 401)
        );
    }

    const decoded = await (promisify(jwt.verify) as any)(
      token,
      this._configService.JWT_SECRET
    );
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
          new BaseControllerError('User not found.', 401)
        );
    }

    req.user = currentUser;
    next();
  }
}

export default ProtectMiddleware;
