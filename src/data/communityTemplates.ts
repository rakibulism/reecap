export interface CommunityTemplate {
  id: string;
  title: string;
  type: 'template';
  category: 'templates';
  preview: string;
  images: string[];
  audioUrl: string;
}

export const COMMUNITY_TEMPLATES: CommunityTemplate[] = [
  { 
    id: 't1', 
    title: 'Nature Wild', 
    type: 'template', 
    category: 'templates',
    preview: '/pro/ctems/Nature/davidclode-chameleon-10097021_1920.jpg',
    images: [
      '/pro/ctems/Nature/wal_172619-branch-10083881_1920.jpg',
      '/pro/ctems/Nature/davidclode-chameleon-10097021_1920.jpg',
      '/pro/ctems/Nature/neelam279-hydrangeas-9990890_1920.jpg',
      '/pro/ctems/Nature/maranthi-iguana-10089944_1920.jpg',
      '/pro/ctems/Nature/arminep-tiger-7258795_1920.jpg'
    ],
    audioUrl: '/pro/audio/aberrantrealities-organic-flow-1015-remastered-485950.mp3'
  },
  { 
    id: 't2', 
    title: 'Cozy Pets', 
    type: 'template', 
    category: 'templates',
    preview: '/pro/ctems/Pets/bernhardjaeck-cat-10082073_1920.jpg',
    images: [
      '/pro/ctems/Pets/ddzphoto-fisherman-10086224_1920.jpg',
      '/pro/ctems/Pets/bernhardjaeck-cat-10082073_1920.jpg',
      '/pro/ctems/Pets/melanimarfeld-cat-7498362_1920.jpg',
      '/pro/ctems/Pets/drosera74-sheep-10074422_1920.jpg'
    ],
    audioUrl: '/pro/audio/penguinmusic-lazy-day-stylish-futuristic-chill-239287.mp3'
  },
  {
    id: 't3',
    title: 'Urban Morning',
    type: 'template',
    category: 'templates',
    preview: '/pro/ctems/Urban/purgin_alexandr-morning-9911961_1920.jpg',
    images: [
      '/pro/ctems/Urban/ruslansikunov-flowers-10063876_1920.jpg',
      '/pro/ctems/Urban/purgin_alexandr-morning-9911961_1920.jpg',
      '/pro/ctems/Urban/edyttka1388-feathery-cosmos-9516583_1920.jpg',
      '/pro/ctems/Urban/ruslansikunov-chamomile-10084408_1920.jpg'
    ],
    audioUrl: '/pro/audio/kornevmusic-upbeat-happy-corporate-487426.mp3'
  },
  {
    id: 't4',
    title: 'Abstract Flow',
    type: 'template',
    category: 'templates',
    preview: '/pro/ctems/Abstract/ri1yad-abstract-8944153_1920.jpg',
    images: [
      '/pro/ctems/Abstract/ri1yad-abstract-8944153_1920.jpg',
      '/pro/ctems/Abstract/swidaalba-autumn-9948175_1920.jpg',
      '/pro/ctems/Abstract/bin-rui-natural-10003071_1920.jpg'
    ],
    audioUrl: '/pro/audio/nveravetyanmusic-stylish-deep-electronic-262632.mp3'
  },
  // Adding more mock templates to reach 30
  ...Array.from({ length: 26 }, (_, i) => ({
    id: `t${i + 5}`,
    title: `Community Template ${i + 5}`,
    type: 'template' as const,
    category: 'templates' as const,
    preview: `https://picsum.photos/seed/${i + 5}/800/450`,
    images: [
      `https://picsum.photos/seed/${i + 5}-1/1920/1080`,
      `https://picsum.photos/seed/${i + 5}-2/1920/1080`,
      `https://picsum.photos/seed/${i + 5}-3/1920/1080`
    ],
    audioUrl: '/pro/audio/alec_koff-blues-ballad-487408.mp3'
  }))
];
