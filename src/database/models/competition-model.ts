import { Schema, model, HookNextFunction } from 'mongoose';
import ICompetition from '../interfaces/competition/competition-interface';
import ICompetitionModel from '../interfaces/competition/competition-model-interface';
import IPosition from '../interfaces/competition/position-interface';
import IStanding from '../interfaces/competition/standing-interface';
import IFavorite from '../interfaces/favorite/favorite-interface';

const competitionSchema = new Schema<ICompetition, ICompetitionModel>();

competitionSchema.statics.getMatchesById = async function (matches: number[]) {
  return this.aggregate([
    {
      $project: {
        _id: 0,
        emblemUrl: 1,
        matches: 1
      }
    },
    {
      $addFields: {
        'matches.emblemUrl': '$emblemUrl'
      }
    },
    {
      $unwind: '$matches'
    },
    { $match: { $expr: { $in: ['$matches.id', matches] } } },
    {
      $match: { 'matches.status': 'FINISHED' }
    },
    {
      $group: {
        _id: 0,
        matches: {
          $push: '$matches'
        }
      }
    }
  ]);
};

competitionSchema.statics.getMatchesToNotify = async function () {
  return this.aggregate([
    {
      $project: {
        _id: 0,
        emblemUrl: 1,
        matches: 1
      }
    },
    {
      $addFields: {
        'matches.emblemUrl': '$emblemUrl'
      }
    },
    {
      $addFields: {
        'matches.emblemUrl': '$emblemUrl'
      }
    },
    {
      $unwind: '$matches'
    },
    {
      $match: { 'matches.status': 'IN_PLAY' }
    },
    {
      $group: {
        _id: 0,
        matches: {
          $push: '$matches'
        }
      }
    }
  ]);
};

competitionSchema.statics.getMatches = async function (
  code: string,
  matches: number[]
) {
  return this.aggregate([
    {
      $match: {
        code
      }
    },
    {
      $project: {
        _id: 0,
        emblemUrl: 1,
        matches: 1
      }
    },
    {
      $addFields: {
        'matches.emblemUrl': '$emblemUrl'
      }
    },
    {
      $unwind: '$matches'
    },
    {
      $match: {
        'matches.status': { $not: { $eq: 'CANCELLED' } }
      }
    },
    {
      $addFields: {
        'matches.tracked': {
          $in: ['$matches.id', matches || []]
        },
        'matches.matchDay': {
          $dateToString: {
            format: '%Y-%m-%d',
            date: {
              $dateFromString: {
                dateString: '$matches.utcDate'
              }
            }
          }
        }
      }
    },
    {
      $sort: {
        utcDate: 1
      }
    },
    {
      $group: {
        _id: '$matches.matchDay',
        matches: {
          $push: '$matches'
        }
      }
    },
    {
      $addFields: {
        code
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]);
};

competitionSchema.statics.getAllTrackedMatches = async function (
  favorite: IFavorite
) {
  return this.aggregate([
    {
      $project: {
        _id: 0,
        emblemUrl: 1,
        matches: 1
      }
    },
    {
      $addFields: {
        'matches.emblemUrl': '$emblemUrl'
      }
    },
    {
      $unwind: '$matches'
    },
    {
      $match: {
        'matches.status': { $not: { $eq: 'CANCELLED' } }
      }
    },
    {
      $addFields: {
        'matches.tracked': {
          $in: ['$matches.id', favorite.matches]
        },
        'matches.homeTeam.tracked': {
          $in: ['$matches.homeTeam.id', favorite.teams]
        },
        'matches.awayTeam.tracked': {
          $in: ['$matches.awayTeam.id', favorite.teams]
        }
      }
    },
    {
      $match: {
        $or: [
          {
            'matches.tracked': true
          },
          {
            'matches.homeTeam.tracked': true
          },
          {
            'matches.awayTeam.tracked': true
          }
        ]
      }
    },
    {
      $addFields: {
        'matches.matchDay': {
          $dateToString: {
            format: '%Y-%m-%d',
            date: {
              $dateFromString: {
                dateString: '$matches.utcDate'
              }
            }
          }
        }
      }
    },
    {
      $sort: {
        'matches.utcDate': 1
      }
    },
    {
      $group: {
        _id: '$matches.matchDay',
        matches: {
          $push: '$matches'
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]);
};

competitionSchema.statics.getStandings = async function (
  code: string,
  trackedTeams: number[]
) {
  const standings = await this.aggregate([
    {
      $match: {
        code
      }
    },
    {
      $unwind: '$standings'
    },
    {
      $match: {
        'standings.type': 'TOTAL'
      }
    },
    {
      $group: {
        _id: '$standings.group',
        table: {
          $first: '$standings.table'
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    },
    {
      $addFields: {
        code
      }
    }
  ]);
  return standings.map((standing: IStanding) => {
    standing.table.map((position: IPosition) => {
      position.trackedTeam = trackedTeams.includes(position.team.id);
      return position;
    });
    return standing;
  });
};

competitionSchema.pre(/^find/, function (next: HookNextFunction) {
  (this as any).select('-_id name id emblemUrl code');
  next();
});
const Competition = model<ICompetition, ICompetitionModel>(
  'competition',
  competitionSchema
);

export default Competition;
