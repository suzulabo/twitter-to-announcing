import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { fetchTweets } from './fetch';
import { httpsGetPosts } from './posts';

const adminApp = admin.initializeApp();
adminApp.firestore().settings({ ignoreUndefinedProperties: true });

export const posts = functions
  .runWith({
    memory: '128MB',
    timeoutSeconds: 10,
    minInstances: 0,
    maxInstances: 1,
  })
  .https.onRequest(async (req, res) => {
    await httpsGetPosts(req, res, adminApp);
  });

export const onPubSubFetchTweets = functions
  .runWith({
    memory: '128MB',
    timeoutSeconds: 30,
    minInstances: 0,
    maxInstances: 1,
  })
  .pubsub.schedule('1,6,11,16,21,26,31,36,41,46,51,56 * * * *')
  .onRun(async () => {
    await fetchTweets(adminApp);
    return 0;
  });
