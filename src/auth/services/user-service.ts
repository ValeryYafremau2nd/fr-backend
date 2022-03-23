import { inject, injectable } from 'inversify';
import User from '../../database/models/user-model';
import Favorite from '../../database/models/favorite-model';
import { OAuth2Client } from 'google-auth-library';
import { TYPES } from '../../containers/types';
import ConfigService from '../../config/config-service';

@injectable()
class UserService {
  private googleClient;
  constructor(
    @inject(TYPES.ConfigService)
    private readonly _configService: ConfigService
  ) {
    this.googleClient = new OAuth2Client(this._configService.GOOGLE_CLIENT_ID);
  }

  public async createUser(email: string, password: string) {
    const user = await User.findOne({ email });
    if (user !== null) {
      return;
    }
    const newUser = await User.create({
      email,
      password
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
    if (user) {
      return user;
    }
    return;
  }

  public async authenticateUserOauth(name: string, token: string) {
    this.verifyGoogleToken(token).catch(e => {
      console.log(e);
    });
    await User.update(
      { email: name },
      {
        $set: {
          email: name,
          password: token
        }
      },
      {
        upsert: true
      }
    );
    const user = await User.findOne({ email: name }).select(
      '+password -passwordConfirm'
    );
    const fav = await Favorite.findOne({ user: user._id });
    if (!fav) {
      Favorite.create({
        user: user._id,
        teams: [],
        matches: [],
        leagues: []
      });
    }
    return user;
  }

  public async verifyGoogleToken(token: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: this._configService.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  }
}

export default UserService;
