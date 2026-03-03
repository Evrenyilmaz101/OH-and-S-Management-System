"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile, Workshop } from "@/lib/types";
import { getUserProfileByAuthId, getUserProfiles, addUserProfile } from "@/lib/store/user-profiles";
import { getWorkshops } from "@/lib/store/workshops";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  workshops: Workshop[];
  selectedWorkshopId: string | null;
  setSelectedWorkshopId: (id: string | null) => void;
}

import { createContext, useContext } from "react";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  userProfile: null,
  isAdmin: false,
  workshops: [],
  selectedWorkshopId: null,
  setSelectedWorkshopId: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshopId, setSelectedWorkshopIdState] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = userProfile?.is_admin ?? false;

  function setSelectedWorkshopId(id: string | null) {
    setSelectedWorkshopIdState(id);
    if (isAdmin) {
      if (id) {
        localStorage.setItem("selectedWorkshopId", id);
      } else {
        localStorage.removeItem("selectedWorkshopId");
      }
    }
  }

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);

      if (user) {
        // Load workshops + user profile in parallel
        const [allWorkshops, profile] = await Promise.all([
          getWorkshops(),
          getUserProfileByAuthId(user.id),
        ]);
        setWorkshops(allWorkshops.filter((w) => w.active));

        if (profile) {
          setUserProfile(profile);
          if (profile.is_admin) {
            const saved = localStorage.getItem("selectedWorkshopId");
            setSelectedWorkshopIdState(saved || null);
          } else {
            setSelectedWorkshopIdState(profile.workshop_id || null);
          }
        } else {
          // Auto-create profile — first user becomes admin
          const existingProfiles = await getUserProfiles();
          const newProfile = await addUserProfile({
            auth_user_id: user.id,
            is_admin: existingProfiles.length === 0,
            display_name: user.email || "",
          });
          if (newProfile) {
            setUserProfile(newProfile);
            if (!newProfile.is_admin) {
              setSelectedWorkshopIdState(newProfile.workshop_id || null);
            }
          }
        }
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setUserProfile(null);
        setWorkshops([]);
        setSelectedWorkshopIdState(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const contextValue: AuthContextValue = {
    user,
    loading,
    userProfile,
    isAdmin,
    workshops,
    selectedWorkshopId,
    setSelectedWorkshopId,
  };

  // On login page or leave approval, don't enforce auth
  if (pathname === "/login" || pathname === "/auth/callback" || pathname?.startsWith("/leave/approve")) {
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  // On authenticated pages, show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Client-side auth guard — redirect to login if not authenticated
  if (!user) {
    router.replace("/login");
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
