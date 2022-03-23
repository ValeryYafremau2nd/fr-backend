import { Model } from 'mongoose';
import IFavorite from '../favorite/favorite-interface';
import ICompetition from './competition-interface';
import IMatch from './match-interface';
import IMatchesResult from './matches-result-interface';
import IStanding from './standing-interface';

interface ICompetitionModel extends Model<ICompetition> {
  getMatches(code: string, matches: number[]): Promise<IMatchesResult[]>;
  getMatchesById(matches: number[]): Promise<IMatchesResult[]>;
  getMatchesToNotify(): Promise<IMatchesResult[]>;
  getAllTrackedMatches(favorite: IFavorite): Promise<IMatchesResult[]>;
  getStandings(code: string, trackedTeams: number[]): Promise<IStanding[]>;
}
export default ICompetitionModel;
