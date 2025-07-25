// src/app/page.tsx
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BookOpen, Trophy } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#0d0d0d] text-white min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">Pairly</h1>
        <div className="space-x-6 hidden md:flex">
          <a href="#features" className="hover:text-[#e6915b] transition">Features</a>
          <a href="#testimonials" className="hover:text-[#e6915b] transition">Testimonials</a>
          <a href="#login" className="hover:text-[#e6915b] transition">Login</a>
          <Button className="bg-[#e6915b] hover:bg-[#d8824a]">Create Account!</Button>
        </div>
      </nav>

      {/* Hero Section - Focused on top portion */}
      <section className="relative py-24 px-6 md:px-0 min-h-[70vh] flex items-center justify-center text-center">
        {/* Background with top alignment */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/Banner2.jpg"
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

      {/* Features */}
      <section id="features" className="bg-[#1a1a1a] py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-12">What Pairly Offers:</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Feature
              icon={<Users className="w-10 h-10" />}
              title="Duo Services"
              desc="Our teammates consistently rank among the top 1% of the games they play."
            />
            <Feature
              icon={<BookOpen className="w-10 h-10" />}
              title="Coaching"
              desc="Our coaches count with 200 years of collective experience ;) At Pairly, we have coaches for every role and playstyle available!"
            />
            <Feature
              icon={<Trophy className="w-10 h-10" />}
              title="Tournaments"
              desc="From free, 4fun tournaments, to competitive experiences offering money rewards and sponsorships, we got them all!"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-[#121212] text-center">
        <h3 className="text-3xl font-bold mb-10">What our users say:</h3>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <Testimonial
            name="Joana L."
            text="I found my duo to rank up in Valorant. Pairly is 🔥"
          />
          <Testimonial
            name="André M."
            text="Finally a site that understands what I'm looking for — highly recommend."
          />
          <Testimonial
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

      {/* Footer */}
      <footer className="text-gray-500 text-sm text-center py-6 bg-[#0d0d0d]">
        © {new Date().getFullYear()} Pairly. All rights reserved.
      </footer>
    </main>
  );
}

// Updated components with new color scheme
function Feature({
  icon,
  title,
  desc
}: {
  icon: React.ReactNode;
  title: string;
  desc: string
}) {
  return (
    <div className="bg-[#2a2a2a] p-6 rounded-xl hover:bg-[#333] transition">
      <div className="flex justify-center text-[#e6915b] mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}

function Testimonial({ name, text }: { name: string; text: string }) {
  return (
    <div className="bg-[#1f1f1f] p-6 rounded-xl max-w-sm mx-auto">
      <p className="italic text-gray-300 mb-4">“{text}”</p>
      <span className="text-[#6b8ab0] font-semibold">{name}</span>
    </div>
  );
}