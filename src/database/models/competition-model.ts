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

competitionSchema.statics.getMatchesToNotify = async function (
  competitionId: any,
  user: any
) {
  const matches =
    (await Favourite.findOne({ user }).select('matches -_id')) || [];
  return this.aggregate([
    {
      $match: { 'id': competitionId }
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
        'matches.dateComp': {
          $cmp: [
            '$matches.utcDate',
            new Date().toISOString()
          ]
        }
      }
    },
    {
      $match: { 'matches.dateComp': 1 }
    },
    /*{
      $or: [ {$match: { 'matches.season.id': 733 }},
      {$match: { 'matches.season.id': 380 }},
      {$match: { 'matches.season.id': 742 }},
      {$match: { 'matches.season.id': 734 }},
      {$match: { 'matches.season.id': 757 }},
    ]
    },*/
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
    },
    /*{
        $project: {
            _id: 0,
            id: 1,
            standings: 1
        }
    },*/ {
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
