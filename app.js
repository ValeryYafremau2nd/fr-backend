const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const morgan = require('morgan');
const xss = require('xss-clean');
const req = require('sync-request');
const https = require('https');
const fs = require('fs');
const hpp = require('hpp');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const authRouter = require('./auth/auth-router')
const authController = require('./auth/auth-controller');
const Compression = require('./competitions/competition-model');
const Team = require('./teams/team-model');
const Favourite = require('./favourites/favourite-model');
const webpush = require('web-push');
/*const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const crypto = require('crypto');*/

dotenv.config();

const publicVapidKey = process.env.VAPID_PUB;
const privateVapidKey = process.env.VAPID_PRIV;
webpush.setVapidDetails('mailto:2@as.sd', publicVapidKey, privateVapidKey);
const app = express()
app.enable('trust proxy');
app.use(helmet())
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss())
app.use(hpp({
    whitelist: []
}))
app.use(compression())
app.use(cors())
app.use(bodyParser.json())
app.use(cookieParser())

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true/*,
    sslCA: [req('GET', 'https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem').body.toString()]*/
  })
  .then(() => console.log('DB connection successful!'));

// Protect all routes after this middleware
app.use('/api/v1/auth', authRouter);


app.options('*', cors());

app.get('/test', function (req, res) {
  res.send('hello world')
})

//notifications
let users = [];
app.post('/subscribe', authController.protect, async (req, res) => {
  const subscription = req.body;
  console.log(1)
  await Favourite.addSubscription(req.user.id, subscription)
  res.status(201).json({});
  const payload = JSON.stringify({
    "notification": {
        "title": "Angular News",
        "body": "Newsletter Available!",
        "icon": "assets/main-page-logo-small-hat.png",
        "vibrate": [100, 50, 100],
        "data": {
            "dateOfArrival": Date.now(), 
            "primaryKey": 1
        },
        "actions": [{
            "action": "explore",
            "title": "Go to the site"
        }]
    }
});
 users.push({user: req.user.id, subscription});
  webpush.sendNotification(subscription, payload).then(()=> console.log('notified')).catch(error => {
    console.error(error.stack);
  });
});

let matches = [];
const fetchMatches = async () => {
  matches = (await Compression.getMatchesToNotify())[0].matches;
}
fetchMatches()
setInterval(fetchMatches, 10000000)
/*
let matches = [{
  date: Date.now() + 600000,
  homeTeam: {
    name: 'team1',
    id: 80
  },
  awayTeam: {
    name: 'team2',
    id: 86
  },
  id: 1000
},{
  date: Date.now() + 600000 + 10000,
  homeTeam: {
    name: 'team3',
    id: 86
  },
  awayTeam: {
    name: 'team4',
    id: 80
  },
  id: 3000
},{
  date: Date.now() + 600000 + 20000,
  homeTeam: {
    name: 'team5',
    id: 80
  },
  awayTeam: {
    name: 'team6',
    id: 80
  },
  id: 285534
},]
*/
const timeToNotify = 10000000
setInterval(async () => {
  const matchesToNotify = [];
  const matchesCopy = [...matches]
  matchesCopy.find((match) => {
    if (new Date(match.utcDate) - timeToNotify < Date.now()) {
      matchesToNotify.push(matches.shift());
      return false;
    } 
    return true;
  })
  matchesToNotify.forEach(async (match) => {
    const users = (await Favourite.find({})).filter((user) => 
      user.teams.includes(match.homeTeam.id) ||
      user.teams.includes(match.awayTeam.id) ||
      user.matches.includes(match.id)
    );
    users.forEach((user) => {
      pushNotifications(user.subscription, match.homeTeam.name, match.awayTeam.name)
    });
  })
}, 10000)

const pushNotifications = (subscription, team1='team1', team2='team2', minutes='10') => {
    const payload = JSON.stringify({
    "notification": {
        "title": "Football reminder",
        "body": `Match ${team1} vs ${team2} is starting in ${minutes} minutes.`,
        "icon": "assets/main-page-logo-small-hat.png",
        "vibrate": [100, 50, 100],
        "data": {
            "dateOfArrival": Date.now(), 
            "primaryKey": 1
        },
        "actions": [{
            "action": "explore",
            "title": "Go to the site"
        }]
    }
});
  webpush.sendNotification(subscription, payload).then(()=> console.log('notified')).catch(error => {
    console.error(error.stack);
  });
}



app.delete('/favourite/team/:id', authController.protect, async (req, res) => {
  const team = await Favourite.deleteTeam(req.user.id, +req.params.id);
  console.log(team)
  res.json({
    status: 'success',
    data: team
  })
})
app.get('/favourite/leagues', authController.protect, async (req, res) => {
  const leagues = await Favourite.getLeagus(req.user.id);
  res.json({
    status: 'success',
    length: leagues.length,
    results: leagues
  })
})
app.get('/favourite/matches', authController.protect, async (req, res) => {
  const matches = await Favourite.getMatches(req.user.id);
  console.log(matches)
  res.json({
    status: 'success',
    length: matches.length,
    results: matches
  })
})
app.get('/favourite/teams', authController.protect, async (req, res) => {
  const teams = await Favourite.getTeams(req.user.id);
  console.log(teams)
  res.json({
    status: 'success',
    length: teams.length,
    results: teams
  })
})
app.get('/timestamps', authController.protect, async (req, res) => {
  const timestamps = await Favourite.getTimestamps(req.user.id);
  console.log(123)
  res.json({
    status: 'success',
    length: timestamps.length,
    results: timestamps.timestamps || []
  })
})
app.delete('/favourite/league/:id', authController.protect, async (req, res) => {
  const league = await Favourite.deleteLeague(req.user.id, +req.params.id);
  res.json({
    status: 'success',
    data: league
  })
})
app.delete('/favourite/match/:id', authController.protect, async (req, res) => {
  console.log(req.params.id)
  const match = await Favourite.deleteMatch(req.user.id, +req.params.id);
  res.json({
    status: 'success',
    data: match
  })
})
app.delete('/timestamp/:id', authController.protect, async (req, res) => {
  console.log(req)
  const timestamp = await Favourite.deleteTimestamp(req.user.id, req.params.id);
  res.json({
    status: 'success',
    data: req.params.id
  })
})
app.post('/favourite/team', authController.protect, async (req, res) => {
  const team = await Favourite.addTeam(req.user.id, req.body.team);
  console.log(team)
  res.json({
    status: 'success',
    data: team
  })
})
app.post('/favourite/league', authController.protect, async (req, res) => {
  const league = await Favourite.addLeague(req.user.id, req.body.league);
  res.json({
    status: 'success',
    data: league
  })
})
app.post('/favourite/match', authController.protect, async (req, res) => {
  const match = await Favourite.addMatch(req.user.id, req.body.match);
  res.json({
    status: 'success',
    data: match
  })
})
app.post('/timestamp', authController.protect, async (req, res) => {
  console.log('delete timestamp')
  const timestamp = await Favourite.addTimestamp(req.user.id, req.body.timestamp);
  res.json({
    status: 'success',
    data: req.body.timestamp
  }) 
})

app.get('/leagues/:id/strikers', authController.protect, (req, res) => res.json({id: req.params.id, strikers: []}))


app.get('/leagues/:id/matches', authController.protect, async (req, res, id) => {
  console.log(req.user)
  const matches = await Compression.getMatches(+req.params.id, req.user.id);
  console.log(matches)
  res.json({
    status: 'success',
    results: matches.length,
    data: matches
  })
})

app.get('/leagues/:id/standings', authController.protect, async (req, res) => {
  const standings = await Compression.getStandings(+req.params.id, req.user.id);
  console.log(standings)
  res.json({
    status: 'success',
    results: standings.length,
    data: standings
  })
})
app.get('/leagues', authController.protect, async (req, res) => 
{
  res.json(await Compression.find({}))
})
app.get('/teams', async (req, res) => {
  const teams = await Team.find()
  res.json({
    status: 'success',
    results: teams.length,
    data: teams
  })
})
app.get('/teams/:id', async (req, res) => {
  const team = await Team.find({ id: +req.params.id })
  res.json({
    status: 'success',
    data: team
  })
})


https.createServer(
  {
    key: fs.readFileSync('ssl.key'),
    cert: fs.readFileSync('ssl.cert')
  }, );(app).listen(port, () => console.log(`Listening on port ${port}!`))