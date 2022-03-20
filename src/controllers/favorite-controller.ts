import { TYPES } from '../containers/types';
import {
  requestParam,
  request,
  response,
  controller,
  BaseHttpController,
  httpGet,
  httpPost,
  httpDelete
} from 'inversify-express-utils';
import FavoritesService from '../services/favorites-service';
import { inject } from 'inversify';
import { NextFunction, Response } from 'express';
import { UserRequest } from '../base/interfaces/request-interface';
import BaseControllerError from '../base/errors/base-controller-error';

@controller('/favourite')
class FavoriteController extends BaseHttpController {
  constructor(
    @inject(TYPES.FavoritesService)
    private readonly _favoriteService: FavoritesService
  ) {
    super();
  }
  @httpGet('/matches', TYPES.ProtectMiddleware)
  public async getMatches(@request() req: UserRequest, @response() res: Response, next: NextFunction) {
    let matches;
    try {
      matches = await this._favoriteService.getMatches(req.user.id);
    } catch(e) {
      return next(
          new BaseControllerError('Couldn\'t get matches.', 500)
        );
    }
    return res.json({
      status: 'success',
      length: matches.length,
      results: matches
    });
  }
  @httpGet('/teams', TYPES.ProtectMiddleware)
  public async getTeams(@request() req: UserRequest, @response() res: Response, next: NextFunction) {
    let teams;
    try {

    teams = await this._favoriteService.getTeams(req.user.id);
    } catch(e) {
      return next(
          new BaseControllerError('Couldn\'t get teams.', 500)
        );
    }
    return res.json({
      status: 'success',
      length: teams.length,
      results: teams
    });
  }

  @httpPost('/match', TYPES.ProtectMiddleware)
  public async postMatch(@request() req: UserRequest, @response() res: Response, next: NextFunction) {
    let match;
    try {
       match = await this._favoriteService.addMatch(
        req.user.id,
        req.body.match
      );
    } catch(e) {
      return next(
          new BaseControllerError('Couldn\'t add a match .', 500)
        );
    }
    return res.json({
      status: 'success',
      data: match
    });
  }

  @httpPost('/team', TYPES.ProtectMiddleware)
  public async postTeam(@request() req: UserRequest, @response() res: Response, next: NextFunction) {
    let team;
    try {
      team = await this._favoriteService.addTeam(
        req.user.id,
        req.body.team
      );
    } catch(e) {
      return next(
          new BaseControllerError('Couldn\'t add a team .', 500)
        );
    }
    return res.json({
      status: 'success',
      data: team
    });
  }

  @httpDelete('/match/:id', TYPES.ProtectMiddleware)
  public async deleteMatch(
    @requestParam('id') id: string,
    @request() req: UserRequest,
    @response() res: Response, next: NextFunction
  ) {
    let match;
    try {
      match = await this._favoriteService.deleteMatch(
        req.user.id,
        +req.params.id
      );
    } catch(e) {
      return next(
          new BaseControllerError('Couldn\'t delete a match .', 500)
        );
    }
    return res.json({
      status: 'success',
      data: match
    });
  }

  @httpDelete('/team/:id', TYPES.ProtectMiddleware)
  public async deleteTeam(
    @requestParam('id') id: string,
    @request() req: UserRequest,
    @response() res: Response, next: NextFunction
  ) {
    let team;
    try {
      team = await this._favoriteService.deleteTeam(
        req.user.id,
        +req.params.id
      );
    } catch(e) {
      return next(
          new BaseControllerError('Couldn\'t delete a team .', 500)
        );
    }
    return res.json({
      status: 'success',
      data: team
    });
  }
}
export default FavoriteController;
