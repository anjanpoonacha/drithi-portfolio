"use client";

import * as React from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

interface CherryBlossomBackgroundProps {
  className?: string;
}

// Global flag to prevent multiple initializations
let engineInitialized = false;
let engineInitializing = false;

export const CherryBlossomBackground: React.FC<CherryBlossomBackgroundProps> = ({
  className = "",
}) => {
  const [init, setInit] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const initEngine = async () => {
      // If already initialized, just set state
      if (engineInitialized) {
        if (isMounted) {
          setInit(true);
        }
        return;
      }

      // If initialization is in progress, wait for it
      if (engineInitializing) {
        const checkInterval = setInterval(() => {
          if (engineInitialized && isMounted) {
            setInit(true);
            clearInterval(checkInterval);
          }
        }, 100);
        return;
      }

      // Start initialization
      engineInitializing = true;
      
      try {
        await initParticlesEngine(async (engine: Engine) => {
          await loadSlim(engine);
        });
        
        engineInitialized = true;
        engineInitializing = false;
        
        if (isMounted) {
          setInit(true);
        }
      } catch (error) {
        console.error("Failed to initialize particles:", error);
        engineInitializing = false;
      }
    };

    initEngine();

    return () => {
      isMounted = false;
    };
  }, []);

  const options: ISourceOptions = React.useMemo(
    () => ({
      fullScreen: {
        enable: false,
        zIndex: 0,
      },
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
          },
          resize: {
            enable: true,
            delay: 0.5,
          },
        },
        modes: {
          repulse: {
            distance: 60,
            duration: 0.4,
            speed: 0.5,
            easing: "ease-out-quad",
          },
        },
      },
      particles: {
        number: {
          value: 25,
          density: {
            enable: true,
            width: 1920,
            height: 1080,
          },
        },
        color: {
          value: ["#FFB7D5", "#FFFFFF"],
        },
        shape: {
          type: "image",
          image: [
            {
              src: "/petals/petal-pink.svg",
              width: 20,
              height: 24,
            },
            {
              src: "/petals/petal-white.svg",
              width: 20,
              height: 24,
            },
          ],
        },
        opacity: {
          value: { min: 0.3, max: 0.7 },
          animation: {
            enable: true,
            speed: 0.5,
            sync: false,
          },
        },
        size: {
          value: { min: 8, max: 16 },
        },
        rotate: {
          value: { min: 0, max: 360 },
          direction: "random",
          animation: {
            enable: true,
            speed: 3,
            sync: false,
          },
        },
        move: {
          enable: true,
          speed: { min: 0.5, max: 1.2 },
          direction: "bottom",
          random: true,
          straight: false,
          outModes: {
            default: "out",
            bottom: "out",
            top: "none",
          },
          attract: {
            enable: false,
          },
          warp: true,
        },
        wobble: {
          enable: true,
          distance: 15,
          speed: { min: 4, max: 8 },
        },
      },
      detectRetina: true,
      responsive: [
        {
          maxWidth: 768,
          options: {
            particles: {
              number: {
                value: 15,
              },
              size: {
                value: { min: 6, max: 12 },
              },
              move: {
                speed: { min: 0.4, max: 1.0 },
              },
            },
          },
        },
      ],
    }),
    []
  );

  if (!init) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    >
      <Particles
        id="cherry-blossom-particles"
        options={options}
        className="absolute inset-0 pointer-events-auto"
      />
    </div>
  );
};

CherryBlossomBackground.displayName = "CherryBlossomBackground";
