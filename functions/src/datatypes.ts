export interface Tweet {
  id: string;
  text: string;
  createdAt: string;
  replyTo?: string;
  referenced?: { type: 'retweeted' | 'quoted' | 'replied_to'; id: string }[];
  conversationID?: string;
  attachments?: { type: string; url?: string; previewImageURL?: string }[];
}

export interface FS_Tweet {
  tweets: Tweet[];
  needPing: boolean;
}
