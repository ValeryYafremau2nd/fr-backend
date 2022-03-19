import { injectable } from 'inversify';
import Favourite from '../database/models/favorite-model';
import Competition from '../database/models/competition-model';
const webpush = require('web-push');

@injectable()
class NotificationService {
  private startedMatches = new Set();
  constructor() {
    this.prepareNotifications();
    setInterval(this.prepareNotifications.bind(this), 100000);
  }
  private async prepareNotifications() {
    const matchesToNotify = (await (Competition as any).getMatchesToNotify())[0];
    const favorites = await (Favourite as any).find({});
    console.log(this.startedMatches)
    if (matchesToNotify) matchesToNotify.matches.forEach((match: any) => {
      favorites.forEach((user: any) => {
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
    const statusedMatches = await (Competition as any).getMatchesById(
      1,
      Array.from(this.startedMatches)
    );
    if (statusedMatches[0])
      statusedMatches[0].matches.forEach((finishedMatch: any) => {
        console.log(`finished ${finishedMatch.id}`);
        this.startedMatches.delete(finishedMatch.id);
        favorites.forEach((user: any) => {
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
  private pushEndNotification(subscription: any, match: any) {
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
    let matches = [];
    const buff1 = (await (Competition as any).getMatchesToNotify(2021))[0];
    matches = buff1 ? buff1.matches.slice(0, 10) : [];
    const buff2 = (await (Competition as any).getMatchesToNotify(2001))[0];
    matches = matches.concat(buff2 ? buff2.matches.slice(0, 10) : []);
    const buff3 = (await (Competition as any).getMatchesToNotify(2014))[0];
    matches = matches.concat(buff3 ? buff3.matches.slice(0, 10) : []);
    const buff4 = (await (Competition as any).getMatchesToNotify(2002))[0];
    matches = matches.concat(buff4 ? buff4.matches.slice(0, 10) : []);
    const buff5 = (await (Competition as any).getMatchesToNotify(2019))[0];
    return matches.concat(buff5 ? buff5.matches.slice(0, 10) : []);
  }

  private pushStartNotification(subscription: any, match: any) {
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

  private sendNotification(subscription: any, payload: any) {
    webpush
      .sendNotification(subscription, payload)
      .then(() => {
        /*console.log('sent');*/
      })
      .catch((error: any) => {
        console.error(error);
      });
  }
}

export default NotificationService;
