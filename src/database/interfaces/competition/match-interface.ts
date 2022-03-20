interface IMatch {
  id: number;
  utcDate: string;
  status: string; // fix enum
  matchDay: string;
  tracked: boolean;
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  score: {
    fullTime: {
      homeTeam: number;
      awayTeam: number;
    };
  };
}
export default IMatch;
