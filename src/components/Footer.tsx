export default function Footer() {
  return (
    <footer className="text-gray-500 text-sm text-center py-6 bg-[#0d0d0d]">
      © {new Date().getFullYear()} Pairly. All rights reserved.
    </footer>
  );
}