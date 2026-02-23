import { motion } from "framer-motion";

const shapes = [
  { size: 300, x: "10%", y: "20%", delay: 0, color: "hsl(0, 85%, 50%)" },
  { size: 200, x: "80%", y: "10%", delay: 2, color: "hsl(25, 90%, 50%)" },
  { size: 250, x: "70%", y: "60%", delay: 4, color: "hsl(0, 70%, 40%)" },
  { size: 180, x: "20%", y: "70%", delay: 1, color: "hsl(340, 80%, 45%)" },
];

export default function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
            background: shape.color,
            opacity: 0.06,
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -30, 20, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
