import { Request, Response, NextFunction } from 'express';
import { promisify } from 'util';
import * as jwt from 'jsonwebtoken';
import User from '../../database/models/user-model';
import { BaseMiddleware } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import ConfigService from '../../config/config-service';
import { TYPES } from '../../types/types';

@injectable()
class ProtectMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.ConfigService) private readonly _configService: ConfigService
  ) {
    super();
  }
  public async handler(
    // fix test async
    req: any, // fix
    res: Response,
    next: NextFunction
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
      return res.status(401).send('Token expired.');
      /*return next(
          new AppError('You are not logged in! Please log in to get access.', 401)
        );*/
    }

    if (Date.now() >= (jwt.decode(token) as any).exp * 1000) {
      return res.status(401).send('Token expired.'); // fix
    }

    const decoded = await (promisify(jwt.verify) as any)(
      token,
      this._configService.JWT_SECRET
    );
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).send();
    }

    req.user = currentUser; // fix custom request class
    next();
  }
}

export default ProtectMiddleware;
