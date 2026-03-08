import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type Balance = bigint;
export interface Task {
    id: TaskId;
    reward: Balance;
    title: string;
    createdAt: Time;
    description: string;
    completedCount: bigint;
}
export type WithdrawalId = bigint;
export interface UserWithEarnings {
    principal: Principal;
    name: string;
    earnings: Balance;
}
export interface TaskDto {
    id: TaskId;
    reward: Balance;
    title: string;
    createdAt: Time;
    description: string;
    completedCount: bigint;
}
export interface AdminStats {
    totalTasks: bigint;
    pendingWithdrawalRequests: bigint;
    totalWithdrawalRequests: bigint;
    totalEarningsDistributed: Balance;
    totalUsers: bigint;
}
export type TaskId = bigint;
export interface UserDashboard {
    availableTasks: Array<TaskDto>;
    completedTasks: Array<TaskDto>;
    earnings: Balance;
}
export interface UserProfile {
    name: string;
    earnings: Balance;
    withdrawalCount: bigint;
}
export interface WithdrawalRequestDto {
    id: WithdrawalId;
    status: WithdrawalStatus;
    userName: string;
    paymentMethod: PaymentMethod;
    createdAt: Time;
    user: Principal;
    phoneNumber: string;
    amount: Balance;
}
export enum PaymentMethod {
    easypaisa = "easypaisa",
    jazzcash = "jazzcash"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WithdrawalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    approveWithdrawal(withdrawalId: WithdrawalId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeTask(taskId: TaskId): Promise<void>;
    createTask(title: string, description: string, reward: Balance): Promise<TaskId>;
    deleteTask(taskId: TaskId): Promise<void>;
    getAdminStats(): Promise<AdminStats>;
    getAllTasks(): Promise<Array<Task>>;
    getAllTasksWithCompletions(): Promise<Array<Task>>;
    getAllUsersWithEarnings(): Promise<Array<UserWithEarnings>>;
    getAllWithdrawals(): Promise<Array<WithdrawalRequestDto>>;
    getAvailableTasks(): Promise<Array<TaskDto>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompletedTasks(): Promise<Array<TaskDto>>;
    getCurrentEarnings(): Promise<Balance>;
    getMyWithdrawals(): Promise<Array<WithdrawalRequestDto>>;
    getTask(taskId: TaskId): Promise<TaskDto>;
    getUserDashboard(): Promise<UserDashboard>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectWithdrawal(withdrawalId: WithdrawalId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitWithdrawal(amount: Balance, phoneNumber: string, paymentMethod: PaymentMethod): Promise<WithdrawalId>;
    updateTask(taskId: TaskId, title: string, description: string, reward: Balance): Promise<void>;
}
