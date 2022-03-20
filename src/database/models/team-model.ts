import * as mongoose from 'mongoose';
import ITeam from '../interfaces/team/team-interface';

const teamSchema = new mongoose.Schema<ITeam>(); // fix add fields
const Team = mongoose.model('teams', teamSchema);

export default Team;
