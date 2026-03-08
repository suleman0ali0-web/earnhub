import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Include authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Core types
  type TaskId = Nat;
  type WithdrawalId = Nat;
  type Balance = Nat;

  public type UserProfile = {
    name : Text;
    earnings : Balance;
    withdrawalCount : Nat;
  };

  public type Task = {
    id : TaskId;
    title : Text;
    description : Text;
    reward : Balance;
    createdAt : Time.Time;
    completedCount : Nat;
  };

  public type TaskDto = {
    id : TaskId;
    title : Text;
    description : Text;
    reward : Balance;
    createdAt : Time.Time;
    completedCount : Nat;
  };

  public type UserDashboard = {
    earnings : Balance;
    completedTasks : [TaskDto];
    availableTasks : [TaskDto];
  };

  public type WithdrawalStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type PaymentMethod = {
    #easypaisa;
    #jazzcash;
  };

  public type WithdrawalRequest = {
    id : WithdrawalId;
    user : Principal;
    userName : Text;
    amount : Balance;
    phoneNumber : Text;
    paymentMethod : PaymentMethod;
    status : WithdrawalStatus;
    createdAt : Time.Time;
  };

  public type WithdrawalRequestDto = {
    id : WithdrawalId;
    user : Principal;
    userName : Text;
    amount : Balance;
    phoneNumber : Text;
    paymentMethod : PaymentMethod;
    status : WithdrawalStatus;
    createdAt : Time.Time;
  };

  public type UserWithEarnings = {
    principal : Principal;
    name : Text;
    earnings : Balance;
  };

  public type AdminStats = {
    totalUsers : Nat;
    totalTasks : Nat;
    totalEarningsDistributed : Balance;
    totalWithdrawalRequests : Nat;
    pendingWithdrawalRequests : Nat;
  };

  module TaskDto {
    public func compare(task1 : TaskDto, task2 : TaskDto) : Order.Order {
      Nat.compare(task1.id, task2.id);
    };
  };

  // State
  var nextTaskId = 0;
  var nextWithdrawalId = 0;

  let tasks = Map.empty<TaskId, Task>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userCompletedTasks = Map.empty<Principal, Set.Set<TaskId>>();
  let withdrawalRequests = Map.empty<WithdrawalId, WithdrawalRequest>();

  // Task management (admin only)
  public shared ({ caller }) func createTask(title : Text, description : Text, reward : Balance) : async TaskId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create tasks");
    };

    let taskId = nextTaskId;
    nextTaskId += 1;

    let task : Task = {
      id = taskId;
      title;
      description;
      reward;
      createdAt = Time.now();
      completedCount = 0;
    };

    tasks.add(taskId, task);
    taskId;
  };

  public shared ({ caller }) func updateTask(taskId : TaskId, title : Text, description : Text, reward : Balance) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update tasks");
    };

    let existingTask = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    let updatedTask : Task = {
      id = taskId;
      title;
      description;
      reward;
      createdAt = existingTask.createdAt;
      completedCount = existingTask.completedCount;
    };

    tasks.add(taskId, updatedTask);
  };

  public shared ({ caller }) func deleteTask(taskId : TaskId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete tasks");
    };

    tasks.remove(taskId);
  };

  // Task completion (user)
  public shared ({ caller }) func completeTask(taskId : TaskId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete tasks");
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let completedTasks = switch (userCompletedTasks.get(caller)) {
      case (null) { Set.empty<TaskId>() };
      case (?tasks) { tasks };
    };

    if (completedTasks.contains(taskId)) {
      Runtime.trap("Task already completed");
    };

    completedTasks.add(taskId);
    userCompletedTasks.add(caller, completedTasks);

    // Update user earnings
    let updatedProfile : UserProfile = {
      name = profile.name;
      earnings = profile.earnings + task.reward;
      withdrawalCount = profile.withdrawalCount;
    };
    userProfiles.add(caller, updatedProfile);

    // Update task completion count
    let updatedTask : Task = {
      id = task.id;
      title = task.title;
      description = task.description;
      reward = task.reward;
      createdAt = task.createdAt;
      completedCount = task.completedCount + 1;
    };
    tasks.add(taskId, updatedTask);
  };

  // User queries (require user permission)
  public query ({ caller }) func getCurrentEarnings() : async Balance {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access earnings");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
    profile.earnings;
  };

  public query ({ caller }) func getAvailableTasks() : async [TaskDto] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view available tasks");
    };

    let completedTasks = switch (userCompletedTasks.get(caller)) {
      case (null) { Set.empty<TaskId>() };
      case (?tasks) { tasks };
    };

    let availableTasks = tasks.values().toArray().filter(
      func(task) {
        not completedTasks.contains(task.id);
      }
    );
    availableTasks.map(toTaskDto).sort();
  };

  func toTaskDto(task : Task) : TaskDto {
    {
      title = task.title;
      id = task.id;
      description = task.description;
      reward = task.reward;
      createdAt = task.createdAt;
      completedCount = task.completedCount;
    };
  };

  public query ({ caller }) func getCompletedTasks() : async [TaskDto] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view completed tasks");
    };

    let completedTasks = switch (userCompletedTasks.get(caller)) {
      case (null) { Set.empty<TaskId>() };
      case (?tasks) { tasks };
    };

    let completedTaskIds = completedTasks.toArray();
    completedTaskIds.map(
      func(taskId) {
        switch (tasks.get(taskId)) {
          case (null) { Runtime.trap("Task not found") };
          case (?task) {
            toTaskDto(task);
          };
        };
      }
    );
  };

  public query ({ caller }) func getUserDashboard() : async UserDashboard {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access dashboard");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let completedTasksSet = switch (userCompletedTasks.get(caller)) {
      case (null) { Set.empty<TaskId>() };
      case (?tasks) { tasks };
    };

    let completedTaskIds = completedTasksSet.toArray();
    let completedTasksList = completedTaskIds.map(
      func(taskId) {
        switch (tasks.get(taskId)) {
          case (null) { Runtime.trap("Task not found") };
          case (?task) { toTaskDto(task) };
        };
      }
    );

    let availableTasksList = tasks.values().toArray().filter(
      func(task) {
        not completedTasksSet.contains(task.id);
      }
    ).map(toTaskDto);

    let sortedAvailableTasks = availableTasksList.sort();

    {
      earnings = profile.earnings;
      completedTasks = completedTasksList;
      availableTasks = sortedAvailableTasks;
    };
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    tasks.values().toArray();
  };

  public query ({ caller }) func getTask(taskId : TaskId) : async TaskDto {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { toTaskDto(task) };
    };
  };

  // Admin queries
  public query ({ caller }) func getAdminStats() : async AdminStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access platform stats");
    };

    let totalUsers = userProfiles.size();
    let totalTasks = tasks.size();
    var totalEarnings : Balance = 0;

    for (profile in userProfiles.values()) {
      totalEarnings += profile.earnings;
    };

    let totalWithdrawalRequests = withdrawalRequests.size();

    let pendingWithdrawalRequests = withdrawalRequests.values().toArray().filter(
      func(request) {
        switch (request.status) {
          case (#pending) { true };
          case (_) { false };
        };
      }
    ).size();

    {
      totalUsers;
      totalTasks;
      totalEarningsDistributed = totalEarnings;
      totalWithdrawalRequests;
      pendingWithdrawalRequests;
    };
  };

  public query ({ caller }) func getAllUsersWithEarnings() : async [UserWithEarnings] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    let users = userProfiles.entries().toArray().map(
      func((principal, profile)) {
        {
          principal;
          name = profile.name;
          earnings = profile.earnings;
        };
      }
    );
    users;
  };

  public query ({ caller }) func getAllTasksWithCompletions() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all tasks with completions");
    };

    tasks.values().toArray();
  };

  // Withdrawals system
  public shared ({ caller }) func submitWithdrawal(amount : Balance, phoneNumber : Text, paymentMethod : PaymentMethod) : async WithdrawalId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit withdrawals");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    if (amount > profile.earnings) {
      Runtime.trap("Insufficient balance");
    };

    let requiredMin = if (profile.withdrawalCount < 2) { 200 } else { 500 };

    if (amount < requiredMin) {
      Runtime.trap("Minimum withdrawal amount is " # requiredMin.toText());
    };

    let withdrawalId = nextWithdrawalId;
    nextWithdrawalId += 1;

    let request : WithdrawalRequest = {
      id = withdrawalId;
      user = caller;
      userName = profile.name;
      amount;
      phoneNumber;
      paymentMethod;
      status = #pending;
      createdAt = Time.now();
    };

    // Deduct balance
    let updatedProfile : UserProfile = {
      name = profile.name;
      earnings = profile.earnings - amount;
      withdrawalCount = profile.withdrawalCount;
    };
    userProfiles.add(caller, updatedProfile);

    // Save request
    withdrawalRequests.add(withdrawalId, request);

    withdrawalId;
  };

  public shared ({ caller }) func approveWithdrawal(withdrawalId : WithdrawalId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawals");
    };

    let request = switch (withdrawalRequests.get(withdrawalId)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?request) { request };
    };

    if (request.status != #pending) {
      Runtime.trap("Withdrawal request already processed");
    };

    let updatedRequest : WithdrawalRequest = {
      id = request.id;
      user = request.user;
      userName = request.userName;
      amount = request.amount;
      phoneNumber = request.phoneNumber;
      paymentMethod = request.paymentMethod;
      status = #approved;
      createdAt = request.createdAt;
    };

    withdrawalRequests.add(withdrawalId, updatedRequest);

    // Update user's withdrawal count
    switch (userProfiles.get(request.user)) {
      case (null) { () };
      case (?profile) {
        let updatedProfile : UserProfile = {
          name = profile.name;
          earnings = profile.earnings;
          withdrawalCount = profile.withdrawalCount + 1;
        };
        userProfiles.add(request.user, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func rejectWithdrawal(withdrawalId : WithdrawalId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject withdrawals");
    };

    let request = switch (withdrawalRequests.get(withdrawalId)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?request) { request };
    };

    if (request.status != #pending) {
      Runtime.trap("Withdrawal request already processed");
    };

    let updatedRequest : WithdrawalRequest = {
      id = request.id;
      user = request.user;
      userName = request.userName;
      amount = request.amount;
      phoneNumber = request.phoneNumber;
      paymentMethod = request.paymentMethod;
      status = #rejected;
      createdAt = request.createdAt;
    };

    withdrawalRequests.add(withdrawalId, updatedRequest);

    // Refund balance
    switch (userProfiles.get(request.user)) {
      case (null) { () };
      case (?profile) {
        let updatedProfile : UserProfile = {
          name = profile.name;
          earnings = profile.earnings + request.amount;
          withdrawalCount = profile.withdrawalCount;
        };
        userProfiles.add(request.user, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getMyWithdrawals() : async [WithdrawalRequestDto] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view withdrawals");
    };

    let filteredRequests = withdrawalRequests.values().toArray().filter(
      func(request) {
        request.user == caller;
      }
    );

    filteredRequests.map(toWithdrawalRequestDto);
  };

  func toWithdrawalRequestDto(request : WithdrawalRequest) : WithdrawalRequestDto {
    {
      id = request.id;
      user = request.user;
      userName = request.userName;
      amount = request.amount;
      phoneNumber = request.phoneNumber;
      paymentMethod = request.paymentMethod;
      status = request.status;
      createdAt = request.createdAt;
    };
  };

  public query ({ caller }) func getAllWithdrawals() : async [WithdrawalRequestDto] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all withdrawals");
    };

    withdrawalRequests.values().toArray().map(toWithdrawalRequestDto);
  };

  // Profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access user profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Check if user is new
    switch (userProfiles.get(caller)) {
      case (null) {
        // New user, add 50 coins bonus and initialize with provided name
        let newProfile : UserProfile = {
          name = profile.name;
          earnings = 50;
          withdrawalCount = 0;
        };
        userProfiles.add(caller, newProfile);
      };
      case (?existingProfile) {
        // Existing user: only allow updating name, preserve earnings and withdrawalCount
        let updatedProfile : UserProfile = {
          name = profile.name;
          earnings = existingProfile.earnings;
          withdrawalCount = existingProfile.withdrawalCount;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };
};
