import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import AuthController from './auth/controllers/auth-controller';
import LeagueController from './controllers/league-controller';

import FavoriteController from './controllers/favorite-controller';
import mainContainer from './containers';
import mainLoader from './loaders';
import DBConnection from './database/db-connection';
import ConfigService from './config/config-service';
import { TYPES } from './containers/types';
import NotificationController from './controllers/notification-controller';
import { Request, Response } from 'express';
import BaseControllerError from './base/errors/base-controller-error';

const initialization =
  DBConnection &&
  FavoriteController &&
  LeagueController &&
  AuthController &&
  NotificationController &&
  ConfigService;
const dbcon = mainContainer.get(TYPES.DBConnection);

const server = new InversifyExpressServer(mainContainer);
server.setConfig(mainLoader);
server.setErrorConfig(app => {
  app.use((err: BaseControllerError, req: Request, res: Response) => {
    console.error(err.stack);
    res.status(err.getCode()).send({ status: 'erorr', message: err.getMessage()});
  });
});

const ap2p = server.build();
ap2p.listen(process.env.PORT || 3000);

// heroku never sleeps
const https = require('https');
setInterval(() => {
  https.get('https://guarded-beyond-86562.herokuapp.com');
}, 300000);
