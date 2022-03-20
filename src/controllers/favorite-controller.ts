import { TYPES } from '../types/types';
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
import { Response } from 'express';

@controller('/favourite')
class FavoriteController extends BaseHttpController {
  constructor(
    @inject(TYPES.FavoritesService)
    private readonly _favoriteService: FavoritesService
  ) {
    super();
  }
  @httpGet('/matches', TYPES.ProtectMiddleware)
  public async getMatches(@request() req: any, @response() res: Response) {
    const matches1 = await this._favoriteService.getMatches(req.user.id);
    res.json({
      status: 'success',
      length: matches1.length,
      results: matches1
    });
  }
  @httpGet('/teams', TYPES.ProtectMiddleware)
  public async getTeams(@request() req: any, @response() res: Response) {
    const teams = await this._favoriteService.getTeams(req.user.id);
    res.json({
      status: 'success',
      length: teams.length,
      results: teams
    });
  }

  @httpPost('/match', TYPES.ProtectMiddleware)
  public async postMatch(@request() req: any, @response() res: Response) {
    const match = await this._favoriteService.addMatch(
      req.user.id,
      req.body.match
    );
    res.json({
      status: 'success',
      data: match
    });
  }

  @httpPost('/team', TYPES.ProtectMiddleware)
  public async postTeam(@request() req: any, @response() res: Response) {
    const team = await this._favoriteService.addTeam(
      req.user.id,
      req.body.team
    );
    res.json({
      status: 'success',
      data: team
    });
  }

  @httpDelete('/match/:id', TYPES.ProtectMiddleware)
  public async deleteMatch(
    @requestParam('id') id: string,
    @request() req: any,
    @response() res: Response
  ) {
    const match = await this._favoriteService.deleteMatch(
      req.user.id,
      +req.params.id
    );
    res.json({
      status: 'success',
      data: match
    });
  }

  @httpDelete('/team/:id', TYPES.ProtectMiddleware)
  public async deleteTeam(
    @requestParam('id') id: string,
    @request() req: any,
    @response() res: Response
  ) {
    const team = await this._favoriteService.deleteTeam(
      req.user.id,
      +req.params.id
    );
    res.json({
      status: 'success',
      data: team
    });
  }
}
export default FavoriteController;
