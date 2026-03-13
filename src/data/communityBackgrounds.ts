export interface CommunityBackground {
  id: string;
  url: string;
  thumbnail: string;
  name: string;
}

export interface CommunityGradient {
  id: string;
  name: string;
  gradient: string;
}

export const COMMUNITY_BACKGROUNDS: CommunityBackground[] = [
  { id: 'bg1', name: 'Mountain Fog', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=200' },
  { id: 'bg2', name: 'Ocean Calm', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=200' },
  { id: 'bg3', name: 'Forest Path', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=200' },
  { id: 'bg4', name: 'Desert Sun', url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=200' },
  { id: 'bg5', name: 'Night Sky', url: 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&q=80&w=200' },
  { id: 'bg6', name: 'Soft Clouds', url: 'https://images.unsplash.com/photo-1496450681664-3df85efbd29f?auto=format&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1496450681664-3df85efbd29f?auto=format&fit=crop&q=80&w=200' },
];

export const SUGGESTED_GRADIENTS: CommunityGradient[] = [
  { id: 'g1', name: 'Midnight', gradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  { id: 'g2', name: 'Sunset', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'g3', name: 'Ocean', gradient: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)' },
  { id: 'g4', name: 'Lush', gradient: 'linear-gradient(135deg, #a8e063, #56ab2f)' },
  { id: 'g5', name: 'Purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'g6', name: 'Rose', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
];
