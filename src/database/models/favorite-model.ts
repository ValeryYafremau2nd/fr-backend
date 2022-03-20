import * as mongoose from 'mongoose';
import Team from './team-model';
import Competition from './competition-model';
import ISubscription from '../interfaces/favorite/subscription-interface';
import IFavoriteModel from '../interfaces/favorite/favorite-model-interface';
import IFavorite from '../interfaces/favorite/favorite-interface';
const favoriteSchema = new mongoose.Schema<IFavorite, IFavoriteModel>({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'users',
    unique: true
  },
  teams: [Number],
  leagues: [Number],
  matches: [Number],
  timestamps: [],
  subscription: ''
});

favoriteSchema.statics.getFavorite = async function (user: string) {
  return await this.findOne({ user }).select('matches teams -_id');
};
/*
favoriteSchema.statics.getMatches = async function (user: string) {
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
      $group: {
        _id: '$matches.matchDay',
        matches: {
          $push: '$matches'
        }
      }
    }
  ]);
};
*/
favoriteSchema.statics.getLeagues = function (user: string) {
  return this.findOne({
    user
  }).select('leagues');
};

favoriteSchema.statics.getTeams = function (user: string) {
  return this.findOne({
    user
  }).select('teams');
};

favoriteSchema.statics.deleteMatch = (user: string, match: number) => {
  return Favorite.update(
    // fix in all file
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
favoriteSchema.statics.deleteLeague = (user: string, league: number) => {
  return Favorite.update(
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
favoriteSchema.statics.deleteTeam = (user: string, team: number) => {
  return Favorite.update(
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
favoriteSchema.statics.addMatch = (user: string, match: number) => {
  return Favorite.update(
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

favoriteSchema.statics.addLeague = (user: string, league: number) => {
  return Favorite.update(
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

favoriteSchema.statics.addTeam = (user: string, team: number) => {
  return Favorite.update(
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
favoriteSchema.statics.addSubscription = (
  user: string,
  subscription: ISubscription
) => {
  return Favorite.updateOne(
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

const Favorite = mongoose.model<IFavorite, IFavoriteModel>(
  'Favorites',
  favoriteSchema
);

export default Favorite;
