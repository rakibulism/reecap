import type { Creator, Post } from '../types/creators';

// Stable demo imagery (picsum seeds + pravatar) so the feed looks real.
const avatar = (n: number) => `https://i.pravatar.cc/200?img=${n}`;
const cover = (seed: string) => `https://picsum.photos/seed/${seed}/1200/400`;
const shot = (seed: string) => `https://picsum.photos/seed/${seed}/1000/750`;

export const ME_ID = 'me';

export const SEED_CREATORS: Creator[] = [
  { id: ME_ID, name: 'You', handle: 'you', avatar: avatar(12), cover: cover('you-cover'), location: 'Your studio', bio: 'Making recaps & motion in Reecap.', followers: 128, following: false, notify: false },
  { id: 'maya', name: 'Maya Okafor', handle: 'mayamotion', avatar: avatar(5), cover: cover('maya-cover'), location: 'Lagos, NG', bio: 'Motion designer. I animate everyday objects into stories.', followers: 18420, following: false, notify: false, verified: true },
  { id: 'leo', name: 'Leo Tan', handle: 'leobuilds', avatar: avatar(15), cover: cover('leo-cover'), location: 'Singapore', bio: 'Product designer obsessed with micro-interactions.', followers: 9234, following: true, notify: true, verified: true },
  { id: 'nadia', name: 'Nadia Rivera', handle: 'nadiacreates', avatar: avatar(32), cover: cover('nadia-cover'), location: 'Mexico City, MX', bio: 'Photographer → video recaps of city life.', followers: 5612, following: false, notify: false },
  { id: 'kofi', name: 'Kofi Mensah', handle: 'kofivisuals', avatar: avatar(8), cover: cover('kofi-cover'), location: 'Accra, GH', bio: '3D + motion. Brand films and loops.', followers: 23010, following: false, notify: false, verified: true },
  { id: 'ines', name: 'Inès Dubois', handle: 'inesdesigns', avatar: avatar(20), cover: cover('ines-cover'), location: 'Paris, FR', bio: 'Type, layout, and the occasional gradient.', followers: 7740, following: false, notify: false },
];

const m = 60_000;
const h = 60 * m;
const now = 1_750_000_000_000; // fixed base (avoids Date.now in module scope)

export const SEED_POSTS: Post[] = [
  {
    id: 'p1', authorId: 'maya', kind: 'animation', text: 'New loop — a coffee cup that never stops pouring. Built layer-by-layer in Reecap Motion ☕️',
    media: shot('coffee-loop'), video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    createdAt: now - 2 * h, reactions: { like: 212, love: 88, fire: 140, clap: 22, wow: 9 }, myReaction: null,
    comments: [
      { id: 'c1', authorId: 'leo', text: 'The easing on this is buttery 🧈', createdAt: now - 1 * h },
      { id: 'c2', authorId: 'nadia', text: 'Tutorial please!', createdAt: now - 40 * m },
    ], shares: 41, reposts: 27, reposted: false,
  },
  {
    id: 'p2', authorId: 'leo', kind: 'design', text: 'Redesigned the Reecap export sheet on the infinite canvas. Spacing system finally clicks.',
    media: shot('export-sheet'), createdAt: now - 5 * h,
    reactions: { like: 540, love: 132, fire: 60, clap: 75, wow: 18 }, myReaction: 'like',
    comments: [{ id: 'c3', authorId: 'ines', text: 'That 8pt grid is *chef’s kiss*', createdAt: now - 4 * h }],
    shares: 96, reposts: 64, reposted: false,
  },
  {
    id: 'p3', authorId: 'nadia', kind: 'image', text: 'Street series, vol. 3 — shot at golden hour, recapped into a 20s reel.',
    media: shot('street-3'), createdAt: now - 9 * h,
    reactions: { like: 318, love: 201, fire: 44, clap: 30, wow: 27 }, myReaction: null,
    comments: [], shares: 22, reposts: 12, reposted: false,
  },
  {
    id: 'p4', authorId: 'kofi', kind: 'animation', text: 'Brand loop for a music festival. 3 frames, infinite energy.',
    media: shot('festival-loop'), video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    createdAt: now - 14 * h, reactions: { like: 880, love: 410, fire: 520, clap: 140, wow: 66 }, myReaction: 'fire',
    comments: [{ id: 'c4', authorId: 'maya', text: 'Those color transitions 🔥', createdAt: now - 13 * h }],
    shares: 210, reposts: 188, reposted: false,
  },
  {
    id: 'p5', authorId: 'ines', kind: 'design', text: 'Poster study — type on a path, all done with the new arc tool.',
    media: shot('poster-arc'), createdAt: now - 26 * h,
    reactions: { like: 264, love: 90, fire: 33, clap: 51, wow: 14 }, myReaction: null,
    comments: [], shares: 38, reposts: 19, reposted: false,
  },
];
