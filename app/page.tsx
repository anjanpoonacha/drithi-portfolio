export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-6xl md:text-8xl sparkle-text animate-pulse">
          Drithi Sparkle
        </h1>
        <p className="text-xl md:text-2xl text-purple-dark">
          ✨ Welcome to my world of stories ✨
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Do you like to read my books?
        </p>
        
        <div className="flex gap-4 justify-center mt-8">
          <button className="bg-purple-primary hover:bg-purple-dark text-white px-8 py-3 rounded-full transition-all transform hover:scale-105">
            📚 Browse Books
          </button>
          <button className="bg-pink-accent hover:bg-pink-600 text-white px-8 py-3 rounded-full transition-all transform hover:scale-105">
            🎵 Music
          </button>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>🌸 A story reading website by Drithi (Age 13) 🌸</p>
        </div>
      </div>
      
      {/* Cherry Blossom decoration - placeholder */}
      <div className="fixed bottom-4 right-4 text-6xl opacity-20 animate-bounce">
        🌸
      </div>
    </main>
  );
}
