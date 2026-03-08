import { CoinIcon } from "@/components/CoinIcon";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Loader2, Shield, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";

export function LoginPage() {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  const features = [
    {
      icon: Zap,
      label: "Complete Tasks",
      desc: "Earn coins for every completed task",
    },
    {
      icon: TrendingUp,
      label: "Track Earnings",
      desc: "Real-time dashboard for your balance",
    },
    {
      icon: Shield,
      label: "Secure & Fast",
      desc: "Powered by Internet Identity",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Left panel — hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 lg:p-16 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
          {/* Geometric grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(oklch(0.62 0.17 158) 1px, transparent 1px),
                linear-gradient(90deg, oklch(0.62 0.17 158) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-md w-full mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3 mb-10"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center shadow-emerald"
            >
              <CoinIcon size={26} />
            </motion.div>
            <div>
              <h1 className="font-display font-extrabold text-3xl tracking-tight leading-none">
                Earn<span className="text-emerald">Hub</span>
              </h1>
              <p className="text-muted-foreground text-xs tracking-widest uppercase mt-0.5">
                Task Earning Platform
              </p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="font-display font-bold text-4xl lg:text-5xl leading-tight mb-4">
              Complete tasks,{" "}
              <span className="text-gold glow-gold">earn coins.</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Join EarnHub — the task-based earning platform where every
              completed task puts coins in your wallet.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-3 mb-10"
          >
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-1 border border-border"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-emerald" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold gradient-emerald text-primary-foreground hover:opacity-90 shadow-emerald transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            {isLoginError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive text-center"
                data-ocid="login.error_state"
              >
                {loginError?.message || "Login failed. Please try again."}
              </motion.p>
            )}

            <p className="text-center text-xs text-muted-foreground">
              New to EarnHub? Your account is created on first login.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel — stats mockup */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex w-96 xl:w-[440px] bg-surface-1 border-l border-border flex-col items-center justify-center p-12 gap-8"
      >
        {/* Big coin */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-full gradient-gold flex items-center justify-center shadow-gold">
            <span className="font-display font-black text-5xl text-amber-900">
              ₑ
            </span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald flex items-center justify-center shadow-emerald">
            <span className="text-xs font-bold text-primary-foreground">+</span>
          </div>
        </motion.div>

        {/* Mock stats */}
        <div className="w-full space-y-4">
          {[
            { label: "Total Users", value: "2,847", change: "+12%" },
            { label: "Tasks Available", value: "156", change: "+8%" },
            { label: "Coins Distributed", value: "1.2M", change: "+24%" },
          ].map(({ label, value, change }) => (
            <div
              key={label}
              className="flex items-center justify-between p-4 rounded-xl bg-background border border-border"
            >
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {label}
                </p>
                <p className="font-display font-bold text-2xl text-foreground mt-0.5">
                  {value}
                </p>
              </div>
              <span className="text-xs font-medium text-emerald bg-emerald/10 px-2.5 py-1 rounded-full">
                {change}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center italic">
          Join thousands already earning on EarnHub
        </p>
      </motion.div>
    </div>
  );
}
