'use client';

import { useEffect, useState } from 'react';
import { User } from '@/contexts/AuthContext';
import { formatRelativeTime, getAvatar, getRankColor, cn } from '@/lib/utils';
import Image from 'next/image';
import { capybaraFacts } from '@/app/utils/capybaraFacts';

// ============================================================================
// STYLES - All Tailwind classes in one place
// ============================================================================
const StyleClasses = {
  overlay: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-300 font-sans",
  card: "w-full max-w-md m-4 text-center rounded-xl border-2 border-amber-400/20 bg-gradient-to-br from-zinc-950 to-black p-8 shadow-2xl shadow-amber-500/10",
  logo: "w-24 h-auto mx-auto mb-6 animate-pulse",
  title: "font-montserrat-semibold text-xl text-gray-50 mb-4 tracking-wide",
  progressContainer: "w-full bg-black/30 rounded-full h-2.5 mt-4 mb-2 overflow-hidden border border-amber-400/20",
  progressBar: "h-full rounded-full bg-amber-400 transition-all duration-500 ease-out shadow-[0_0_10px_theme(colors.amber.400)]",
  progressText: "font-montserrat-medium text-sm text-amber-400 tracking-wider",
  userDetails: {
    container: "animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-amber-400/20 pt-6",
    avatar: "w-24 h-24 mx-auto rounded-full border-2 border-amber-400 mb-4 shadow-lg shadow-amber-400/20 animate-float",
    welcomeText: "font-montserrat-medium text-lg text-gray-400",
    displayName: "font-fugazone text-4xl gsap-gradient-text",
    statsGrid: "mt-6 grid grid-cols-2 gap-3 text-left",
    lastSeen: "mt-6 text-xs text-gray-500 flex items-center justify-center space-x-2",
  },
  statItem: {
    container: "flex items-center space-x-3 rounded-lg bg-black/20 p-3 text-left transition-colors hover:bg-black/40",
    iconWrapper: "flex-shrink-0 text-amber-400",
    icon: "w-5 h-5",
    label: "text-xs text-gray-400",
    value: "font-montserrat-semibold text-sm text-gray-50",
  },
  capybaraFact: {
    container: "animate-in fade-in duration-500 border-t border-amber-400/20 mt-6 pt-6",
    title: "font-montserrat-semibold text-sm text-amber-400 mb-2 tracking-wide",
    text: "font-montserrat-medium text-sm text-gray-400",
  },
};

// ============================================================================
// ICONS - No changes
// ============================================================================
const UsernameIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>);
const LastSeenIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>);
const GameIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12h3l3-9 4 18 4-9h3"/><path d="M8 12h8"/></svg>);
const RoleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>);
const RankIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);


// ============================================================================
// SUB-COMPONENTS - Updated
// ============================================================================
const StatItem = ({ icon, label, value, valueClassName }: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  valueClassName?: string;
}) => {
  if (!value) return null;
  return (
    <div className={StyleClasses.statItem.container}>
      <div className={StyleClasses.statItem.iconWrapper}>{icon}</div>
      <div>
        <p className={StyleClasses.statItem.label}>{label}</p>
        <p className={cn(StyleClasses.statItem.value, valueClassName)}>{value}</p>
      </div>
    </div>
  );
};

const UserDetailsView = ({ user, displayName, avatar }: { 
  user: User;
  displayName: string;
  avatar: { src: string; fallback: string } | null;
}) => (
  <div className={StyleClasses.userDetails.container}>
    {avatar && (
      <Image
        src={avatar.src}
        alt="User Avatar"
        width={96}
        height={96}
        className={StyleClasses.userDetails.avatar}
      />
    )}
    <h3 className={StyleClasses.userDetails.welcomeText}>Welcome back,</h3>
    <p className={StyleClasses.userDetails.displayName}>{displayName}!</p>
    
    <div className={StyleClasses.userDetails.statsGrid}>
      <StatItem icon={<UsernameIcon className={StyleClasses.statItem.icon}/>} label="Username" value={user.username} />
      <StatItem icon={<GameIcon className={StyleClasses.statItem.icon}/>} label="Game" value={user.game} />
      <StatItem icon={<RoleIcon className={StyleClasses.statItem.icon}/>} label="Role" value={user.role} />
      <StatItem 
        icon={<RankIcon className={StyleClasses.statItem.icon}/>} 
        label="Rank" 
        value={user.rank}
        valueClassName={getRankColor(user.rank)}
      />
    </div>

    {user.lastSeen && (
      <div className={StyleClasses.userDetails.lastSeen}>
        <LastSeenIcon className="w-3 h-3"/>
        <span>Last seen: {formatRelativeTime(user.lastSeen, 'en-US')}</span>
      </div>
    )}
  </div>
);

// New: Component to display capybara facts
const CapybaraFact = ({ fact }: { fact: string | null }) => {
  if (!fact) return null;
  return (
    <div className={StyleClasses.capybaraFact.container}>
      <h4 className={StyleClasses.capybaraFact.title}>Capybara Fact</h4>
      <p className={StyleClasses.capybaraFact.text}>{fact}</p>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT - Updated
// ============================================================================
interface DimmedLoaderProps {
  progress: number;
  user?: User | null;
}

const DimmedLoader = ({ progress, user }: DimmedLoaderProps) => {
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [capybaraFact, setCapybaraFact] = useState<string | null>(null);

  useEffect(() => {
    const factIndex = Math.floor(Math.random() * capybaraFacts.length);
    setCapybaraFact(capybaraFacts[factIndex]);

    if (progress >= 100) {
      const timer = setTimeout(() => setShowUserDetails(true), 300);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const displayName = user?.firstName || user?.username || "User";
  const avatar = user ? getAvatar(displayName, user.avatar) : null;

  return (
    <div className={StyleClasses.overlay}>
      <div className={StyleClasses.card}>
        <Image
          src="/images/pairly_logo.png"
          alt="Pairly Logo"
          width={96}
          height={96}
          className={StyleClasses.logo}
          priority
        />
        
        <div className="mb-6">
          <h2 className={StyleClasses.title}>Loading session...</h2>
          <div className={StyleClasses.progressContainer}>
            <div
              className={StyleClasses.progressBar}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className={StyleClasses.progressText}>{`${Math.round(progress)}%`}</p>
          {progress >= 100 && capybaraFact && (
            <CapybaraFact fact={capybaraFact} />
          )}
        </div>

        {showUserDetails && user && (
          <UserDetailsView user={user} displayName={displayName} avatar={avatar} />
        )}
      </div>
    </div>
  );
};

export default DimmedLoader;
