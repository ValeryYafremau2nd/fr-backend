import { injectable } from 'inversify';
import Favorite from '../database/models/favorite-model';
import Competition from '../database/models/competition-model';

@injectable()
class CompetitionService {
  async getMatches(code: string, user: string) {
    const matches = await Favorite.findOne({ user }).select('matches -_id');
    return Competition.getMatches(code, matches.matches);
  }
  async getStandings(code: string, user: string) {
    const trackedTeams = await Favorite.findOne({ user }).select('teams -_id');
    return Competition.getStandings(code, trackedTeams.teams);
  }
  async getLeagues() {
    return await Competition.find({});
  }
}

export default CompetitionService;
