import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import AuthController from './auth/controllers/auth-controller';
import LeagueController from './controllers/league-controller';

import FavoriteController from './controllers/favorite-controller';
import mainContainer from './containers';
import mainLoader from './loaders';
import DBConnection from './database/db-connection';
import ConfigService from './config/config-service';
import { TYPES } from './types/types';
import NotificationController from './controllers/notification-controller';
import { NextFunction, Request, Response } from 'express';

// init in container?
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
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('!');
  });
});

const ap2p = server.build();
ap2p.listen(process.env.PORT || 3000);

// heroku never sleeps
const https = require('https');
setInterval(() => {
  https.get('https://guarded-beyond-86562.herokuapp.com');
}, 300000);
