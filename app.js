const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const morgan = require('morgan');
const xss = require('xss-clean');
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
/*const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const crypto = require('crypto');*/

dotenv.config();

const app = express()
app.enable('trust proxy');
app.use(helmet())
const port = 80
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
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

// Protect all routes after this middleware
app.use('/api/v1/auth', authRouter);


app.options('*', cors());

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))