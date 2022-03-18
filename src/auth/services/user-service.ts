import { injectable } from 'inversify';
import User from '../../database/models/user-model';
import Favorite from '../../database/models/favorite-model';
import { OAuth2Client } from 'google-auth-library';

@injectable()
class UserService {
  private googleClient = new OAuth2Client(
    '124452340094-n9trtaie2urmc0n9ke9mca6urhh3djds.apps.googleusercontent.com'
  ); // fix

  public async createUser(email: string, password: string) {
    const user = await User.findOne({ email });
    if (user !== null) {
      return; // custom error
    }
    const newUser = await User.create({
      email,
      password,
      passwordConfirm: password // fix
    });
    await Favorite.create({
      user: newUser._id,
      teams: [],
      matches: [],
      leagues: []
    });
    return newUser;
  }

  public async authenticateUser(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.correctPassword(password, user.password))) {
      return user;
    }
    return;
  }

  public async authenticateUserOauth(name: string, token: string) {
    this.verifyGoogleToken(token).catch(e => {
      console.log(e);
    }); // fix
    await User.update(
      { email: name }, // fix
      {
        $set: {
          email: name,
          oauthToken: token,
          password: token,
          passwordConfirm: token // fix
        }
      },
      {
        upsert: true
      }
    );
    const user = await User.findOne({ email: name });
    const fav = await Favorite.findOne({ user: user._id });
    fav ||
      Favorite.create({
        user: user._id,
        teams: [],
        matches: [],
        leagues: []
      });
    return user;
  }

  public async verifyGoogleToken(token: string) {
    this.googleClient.revokeToken;
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience:
        '124452340094-n9trtaie2urmc0n9ke9mca6urhh3djds.apps.googleusercontent.com' // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      // [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
  }
}

export default UserService;
