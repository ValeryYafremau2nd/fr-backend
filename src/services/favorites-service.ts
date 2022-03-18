import { injectable } from 'inversify';
import Favourite from '../database/models/favorite-model';
import Competition from '../database/models/competition-model';
import Team from '../database/models/team-model';

@injectable()
class FavoritesService {
  async getMatches(user: any) {
    const favorite = await (Favourite as any).getFavorite(user);
    return (Competition as any).getAllTrackedMatches(favorite);
  }
  async getTeams(user: any) {
    const teamIds = await (Favourite as any).getTeams(user);
    return Team.find({
      id: {
        $in: teamIds.teams
      }
    });
  }
  deleteTeam(user: any, team: any) {
    return (Favourite as any).deleteTeam(user, team);
  }
  addTeam(user: any, team: any) {
    return (Favourite as any).addTeam(user, team);
  }
  deleteMatch(user: any, match: any) {
    return (Favourite as any).deleteMatch(user, match);
  }
  addMatch(user: any, match: any) {
    return (Favourite as any).addMatch(user, match);
  }
}

export default FavoritesService;
