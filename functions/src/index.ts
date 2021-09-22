import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { fetchTweets } from './fetch';

const adminApp = admin.initializeApp();
adminApp.firestore().settings({ ignoreUndefinedProperties: true });

export const onPubSubFetchTweet = functions.pubsub.schedule('* * * * *').onRun(async () => {
  await fetchTweets(adminApp);
  return 0;
});
