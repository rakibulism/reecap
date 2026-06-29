import React, { useState } from 'react';
import {
  ChatCircle, Repeat, ShareNetwork, CircleWavyCheck, Play, Sparkle, Image as ImageIcon, PenNib, ArrowsClockwise,
} from 'phosphor-react';
import { useCreatorsStore } from '../../store/creatorsStore';
import type { Post, PostKind } from '../../types/creators';
import { REACTIONS, REACTION_EMOJI, timeAgo, compact } from '../../lib/creatorsUtil';
import { useCommunityGuard } from '../../hooks/useCommunityGuard';

const KIND_BADGE: Record<PostKind, { icon: React.ReactNode; label: string; cls: string }> = {
  image: { icon: <ImageIcon size={12} weight="fill" />, label: 'Photo', cls: 'bg-sky-500/15 text-sky-500' },
  animation: { icon: <Sparkle size={12} weight="fill" />, label: 'Animation', cls: 'bg-violet-500/15 text-violet-500' },
  design: { icon: <PenNib size={12} weight="fill" />, label: 'Design', cls: 'bg-amber-500/15 text-amber-600' },
};

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const { creators, meId, react, addComment, share, repost, openProfile } = useCreatorsStore();
  const { guard } = useCommunityGuard();
  const author = creators[post.authorId];
  const me = creators[meId];
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState('');
  const [shared, setShared] = useState(false);

  if (!author) return null;
  const reactionTotal = Object.values(post.reactions).reduce((a, b) => a + b, 0);
  const topReactions = (Object.keys(post.reactions) as (keyof typeof post.reactions)[])
    .filter((k) => post.reactions[k] > 0)
    .sort((a, b) => post.reactions[b] - post.reactions[a])
    .slice(0, 3);
  const badge = KIND_BADGE[post.kind];

  const doShare = () => {
    share(post.id);
    const url = `https://reecap.vercel.app/c/${post.id}`;
    try { navigator.clipboard?.writeText(url); } catch { /* clipboard blocked */ }
    setShared(true);
    setTimeout(() => setShared(false), 1600);
  };

  const submitComment = guard(() => {
    const t = draft.trim();
    if (!t) return;
    addComment(post.id, t);
    setDraft('');
    setShowComments(true);
  });

  return (
    <article className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] overflow-hidden">
      {post.repostedById && (
        <div className="flex items-center gap-2 px-4 pt-2.5 text-[12px] text-[var(--color-text-muted)]">
          <ArrowsClockwise size={13} /> {post.repostedById === meId ? 'You reposted' : `${creators[post.repostedById]?.name} reposted`}
        </div>
      )}
      {/* header */}
      <div className="flex items-center gap-3 px-4 pt-3.5">
        <button onClick={() => openProfile(author.id)}>
          <img src={author.avatar} alt={author.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <button onClick={() => openProfile(author.id)} className="font-bold text-[14px] hover:underline truncate">{author.name}</button>
            {author.verified && <CircleWavyCheck size={14} weight="fill" className="text-sky-500 shrink-0" />}
            <span className="text-[13px] text-[var(--color-text-muted)] truncate">@{author.handle}</span>
            <span className="text-[13px] text-[var(--color-text-muted)]">· {timeAgo(post.createdAt)}</span>
          </div>
          <span className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badge.cls}`}>
            {badge.icon} {badge.label}
          </span>
        </div>
      </div>

      {/* text */}
      {post.text && <p className="px-4 pt-2.5 text-[14px] leading-relaxed text-[var(--color-text-primary)]">{post.text}</p>}

      {/* media */}
      <div className="mt-3 relative bg-black/5">
        {post.kind === 'animation' && post.video ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={post.video} poster={post.media} controls loop muted playsInline className="w-full max-h-[460px] object-cover" />
        ) : (
          <img src={post.media} alt="" className="w-full max-h-[460px] object-cover" />
        )}
        {post.kind === 'animation' && !post.video && (
          <div className="absolute inset-0 flex items-center justify-center"><Play size={56} weight="fill" className="text-white/90 drop-shadow" /></div>
        )}
      </div>

      {/* reaction summary */}
      <div className="flex items-center justify-between px-4 pt-2.5 text-[12px] text-[var(--color-text-muted)]">
        <div className="flex items-center gap-1">
          {topReactions.map((k) => <span key={k}>{REACTION_EMOJI[k]}</span>)}
          {reactionTotal > 0 && <span className="ml-1">{compact(reactionTotal)}</span>}
        </div>
        <div className="flex items-center gap-3">
          {post.comments.length > 0 && <button onClick={() => setShowComments((v) => !v)} className="hover:underline">{compact(post.comments.length)} comments</button>}
          {post.reposts > 0 && <span>{compact(post.reposts)} reposts</span>}
        </div>
      </div>

      {/* action bar */}
      <div className="grid grid-cols-4 gap-1 px-2 py-1.5 mt-1.5 border-t border-[var(--color-border-default)]">
        <div className="relative" onMouseLeave={() => setShowReactions(false)}>
          <button
            onClick={guard(() => react(post.id, post.myReaction ?? 'like'))}
            onMouseEnter={() => setShowReactions(true)}
            className={`w-full h-9 flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] text-[13px] font-semibold transition-colors
              ${post.myReaction ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
          >
            <span className="text-[15px]">{post.myReaction ? REACTION_EMOJI[post.myReaction] : '👍'}</span>
            <span className="hidden sm:inline">{post.myReaction ? REACTIONS.find((r) => r.key === post.myReaction)?.label : 'React'}</span>
          </button>
          {showReactions && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 flex gap-0.5 px-1.5 py-1 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-md)] z-10">
              {REACTIONS.map((r) => (
                <button key={r.key} onClick={guard(() => { react(post.id, r.key); setShowReactions(false); })} title={r.label} className="w-8 h-8 text-[18px] rounded-full hover:bg-[var(--color-bg-hover)] hover:scale-125 transition-transform">{r.emoji}</button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setShowComments((v) => !v)} className="h-9 flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] text-[13px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]">
          <ChatCircle size={17} /> <span className="hidden sm:inline">Comment</span>
        </button>
        <button onClick={guard(() => repost(post.id))} className={`h-9 flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] text-[13px] font-semibold transition-colors ${post.reposted ? 'text-emerald-500' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
          <Repeat size={17} /> <span className="hidden sm:inline">{post.reposted ? 'Reposted' : 'Repost'}</span>
        </button>
        <button onClick={doShare} className="h-9 flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] text-[13px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]">
          <ShareNetwork size={17} /> <span className="hidden sm:inline">{shared ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* comments */}
      {showComments && (
        <div className="px-4 pb-3 pt-1 border-t border-[var(--color-border-default)] space-y-3">
          {post.comments.map((c) => {
            const ca = creators[c.authorId];
            return (
              <div key={c.id} className="flex items-start gap-2.5 pt-2">
                <img src={ca?.avatar} alt="" referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover shrink-0" />
                <div className="min-w-0 bg-[var(--color-bg-panel)] rounded-[var(--radius-md)] px-3 py-2 flex-1">
                  <div className="flex items-center gap-1 text-[12px]">
                    <span className="font-bold">{ca?.name ?? 'User'}</span>
                    <span className="text-[var(--color-text-muted)]">· {timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">{c.text}</p>
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-2 pt-1">
            <img src={me?.avatar} alt="" referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover shrink-0" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitComment(); }}
              placeholder="Write a comment…"
              className="flex-1 h-9 px-3 rounded-full bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] text-[13px] focus:border-[var(--color-primary)] outline-none"
            />
            <button onClick={submitComment} disabled={!draft.trim()} className="text-[13px] font-semibold text-[var(--color-primary)] disabled:opacity-40 px-2">Post</button>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
