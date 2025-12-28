import Link from "next/link";
import { CherryBlossomBackground } from "@/components/CherryBlossomBackground";
import { DecorativeBorder } from "@/components/DecorativeBorder";
import { FadeInSection } from "@/components/FadeInSection";
import { AnimatedButton } from "@/components/AnimatedButton";
import { BookOpen, Music, Sparkles, Flower } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 pt-20">
      {/* Cherry blossom petals falling in background */}
      <CherryBlossomBackground />
      
      {/* Main content with proper z-index layering */}
      <div className="relative z-10 w-full max-w-4xl">
        <DecorativeBorder 
          variant="soft" 
          showAnimation={true}
          className="p-6 md:p-12"
        >
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Title fades in first */}
            <FadeInSection>
              <h1 className="text-4xl sm:text-6xl md:text-8xl sparkle-text break-words">
                Drithi Sparkle
              </h1>
            </FadeInSection>

            {/* Description fades in with slight delay */}
            <FadeInSection delay={0.2}>
              <div className="flex items-center justify-center gap-2 text-xl md:text-2xl text-purple-900">
                <Sparkles className="w-6 h-6 text-purple-primary" />
                <p className="inline">Welcome to my world of stories</p>
                <Sparkles className="w-6 h-6 text-purple-primary" />
              </div>
              <p className="text-lg text-gray-900 max-w-2xl mx-auto mt-3" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                Do you like to read my books?
              </p>
            </FadeInSection>
            
            {/* Buttons fade in last with sparkle effects */}
            <FadeInSection delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
                <Link href="/books">
                  <AnimatedButton 
                    showSparkle={true}
                    size="lg"
                    className="bg-purple-primary hover:bg-purple-dark text-white px-8 py-3 rounded-full shadow-lg transition-all"
                  >
                    <BookOpen className="h-5 w-5" />
                    Browse Books
                  </AnimatedButton>
                </Link>
                <Link href="/books">
                  <AnimatedButton 
                    showSparkle={false}
                    size="lg"
                    className="bg-pink-accent hover:bg-pink-600 text-white px-8 py-3 rounded-full shadow-lg transition-all"
                  >
                    <Music className="h-5 w-5" />
                    Music
                  </AnimatedButton>
                </Link>
              </div>
            </FadeInSection>
            
            {/* Footer with subtle fade */}
            <FadeInSection delay={0.6}>
              <div className="mt-8 sm:mt-12 text-sm text-gray-900 flex items-center justify-center gap-2" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                <Flower className="w-4 h-4 text-pink-accent" />
                <p>
                  A story reading website by Drithi (Age {
                    (() => {
                      const today = new Date();
                      const birthDate = new Date(2012, 4, 15); // May is month 4 (0-indexed)
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                      return age;
                    })()
                  })
                </p>
                <Flower className="w-4 h-4 text-pink-accent" />
              </div>
            </FadeInSection>
          </div>
        </DecorativeBorder>
      </div>
    </main>
  );
}
