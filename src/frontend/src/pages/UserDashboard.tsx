import { CoinIcon, formatCoins } from "@/components/CoinIcon";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCompleteTask,
  useMyWithdrawals,
  useSubmitWithdrawal,
  useUserDashboard,
  useUserProfile,
} from "@/hooks/useQueries";
import {
  ArrowDownCircle,
  CheckCircle2,
  Clock,
  Coins,
  ListTodo,
  Loader2,
  SmartphoneNfc,
  Trophy,
  Wallet,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PaymentMethod, WithdrawalStatus } from "../backend.d";
import type { Task } from "../backend.d";

interface UserDashboardProps {
  userName: string;
}

function TaskCard({
  task,
  completed,
  index,
}: {
  task: Task;
  completed: boolean;
  index: number;
}) {
  const completeTask = useCompleteTask();
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeTask.mutateAsync(task.id);
      toast.success(
        `Task completed! +${formatCoins(task.reward)} coins earned 🎉`,
      );
    } catch {
      toast.error("Failed to complete task. Please try again.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`group relative bg-card border rounded-xl p-5 transition-all duration-300 ${
        completed
          ? "border-emerald/20 bg-emerald/5"
          : "border-border hover:border-emerald/40 hover:shadow-emerald cursor-pointer"
      }`}
      data-ocid={`task.item.${index + 1}`}
    >
      {/* Reward badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display font-semibold text-base text-foreground leading-tight flex-1">
          {task.title}
        </h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/30 flex-shrink-0">
          <CoinIcon size={12} />
          <span className="text-gold text-xs font-bold">
            {formatCoins(task.reward)}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{Number(task.completedCount)} completions</span>
        </div>

        {completed ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald">
            <CheckCircle2 size={14} />
            Completed
          </div>
        ) : (
          <Button
            size="sm"
            className="h-8 px-4 text-xs gradient-emerald text-primary-foreground font-semibold shadow-emerald hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            onClick={handleComplete}
            disabled={completing}
            data-ocid={`task.primary_button.${index + 1}`}
          >
            {completing ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Completing…
              </>
            ) : (
              "Complete Task"
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-3/4 bg-surface-3" />
        <Skeleton className="h-6 w-16 rounded-full bg-surface-3" />
      </div>
      <Skeleton className="h-4 w-full bg-surface-3" />
      <Skeleton className="h-4 w-2/3 bg-surface-3" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24 bg-surface-3" />
        <Skeleton className="h-8 w-28 rounded-lg bg-surface-3" />
      </div>
    </div>
  );
}

function WithdrawalStatusBadge({ status }: { status: WithdrawalStatus }) {
  if (status === WithdrawalStatus.approved) {
    return (
      <Badge className="bg-emerald/15 text-emerald border-emerald/30 gap-1">
        <CheckCircle2 size={10} />
        Approved
      </Badge>
    );
  }
  if (status === WithdrawalStatus.rejected) {
    return (
      <Badge className="bg-destructive/15 text-destructive border-destructive/30 gap-1">
        <XCircle size={10} />
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-gold/15 text-gold border-gold/30 gap-1">
      <Clock size={10} />
      Pending
    </Badge>
  );
}

function WithdrawalDialog({
  open,
  onClose,
  balance,
  withdrawalCount,
}: {
  open: boolean;
  onClose: () => void;
  balance: bigint;
  withdrawalCount: bigint;
}) {
  const submitWithdrawal = useSubmitWithdrawal();
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.easypaisa,
  );

  // Minimum withdrawal: first withdrawal = 200, second = 200, third+ = 500
  // Based on withdrawalCount: if count < 2 then min 200, else min 500
  const minAmount = Number(withdrawalCount) < 2 ? 200 : 500;
  const maxAmount = Number(balance);

  const amountNum = Number(amount);
  const amountValid =
    amount !== "" &&
    amountNum >= minAmount &&
    amountNum <= maxAmount &&
    Number.isInteger(amountNum);
  const phoneValid = /^03[0-9]{9}$/.test(phone.replace(/-/g, ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountValid || !phoneValid) return;
    try {
      await submitWithdrawal.mutateAsync({
        amount: BigInt(amountNum),
        phoneNumber: phone.trim(),
        paymentMethod,
      });
      toast.success(
        `Withdrawal request for ${amountNum} PKR submitted successfully!`,
      );
      setAmount("");
      setPhone("");
      onClose();
    } catch {
      toast.error("Failed to submit withdrawal. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border sm:max-w-md"
        data-ocid="withdrawal.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-xl flex items-center gap-2">
            <Wallet size={20} className="text-emerald" />
            Withdraw Earnings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Your balance:{" "}
            <span className="font-bold text-gold">
              {formatCoins(balance)} PKR
            </span>
            {" · "}
            Minimum:{" "}
            <span className="font-bold text-foreground">{minAmount} PKR</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: PaymentMethod.easypaisa,
                  label: "Easypaisa",
                  color: "emerald",
                },
                {
                  value: PaymentMethod.jazzcash,
                  label: "JazzCash",
                  color: "gold",
                },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    paymentMethod === value
                      ? color === "emerald"
                        ? "border-emerald bg-emerald/10 text-emerald"
                        : "border-gold bg-gold/10 text-gold"
                      : "border-border text-muted-foreground hover:border-border/80 hover:bg-surface-1"
                  }`}
                  data-ocid={`withdrawal.${value}.toggle`}
                >
                  <SmartphoneNfc size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="withdraw-phone" className="text-sm font-medium">
              {paymentMethod === PaymentMethod.easypaisa
                ? "Easypaisa"
                : "JazzCash"}{" "}
              Number
            </Label>
            <Input
              id="withdraw-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XX-XXXXXXX"
              className="bg-surface-2 border-border focus:border-emerald/60"
              required
              data-ocid="withdrawal.input"
            />
            {phone && !phoneValid && (
              <p
                className="text-xs text-destructive"
                data-ocid="withdrawal.error_state"
              >
                Enter a valid Pakistan mobile number (e.g. 03001234567)
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount" className="text-sm font-medium">
              Amount (PKR)
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <CoinIcon size={16} />
              </div>
              <Input
                id="withdraw-amount"
                type="number"
                min={minAmount}
                max={maxAmount}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ${minAmount}`}
                className="pl-9 bg-surface-2 border-border focus:border-emerald/60"
                required
                data-ocid="withdrawal.select"
              />
            </div>
            {amount && !amountValid && (
              <p
                className="text-xs text-destructive"
                data-ocid="withdrawal.amount.error_state"
              >
                {amountNum > maxAmount
                  ? `Insufficient balance (max ${maxAmount} PKR)`
                  : `Minimum withdrawal is ${minAmount} PKR`}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border hover:bg-surface-2"
              data-ocid="withdrawal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !amountValid || !phoneValid || submitWithdrawal.isPending
              }
              className="gradient-emerald text-primary-foreground font-semibold shadow-emerald hover:opacity-90"
              data-ocid="withdrawal.submit_button"
            >
              {submitWithdrawal.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <ArrowDownCircle size={16} className="mr-2" />
                  Request Withdrawal
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UserDashboard({ userName }: UserDashboardProps) {
  const { data: dashboard, isLoading } = useUserDashboard();
  const { data: profile } = useUserProfile();
  const { data: myWithdrawals = [], isLoading: withdrawalsLoading } =
    useMyWithdrawals();
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);

  const earnings = dashboard?.earnings ?? BigInt(0);
  const availableTasks = dashboard?.availableTasks ?? [];
  const completedTasks = dashboard?.completedTasks ?? [];
  const withdrawalCount = profile?.withdrawalCount ?? BigInt(0);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userName={userName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Page title */}
          <motion.div variants={itemVariants}>
            <h2 className="font-display font-bold text-2xl text-foreground">
              Welcome back, <span className="text-emerald">{userName}</span> 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Your earning dashboard — complete tasks to grow your balance.
            </p>
          </motion.div>

          {/* Earnings hero card */}
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 shadow-card">
              {/* Background decorations */}
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-emerald/5 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="w-20 h-20 rounded-2xl gradient-gold flex items-center justify-center shadow-gold flex-shrink-0"
                >
                  <span className="font-display font-black text-4xl text-amber-900">
                    ₑ
                  </span>
                </motion.div>

                <div className="flex-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">
                    Your Balance
                  </p>
                  {isLoading ? (
                    <Skeleton
                      className="h-14 w-48 bg-surface-3"
                      data-ocid="dashboard.loading_state"
                    />
                  ) : (
                    <div className="flex items-baseline gap-3">
                      <span className="font-display font-black text-6xl text-gold glow-gold leading-none">
                        {formatCoins(earnings)}
                      </span>
                      <span className="text-2xl text-gold/60 font-medium">
                        PKR
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {completedTasks.length} tasks completed total
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 sm:text-right">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald/10 border border-emerald/20">
                    <Coins size={16} className="text-emerald" />
                    <span className="text-sm font-semibold text-emerald">
                      {availableTasks.length} tasks ready
                    </span>
                  </div>
                  <Button
                    onClick={() => setWithdrawalOpen(true)}
                    disabled={earnings < BigInt(200)}
                    className="gap-2 gradient-emerald text-primary-foreground font-semibold shadow-emerald hover:opacity-90 transition-all hover:scale-105 active:scale-95"
                    data-ocid="withdrawal.open_modal_button"
                  >
                    <Wallet size={16} />
                    Withdraw
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-4"
          >
            {[
              {
                icon: ListTodo,
                label: "Available",
                value: availableTasks.length,
                color: "emerald",
              },
              {
                icon: Trophy,
                label: "Completed",
                value: completedTasks.length,
                color: "gold",
              },
              {
                icon: Coins,
                label: "Total Earned",
                value: `${formatCoins(earnings)}`,
                color: "gold",
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="bg-card border border-border rounded-xl p-4 text-center"
              >
                <Icon
                  size={18}
                  className={
                    color === "emerald"
                      ? "text-emerald mx-auto mb-2"
                      : "text-gold mx-auto mb-2"
                  }
                />
                <p className="font-display font-bold text-xl text-foreground">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Available Tasks */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-2">
                <ListTodo size={16} className="text-emerald" />
                <h3 className="font-display font-semibold text-sm text-foreground uppercase tracking-wider">
                  Available Tasks
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-emerald/15 text-emerald border-emerald/20 text-xs"
                >
                  {availableTasks.length}
                </Badge>
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : availableTasks.length === 0 ? (
              <div
                className="text-center py-16 rounded-xl border border-dashed border-border bg-surface-1"
                data-ocid="task.empty_state"
              >
                <Trophy
                  size={40}
                  className="text-muted-foreground/40 mx-auto mb-3"
                />
                <p className="font-medium text-foreground mb-1">
                  All tasks completed!
                </p>
                <p className="text-sm text-muted-foreground">
                  You've completed all available tasks. Check back soon for
                  more!
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {availableTasks.map((task, i) => (
                    <TaskCard
                      key={task.id.toString()}
                      task={task}
                      completed={false}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.section>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <motion.section variants={itemVariants}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-border" />
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold" />
                  <h3 className="font-display font-semibold text-sm text-foreground uppercase tracking-wider">
                    Completed Tasks
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-gold/15 text-gold border-gold/20 text-xs"
                  >
                    {completedTasks.length}
                  </Badge>
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTasks.map((task, i) => (
                  <TaskCard
                    key={task.id.toString()}
                    task={task}
                    completed={true}
                    index={i}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Withdrawal History */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-emerald" />
                <h3 className="font-display font-semibold text-sm text-foreground uppercase tracking-wider">
                  Withdrawal History
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-emerald/15 text-emerald border-emerald/20 text-xs"
                >
                  {myWithdrawals.length}
                </Badge>
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {withdrawalsLoading ? (
                <div
                  className="p-6 space-y-3"
                  data-ocid="withdrawal.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-surface-3" />
                  ))}
                </div>
              ) : myWithdrawals.length === 0 ? (
                <div
                  className="text-center py-12"
                  data-ocid="withdrawal.empty_state"
                >
                  <ArrowDownCircle
                    size={36}
                    className="text-muted-foreground/40 mx-auto mb-3"
                  />
                  <p className="font-medium text-foreground mb-1">
                    No withdrawals yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your withdrawal requests will appear here.
                  </p>
                </div>
              ) : (
                <Table data-ocid="withdrawal.table">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">
                        Method
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Phone
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium text-center">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myWithdrawals.map((w, i) => (
                      <TableRow
                        key={w.id.toString()}
                        className="border-border hover:bg-surface-1 transition-colors"
                        data-ocid={`withdrawal.row.${i + 1}`}
                      >
                        <TableCell>
                          <span className="font-semibold text-sm text-foreground capitalize">
                            {w.paymentMethod}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground font-mono">
                            {w.phoneNumber}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/20">
                            <CoinIcon size={12} />
                            <span className="text-gold text-xs font-bold">
                              {formatCoins(w.amount)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <WithdrawalStatusBadge status={w.status} />
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              Number(w.createdAt) / 1_000_000,
                            ).toLocaleDateString("en-PK", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </motion.section>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald hover:text-emerald-bright transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Withdrawal Dialog */}
      <WithdrawalDialog
        open={withdrawalOpen}
        onClose={() => setWithdrawalOpen(false)}
        balance={earnings}
        withdrawalCount={withdrawalCount}
      />
    </div>
  );
}
