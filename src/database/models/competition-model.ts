import * as mongoose from 'mongoose';
import Favourite from './favorite-model';

const competitionSchema = new mongoose.Schema({
  name: String,
  id: Number,
  emblemUrl: String
  /*seasons: {
        type: Array
    },
    standings:
    matches:*/
});

competitionSchema.statics.getMatchesById = async function (
  competitionId: any,
  matches: any
) {
  return this.aggregate([
    {
      $project: {
        _id: 0,
        matches: 1
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

competitionSchema.statics.getMatchesToNotify = async function (
) {
  return this.aggregate([
    {
      $project: {
        _id: 0,
        matches: 1
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
  competitionId: any,
  matches: any
) {
  return this.aggregate([
    {
      $match: {
        id: competitionId
      }
    },
    {
      $project: {
        _id: 0,
        matches: 1
      }
    },
    {
      $unwind: '$matches'
    },
    {
      $addFields: {
        'matches.tracked': {
          $in: ['$matches.id', matches.matches || []]
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
        competitionId
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
  favorite: any
) {
  return this.aggregate([
    {
      $project: {
        _id: 0,
        matches: 1
      }
    },
    {
      $unwind: '$matches'
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
        // replace with filter
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
        competitionId: 2001
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
  competitionId: any,
  trackedTeams: any
) {
  const standings = await this.aggregate([
    {
      $match: {
        id: competitionId
      }
    },{
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
        competitionId
      }
    }
  ]);
  return standings.map((standing: any) => {
    standing.table.map((position: any) => {
      position.trackedTeam = trackedTeams.teams.includes(position.team.id);
      return position;
    });
    return standing;
  });
};

competitionSchema.pre(/^find/, function (next: any) {
  (this as any).select('-_id name id emblemUrl');
  next();
});
const Competition = mongoose.model('competition', competitionSchema);

export default Competition;
