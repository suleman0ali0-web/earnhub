import { CoinIcon, formatCoins } from "@/components/CoinIcon";
import { Header } from "@/components/Header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminStats,
  useAllTasks,
  useAllUsers,
  useAllWithdrawals,
  useApproveWithdrawal,
  useCreateTask,
  useDeleteTask,
  useRejectWithdrawal,
  useUpdateTask,
} from "@/hooks/useQueries";
import {
  ArrowDownCircle,
  CheckCircle2,
  Clock,
  Coins,
  ListTodo,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { WithdrawalStatus } from "../backend.d";
import type { AdminStats, Task, WithdrawalRequestDto } from "../backend.d";

interface TaskFormData {
  title: string;
  description: string;
  reward: string;
}

interface AdminDashboardProps {
  userName: string;
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

function WithdrawalActions({
  withdrawal,
}: { withdrawal: WithdrawalRequestDto }) {
  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();

  const handleApprove = async () => {
    try {
      await approveWithdrawal.mutateAsync(withdrawal.id);
      toast.success(`Withdrawal approved for ${withdrawal.userName}`);
    } catch {
      toast.error("Failed to approve withdrawal");
    }
  };

  const handleReject = async () => {
    try {
      await rejectWithdrawal.mutateAsync(withdrawal.id);
      toast.success(`Withdrawal rejected for ${withdrawal.userName}`);
    } catch {
      toast.error("Failed to reject withdrawal");
    }
  };

  if (withdrawal.status !== WithdrawalStatus.pending) {
    return <WithdrawalStatusBadge status={withdrawal.status} />;
  }

  return (
    <div className="flex items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            className="h-8 px-3 bg-emerald/15 text-emerald border border-emerald/30 hover:bg-emerald hover:text-primary-foreground font-semibold text-xs transition-all"
            disabled={approveWithdrawal.isPending}
            data-ocid="withdrawal.confirm_button"
          >
            {approveWithdrawal.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={12} className="mr-1" />
                Approve
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent
          className="bg-card border-border"
          data-ocid="withdrawal.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold">
              Approve Withdrawal?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Approve withdrawal of{" "}
              <span className="font-bold text-gold">
                {formatCoins(withdrawal.amount)} PKR
              </span>{" "}
              for{" "}
              <span className="font-semibold text-foreground">
                {withdrawal.userName}
              </span>{" "}
              via <span className="capitalize">{withdrawal.paymentMethod}</span>{" "}
              ({withdrawal.phoneNumber})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border hover:bg-surface-2"
              data-ocid="withdrawal.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald text-primary-foreground hover:bg-emerald/90"
              onClick={handleApprove}
              data-ocid="withdrawal.confirm_button"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border font-semibold text-xs"
            disabled={rejectWithdrawal.isPending}
            data-ocid="withdrawal.delete_button"
          >
            {rejectWithdrawal.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <>
                <XCircle size={12} className="mr-1" />
                Reject
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent
          className="bg-card border-border"
          data-ocid="withdrawal.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold">
              Reject Withdrawal?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Reject withdrawal of{" "}
              <span className="font-bold text-gold">
                {formatCoins(withdrawal.amount)} PKR
              </span>{" "}
              for{" "}
              <span className="font-semibold text-foreground">
                {withdrawal.userName}
              </span>
              ? The amount will be returned to their balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border hover:bg-surface-2"
              data-ocid="withdrawal.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleReject}
              data-ocid="withdrawal.confirm_button"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TaskFormDialog({
  open,
  onClose,
  editTask,
}: {
  open: boolean;
  onClose: () => void;
  editTask?: Task | null;
}) {
  const [form, setForm] = useState<TaskFormData>({
    title: editTask?.title ?? "",
    description: editTask?.description ?? "",
    reward: editTask ? editTask.reward.toString() : "",
  });

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isPending = createTask.isPending || updateTask.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reward = BigInt(Math.max(0, Number.parseInt(form.reward, 10) || 0));

    try {
      if (editTask) {
        await updateTask.mutateAsync({
          taskId: editTask.id,
          title: form.title.trim(),
          description: form.description.trim(),
          reward,
        });
        toast.success("Task updated successfully");
      } else {
        await createTask.mutateAsync({
          title: form.title.trim(),
          description: form.description.trim(),
          reward,
        });
        toast.success("Task created successfully");
      }
      onClose();
    } catch {
      toast.error(
        `Failed to ${editTask ? "update" : "create"} task. Please try again.`,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border sm:max-w-lg"
        data-ocid="task.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-xl">
            {editTask ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-sm font-medium">
              Task Title
            </Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g. Write a product review"
              className="bg-surface-2 border-border focus:border-emerald/60"
              required
              data-ocid="task.input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="task-desc"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe the task in detail…"
              className="bg-surface-2 border-border focus:border-emerald/60 min-h-[100px] resize-none"
              required
              data-ocid="task.textarea"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-reward" className="text-sm font-medium">
              Reward (coins)
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <CoinIcon size={16} />
              </div>
              <Input
                id="task-reward"
                type="number"
                min="1"
                value={form.reward}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reward: e.target.value }))
                }
                placeholder="100"
                className="pl-9 bg-surface-2 border-border focus:border-emerald/60"
                required
                data-ocid="task.select"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border hover:bg-surface-2"
              data-ocid="task.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !form.title.trim() ||
                !form.description.trim() ||
                !form.reward ||
                isPending
              }
              className="gradient-emerald text-primary-foreground font-semibold shadow-emerald hover:opacity-90"
              data-ocid="task.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editTask ? "Updating…" : "Creating…"}
                </>
              ) : editTask ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminDashboard({ userName }: AdminDashboardProps) {
  const { data: statsRaw, isLoading: statsLoading } = useAdminStats();
  const stats = statsRaw as AdminStats | undefined;
  const { data: tasks = [], isLoading: tasksLoading } = useAllTasks();
  const { data: users = [], isLoading: usersLoading } = useAllUsers();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } =
    useAllWithdrawals();
  const deleteTask = useDeleteTask();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleCloseForm = () => {
    setTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleDelete = async (taskId: bigint) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: stats?.totalUsers ?? BigInt(0),
      color: "emerald",
      format: (v: bigint) => v.toString(),
    },
    {
      icon: ListTodo,
      label: "Total Tasks",
      value: stats?.totalTasks ?? BigInt(0),
      color: "gold",
      format: (v: bigint) => v.toString(),
    },
    {
      icon: Coins,
      label: "Coins Distributed",
      value: stats?.totalEarningsDistributed ?? BigInt(0),
      color: "gold",
      format: formatCoins,
    },
    {
      icon: Clock,
      label: "Pending Withdrawals",
      value: stats?.pendingWithdrawalRequests ?? BigInt(0),
      color: "amber",
      format: (v: bigint) => v.toString(),
    },
    {
      icon: ArrowDownCircle,
      label: "Total Withdrawals",
      value: stats?.totalWithdrawalRequests ?? BigInt(0),
      color: "emerald",
      format: (v: bigint) => v.toString(),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userName={userName} isAdmin />

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
              Admin Dashboard
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Manage tasks, users, withdrawals, and monitor platform
              performance.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {statCards.map(({ icon: Icon, label, value, color, format }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className="relative overflow-hidden bg-card border border-border rounded-xl p-5"
              >
                <div
                  className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl pointer-events-none ${
                    color === "emerald"
                      ? "bg-emerald/10"
                      : color === "amber"
                        ? "bg-gold/10"
                        : "bg-gold/10"
                  }`}
                />
                <Icon
                  size={18}
                  className={`mb-2 ${
                    color === "emerald"
                      ? "text-emerald"
                      : color === "amber"
                        ? "text-gold"
                        : "text-gold"
                  }`}
                />
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 leading-tight">
                  {label}
                </p>
                {statsLoading ? (
                  <Skeleton
                    className="h-8 w-16 bg-surface-3"
                    data-ocid="admin.loading_state"
                  />
                ) : (
                  <p
                    className={`font-display font-black text-2xl ${
                      color === "emerald"
                        ? "text-emerald"
                        : color === "amber"
                          ? "text-gold"
                          : "text-gold"
                    }`}
                  >
                    {format(value)}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Task Management */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  Task Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage earning tasks for users.
                </p>
              </div>
              <Button
                className="gradient-emerald text-primary-foreground font-semibold shadow-emerald hover:opacity-90 gap-2"
                onClick={() => setTaskFormOpen(true)}
                data-ocid="task.open_modal_button"
              >
                <Plus size={16} />
                Add Task
              </Button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {tasksLoading ? (
                <div
                  className="p-6 space-y-3"
                  data-ocid="admin.task.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-surface-3" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-16" data-ocid="task.empty_state">
                  <ListTodo
                    size={40}
                    className="text-muted-foreground/40 mx-auto mb-3"
                  />
                  <p className="font-medium text-foreground mb-1">
                    No tasks yet
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first task to get users earning.
                  </p>
                  <Button
                    className="gradient-emerald text-primary-foreground font-semibold shadow-emerald hover:opacity-90 gap-2"
                    onClick={() => setTaskFormOpen(true)}
                    data-ocid="task.primary_button"
                  >
                    <Plus size={16} />
                    Create First Task
                  </Button>
                </div>
              ) : (
                <Table data-ocid="task.table">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">
                        Task
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium text-center">
                        Reward
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium text-center">
                        Completions
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task, i) => (
                      <TableRow
                        key={task.id.toString()}
                        className="border-border hover:bg-surface-1 transition-colors"
                        data-ocid={`task.row.${i + 1}`}
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {task.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/20">
                            <CoinIcon size={12} />
                            <span className="text-gold text-xs font-bold">
                              {formatCoins(task.reward)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className="bg-emerald/10 text-emerald border-emerald/20"
                          >
                            <CheckCircle2 size={10} className="mr-1" />
                            {Number(task.completedCount)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-surface-2"
                              onClick={() => handleEdit(task)}
                              data-ocid={`task.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  data-ocid={`task.delete_button.${i + 1}`}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent
                                className="bg-card border-border"
                                data-ocid="task.dialog"
                              >
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-display font-bold">
                                    Delete Task?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold text-foreground">
                                      "{task.title}"
                                    </span>
                                    ? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    className="border-border hover:bg-surface-2"
                                    data-ocid="task.cancel_button"
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDelete(task.id)}
                                    data-ocid="task.confirm_button"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </motion.section>

          {/* Users section */}
          <motion.section variants={itemVariants}>
            <div className="mb-5">
              <h3 className="font-display font-bold text-lg text-foreground">
                Users & Earnings
              </h3>
              <p className="text-sm text-muted-foreground">
                All registered users and their coin balances.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {usersLoading ? (
                <div
                  className="p-6 space-y-3"
                  data-ocid="admin.users.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-surface-3" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div
                  className="text-center py-16"
                  data-ocid="users.empty_state"
                >
                  <Users
                    size={40}
                    className="text-muted-foreground/40 mx-auto mb-3"
                  />
                  <p className="font-medium text-foreground mb-1">
                    No users yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Users will appear here after they sign up.
                  </p>
                </div>
              ) : (
                <Table data-ocid="users.table">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">
                        User
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Principal
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">
                        Earnings
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, i) => {
                      const initials = user.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);
                      const shortPrincipal = `${user.principal.toString().slice(0, 12)}…`;
                      return (
                        <TableRow
                          key={user.principal.toString()}
                          className="border-border hover:bg-surface-1 transition-colors"
                          data-ocid={`users.row.${i + 1}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald/15 border border-emerald/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-emerald">
                                  {initials}
                                </span>
                              </div>
                              <span className="font-semibold text-foreground text-sm">
                                {user.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground font-mono">
                              {shortPrincipal}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/20">
                              <CoinIcon size={12} />
                              <span className="text-gold text-xs font-bold">
                                {formatCoins(user.earnings)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </motion.section>

          {/* Withdrawals section */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-5">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Wallet size={18} className="text-emerald" />
                  Withdrawal Requests
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review and process user withdrawal requests.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {withdrawalsLoading ? (
                <div
                  className="p-6 space-y-3"
                  data-ocid="admin.withdrawal.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-surface-3" />
                  ))}
                </div>
              ) : withdrawals.length === 0 ? (
                <div
                  className="text-center py-16"
                  data-ocid="withdrawal.empty_state"
                >
                  <ArrowDownCircle
                    size={40}
                    className="text-muted-foreground/40 mx-auto mb-3"
                  />
                  <p className="font-medium text-foreground mb-1">
                    No withdrawal requests yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Withdrawal requests from users will appear here.
                  </p>
                </div>
              ) : (
                <Table data-ocid="withdrawal.table">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">
                        User
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Phone
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Method
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
                      <TableHead className="text-muted-foreground font-medium text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w, i) => (
                      <TableRow
                        key={w.id.toString()}
                        className="border-border hover:bg-surface-1 transition-colors"
                        data-ocid={`withdrawal.row.${i + 1}`}
                      >
                        <TableCell>
                          <span className="font-semibold text-foreground text-sm">
                            {w.userName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground font-mono">
                            {w.phoneNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-foreground capitalize">
                            {w.paymentMethod}
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
                        <TableCell className="text-right">
                          <WithdrawalActions withdrawal={w} />
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

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={taskFormOpen}
        onClose={handleCloseForm}
        editTask={editingTask}
      />

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
    </div>
  );
}
