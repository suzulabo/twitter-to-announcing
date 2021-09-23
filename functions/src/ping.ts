import axios from 'axios';
import { TweetTarget } from './config';
import { logger } from './logger';

const PING_TIMEOUT = 30 * 1000;

export const ping = async (target: TweetTarget): Promise<boolean> => {
  const source = axios.CancelToken.source();

  const timer = setTimeout(() => {
    source.cancel();
  }, PING_TIMEOUT);

  try {
    const reqID = new Date().toISOString();
    const res = await axios.get(target.pingURL, {
      timeout: PING_TIMEOUT,
      maxRedirects: 0,
      headers: {
        'APP-REQUEST-ID': reqID,
      },
      cancelToken: source.token,
    });

    const result = res.data as { status: string; reqID: string };
    if (result.status != 'ok') {
      logger.error('ping error', result);
      return false;
    }
    if (result.reqID != reqID) {
      logger.warn('reqID is not same', result);
      return false;
    }
  } finally {
    clearTimeout(timer);
  }

  return true;
};
