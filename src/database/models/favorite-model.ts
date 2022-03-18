import * as mongoose from 'mongoose';
import Team from './team-model';
import Competition from './competition-model';
const favouriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'users',
    unique: true
  },
  teams: [],
  leagues: [],
  matches: [],
  timestamps: [],
  subscription: ''
});

favouriteSchema.statics.getFavorite = async function (user: any) {
  return await this.findOne({ user }).select('matches teams -_id');
};

favouriteSchema.statics.getMatches = async function (user: any) {
  const favorite = this.findOne({ user }).select('matches teams -_id');
  return Competition.aggregate([
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

favouriteSchema.statics.getLeagues = function (user: any) {
  return this.findOne({
    user
  }).select('leagues');
};

favouriteSchema.statics.getTeams = function (user: any) {
  return this.findOne({
    user
  }).select('teams');
};

favouriteSchema.statics.deleteMatch = (user: any, match: any) => {
  return Favourite.update(
    {
      user
    },
    {
      $pull: {
        matches: match
      }
    },
    {
      upsert: true
    }
  );
};
favouriteSchema.statics.deleteLeague = (user: any, league: any) => {
  return Favourite.update(
    {
      user
    },
    {
      $pull: {
        leagues: league
      }
    },
    {
      upsert: true
    }
  );
};
favouriteSchema.statics.deleteTeam = (user: any, team: any) => {
  return Favourite.update(
    {
      user
    },
    {
      $pull: {
        teams: team
      }
    },
    {
      upsert: true
    }
  );
};
favouriteSchema.statics.addMatch = (user: any, match: any) => {
  return Favourite.update(
    {
      user
    },
    {
      $push: {
        matches: match
      }
    },
    {
      upsert: true
    }
  );
};

favouriteSchema.statics.addLeague = (user: any, league: any) => {
  return Favourite.update(
    {
      user
    },
    {
      $push: {
        leagues: league
      }
    },
    {
      upsert: true
    }
  );
};

favouriteSchema.statics.addTeam = (user: any, team: any) => {
  return Favourite.update(
    {
      user
    },
    {
      $push: {
        teams: team
      }
    },
    {
      upsert: true
    }
  );
};
favouriteSchema.statics.addSubscription = (user: any, subscription: any) => {
  return Favourite.updateOne(
    {
      user
    },
    {
      $set: {
        subscription
      }
    },
    {
      upsert: true
    }
  );
};

const Favourite = mongoose.model('favourites', favouriteSchema);

export default Favourite;
