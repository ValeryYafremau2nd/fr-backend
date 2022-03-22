import IMatch from './match-interface';

interface ICompetition {
  id: number;
  emblemUrl: string;
  name: string;
  code: string;
  matches: IMatch[];
}
export default ICompetition;
