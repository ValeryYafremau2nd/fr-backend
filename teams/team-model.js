const mongoose = require('mongoose');
// const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const teamSchema = new mongoose.Schema();
const Team = mongoose.model('teams', teamSchema);

module.exports = Team;