import React from 'react';
import { X, Crown, User, Check } from 'phosphor-react';
import { useReecapStore } from '../../store/reecapStore';

const PRO_AVATAR = 'https://avatars.githubusercontent.com/u/74898633?v=4';
const FREE_AVATAR =
  'https://scontent.fdac80-1.fna.fbcdn.net/v/t39.30808-6/709728364_1695604148259716_6570136783596587279_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx480x480&ctp=s480x480&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeG6bm9maI_sHLNHEMqwso_OROPNSUvO6EZE481JS87oRjsFBX27DGRCe25QHGFUG_IQKqZB_XQM5cqhAilyq3dQ&_nc_ohc=7QBKdbfZqjUQ7kNvwEfkOwZ&_nc_oc=AdrstV-zHIGpNkBKkS-FrTyK_dQd1P-ZIIRkqW9-mJh97hC0ceUHFMnfgW04bPahLfA&_nc_zt=23&_nc_ht=scontent.fdac80-1.fna&_nc_gid=qENcDJV2SJ1pEEtd5HmN0w&_nc_ss=7b2a8&oh=00_Af-jvEvOmQID4hou56fMOM4Otjqvdr-HX2KoHbX3O9KLQA&oe=6A3F2B6A';

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { login } = useReecapStore();
  if (!isOpen) return null;

  const choose = (plan: 'pro' | 'free') => {
    login(plan);
    onClose();
  };

  const Option: React.FC<{
    plan: 'pro' | 'free';
    avatar: string;
    title: string;
    blurb: string;
    perks: string[];
    accent: string;
  }> = ({ plan, avatar, title, blurb, perks, accent }) => (
    <button
      onClick={() => choose(plan)}
      className="group flex-1 text-left rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)] transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={avatar}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-11 h-11 rounded-full object-cover border-2"
          style={{ borderColor: accent }}
        />
        <div>
          <div className="flex items-center gap-1.5 text-[14px] font-bold text-[var(--color-text-primary)]">
            {plan === 'pro' ? <Crown size={15} weight="fill" style={{ color: accent }} /> : <User size={15} />}
            {title}
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)]">{blurb}</div>
        </div>
      </div>
      <ul className="space-y-1.5 mb-3">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
            <Check size={12} weight="bold" style={{ color: accent }} />
            {p}
          </li>
        ))}
      </ul>
      <span
        className="inline-flex w-full items-center justify-center h-9 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white transition-opacity group-hover:opacity-90"
        style={{ background: accent }}
      >
        Login as {plan === 'pro' ? 'Pro' : 'Free'}
      </span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[var(--radius-lg)] bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] shadow-[var(--shadow-md)] p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
        >
          <X size={18} />
        </button>

        <h2 className="text-[18px] font-bold tracking-tight text-[var(--color-text-primary)] mb-1">Sign in to Reecap</h2>
        <p className="text-[12px] text-[var(--color-text-secondary)] mb-5">Choose how you’d like to continue.</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Option
            plan="pro"
            avatar={PRO_AVATAR}
            title="Pro account"
            blurb="Full access"
            perks={['10,000+ premium tracks', '4K export & no watermark', 'Priority features']}
            accent="#FF3D03"
          />
          <Option
            plan="free"
            avatar={FREE_AVATAR}
            title="Free account"
            blurb="Get started"
            perks={['Unlimited projects', 'Core editor & motion tool', 'Community library']}
            accent="#3B82F6"
          />
        </div>

        <p className="mt-5 text-[10px] text-[var(--color-text-muted)] text-center">
          Demo sign-in — no password required.
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
