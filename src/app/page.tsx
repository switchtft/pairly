export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 text-black p-6">
      <h1 className="text-5xl font-bold mb-4">Bem-vindo ao Pairly 👥</h1>
      <p className="text-xl text-gray-600 max-w-md text-center mb-6">
        Junta-te à comunidade e encontra a tua dupla ideal para jogar, estudar ou trabalhar.
      </p>
      <button className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition">
        Começar agora
      </button>
    </main>
  );
}
