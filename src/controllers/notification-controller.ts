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
  httpPost
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { TYPES } from '../types/types';
import Favorite from '../database/models/favorite-model';
import Competition from '../database/models/competition-model';
import NotificationService from '../services/notification-service';

const users = [];
@controller('/subscribe')
class NotificationController extends BaseHttpController {
  constructor(
    @inject(TYPES.NotificationService)
    private readonly _notificationService: NotificationService
  ) {
    super();
    webpush.setVapidDetails(
      'mailto:2@as.sd',
      process.env.VAPID_PUB,
      process.env.VAPID_PRIV
    );
  }

  @httpPost('/', TYPES.ProtectMiddleware) // fix middleware
  public async getLeagues(@request() req: any, @response() res: any) {
    const subscription = req.body;
    await Favorite.addSubscription(req.user.id, subscription);
    res.status(201).json({});
    const payload = JSON.stringify({
      notification: {
        title: 'Match tracker',
        body: 'Match notifications are on.'
      }
    });
    users.push({ user: req.user.id, subscription });
  }
}
export default NotificationController;
