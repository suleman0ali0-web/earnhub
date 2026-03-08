import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminStats,
  PaymentMethod,
  Task,
  UserDashboard,
  UserProfile,
  UserRole,
  UserWithEarnings,
  WithdrawalRequestDto,
} from "../backend.d";
import { useActor } from "./useActor";

// ── User queries ──────────────────────────────────────────────────────────────

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserDashboard() {
  const { actor, isFetching } = useActor();
  return useQuery<UserDashboard>({
    queryKey: ["userDashboard"],
    queryFn: async () => {
      if (!actor)
        return { availableTasks: [], completedTasks: [], earnings: BigInt(0) };
      return actor.getUserDashboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      void queryClient.invalidateQueries({ queryKey: ["userRole"] });
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.completeTask(taskId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userDashboard"] });
    },
  });
}

// ── Admin queries ─────────────────────────────────────────────────────────────

export function useAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async (): Promise<AdminStats> => {
      if (!actor)
        return {
          totalTasks: BigInt(0),
          totalUsers: BigInt(0),
          totalEarningsDistributed: BigInt(0),
          pendingWithdrawalRequests: BigInt(0),
          totalWithdrawalRequests: BigInt(0),
        };
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["allTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasksWithCompletions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserWithEarnings[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsersWithEarnings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      reward,
    }: {
      title: string;
      description: string;
      reward: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTask(title, description, reward);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      void queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      title,
      description,
      reward,
    }: {
      taskId: bigint;
      title: string;
      description: string;
      reward: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateTask(taskId, title, description, reward);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteTask(taskId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      void queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

// ── Withdrawal queries ────────────────────────────────────────────────────────

export function useMyWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery<WithdrawalRequestDto[]>({
    queryKey: ["myWithdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyWithdrawals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery<WithdrawalRequestDto[]>({
    queryKey: ["allWithdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWithdrawals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      phoneNumber,
      paymentMethod,
    }: {
      amount: bigint;
      phoneNumber: string;
      paymentMethod: PaymentMethod;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitWithdrawal(amount, phoneNumber, paymentMethod);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myWithdrawals"] });
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      void queryClient.invalidateQueries({ queryKey: ["userDashboard"] });
    },
  });
}

export function useApproveWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (withdrawalId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.approveWithdrawal(withdrawalId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allWithdrawals"] });
      void queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useRejectWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (withdrawalId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.rejectWithdrawal(withdrawalId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allWithdrawals"] });
      void queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}
