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
      const buff1 = (await (Competition as any).getMatchesToNotify(2021))[0];
      matches = buff1 ? buff1.matches.slice(0, 10) : [];
      const buff2 = (await (Competition as any).getMatchesToNotify(2001))[0];
      matches = matches.concat(buff2 ? buff2.matches.slice(0, 10) : []);
      const buff3 = (await (Competition as any).getMatchesToNotify(2014))[0];
      matches = matches.concat(buff3 ? buff3.matches.slice(0, 10) : []);
      const buff4 = (await (Competition as any).getMatchesToNotify(2002))[0];
      console.log(matches[0]);
      matches = matches.concat([...buff4.matches.slice(0, 10)]);
      console.log(matches[0]);
      const buff5 = (await (Competition as any).getMatchesToNotify(2019))[0];
      matches = matches.concat(buff5 ? buff5.matches.slice(0, 10) : []);
      // console.log(matches.filter((match: any) => ((new Date(match.utcDate) as any) < Date.now())).length)
    };
    fetchMatches();
    setInterval(fetchMatches, 10000000);
    const prepareNotifications = async () => {
      console.log('prepare');
      console
        .log
        /*matches.filter((match: any) => {
          return match.season.id === 733;
        })*/
        ();
      let matchesToNotify: any = [];
      const matchesCopy = [...matches];
      matchesToNotify = matches.filter(
        (match: any) => (new Date(match.utcDate) as any) < Date.now()
      );
      // console.log(matchesToNotify.map((match: any) => match.id))
      matchesToNotify.forEach(async (match: any) => {
        (await (Favourite as any).find({})).forEach((user: any) => {
          if (
            (user.teams.includes(match.homeTeam.id) ||
              user.teams.includes(match.awayTeam.id) ||
              user.matches.includes(match.id)) &&
            user.subscription
          ) {
            if (matches.status !== 'POSTPONED') {
              startedMatches.push(match);
              pushNotifications(user.subscription, match);
            }
          }
        });
        startedMatches = startedMatches.filter((startedMatch: any) => {
          if (startedMatch.status === 'FINISHED') {
            finishedToNotify.push(startedMatch);
            return false;
          }
          return true;
        });
        finishedToNotify.filter(async (finishedMatch: any) => {
          (await (Favourite as any).find({})).forEach((user: any) => {
            if (
              (user.teams.includes(finishedMatch.homeTeam.id) ||
                user.teams.includes(finishedMatch.awayTeam.id) ||
                user.matches.includes(finishedMatch.id)) &&
              user.subscription
            ) {
              pushFinishedNotifications(user.subscription, finishedMatch);
              return false;
            }
            return true;
          });
        });
      });
    };
    const timeToNotify = 10000000000;
    prepareNotifications();
    setInterval(prepareNotifications, 200000);

    const pushFinishedNotifications = (subscription: any, match: any) => {
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
        .then(() => {
          // console.log('sent');
        })
        .catch((error: any) => {
          console.error(error);
        });
    };

    const pushNotifications = (subscription: any, match: any) => {
      // console.log('push not')
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
        .then(() => {
          /*console.log('sent');*/
        })
        .catch((error: any) => {
          console.error(error);
        });
    };
  }
}

export default NotificationService;
