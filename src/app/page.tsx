// src/app/page.tsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Users, BookOpen, Trophy } from "lucide-react";

export default function Home() {
  return (
    <main className="bg-[#0d0d0d] text-white min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">Pairly</h1>
        <div className="space-x-6 hidden md:flex">
          <a href="#features" className="hover:text-purple-400 transition">Features</a>
          <a href="#testimonials" className="hover:text-purple-400 transition">Testimonials</a>
          <a href="#login" className="hover:text-purple-400 transition">Login</a>
          <Button className="bg-purple-600 hover:bg-purple-700">Create Account</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-24 px-6 md:px-0">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Find the <span className="text-purple-500">perfect players</span> to play, learn with or compete with!
        </h2>
        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
          Our teammates consistently rank at the top 1% of the games they play. Meet your new duo or coach in under <span className="text-purple-500">5 minutes! </span>
          Join our tournaments to win <span className="text-purple-500">up to 1000$ in prizes!</span>
        </p>
        <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
          Get Started <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
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
        <h3 className="text-3xl font-bold mb-10">What our users say</h3>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <Testimonial
            name="Joana L."
            text="I found my duo to rank up in Valorant. Pairly is 🔥"
          />
          <Testimonial
            name="André M."
            text="Finally a site that understands what I’m looking for — highly recommend."
          />
          <Testimonial
            name="Gonçalo F."
            text="Used Pairly to find a study partner. Very effective!"
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-purple-700 to-purple-500 text-center text-white">
        <h3 className="text-3xl font-semibold mb-6">Ready to find your duo?</h3>
        <Button size="lg" variant="secondary" className="bg-white text-purple-800 hover:bg-gray-100">
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

// Simple inline components (you can move them to components/ folder)
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
      <div className="flex justify-center text-purple-400 mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}

function Testimonial({ name, text }: { name: string; text: string }) {
  return (
    <div className="bg-[#1f1f1f] p-6 rounded-xl max-w-sm mx-auto shadow-md">
      <p className="italic text-gray-300 mb-4">“{text}”</p>
      <span className="text-purple-400 font-semibold">{name}</span>
    </div>
  );
}
