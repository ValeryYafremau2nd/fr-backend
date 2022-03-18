import * as mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(); // fix add fields
const Team = mongoose.model('teams', teamSchema);

export default Team;
