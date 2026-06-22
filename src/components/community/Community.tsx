import React, { useState } from 'react';
import { CaretLeft } from 'phosphor-react';
import { useReecapStore } from '../../store/reecapStore';
import { useCreatorsStore } from '../../store/creatorsStore';
import SegmentedControl from '../ui/SegmentedControl';
import Button from '../ui/Button';
import CreatorsCommunity from './CreatorsCommunity';
import CommunityHub from './CommunityHub';

// The Community area hosts two spaces: the new Creators social feed and the
// existing Assets hub (templates + audio). A segmented control switches them.
const Community: React.FC = () => {
  const { setActiveView } = useReecapStore();
  const openProfile = useCreatorsStore((s) => s.openProfile);
  const [tab, setTab] = useState<'creators' | 'assets'>('creators');

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-page)] overflow-hidden">
      <div className="h-12 shrink-0 border-b border-[var(--color-border-default)] flex items-center justify-between px-4 gap-4">
        <Button variant="ghost" size="sm" icon={<CaretLeft size={18} />} onClick={() => setActiveView('editor')}>
          Editor
        </Button>
        <div className="w-[260px]">
          <SegmentedControl
            options={[{ label: 'Creators', value: 'creators' }, { label: 'Assets', value: 'assets' }]}
            value={tab}
            onChange={(v) => { setTab(v); if (v === 'creators') openProfile(null); }}
          />
        </div>
        <div className="w-[88px]" />
      </div>

      {tab === 'creators' ? <CreatorsCommunity /> : <CommunityHub hideBack />}
    </div>
  );
};

export default Community;
