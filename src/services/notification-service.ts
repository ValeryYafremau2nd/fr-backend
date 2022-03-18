import { injectable } from 'inversify';
import Favourite from '../database/models/favorite-model';
import Competition from '../database/models/competition-model';
import Team from '../database/models/team-model';
const webpush = require('web-push');

@injectable()
class NotificationService {
  constructor() {
    const finishedToNotify: any = [];
    let startedMatches: any = [];
    let matches: any = [];
    const fetchMatches = async () => {
      matches = (await (Competition as any).getMatchesToNotify())[0].matches;
    };
    fetchMatches();
    setInterval(fetchMatches, 10000000);
    const prepareNotifications = async () => {
      console.log('prepare');
      console.log(
        matches.map((match: any) => {
          return match.utcDate;
        })
      );
      const matchesToNotify: any = [];
      const matchesCopy = [...matches];
      matchesCopy.find((match: any) => {
        if ((new Date(match.utcDate) as any) < Date.now()) {
          matchesToNotify.push(matches.shift());
          return false;
        }
        return true;
      });
      matchesToNotify.forEach(async (match: any) => {
        (await (Favourite as any).find({})).forEach((user: any) => {
          if ((
            user.teams.includes(match.homeTeam.id) ||
            user.teams.includes(match.awayTeam.id) ||
            user.matches.includes(match.id))
          ) {
            if (matches.status !== 'POSTPONED') {
              console.log(match.id)
              startedMatches.push(match);
              pushNotifications(
                user.subscription,
                match
              );
            }
          }
        });
      });
      console.log(startedMatches)
      startedMatches = startedMatches.filter((match: any) => {
        if (match.status === 'FINISHED') {
          finishedToNotify.push(match);
          return false;
        }
        return true;
      });
      finishedToNotify.filter(async (match: any) => {
        (await (Favourite as any).find({})).forEach((user: any) => {
          if ((
            user.teams.includes(match.homeTeam.id) ||
            user.teams.includes(match.awayTeam.id) ||
            user.matches.includes(match.id))
          ) {
              pushFinishedNotifications(
                user.subscription,
                match
              );
              return false;
          }
          return true
        });
      });
    };
    const timeToNotify = 10000000000;
    prepareNotifications();
    setInterval(prepareNotifications, 100000);

    const pushFinishedNotifications = (
      subscription: any,
      match: any
    ) => {
      console.log('pushed finished')
      const payload = JSON.stringify({
        notification: {
          title: `${match.homeTeam.name} ${match.score.fullTime.homeTeam} : ${match.score.fullTime.awayTeam} ${match.awayTeam.name}`,
          body: `The match has just finished.`,
          icon: 'assets/main-page-logo-small-hat.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
          }
        }
      });
      webpush
        .sendNotification(subscription, payload)
        .then(() => {console.log('sent')})
        .catch((error: any) => {
          console.error(error);
        });
    };

    const pushNotifications = (
      subscription: any,
      match: any
    ) => {
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
      webpush
        .sendNotification(subscription, payload)
        .then(() => {console.log('sent')})
        .catch((error: any) => {
          console.error(error);
        });
    };
  }
}

export default NotificationService;
