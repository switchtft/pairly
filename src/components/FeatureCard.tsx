import Link from "next/link";

export default function FeatureCard({
  icon,
  title,
  desc,
  href
}: {
  icon: string;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="bg-[#2a2a2a] p-6 rounded-xl hover:bg-[#333] transition transform group-hover:-translate-y-1">
        <div className="flex justify-center text-4xl mb-4">{icon}</div>
        <h4 className="text-xl font-semibold mb-2 text-center">{title}</h4>
        <p className="text-gray-400 text-center">{desc}</p>
        <div className="mt-4 text-center">
          <span className="text-[#e6915b] group-hover:underline">Learn more →</span>
        </div>
      </div>
    </Link>
  );
}