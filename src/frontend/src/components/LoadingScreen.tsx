import { motion } from "motion/react";
import { CoinIcon } from "./CoinIcon";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <CoinIcon size={48} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        className="text-muted-foreground font-body text-sm tracking-widest uppercase"
      >
        Loading EarnHub…
      </motion.p>
    </div>
  );
}
