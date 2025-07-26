import { Button } from "@/components/ui/button";
import Image from "next/image";


export default function CoachingPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
        <div className="order-2 md:order-1">
          <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-[#6b8ab0]/30">
            <Image
              src="/images/coaching.jpg"
              alt="Gaming coaching session"
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        <div className="order-1 md:order-2">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6b8ab0] to-[#8a675e]">
            Level Up Your Game
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Learn from professional coaches who have competed at the highest levels. Our personalized coaching sessions are designed to help you master mechanics, strategy, and game sense.
          </p>
          <div className="space-y-4 mb-8">
            {[
              "Personalized 1-on-1 sessions",
              "VOD reviews and analysis",
              "Role-specific training",
              "Game sense development",
              "Custom practice routines"
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="mr-4 text-[#6b8ab0] text-xl">✓</div>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <Button className="bg-gradient-to-r from-[#6b8ab0] to-[#8a675e] hover:from-[#5a79a0] hover:to-[#79564e] px-8 py-6 text-lg">
            Find a Coach
          </Button>
        </div>
      </div>
      
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Coaching Packages</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "Beginner", 
              price: "$25", 
              desc: "Perfect for new players looking to build strong fundamentals",
              features: ["2 sessions", "Basic mechanics", "Game introduction"]
            },
            { 
              title: "Intermediate", 
              price: "$45", 
              desc: "For players looking to climb the ranked ladder",
              features: ["4 sessions", "Role specialization", "VOD reviews", "Strategy sessions"]
            },
            { 
              title: "Advanced", 
              price: "$80", 
              desc: "For competitive players aiming for the top ranks",
              features: ["8 sessions", "Advanced strategies", "Team play", "Tournament prep", "Personalized training"]
            }
          ].map((packageItem, index) => (
            <div key={index} className={`p-8 rounded-xl ${index === 1 ? 'border-2 border-[#e6915b] scale-105' : 'border border-[#6b8ab0]/30'}`}>
              <h3 className="text-2xl font-bold mb-2">{packageItem.title}</h3>
              <p className="text-4xl font-bold mb-4 text-[#e6915b]">{packageItem.price}</p>
              <p className="text-gray-400 mb-6">{packageItem.desc}</p>
              <ul className="space-y-3 mb-8">
                {packageItem.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <div className="mr-3 text-[#6b8ab0]">•</div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-[#6b8ab0] to-[#8a675e] hover:from-[#5a79a0] hover:to-[#79564e]">
                Choose Plan
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

