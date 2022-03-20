import ISubscription from './subscription-interface';

interface IFavorite {
  user: string;
  teams: number[];
  leagues: number[];
  matches: number[];
  timestamps: string[];
  subscription: ISubscription;
}
export default IFavorite;
