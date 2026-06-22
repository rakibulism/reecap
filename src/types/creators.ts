// Creators community — social graph + feed data model.
//
// A lightweight, client-side social layer: creator profiles, a follow graph,
// and a feed of posts (image / animation / design) with reactions, comments,
// shares and reposts. State lives in the browser (demo) — no backend.

export type PostKind = 'image' | 'animation' | 'design';

export type ReactionKey = 'like' | 'love' | 'fire' | 'clap' | 'wow';

export interface Creator {
  id: string;
  name: string;
  handle: string; // without '@'
  avatar: string;
  cover: string;
  location: string;
  bio: string;
  followers: number;
  following: boolean; // does the current user follow them
  notify: boolean; // "get notified" bell
  verified?: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: number; // epoch ms
}

export interface Post {
  id: string;
  authorId: string;
  kind: PostKind;
  text: string;
  media: string; // image / poster URL
  video?: string; // animation video URL (kind === 'animation')
  createdAt: number;
  reactions: Record<ReactionKey, number>;
  myReaction: ReactionKey | null;
  comments: Comment[];
  shares: number;
  reposts: number;
  reposted: boolean; // current user reposted
  repostedById?: string; // when this feed entry is someone's repost
}
