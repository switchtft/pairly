// components/Sidebar.tsx
import { Button } from '@/components/ui/button';
import { Gamepad2, History, Trophy, BookOpen } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => (
  <div className="w-80 flex-shrink-0">
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 mb-6">
      <div className="space-y-2">
        <Button
          onClick={() => onTabChange('dashboard')}
          className={`w-full justify-start ${activeTab === 'dashboard' ? 'bg-[#e6915b] hover:bg-[#d18251]' : 'bg-transparent hover:bg-[#2a2a2a]'}`}
        >
          <Gamepad2 size={16} className="mr-3" />
          Dashboard
        </Button>
        <Button
          onClick={() => onTabChange('order-history')}
          className={`w-full justify-start ${activeTab === 'order-history' ? 'bg-[#e6915b] hover:bg-[#d18251]' : 'bg-transparent hover:bg-[#2a2a2a]'}`}
        >
          <History size={16} className="mr-3" />
          Order History
        </Button>
        <Button
          onClick={() => onTabChange('quest')}
          className={`w-full justify-start ${activeTab === 'quest' ? 'bg-[#e6915b] hover:bg-[#d18251]' : 'bg-transparent hover:bg-[#2a2a2a]'}`}
        >
          <Trophy size={16} className="mr-3" />
          Quests
        </Button>
        <Button
          onClick={() => onTabChange('teammate-rules')}
          className={`w-full justify-start ${activeTab === 'teammate-rules' ? 'bg-[#e6915b] hover:bg-[#d18251]' : 'bg-transparent hover:bg-[#2a2a2a]'}`}
        >
          <BookOpen size={16} className="mr-3" />
          Mentor Rules
        </Button>
      </div>
    </div>
  </div>
);

export default Sidebar;
