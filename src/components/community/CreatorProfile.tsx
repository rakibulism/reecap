import React from 'react';
import { ArrowLeft, MapPin, CircleWavyCheck, Bell, BellRinging } from 'phosphor-react';
import { useCreatorsStore } from '../../store/creatorsStore';
import { compact } from '../../lib/creatorsUtil';
import PostCard from './PostCard';

const CreatorProfile: React.FC<{ id: string }> = ({ id }) => {
  const { creators, posts, meId, toggleFollow, toggleNotify, openProfile } = useCreatorsStore();
  const c = creators[id];
  if (!c) return null;
  const isMe = id === meId;
  const theirPosts = posts.filter((p) => p.authorId === id && !p.repostedById);

  return (
    <div className="max-w-[640px] mx-auto">
      <button onClick={() => openProfile(null)} className="flex items-center gap-2 mb-3 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
        <ArrowLeft size={16} /> Back to feed
      </button>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="h-40 bg-[var(--color-bg-panel)]">
          <img src={c.cover} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10">
            <img src={c.avatar} alt={c.name} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full object-cover border-4 border-[var(--color-bg-surface)]" />
            {!isMe && (
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => toggleNotify(c.id)}
                  disabled={!c.following}
                  title="Get notified"
                  className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors disabled:opacity-40
                    ${c.notify ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
                >
                  {c.notify ? <BellRinging size={17} weight="fill" /> : <Bell size={17} />}
                </button>
                <button
                  onClick={() => toggleFollow(c.id)}
                  className={`h-9 px-5 rounded-full text-[13px] font-bold transition-colors
                    ${c.following ? 'bg-[var(--color-bg-panel)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)]' : 'bg-[var(--color-primary)] text-white hover:opacity-90'}`}
                >
                  {c.following ? 'Following' : 'Follow'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-bold tracking-tight">{c.name}</h2>
              {c.verified && <CircleWavyCheck size={18} weight="fill" className="text-sky-500" />}
            </div>
            <p className="text-[13px] text-[var(--color-text-muted)]">@{c.handle}</p>
            {c.bio && <p className="text-[14px] mt-2 leading-relaxed">{c.bio}</p>}
            <div className="flex items-center gap-4 mt-2.5 text-[13px] text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1"><MapPin size={14} /> {c.location}</span>
            </div>
            <div className="flex items-center gap-4 mt-2.5 text-[13px]">
              <span><b className="text-[var(--color-text-primary)]">{compact(c.followers)}</b> <span className="text-[var(--color-text-muted)]">followers</span></span>
              <span><b className="text-[var(--color-text-primary)]">{theirPosts.length}</b> <span className="text-[var(--color-text-muted)]">posts</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        {theirPosts.length === 0 ? (
          <p className="text-center text-[13px] text-[var(--color-text-muted)] py-8">No posts yet.</p>
        ) : (
          theirPosts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
};

export default CreatorProfile;
