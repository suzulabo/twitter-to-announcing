import { appConfig, TweetTarget } from './config';
import { FS_Tweet } from './datatypes';
import { FirebaseAdminApp, Firestore } from './firebase';
import { logger } from './logger';
import { ping } from './ping';
import { getUserTweets } from './twitter';

const fetchTweet = async (firestore: Firestore, target: TweetTarget) => {
  const docRef = firestore.doc(`tweets/${target.id}`);
  const curData = (await docRef.get()).data() as FS_Tweet | undefined;

  const latest = curData?.tweets[0];

  logger.debug('start fetch', { id: target.id });
  const newTweets = await getUserTweets(target.id, latest?.id);
  if (newTweets.length == 0) {
    logger.debug('no new tweets', { id: target.id });
  } else {
    {
      const tweets = [...newTweets, ...(curData?.tweets || [])].slice(0, target.maxTweets);
      await docRef.set({ tweets, needPing: true });
    }
    logger.info('save tweets', {
      length: newTweets.length,
      ids: newTweets.map(v => v.id).slice(0, 10),
    });
  }

  if (curData?.needPing || newTweets.length > 0) {
    const result = await ping(target);
    if (result) {
      await docRef.update({ needPing: false });
    }
    logger.info('ping finished', { name: target.name });
  }
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
