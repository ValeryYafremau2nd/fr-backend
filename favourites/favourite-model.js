const mongoose = require('mongoose');
const Team = require('../teams/team-model');
const favouriteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            unique: true
        },
      teams: [],
      leagues: [],
      matches: [/*{
        type: String,
        unique: true
      }*/],
      timestamps: [],
      subscription: '' 
    }
);

favouriteSchema.statics.getMatches = async function(user) {
    const matches = await this.findOne({user}).select('matches teams -_id');
   // console.log(Competition)
    return require('../competitions/competition-model').aggregate([{
      $project: {
          _id: 0,
          matches: 1
      }
  },{
      $unwind: '$matches'
  }, {
    $addFields: {
        "matches.tracked": {
          $in: ["$matches.id", matches.matches]
        },
        "matches.homeTeam.tracked": {
          $in: ["$matches.homeTeam.id", matches.teams]
        },
        "matches.awayTeam.tracked": {
          $in: ["$matches.awayTeam.id", matches.teams]
        }
    }
  }, {
    $match: {
      // replace with filter
        $or: [{
          "matches.tracked": true
        }, {
          "matches.homeTeam.tracked": true
        }, {
          "matches.awayTeam.tracked": true
        }]
    }
  },{
    $addFields: {
        "matches.matchDay": { 
            "$dateToString": {
                format: "%Y-%m-%d",
                date: {
                    $dateFromString: {
                        dateString: "$matches.utcDate"
                    }
                }
            }
        }
    }
  },{
      $sort: {
          utcDate: 1
      }
  },{
      $group: {
          _id: '$matches.matchDay',
          matches: {
              $push: '$matches'
          }
      }
  }, {
      $addFields: {
          competitionId: 2001
      }
  }, {
      $sort: {
          _id: 1
      }
    }])
};

favouriteSchema.statics.getLeagues = function(user) {
    return this.findOne({
        user
    }).select('leagues');
};

favouriteSchema.statics.getTeams = async function(user) {
    const ids = await this.findOne({
          user
    }).select('teams');
    console.log(ids)
    return Team.find({
      id: {
        $in: ids.teams
      }
    })
};


favouriteSchema.statics.deleteMatch = function(user, match) {
  console.log(match)
  return Favourite.update({
      user
    }, {
      $pull: {
        matches: match
      }
    }, {
      upsert: true
    });
  };
  favouriteSchema.statics.deleteLeague = function(user, league) {
    return Favourite.update({
        user
      }, {
        $pull: {
          leagues: league
        }
      }, {
        upsert: true
      });
    };
    favouriteSchema.statics.deleteTeam = function(user, team) {
      return Favourite.update({
          user
        }, {
          $pull: {
            teams: team
          }
        }, {
          upsert: true
        });
      };
favouriteSchema.statics.addMatch = function(user, match) {
  return Favourite.update({
      user
    }, {
      $push: {
        matches: match
      }
    }, {
      upsert: true
    });
  };

  favouriteSchema.statics.addLeague = function(user, league) {
    return Favourite.update({
        user
      }, {
        $push: {
          leagues: league
        }
      }, {
        upsert: true
      });
    };

favouriteSchema.statics.addTeam = function(user, team) {
  return Favourite.update({
      user
    }, {
      $push: {
        teams: team
      }
    }, {
      upsert: true
    });
  };

favouriteSchema.statics.deleteTimestamp = function(user, timestamp) {
  console.log(timestamp)
  return Favourite.update({
      user
    }, {
      $pull: {
        timestamps: timestamp
      }
    }, {
      upsert: true
    });
  };

  

favouriteSchema.statics.getTimestamps = async function(user) {
  return this.findOne({
    user
}).select('timestamps');
};

favouriteSchema.statics.addTimestamp = function(user, timestamp) {
  console.log(timestamp)
  return Favourite.update({
      user
    }, {
      $push: {
        timestamps: timestamp
      }
    }, {
      upsert: true
    });
};
favouriteSchema.statics.addSubscription = function(user, subscription) {
  console.log(1)
  return Favourite.updateOne({
      user
    }, {
      $set: {
        subscription
      }
    }, {
      upsert: true
    });
  };


  const Favourite = mongoose.model('favourites', favouriteSchema);
  
  module.exports = Favourite;