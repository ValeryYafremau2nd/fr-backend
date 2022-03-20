import { Model } from 'mongoose';
import IFavorite from './favorite-interface';
import ISubscription from './subscription-interface';

interface IFavoriteModel extends Model<IFavorite> {
  getFavorite(user: string): Promise<IFavorite>;
  getMatches(user: string): Promise<number[]>;
  getTeams(user: string): Promise<{ teams: number[] }>;
  getLeagues(user: string): Promise<number[]>;
  deleteLeague(user: string, league: number): Promise<void>;
  deleteMatch(user: string, match: number): Promise<void>;
  deleteTeam(user: string, team: number): Promise<void>;
  addLeague(user: string, league: number): Promise<void>;
  addMatch(user: string, match: number): Promise<void>;
  addTeam(user: string, team: number): Promise<void>;
  addSubscription(user: string, subscribtion: ISubscription): Promise<void>;
}
export default IFavoriteModel;
