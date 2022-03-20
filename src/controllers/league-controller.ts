import {
  controller,
  BaseHttpController,
  httpGet,
  request,
  response,
  requestParam
} from 'inversify-express-utils';
import { TYPES } from '../types/types';
import { inject } from 'inversify';
import CompetitionService from '../services/competition-service';

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
    @request() req: any,
    @response() res: any
  ) {
    const matches1 = await this._competitionService.getMatches(
      +req.params.id,
      req.user.id
    );
    res.json({
      status: 'success',
      results: matches1.length,
      data: matches1
    });
  }

  @httpGet('/:id/standings', TYPES.ProtectMiddleware)
  public async getStandings(
    @requestParam('id') id: string,
    @request() req: any,
    @response() res: any
  ) {
    const standings = await this._competitionService.getStandings(
      +req.params.id,
      req.user.id
    );
    res.json({
      status: 'success',
      results: standings.length,
      data: standings
    });
  }

  @httpGet('/', TYPES.ProtectMiddleware) // fix middleware
  public async getLeagues(@request() req: any, @response() res: any) {
    res.json(await this._competitionService.getLeagues());
  }
}
export default LeagueController;
