import * as functions from 'firebase-functions';

export const onPubSubCheckTweet = functions.pubsub.schedule('* * * * *').onRun(async () => {
  console.log('hello onPubSubCheckTweet');
  return Promise.resolve(0);
});
