import { appConfig, TweetTarget } from './config';
import { FS_Tweet } from './datatypes';
import { FirebaseAdminApp, Firestore } from './firebase';
import { logger } from './logger';
import { getUserTweets } from './twitter';

const fetchTweet = async (firestore: Firestore, target: TweetTarget) => {
  const docRef = firestore.doc(`tweets/${target.id}`);
  const curData = (await docRef.get()).data() as FS_Tweet | undefined;

  const latest = curData?.tweets[0];

  logger.info('start fetch', { id: target.id });
  const tweets = await getUserTweets(target.id, latest?.id);
  if (tweets.length == 0) {
    logger.info('no new tweets', { id: target.id });
    return;
  }

  const newTweets = [...tweets, ...(curData?.tweets || [])].slice(0, target.maxTweets);
  await docRef.set({ tweets: newTweets });
  logger.info('save tweets', { length: tweets.length, ids: tweets.map(v => v.id).slice(0, 10) });
};

export const fetchTweets = async (admin: FirebaseAdminApp) => {
  const firestore = admin.firestore();
  await Promise.all(
    appConfig.targets.map(v =>
      fetchTweet(firestore, v).catch(reason => {
        logger.error('fetch error', { id: v.id, reason });
      }),
    ),
  );
};
