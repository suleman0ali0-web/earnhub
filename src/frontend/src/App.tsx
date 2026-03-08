import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingScreen } from "./components/LoadingScreen";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUserProfile, useUserRole } from "./hooks/useQueries";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LoginPage } from "./pages/LoginPage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { UserDashboard } from "./pages/UserDashboard";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isLoggedIn = !!identity;

  const { data: profile, isLoading: profileLoading } = useUserProfile();

  const { data: role, isLoading: roleLoading } = useUserRole();

  // Show loading while auth is initializing
  if (isInitializing) {
    return (
      <>
        <LoadingScreen />
        <Toaster />
      </>
    );
  }

  // Not logged in → show login
  if (!isLoggedIn) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  // Logged in but loading profile/role
  if (profileLoading || roleLoading) {
    return (
      <>
        <LoadingScreen />
        <Toaster />
      </>
    );
  }

  // No profile yet → show setup
  if (!profile) {
    return (
      <>
        <ProfileSetupPage
          onComplete={() => {
            void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            void queryClient.invalidateQueries({ queryKey: ["userRole"] });
          }}
        />
        <Toaster />
      </>
    );
  }

  // Admin role
  if (role === "admin") {
    return (
      <>
        <AdminDashboard userName={profile.name} />
        <Toaster />
      </>
    );
  }

  // User role (default)
  return (
    <>
      <UserDashboard userName={profile.name} />
      <Toaster />
    </>
  );
}
