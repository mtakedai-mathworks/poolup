import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Car } from "lucide-react";

const HeroAnimation = () => {
  const membraneControls = useAnimation();
  const carControls = useAnimation();

  useEffect(() => {
    membraneControls.start({
      rotate: [0, 15, -10, 10, -5, 5, 0],
      transition: {
        repeat: Infinity,
        duration: 4,
        ease: "easeInOut"
      }
    });

    carControls.start({
      x: ["-100%", "100%"],
      transition: {
        repeat: Infinity,
        duration: 6,
        ease: "linear"
      }
    });
  }, [membraneControls, carControls]);

  return (
    <div className="relative h-[300px] bg-gradient-to-r from-blue-50 to-blue-100 overflow-hidden rounded-xl shadow-md">
      {/* Animated L-membrane (simplified) */}
      <motion.svg
        width="120"
        height="120"
        viewBox="0 0 100 100"
        className="absolute left-1/2 top-8 -translate-x-1/2"
        animate={membraneControls}
      >
        <defs>
          <linearGradient id="orange-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F7931E" />
            <stop offset="100%" stopColor="#F15A24" />
          </linearGradient>
        </defs>
        <path
          d="M10,90 C30,10 70,10 90,90 Z"
          fill="url(#orange-gradient)"
          stroke="#000"
          strokeWidth="1"
        />
      </motion.svg>

      {/* Animated Car */}
      <motion.div
        className="absolute bottom-6 text-blue-600"
        animate={carControls}
      >
        <Car className="w-10 h-10" />
      </motion.div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-xl font-bold text-gray-800">Welcome to My MathWorks-Inspired Page</h1>
        <p className="text-sm text-gray-600">Powered by React & Framer Motion</p>
      </div>
    </div>
  );
};

export default HeroAnimation;
