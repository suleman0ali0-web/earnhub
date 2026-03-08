import { CoinIcon } from "@/components/CoinIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveProfile } from "@/hooks/useQueries";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileSetupPageProps {
  onComplete: () => void;
}

export function ProfileSetupPage({ onComplete }: ProfileSetupPageProps) {
  const [name, setName] = useState("");
  const saveProfile = useSaveProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        earnings: BigInt(0),
        withdrawalCount: BigInt(0),
      });
      toast.success("Welcome! 50 coins bonus credited to your account 🎉");
      onComplete();
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-emerald/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              className="inline-flex w-16 h-16 rounded-2xl gradient-emerald items-center justify-center mb-4 shadow-emerald"
            >
              <CoinIcon size={32} />
            </motion.div>
            <h1 className="font-display font-bold text-2xl text-foreground mb-2">
              Welcome to EarnHub!
            </h1>
            <p className="text-muted-foreground text-sm">
              Set up your profile to start earning coins by completing tasks.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Your Display Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ali Hassan"
                className="h-12 bg-surface-2 border-border focus:border-emerald/60 focus:ring-emerald/20"
                autoFocus
                required
                data-ocid="profile.input"
              />
              <p className="text-xs text-muted-foreground">
                This name will be visible on the leaderboard.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 gradient-emerald text-primary-foreground font-semibold shadow-emerald hover:opacity-90 transition-opacity"
              disabled={!name.trim() || saveProfile.isPending}
              data-ocid="profile.submit_button"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Earning
                </>
              )}
            </Button>

            {saveProfile.isError && (
              <p
                className="text-sm text-destructive text-center"
                data-ocid="profile.error_state"
              >
                Failed to save profile. Please try again.
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
