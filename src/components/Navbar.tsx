import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold tracking-tight">Pairly</Link>
      
      <div className="space-x-6 hidden md:flex">
        <Link href="/#features" className="hover:text-[#e6915b] transition">Features</Link>
        <Link href="/duo" className="hover:text-[#e6915b] transition">Duo</Link>
        <Link href="/coaching" className="hover:text-[#e6915b] transition">Coaching</Link>
        <Link href="/tournaments" className="hover:text-[#e6915b] transition">Tournaments</Link>
        <Link href="/#testimonials" className="hover:text-[#e6915b] transition">Testimonials</Link>
        <Link href="/login" className="hover:text-[#e6915b] transition">Login</Link>
        <Button className="bg-[#e6915b] hover:bg-[#d8824a]">
          <Link href="/signup">Create Account</Link>
        </Button>
      </div>
    </nav>
  );
}