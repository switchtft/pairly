import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function TournamentsPage() {
  const tournaments = [
    {
      id: 1,
      title: "Weekly Valorant Cup",
      game: "Valorant",
      date: "Every Saturday",
      prize: "$500",
      participants: 128,
      image: "/images/tournament1.jpg"
    },
    {
      id: 2,
      title: "League of Legends Clash",
      game: "League of Legends",
      date: "Monthly Finals",
      prize: "$1,000",
      participants: 256,
      image: "/images/tournament2.jpg"
    },
    {
      id: 3,
      title: "CS:GO Open Series",
      game: "CS:GO",
      date: "Bi-weekly",
      prize: "$750",
      participants: 64,
      image: "/images/tournament3.jpg"
    },
    {
      id: 4,
      title: "Rocket League Showdown",
      game: "Rocket League",
      date: "Every Sunday",
      prize: "$300",
      participants: 32,
      image: "/images/tournament4.jpg"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#e6915b] to-[#a8724c]">
          Compete in Exciting Tournaments
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Join our competitive tournaments with cash prizes and sponsorship opportunities. 
          Whether you're looking for casual fun or serious competition, we have events for every skill level.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <div className="bg-[#1a1a1a] rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Upcoming Tournaments</h2>
          <div className="space-y-6">
            {tournaments.map(tournament => (
              <div key={tournament.id} className="flex items-center p-4 bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition">
                <div className="relative w-24 h-24 rounded-md overflow-hidden mr-6">
                  <Image
                    src={tournament.image}
                    alt={tournament.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{tournament.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-sm bg-[#e6915b]/20 text-[#e6915b] px-2 py-1 rounded">{tournament.game}</span>
                    <span className="text-sm bg-[#6b8ab0]/20 text-[#6b8ab0] px-2 py-1 rounded">{tournament.date}</span>
                    <span className="text-sm bg-[#8a675e]/20 text-[#8a675e] px-2 py-1 rounded">Prize: {tournament.prize}</span>
                  </div>
                </div>
                <Button className="ml-auto bg-gradient-to-r from-[#6b8ab0] to-[#8a675e] hover:from-[#5a79a0] hover:to-[#79564e]">
                  Register
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Create Your Tournament</h2>
          <p className="text-gray-300 mb-8">
            Host your own custom tournament with our easy-to-use tools. Set your rules, invite players, and manage everything in one place.
          </p>
          
          <div className="space-y-6">
            <div className="bg-[#2a2a2a] p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4">Basic Tournament</h3>
              <p className="text-gray-400 mb-4">Perfect for small groups and casual events</p>
              <p className="text-2xl font-bold mb-4 text-[#e6915b]">Free</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <div className="mr-3 text-[#6b8ab0]">✓</div>
                  <span>Up to 16 teams</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 text-[#6b8ab0]">✓</div>
                  <span>Basic bracket management</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 text-[#6b8ab0]">✓</div>
                  <span>Simple registration</span>
                </li>
              </ul>
              <Button className="w-full">Create Tournament</Button>
            </div>
            
            <div className="bg-[#2a2a2a] p-6 rounded-lg border-2 border-[#e6915b]">
              <h3 className="font-bold text-lg mb-4">Premium Tournament</h3>
              <p className="text-gray-400 mb-4">For serious events with cash prizes</p>
              <p className="text-2xl font-bold mb-4 text-[#e6915b]">$29.99</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <div className="mr-3 text-[#6b8ab0]">✓</div>
                  <span>Unlimited teams</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 text-[#6b8ab0]">✓</div>
                  <span>Advanced bracket options</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 text-[#6b8ab0]">✓</div>
                  <span>Prize pool management</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 text-[#6b8ab0]">✓</div>
                  <span>Stream integration</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 text-[#6b8ab0]">✓</div>
                  <span>Custom branding</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-[#e6915b] to-[#a8724c] hover:from-[#d8824a] hover:to-[#976040]">
                Create Tournament
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}