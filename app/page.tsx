import { CherryBlossomBackground } from "@/components/CherryBlossomBackground";
import { DecorativeBorder } from "@/components/DecorativeBorder";
import { FadeInSection } from "@/components/FadeInSection";
import { AnimatedButton } from "@/components/AnimatedButton";
import { BookOpen, Music } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-8">
      {/* Cherry blossom petals falling in background */}
      <CherryBlossomBackground />
      
      {/* Main content with proper z-index layering */}
      <div className="relative z-10 w-full max-w-4xl">
        <DecorativeBorder 
          variant="soft" 
          showAnimation={true}
          className="p-8 md:p-12"
        >
          <div className="text-center space-y-6">
            {/* Title fades in first */}
            <FadeInSection>
              <h1 className="text-6xl md:text-8xl sparkle-text">
                Drithi Sparkle
              </h1>
            </FadeInSection>

            {/* Description fades in with slight delay */}
            <FadeInSection delay={0.2}>
              <p className="text-xl md:text-2xl text-purple-dark">
                ✨ Welcome to my world of stories ✨
              </p>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
                Do you like to read my books?
              </p>
            </FadeInSection>
            
            {/* Buttons fade in last with sparkle effects */}
            <FadeInSection delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <AnimatedButton 
                  showSparkle={true}
                  variant="default"
                  size="lg"
                  className="bg-purple-primary hover:bg-purple-dark text-white px-8 py-3 rounded-full"
                >
                  <BookOpen className="h-5 w-5" />
                  Browse Books
                </AnimatedButton>
                <AnimatedButton 
                  showSparkle={false}
                  variant="default"
                  size="lg"
                  className="bg-pink-accent hover:bg-pink-600 text-white px-8 py-3 rounded-full"
                >
                  <Music className="h-5 w-5" />
                  Music
                </AnimatedButton>
              </div>
            </FadeInSection>
            
            {/* Footer with subtle fade */}
            <FadeInSection delay={0.6}>
              <div className="mt-12 text-sm text-gray-500">
                <p>🌸 A story reading website by Drithi (Age 13) 🌸</p>
              </div>
            </FadeInSection>
          </div>
        </DecorativeBorder>
      </div>
    </main>
  );
}
