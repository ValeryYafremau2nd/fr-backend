import { injectable } from 'inversify';
import Favorite from '../database/models/favorite-model';
import Competition from '../database/models/competition-model';
import Team from '../database/models/team-model';

@injectable()
class FavoritesService {
  async getMatches(user: string) {
    const favorite = await Favorite.getFavorite(user);
    console.log(JSON.stringify(favorite))
    return Competition.getAllTrackedMatches(favorite);
  }
  async getTeams(user: string) {
    const teamIds = await Favorite.getTeams(user);
    return Team.find({
      id: {
        $in: teamIds.teams
      }
    });
  }
  deleteTeam(user: string, team: number) {
    return Favorite.deleteTeam(user, team);
  }
  addTeam(user: string, team: number) {
    return Favorite.addTeam(user, team);
  }
  deleteMatch(user: string, match: number) {
    return Favorite.deleteMatch(user, match);
  }
  addMatch(user: string, match: number) {
    return Favorite.addMatch(user, match);
  }
}

export default FavoritesService;
