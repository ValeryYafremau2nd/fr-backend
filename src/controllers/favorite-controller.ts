import { TYPES } from '../containers/types';
import {
  requestParam,
  request,
  response,
  controller,
  BaseHttpController,
  httpGet,
  httpPost,
  httpDelete,
  next
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
  public async getMatches(
    @request() req: UserRequest,
    @response() res: Response,
    @next() next: NextFunction
  ) {
    let matches;
    try {
      matches = await this._favoriteService.getMatches(req.user.id);
    } catch (e) {
      return res.formatter.serverError("Couldn't get matches");
    }
    return res.formatter.ok(matches);
  }
  @httpGet('/teams', TYPES.ProtectMiddleware)
  public async getTeams(
    @request() req: UserRequest,
    @response() res: Response,
    @next() next: NextFunction
  ) {
    let teams;
    try {
      teams = await this._favoriteService.getTeams(req.user.id);
    } catch (e) {
      return res.formatter.serverError("Couldn't get teams");
    }
    return res.formatter.ok(teams);
  }

  @httpPost('/match', TYPES.ProtectMiddleware)
  public async postMatch(
    @request() req: UserRequest,
    @response() res: Response,
    @next() next: NextFunction
  ) {
    let match;
    try {
      match = await this._favoriteService.addMatch(req.user.id, req.body.match);
    } catch (e) {
      return res.formatter.serverError("Couldn't add a match");
    }
    return res.formatter.created(match);
  }

  @httpPost('/team', TYPES.ProtectMiddleware)
  public async postTeam(
    @request() req: UserRequest,
    @response() res: Response,
    @next() next: NextFunction
  ) {
    let team;
    try {
      team = await this._favoriteService.addTeam(req.user.id, req.body.team);
    } catch (e) {
      return res.formatter.serverError("Couldn't add a team.");
    }
    return res.formatter.created(team);
  }

  @httpDelete('/match/:id', TYPES.ProtectMiddleware)
  public async deleteMatch(
    @requestParam('id') id: string,
    @request() req: UserRequest,
    @response() res: Response,
    @next() next: NextFunction
  ) {
    let match;
    try {
      match = await this._favoriteService.deleteMatch(
        req.user.id,
        +req.params.id
      );
    } catch (e) {
      return res.formatter.serverError("Couldn't delete a match");
    }
    return res.formatter.ok(match);
  }

  @httpDelete('/team/:id', TYPES.ProtectMiddleware)
  public async deleteTeam(
    @requestParam('id') id: string,
    @request() req: UserRequest,
    @response() res: Response,
    @next() next: NextFunction
  ) {
    let team;
    try {
      team = await this._favoriteService.deleteTeam(
        req.user.id,
        +req.params.id
      );
    } catch (e) {
      return res.formatter.serverError("Couldn't delete a team");
    }
    return res.formatter.ok(team);
  }
}
export default FavoriteController;
