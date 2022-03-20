import { injectable } from 'inversify';
import Favorite from '../database/models/favorite-model';
import Competition from '../database/models/competition-model';
import IMatch from '../database/interfaces/competition/match-interface';
import IFavorite from '../database/interfaces/favorite/favorite-interface';
import ISubscription from '../database/interfaces/favorite/subscription-interface';
const webpush = require('web-push');

@injectable()
class NotificationService {
  private startedMatches = new Set();
  constructor() {
    this.prepareNotifications();
    setInterval(this.prepareNotifications.bind(this), 100000);
  }
  private async prepareNotifications() {
    const matchesToNotify = (await Competition.getMatchesToNotify())[0];
    const favorites = await Favorite.find({});
    console.log(this.startedMatches);
    if (matchesToNotify)
      matchesToNotify.matches.forEach((match: IMatch) => {
        favorites.forEach((user: IFavorite) => {
          if (
            (user.teams.includes(match.homeTeam.id) ||
              user.teams.includes(match.awayTeam.id) ||
              user.matches.includes(match.id)) &&
            user.subscription &&
            !this.startedMatches.has(match.id)
          ) {
            console.log(`started ${match.id}`);
            this.startedMatches.add(match.id);
            this.pushStartNotification(user.subscription, match);
          }
        });
      });
    const statusedMatches = await Competition.getMatchesById(
      Array.from(this.startedMatches) as number[]
    );
    if (statusedMatches[0])
      statusedMatches[0].matches.forEach((finishedMatch: IMatch) => {
        console.log(`finished ${finishedMatch.id}`);
        this.startedMatches.delete(finishedMatch.id);
        favorites.forEach((user: IFavorite) => {
          if (
            (user.teams.includes(finishedMatch.homeTeam.id) ||
              user.teams.includes(finishedMatch.awayTeam.id) ||
              user.matches.includes(finishedMatch.id)) &&
            user.subscription
          ) {
            this.pushEndNotification(user.subscription, finishedMatch);
          }
        });
      });
  }
  private pushEndNotification(subscription: ISubscription, match: IMatch) {
    const payload = JSON.stringify({
      notification: {
        title: `${match.homeTeam.name} ${match.score.fullTime.homeTeam} : ${match.score.fullTime.awayTeam} ${match.awayTeam.name}`,
        body: `The match has just finished.`,
        icon: '',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        }
      }
    });
    this.sendNotification(subscription, payload);
  }

  private async fetchMatches() {
    return (await Competition.getMatchesToNotify())[0];
  }

  private pushStartNotification(subscription: ISubscription, match: IMatch) {
    const payload = JSON.stringify({
      notification: {
        title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        body: `The match has just started.`,
        icon: 'assets/main-page-logo-small-hat.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        }
      }
    });
    this.sendNotification(subscription, payload);
  }

  private sendNotification(subscription: ISubscription, payload: any) {
    webpush
      .sendNotification(subscription, payload)
      .then(() => {
        /*console.log('sent');*/
      })
      .catch((error: Error) => {
        console.error(error);
      });
  }
}

export default NotificationService;
