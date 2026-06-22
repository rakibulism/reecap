import { create } from 'zustand';
import type { Creator, Post, PostKind, ReactionKey } from '../types/creators';
import { SEED_CREATORS, SEED_POSTS, ME_ID } from '../data/creators';

const uid = () => Math.random().toString(36).slice(2, 10);

interface CreatorsState {
  creators: Record<string, Creator>;
  posts: Post[];
  meId: string;

  // The community itself (a profile you can follow + get notified about).
  communityFollowed: boolean;
  communityNotify: boolean;
  communityFollowers: number;

  // navigation: which creator profile is open (null = main feed)
  viewingProfileId: string | null;

  // selectors
  me: () => Creator;
  creator: (id: string) => Creator | undefined;

  // community
  toggleCommunityFollow: () => void;
  toggleCommunityNotify: () => void;

  // social graph
  toggleFollow: (id: string) => void;
  toggleNotify: (id: string) => void;
  openProfile: (id: string | null) => void;

  // engagement
  react: (postId: string, key: ReactionKey) => void;
  addComment: (postId: string, text: string) => void;
  share: (postId: string) => void;
  repost: (postId: string) => void;

  // authoring
  composePost: (input: { kind: PostKind; text: string; media: string; video?: string }) => void;
}

const seededCreators: Record<string, Creator> = Object.fromEntries(SEED_CREATORS.map((c) => [c.id, c]));

export const useCreatorsStore = create<CreatorsState>((set, get) => ({
  creators: seededCreators,
  posts: SEED_POSTS,
  meId: ME_ID,
  communityFollowed: false,
  communityNotify: false,
  communityFollowers: 48230,
  viewingProfileId: null,

  me: () => get().creators[get().meId],
  creator: (id) => get().creators[id],

  toggleCommunityFollow: () =>
    set((s) => ({ communityFollowed: !s.communityFollowed, communityFollowers: s.communityFollowers + (s.communityFollowed ? -1 : 1) })),
  toggleCommunityNotify: () => set((s) => ({ communityNotify: !s.communityNotify })),

  toggleFollow: (id) =>
    set((s) => {
      const c = s.creators[id];
      if (!c) return s;
      const following = !c.following;
      return { creators: { ...s.creators, [id]: { ...c, following, followers: c.followers + (following ? 1 : -1), notify: following ? c.notify : false } } };
    }),
  toggleNotify: (id) =>
    set((s) => {
      const c = s.creators[id];
      if (!c) return s;
      return { creators: { ...s.creators, [id]: { ...c, notify: !c.notify } } };
    }),
  openProfile: (id) => set({ viewingProfileId: id }),

  react: (postId, key) =>
    set((s) => ({
      posts: s.posts.map((p) => {
        if (p.id !== postId) return p;
        const reactions = { ...p.reactions };
        if (p.myReaction) reactions[p.myReaction] = Math.max(0, reactions[p.myReaction] - 1);
        let myReaction: ReactionKey | null = key;
        if (p.myReaction === key) myReaction = null; // toggle off
        else reactions[key] = (reactions[key] ?? 0) + 1;
        return { ...p, reactions, myReaction };
      }),
    })),

  addComment: (postId, text) =>
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, { id: uid(), authorId: s.meId, text, createdAt: Date.now() }] } : p,
      ),
    })),

  share: (postId) =>
    set((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, shares: p.shares + 1 } : p)) })),

  repost: (postId) =>
    set((s) => {
      const target = s.posts.find((p) => p.id === postId);
      if (!target) return s;
      const reposted = !target.reposted;
      const posts = s.posts.map((p) => (p.id === postId ? { ...p, reposted, reposts: p.reposts + (reposted ? 1 : -1) } : p));
      if (reposted) {
        // surface a repost entry at the top of the feed
        const entry: Post = { ...target, id: `rp-${uid()}`, reposted: true, repostedById: s.meId, createdAt: Date.now() };
        return { posts: [entry, ...posts] };
      }
      // un-repost: drop my repost surface entry for this original
      return { posts: posts.filter((p) => !(p.repostedById === s.meId && p.text === target.text && p.id.startsWith('rp-'))) };
    }),

  composePost: ({ kind, text, media, video }) =>
    set((s) => {
      const post: Post = {
        id: uid(), authorId: s.meId, kind, text, media, video,
        createdAt: Date.now(), reactions: { like: 0, love: 0, fire: 0, clap: 0, wow: 0 }, myReaction: null,
        comments: [], shares: 0, reposts: 0, reposted: false,
      };
      return { posts: [post, ...s.posts] };
    }),
}));
