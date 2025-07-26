import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function DuoPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#e6915b] to-[#a8724c]">
            Find Your Perfect Duo Partner
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Connect with top-ranked players who complement your playstyle. Our matchmaking algorithm pairs you with teammates who match your skill level, schedule, and communication preferences.
          </p>
          <div className="space-y-4 mb-8">
            <div className="flex items-center">
              <div className="mr-4 text-[#e6915b] text-xl">✓</div>
              <p>Players from top 1% of their games</p>
            </div>
            <div className="flex items-center">
              <div className="mr-4 text-[#e6915b] text-xl">✓</div>
              <p>Compatibility-based matching system</p>
            </div>
            <div className="flex items-center">
              <div className="mr-4 text-[#e6915b] text-xl">✓</div>
              <p>Verified player profiles with stats</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-[#e6915b] to-[#a8724c] hover:from-[#d8824a] hover:to-[#976040] px-8 py-6 text-lg">
            Find My Duo Partner
          </Button>
        </div>
        
        <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-[#e6915b]/30">
          <Image
            src="/images/duo-service.jpg"
            alt="Duo partners gaming"
            fill
            className="object-cover"
          />
        </div>
      </div>
      
      <div className="bg-[#1a1a1a] rounded-2xl p-8 mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Select Your Game", desc: "Choose from our supported competitive games" },
            { step: "2", title: "Set Preferences", desc: "Define your playstyle, schedule, and communication needs" },
            { step: "3", title: "Match & Play", desc: "Get paired with your perfect duo partner and start playing" }
          ].map((item, index) => (
            <div key={index} className="text-center p-6 bg-[#2a2a2a] rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#e6915b] flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-xl">{item.step}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}