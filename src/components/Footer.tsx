import Link from 'next/link';
import { Gamepad2, Twitter, Youtube, Twitch, MessageCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#0d0d0d] border-t border-[#1a1a1a] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <Gamepad2 size={24} className="text-[#e6915b] mr-2" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] bg-clip-text text-transparent">
                Pairly
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Connecting gamers worldwide to find teammates, coaches, and competitive tournaments.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <Twitter size={18} />, label: "Twitter" },
                { icon: <MessageCircle size={18} />, label: "Discord" },
                { icon: <Twitch size={18} />, label: "Twitch" },
                { icon: <Youtube size={18} />, label: "YouTube" }
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Duo', 'Coaching', 'Tournaments', 'FAQ', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href="#" 
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Games</h4>
            <ul className="space-y-3">
              {['League of Legends', 'Valorant', 'CS:GO 2', 'Dota 2', 'Overwatch 2', 'Rocket League'].map((game) => (
                <li key={game}>
                  <Link 
                    href="#" 
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {game}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get updates on tournaments and special offers
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-[#1a1a1a] text-sm px-4 py-2 rounded-l-lg w-full focus:outline-none focus:ring-1 focus:ring-[#6b8ab0]"
              />
              <button className="bg-gradient-to-r from-[#e6915b] to-[#e6915b] hover:from-[#d18251] hover:to-[#d18251] text-sm px-4 py-2 rounded-r-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {currentYear} Pairly Gaming. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-gray-500 hover:text-gray-400 text-sm">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-500 hover:text-gray-400 text-sm">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-500 hover:text-gray-400 text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}