const mongoose = require('mongoose');
const Favourite = require('../favourites/favourite-model');
// const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const competitionSchema = new mongoose.Schema(
  {
    name: String,
    id: Number,
    emblemUrl: String,
    /*seasons: {
        type: Array
    },
    standings:
    matches:*/
  }
);

competitionSchema.statics.getMatchesToNotify = async function(competitionId, user) {
    const matches = (await Favourite.findOne({user}).select('matches -_id')) || [];
    return this.aggregate([{
        $project: {
            _id: 0,
            matches: 1
        }
    },{
        $unwind: '$matches'
    }, {
        $addFields: {
            "matches.dateComp": {"$cmp":["$matches.utcDate", new Date().toISOString()]}
        }
    },{
            $match: { "matches.dateComp": 1 }
        }, {
            $group: {
                _id: 0,
            matches: {
                $push: '$matches'
            }
            }
        }
    ])
  };

competitionSchema.statics.getMatches = async function(competitionId, user) {
    const matches = (await Favourite.findOne({user}).select('matches -_id')) || [];
    return this.aggregate([{
        $match: {
            id: competitionId
        }
    },{
        $project: {
            _id: 0,
            matches: 1
        }
    },{
        $unwind: '$matches'
    }, {
        $addFields: {
            "matches.tracked": {
                $in: ["$matches.id", matches.matches || []]
            },
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
            competitionId
        }
    }, {
        $sort: {
            _id: 1
        }
    }])
  };

competitionSchema.statics.getStandings = async function(competitionId, user) {
    const trackedTeams = (await Favourite.findOne({user}).select('teams -_id')) || [];
    console.log(trackedTeams)
    const standings = await this.aggregate([{
        $match: {
            id: competitionId
        }
    },/*{
        $project: {
            _id: 0,
            id: 1,
            standings: 1
        }
    },*/{
        $unwind: '$standings'
    },{
        $match: {
            'standings.type': 'TOTAL'
        }
    },{
        $group: {
            _id: '$standings.group',
            table: {
                $first: '$standings.table'
            }
        }
    },{
        $sort: {
            _id: 1
        }
    }, {
        $addFields: {
            competitionId

        }
    }])
    return standings.map(standing => {
        standing.table.map(position => {
            position.trackedTeam = trackedTeams.teams.includes(position.team.id);
            return position;
        })
        return standing;
    })
  };

competitionSchema.pre(/^find/, function(next) {
  this.select('-_id name id emblemUrl');
  next();
});
// tourSchema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
//   next();
// });

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   console.log(this.pipeline());
//   next();
// });
const Competition = mongoose.model('competition', competitionSchema);

module.exports = Competition;