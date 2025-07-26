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
            src="/images/Banner4.jpg"
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
            Find the <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6b8ab0] to-[#8a675e]">perfect players</span> to play, learn with or compete with!
          </h2>
          <p className="text-lg text-[#e0d6d1] max-w-xl mx-auto mb-8 drop-shadow-lg">
            Our teammates consistently rank at the top 1% of the games they play. Meet your new duo or coach in under <span className="text-[#e6915b] font-medium">5 minutes! </span>
            Join our tournaments to win <span className="text-[#e6915b] font-medium">up to 1000$ in prizes!</span>
          </p>
          <Button size="lg" className="bg-gradient-to-r from-[#e6915b] to-[#a8724c] hover:from-[#d8824a] hover:to-[#976040] shadow-lg">
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Game Selection Section */}
      <GameSelector />

      {/* Features */}
      <section id="features" className="bg-[#1a1a1a] py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-12">What Pairly Offers:</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤝"
              title="Duo Services"
              desc="Our teammates consistently rank among the top 1% of the games they play."
              href="/duo"
            />
            <FeatureCard
              icon="📚"
              title="Coaching"
              desc="Learn from professionals with years of experience across all roles and playstyles."
              href="/coaching"
            />
            <FeatureCard
              icon="🏆"
              title="Tournaments"
              desc="Compete in tournaments with cash prizes and sponsorship opportunities."
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
            text="I found my duo to rank up in Valorant. Pairly is 🔥"
          />
          <TestimonialCard
            name="André M."
            text="Finally a site that understands what I'm looking for — highly recommend."
          />
          <TestimonialCard
            name="Gonçalo F."
            text="Used Pairly to find a study partner. Very effective!"
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#e6915b] to-[#a8724c] text-center text-white">
        <h3 className="text-3xl font-semibold mb-6">Ready to find your duo?</h3>
        <Button size="lg" variant="secondary" className="bg-white text-[#8a675e] hover:bg-gray-100">
          Create Account
        </Button>
      </section>
    </>
  );
}