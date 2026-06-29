import React, { useRef, useState } from 'react';
import {
  CircleWavyCheck, Bell, BellRinging, Image as ImageIcon, Sparkle, PenNib, X, Users, Plus, Crown,
} from 'phosphor-react';
import { useCreatorsStore } from '../../store/creatorsStore';
import type { PostKind } from '../../types/creators';
import { compact } from '../../lib/creatorsUtil';
import PostCard from './PostCard';
import CreatorProfile from './CreatorProfile';
import { useCommunityGuard } from '../../hooks/useCommunityGuard';

const KIND_META: Record<PostKind, { icon: React.ReactNode; label: string; accept: string }> = {
  image: { icon: <ImageIcon size={16} />, label: 'Photo', accept: 'image/*' },
  animation: { icon: <Sparkle size={16} />, label: 'Animation', accept: 'video/*' },
  design: { icon: <PenNib size={16} />, label: 'Design', accept: 'image/*' },
};

const Composer: React.FC = () => {
  const { me, composePost } = useCreatorsStore();
  const { canInteract, openPremiumPrompt } = useCommunityGuard();
  const meUser = me();
  const [text, setText] = useState('');
  const [kind, setKind] = useState<PostKind>('image');
  const [media, setMedia] = useState<string | null>(null);
  const [video, setVideo] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = (k: PostKind) => {
    setKind(k);
    if (fileRef.current) { fileRef.current.accept = KIND_META[k].accept; fileRef.current.value = ''; fileRef.current.click(); }
  };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (kind === 'animation') { setVideo(url); setMedia(url); } else { setMedia(url); setVideo(undefined); }
  };
  const reset = () => { setText(''); setMedia(null); setVideo(undefined); setKind('image'); };
  const post = () => {
    if (!media && !text.trim()) return;
    composePost({ kind, text: text.trim(), media: media ?? `https://picsum.photos/seed/${Date.now()}/1000/700`, video });
    reset();
  };

  // Free / guest users get a preview-only feed — posting is Pro-only.
  if (!canInteract) {
    return (
      <button
        onClick={openPremiumPrompt}
        className="w-full flex items-center gap-3 text-left bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--color-primary)]/50 transition-colors group"
      >
        <span className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
          <Crown size={20} weight="fill" />
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] font-semibold">Posting is a Pro feature</span>
          <span className="block text-[12px] text-[var(--color-text-muted)]">
            You can browse and preview the community. Upgrade to post, react, and follow.
          </span>
        </span>
        <span className="ml-auto shrink-0 hidden sm:inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-[var(--color-primary)] text-white text-[12px] font-bold group-hover:opacity-90">
          Upgrade
        </span>
      </button>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4">
      <div className="flex gap-3">
        <img src={meUser.avatar} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share a photo, animation, or design with creators…"
            rows={media ? 2 : 1}
            className="w-full resize-none bg-transparent text-[15px] placeholder:text-[var(--color-text-muted)] outline-none pt-1.5"
          />
          {media && (
            <div className="relative mt-2 rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border-default)]">
              {video ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={video} className="w-full max-h-72 object-cover" controls muted />
              ) : (
                <img src={media} alt="" className="w-full max-h-72 object-cover" />
              )}
              <button onClick={() => { setMedia(null); setVideo(undefined); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/55 text-white flex items-center justify-center"><X size={15} /></button>
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-default)]">
            <div className="flex items-center gap-1">
              {(Object.keys(KIND_META) as PostKind[]).map((k) => (
                <button key={k} onClick={() => pick(k)} className={`flex items-center gap-1.5 px-2.5 h-8 rounded-[var(--radius-sm)] text-[12px] font-semibold transition-colors ${kind === k && media ? 'bg-[var(--color-primary)]/12 text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                  {KIND_META[k].icon} <span className="hidden sm:inline">{KIND_META[k].label}</span>
                </button>
              ))}
            </div>
            <button onClick={post} disabled={!media && !text.trim()} className="h-8 px-5 rounded-full bg-[var(--color-primary)] text-white text-[13px] font-bold disabled:opacity-40 hover:opacity-90 transition-opacity">Post</button>
          </div>
        </div>
      </div>
      <input ref={fileRef} type="file" className="hidden" onChange={onFile} />
    </div>
  );
};

const CreatorsCommunity: React.FC = () => {
  const {
    creators, posts, meId, viewingProfileId,
    communityFollowed, communityNotify, communityFollowers,
    toggleCommunityFollow, toggleCommunityNotify, toggleFollow, openProfile,
  } = useCreatorsStore();
  const { guard } = useCommunityGuard();

  const suggestions = Object.values(creators).filter((c) => c.id !== meId && !c.following).slice(0, 4);

  if (viewingProfileId) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-bg-page)]">
        <CreatorProfile id={viewingProfileId} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--color-bg-page)]">
      {/* community banner */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex items-end justify-between -mt-8 pb-4">
            <div className="flex items-end gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-surface)] border-4 border-[var(--color-bg-page)] flex items-center justify-center shadow-sm">
                <Users size={28} weight="fill" className="text-[var(--color-primary)]" />
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold tracking-tight">Reecap Creators</h1>
                  <CircleWavyCheck size={16} weight="fill" className="text-sky-500" />
                </div>
                <p className="text-[13px] text-[var(--color-text-muted)]">@creators · {compact(communityFollowers)} members</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <button
                onClick={guard(toggleCommunityNotify)}
                disabled={!communityFollowed}
                title="Get notified"
                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors disabled:opacity-40
                  ${communityNotify ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
              >
                {communityNotify ? <BellRinging size={17} weight="fill" /> : <Bell size={17} />}
              </button>
              <button
                onClick={guard(toggleCommunityFollow)}
                className={`h-9 px-5 rounded-full text-[13px] font-bold transition-colors
                  ${communityFollowed ? 'bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)]' : 'bg-[var(--color-primary)] text-white hover:opacity-90'}`}
              >
                {communityFollowed ? 'Joined' : 'Join community'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* feed + rail */}
      <div className="max-w-[980px] mx-auto px-6 pb-10 flex gap-6">
        <div className="flex-1 min-w-0 max-w-[640px] mx-auto space-y-4">
          <Composer />
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>

        <aside className="hidden lg:block w-72 shrink-0 space-y-4">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 sticky top-4">
            <h3 className="text-[13px] font-bold mb-3">Who to follow</h3>
            <div className="space-y-3">
              {suggestions.map((c) => (
                <div key={c.id} className="flex items-center gap-2.5">
                  <button onClick={() => openProfile(c.id)} className="shrink-0">
                    <img src={c.avatar} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <button onClick={() => openProfile(c.id)} className="flex items-center gap-1 hover:underline">
                      <span className="text-[13px] font-bold truncate">{c.name}</span>
                      {c.verified && <CircleWavyCheck size={12} weight="fill" className="text-sky-500 shrink-0" />}
                    </button>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">{compact(c.followers)} followers</p>
                  </div>
                  <button onClick={guard(() => toggleFollow(c.id))} className="shrink-0 h-7 px-3 rounded-full bg-[var(--color-primary)] text-white text-[12px] font-bold hover:opacity-90 flex items-center gap-1">
                    <Plus size={12} weight="bold" /> Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4">
            <h3 className="text-[13px] font-bold mb-2">Trending</h3>
            <div className="flex flex-wrap gap-1.5">
              {['#motion', '#recap', '#typeonpath', '#3d', '#goldenhour', '#loops'].map((t) => (
                <span key={t} className="text-[12px] font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreatorsCommunity;
