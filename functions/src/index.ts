import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { appConfig } from './config';
import { fetchTweets } from './fetch';
import { httpsGetPosts } from './posts';

const adminApp = admin.initializeApp();
adminApp.firestore().settings({ ignoreUndefinedProperties: true });

export const posts = functions
  .runWith({
    memory: '128MB',
    timeoutSeconds: 60,
    minInstances: 0,
    maxInstances: 1,
  })
  .https.onRequest(async (req, res) => {
    await httpsGetPosts(req, res, adminApp);
  });

export const onPubSubFetchTweets = functions
  .runWith({
    memory: '128MB',
    timeoutSeconds: 60,
    minInstances: 0,
    maxInstances: 1,
  })
  .pubsub.schedule(appConfig.fetchSchedule)
  .onRun(async () => {
    await fetchTweets(adminApp);
    return 0;
  });
