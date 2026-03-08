# EarnHub

## Current State
- Task-based earning platform with Admin and User roles
- Users can complete tasks to earn coins
- Admin can create, edit, delete tasks and view all users
- Login via Internet Identity
- Profile setup on first login
- Coin balance tracked per user

## Requested Changes (Diff)

### Add
- **Login Bonus**: When a user creates their profile (first-ever login/signup), they automatically receive 50 coins as a welcome bonus
- **Withdrawal System**: Users can submit a withdrawal request with:
  - Their phone number (Easypaisa or JazzCash)
  - Payment method selection (Easypaisa / JazzCash)
  - Amount to withdraw
- **Withdrawal Limits by count**:
  - 1st withdrawal: minimum 200 PKR
  - 2nd withdrawal: minimum 200 PKR
  - 3rd+ withdrawals: minimum 500 PKR
- **Withdrawal Status Tracking**: Each request has status: Pending, Approved, Rejected
- **Balance Deduction**: When a user submits a withdrawal, the amount is deducted from their balance immediately (held in escrow)
- **Bounce/Reject Logic**: If admin rejects a withdrawal, the amount is returned to the user's balance
- **Admin Withdrawal Management**: Admin can view all pending withdrawal requests and approve or reject each one, with user name, phone number, amount, and payment method shown
- **User Withdrawal History**: User can see their past withdrawal requests and statuses

### Modify
- `saveCallerUserProfile`: When creating a new profile (not updating), grant 50 coins login bonus automatically
- `UserProfile` type: add `withdrawalCount` field to track how many withdrawals user has made
- `AdminStats`: add `totalWithdrawalRequests` and `pendingWithdrawalRequests` counts
- `UserDashboard` page: add a "Withdraw" button and withdrawal history section
- `AdminDashboard` page: add a "Withdrawals" tab/section for managing requests

### Remove
- Nothing removed

## Implementation Plan
1. **Backend (main.mo)**:
   - Add `WithdrawalRequest` type with fields: id, user principal, userName, amount, phoneNumber, paymentMethod (Easypaisa/JazzCash), status (Pending/Approved/Rejected), createdAt
   - Add `withdrawalRequests` map and `nextWithdrawalId` counter
   - Update `UserProfile` to include `withdrawalCount: Nat`
   - Update `saveCallerUserProfile`: if new user (profile not existing), add 50 coins bonus
   - Add `submitWithdrawal(amount, phoneNumber, paymentMethod)`: validates minimum based on withdrawalCount, deducts from balance, creates request
   - Add `approveWithdrawal(id)`: admin only, sets status to Approved
   - Add `rejectWithdrawal(id)`: admin only, sets status to Rejected, refunds balance
   - Add `getMyWithdrawals()`: user query to get their withdrawal history
   - Add `getAllWithdrawals()`: admin query to get all withdrawal requests
   - Update `AdminStats` to include withdrawal counts

2. **Frontend**:
   - `UserDashboard`: add "Withdraw" button near balance display, withdrawal form dialog (amount, phone, payment method), withdrawal history list
   - `AdminDashboard`: add "Withdrawals" section/tab showing pending requests with approve/reject buttons
   - Update profile setup to show a "50 coins welcome bonus" message after signup
