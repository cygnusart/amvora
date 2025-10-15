'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <div className="text-center relative">
        
        {/* Main Hourglass Container */}
        <div className="relative w-32 h-48 mx-auto mb-8">
          
          {/* Hourglass Outer Frame */}
          <div className="absolute inset-0 flex flex-col items-center">
            {/* Top Bulb */}
            <motion.div
              className="w-24 h-24 bg-gradient-to-b from-amber-50 to-amber-100 rounded-full border-4 border-amber-200 overflow-hidden relative"
              animate={{ rotate: [0, 180, 360] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Top Sand - Decreasing */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-amber-600 to-amber-800"
                initial={{ height: "80%" }}
                animate={{ height: ["80%", "10%", "80%"] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Middle Neck */}
            <div className="w-6 h-6 bg-amber-200 rounded-full -my-3 z-10 border-2 border-amber-300" />

            {/* Bottom Bulb */}
            <motion.div
              className="w-24 h-24 bg-gradient-to-b from-amber-50 to-amber-100 rounded-full border-4 border-amber-200 overflow-hidden relative"
              animate={{ rotate: [0, 180, 360] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Bottom Sand - Increasing */}
              <motion.div
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-amber-800 to-amber-600"
                initial={{ height: "20%" }}
                animate={{ height: ["20%", "90%", "20%"] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>

          {/* Falling Sand Stream */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-full"
            animate={{
              height: [8, 16, 8],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Individual Falling Sand Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400 rounded-full"
              style={{
                left: "50%",
                transform: "translateX(-50%)",
              }}
              animate={{
                top: ["45%", "52%", "45%"],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Loading Text */}
        <motion.h2
          className="text-white text-2xl font-bold mb-4 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Time Flows...
        </motion.h2>

        <motion.p
          className="text-amber-200/80 text-lg mb-6"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        >
          Preparing your focus sanctuary
        </motion.p>

        {/* Animated Dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-amber-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.3
              }}
            />
          ))}
        </div>

        {/* Floating Sand Particles Around */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-300/60 rounded-full"
              style={{
                left: `${50 + Math.cos((i / 12) * Math.PI * 2) * 100}%`,
                top: `${50 + Math.sin((i / 12) * Math.PI * 2) * 80}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}