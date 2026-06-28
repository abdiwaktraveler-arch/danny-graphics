import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IMAGES } from "@/lib/site";

export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDone(true), 1500);
    return () => clearTimeout(id);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          <motion.img
            src={IMAGES.logo}
            alt="Loading"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-20 w-20 object-contain"
          />
          <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.3, ease: "easeInOut" }}
              className="h-full w-full rounded-full"
              style={{ background: "var(--gradient-brand)" }}
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 font-display text-sm tracking-[0.3em] text-muted-foreground"
          >
            DANNY GRAPHICS
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
