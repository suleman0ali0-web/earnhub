import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  // Task/TaskDto types
  type Task = {
    id : Nat;
    title : Text;
    description : Text;
    reward : Nat;
    createdAt : Time.Time;
    completedCount : Nat;
  };

  type TaskDto = {
    title : Text;
    id : Nat;
    description : Text;
    reward : Nat;
    createdAt : Time.Time;
    completedCount : Nat;
  };

  // Withdrawal request
  type WithdrawalId = Nat;
  type Balance = Nat;

  type WithdrawalStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type PaymentMethod = {
    #easypaisa;
    #jazzcash;
  };

  type WithdrawalRequest = {
    id : WithdrawalId;
    user : Principal;
    userName : Text;
    amount : Balance;
    phoneNumber : Text;
    paymentMethod : PaymentMethod;
    status : WithdrawalStatus;
    createdAt : Time.Time;
  };

  // Extended Profile with withdrawal count
  type UserProfile = {
    name : Text;
    earnings : Nat;
    withdrawalCount : Nat;
  };

  // New migrated actor state
  type NewActor = {
    withdrawalRequests : Map.Map<Nat, WithdrawalRequest>;
    nextTaskId : Nat;
    nextWithdrawalId : Nat;
    tasks : Map.Map<Nat, Task>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userCompletedTasks : Map.Map<Principal, Set.Set<Nat>>;
  };

  // Old profile
  type OldUserProfile = {
    name : Text;
    earnings : Nat;
  };

  // Old actor state
  type OldActor = {
    nextTaskId : Nat;
    tasks : Map.Map<Nat, Task>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    userCompletedTasks : Map.Map<Principal, Set.Set<Nat>>;
  };

  // Migration function called by the main actor via `with migration = Migration.run`.
  public func run(old : OldActor) : NewActor {
    let newProfiles = old.userProfiles.map<Principal, OldUserProfile, UserProfile>(
      func(_principal, oldProfile) {
        {
          name = oldProfile.name;
          earnings = oldProfile.earnings;
          withdrawalCount = 0;
        };
      }
    );

    {
      withdrawalRequests = Map.empty<Nat, WithdrawalRequest>();
      nextWithdrawalId = 0;
      nextTaskId = old.nextTaskId;
      tasks = old.tasks;
      userProfiles = newProfiles;
      userCompletedTasks = old.userCompletedTasks;
    };
  };
};
