const publicVapidKey = process.env.VAPID_PUB;
const privateVapidKey = process.env.VAPID_PRIV;
const webpush = require('web-push');
import {
  controller,
  BaseHttpController,
  httpGet,
  request,
  response,
  requestParam,
  httpPost,
  next
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { TYPES } from '../containers/types';
import Favorite from '../database/models/favorite-model';
import NotificationService from '../services/notification-service';
import { NextFunction, Request, Response } from 'express';
import { UserRequest } from '../base/interfaces/request-interface';
import BaseControllerError from '../base/errors/base-controller-error';

@controller('/subscribe')
class NotificationController extends BaseHttpController {
  constructor /*@inject(TYPES.NotificationService)
    private readonly _notificationService: NotificationService*/() {
    super();
    webpush.setVapidDetails(
      'mailto:2@as.sd', // cork
      process.env.VAPID_PUB,
      process.env.VAPID_PRIV
    );
  }

  @httpPost('/', TYPES.ProtectMiddleware)
  public async getLeagues(
    @request() req: UserRequest,
    @response() res: Response,
    @next() next: NextFunction
  ) {
    const subscription = req.body;
    try {
      await Favorite.addSubscription(req.user.id, subscription);
    } catch (e) {
      return res.status(500).send("Couldn't subscribe to notifications.");
    }
    return res.status(201).json({});
  }
}
export default NotificationController;
