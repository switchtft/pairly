import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import GameSelector from "@/components/GameSelector";
import FeatureCard from "@/components/FeatureCard";
import TestimonialCard from "@/components/TestimonialCard";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 px-6 md:px-0 min-h-[70vh] flex items-center justify-center text-center">
        {/* Background with top alignment */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/Banner4.png"
            alt="Esports arena"
            fill
            className="object-cover object-top drop-shadow-none"
            priority
            sizes="100vw"
          />
          {/* Color overlay to unify with text */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/70 via-[#0d0d0d]/30 to-[#0d0d0d]/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[#e6915b] to-[#a8724c]">
            Play <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d4a574] to-[#b8860b]">for free</span> with amazing teammates! :D
          </h2>
          <p className="text-lg text-[#e0d6d1] max-w-xl mx-auto mb-8 drop-shadow-lg">
            Find your perfect duo partner for ranked games, get coaching from top players, join free Inhouses, or compete in tournaments!
          </p>
          <a href="#games">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-[#e6915b] to-[#a8724c] hover:from-[#d8824a] hover:to-[#976040] shadow-lg"
            >
              See What We Offer <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* Game Selection Section */}
      <GameSelector />

      {/* Features */}
      <section id="features" className="bg-[#1a1a1a] py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-12">What Pairly Offers:</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon="🤝"
              title="Duo Services"
              desc="Find your perfect duo partner for ranked games. Free matching with premium coaching options."
              href="/duo"
            />
            <FeatureCard
              icon="📚"
              title="Coaching"
              desc="Learn from top players with personalized coaching sessions. Improve your skills and climb the ranks!"
              href="/coaching"
            />
            <FeatureCard
              icon="⚔️"
              title="Free Inhouses"
              desc="Join casual 5v5 custom games with voice chat. No pressure, just fun gaming with new friends!"
              href="/inhouses"
            />
            <FeatureCard
              icon="🏆"
              title="Tournaments"
              desc="Free tournaments with rewards, or paid entry for bigger prize pools. Something for every player!"
              href="/tournaments"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-[#121212] text-center">
        <h3 className="text-3xl font-bold mb-10">What our users say:</h3>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <TestimonialCard
            name="Joana L."
            text="Found my perfect duo partner through Pairly. The matching system is incredible!"
          />
          <TestimonialCard
            name="André M."
            text="The coaching sessions helped me improve so much. Worth every penny!"
          />
          <TestimonialCard
            name="Gonçalo F."
            text="The free Inhouses are amazing! Found so many cool people to play with."
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#e6915b] to-[#a8724c] text-center text-white">
        <h3 className="text-3xl font-semibold mb-6">Ready to play for free?</h3>
        <p className="text-lg mb-8 opacity-90">Join thousands of gamers in our duo matching, coaching, and free Inhouses!</p>
        <Button size="lg" variant="secondary" className="bg-white text-[#a8724c] hover:bg-gray-100">
          Start Playing Free
        </Button>
      </section>
    </>
  );
}