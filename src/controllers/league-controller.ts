import {
  controller,
  BaseHttpController,
  httpGet,
  request,
  response,
  requestParam
} from 'inversify-express-utils';
import { TYPES } from '../containers/types';
import { inject } from 'inversify';
import CompetitionService from '../services/competition-service';
import { NextFunction, Request, Response } from 'express';
import { UserRequest } from '../base/interfaces/request-interface';
import BaseControllerError from '../base/errors/base-controller-error';

@controller('/leagues')
class LeagueController extends BaseHttpController {
  constructor(
    @inject(TYPES.CompetitionService)
    private readonly _competitionService: CompetitionService
  ) {
    super();
  }

  @httpGet('/:id/matches', TYPES.ProtectMiddleware)
  public async getMatches(
    @requestParam('id') id: string,
    @request() req: UserRequest,
    @response() res: Response, next: NextFunction
  ) {
    let matches;
    try {
      matches = await this._competitionService.getMatches(
        +req.params.id,
        req.user.id
      );
    } catch(e) {
      return next(
          new BaseControllerError('Couldn\'t get matches.', 500)
        );
    }
    return res.json({
      status: 'success',
      results: matches.length,
      data: matches
    });
  }

  @httpGet('/:id/standings', TYPES.ProtectMiddleware)
  public async getStandings(
    @requestParam('id') id: string,
    @request() req: UserRequest,
    @response() res: Response, next: NextFunction
  ) {
    let standings;
    try {
      standings = await this._competitionService.getStandings(
        +req.params.id,
        req.user.id
      );
    } catch(e) {
      return next(
          new BaseControllerError('Couldn\'t get standings.', 500)
        );
    }
    return res.json({
      status: 'success',
      results: standings.length,
      data: standings
    });
  }

  @httpGet('/', TYPES.ProtectMiddleware)
  public async getLeagues(@request() req: Request, @response() res: Response, next: NextFunction) {
    let leagues;
    try {
      leagues = await this._competitionService.getLeagues();
    } catch(e) {
      return next(
          new BaseControllerError('Couldn\'t get leagues.', 500)
        );
    }
    return res.json(leagues);
  }
}
export default LeagueController;
