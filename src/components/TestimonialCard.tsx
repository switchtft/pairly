export default function TestimonialCard({ 
  name, 
  text 
}: { 
  name: string; 
  text: string 
}) {
  return (
    <div className="bg-[#1f1f1f] p-6 rounded-xl max-w-sm mx-auto">
      <p className="italic text-gray-300 mb-4">“{text}”</p>
      <span className="text-[#6b8ab0] font-semibold">{name}</span>
    </div>
  );
}