import { _appConfig } from './config.values';

export interface TweetTarget {
  readonly id: string;
  readonly name: string;
  readonly maxTweets: number;
  pingURL: string;
}

export interface AppConfig {
  readonly twitterBearerToken: string;
  readonly fetchSchedule: string;
  readonly targets: TweetTarget[];
}

export const appConfig: AppConfig = _appConfig;
