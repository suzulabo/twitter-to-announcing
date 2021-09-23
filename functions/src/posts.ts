import { appConfig } from './config';
import { FS_Tweet } from './datatypes';
import { FirebaseAdminApp, HttpRequest, HttpResponse } from './firebase';
import { logger } from './logger';

export const httpsGetPosts = async (
  req: HttpRequest,
  res: HttpResponse,
  adminApp: FirebaseAdminApp,
) => {
  const id = req.query['id'] as string;
  const target = appConfig.targets.find(v => v.id == id);
  if (!target) {
    logger.warn('missing ID', { id });
    res.status(400).send('Bad Request');
    return;
  }

  const firestore = adminApp.firestore();
  const data = (await firestore.doc(`tweets/${id}`).get()).data() as FS_Tweet | undefined;
  const tweets = data?.tweets || [];

  const ids = new Set(tweets.map(v => v.id));

  const posts = [] as {
    body: string;
    pT: string;
    imgs?: string[];
    link: string;
    cID: string; // Custom ID
    parentID?: string;
  }[];
  for (const tweet of tweets) {
    if (tweet.replyTo) {
      if (tweet.replyTo != target.id) {
        // skip reply to not self
        continue;
      }
      if (!ids.has(tweet.conversationID || '')) {
        // skip parent tweet does not exist
        continue;
      }
    }

    const post: typeof posts[number] = {
      body: tweet.text,
      pT: tweet.createdAt,
      link: `https://twitter.com/${target.name}/status/${tweet.id}`,
      cID: tweet.id,
    };

    if (tweet.attachments) {
      const imgs = [] as string[];
      for (const attachment of tweet.attachments) {
        if (attachment.url) {
          imgs.push(attachment.url);
        } else if (attachment.previewImageURL) {
          imgs.push(attachment.previewImageURL);
        }
      }
      if (imgs.length > 0) {
        post.imgs = imgs;
      }
    }

    if (tweet.conversationID != tweet.id) {
      post.parentID = tweet.conversationID;
    }

    posts.push(post);
  }

  res.status(200).send({ posts });
};
