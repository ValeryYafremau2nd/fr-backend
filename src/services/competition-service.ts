import { injectable } from 'inversify';
import Favourite from '../database/models/favorite-model';
import Competition from '../database/models/competition-model';

@injectable()
class CompetitionService {
  async getMatches(competitionId: any, user: any) {
    const matches =
      (await Favourite.findOne({ user }).select('matches -_id')) || [];
    return (Competition as any).getMatches(competitionId, matches);
  }
  async getStandings(competitionId: any, user: any) {
    const trackedTeams =
      (await Favourite.findOne({ user }).select('teams -_id')) || [];
    return (Competition as any).getStandings(competitionId, trackedTeams);
  }
  async getLeagues() {
    return await (Competition as any).find({});
  }
}

export default CompetitionService;
