import { useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useDispatch, useSelector } from 'react-redux';
import { setPrivyAuth, setSupabaseUser, setSyncing } from '@/redux/auth/authSlice';
import { syncPrivyUserToSupabase, clearSupabaseSession } from '@/utils/supabaseAuth';

/**
 * Hook to sync Privy authentication state with Redux and Supabase
 * Monitors Privy state changes and automatically syncs user data
 */
export function useAuthSync() {
  const dispatch = useDispatch();
  const { ready, authenticated, user } = usePrivy();
  const { privyAuthenticated, privyUserId, supabaseUserId } = useSelector((state) => state.auth);
  
  // Track previous state to detect changes
  const prevAuthenticatedRef = useRef(authenticated);
  const prevUserIdRef = useRef(user?.id);
  const isSyncingRef = useRef(false);

  // Sync Privy state to Redux whenever it changes
  useEffect(() => {
    if (!ready) return;

    const hasAuthChanged = prevAuthenticatedRef.current !== authenticated;
    const hasUserChanged = prevUserIdRef.current !== user?.id;

    if (hasAuthChanged || hasUserChanged) {
      dispatch(setPrivyAuth({
        authenticated,
        user: user || null,
      }));

      prevAuthenticatedRef.current = authenticated;
      prevUserIdRef.current = user?.id;
    }
  }, [ready, authenticated, user, dispatch]);

  // Sync user data to Supabase when authenticated
  useEffect(() => {
    if (!ready || !authenticated || !user?.id) {
      // If not authenticated, ensure Supabase user is cleared
      if (supabaseUserId && !authenticated) {
        dispatch(setSupabaseUser({ supabaseUserId: null }));
      }
      return;
    }

    // Prevent duplicate syncs
    if (isSyncingRef.current) return;
    
    // Skip if already synced for this user
    if (privyUserId === user.id && supabaseUserId) {
      return;
    }

    const syncUserToSupabase = async () => {
      try {
        isSyncingRef.current = true;
        dispatch(setSyncing(true));

        const supabaseUserData = await syncPrivyUserToSupabase(user);
        
        dispatch(setSupabaseUser({
          supabaseUserId: supabaseUserData.supabaseUserId,
        }));

        console.log('User synced to Supabase:', supabaseUserData);
      } catch (error) {
        console.error('Error syncing user to Supabase:', error);
        // Don't throw - allow app to continue even if Supabase sync fails
      } finally {
        isSyncingRef.current = false;
        dispatch(setSyncing(false));
      }
    };

    syncUserToSupabase();
  }, [ready, authenticated, user, privyUserId, supabaseUserId, dispatch]);

  // Handle logout cleanup
  useEffect(() => {
    if (ready && !authenticated && prevAuthenticatedRef.current === true) {
      // User just logged out
      clearSupabaseSession().catch((error) => {
        console.error('Error clearing Supabase session:', error);
      });
    }
  }, [ready, authenticated]);

  return {
    isSyncing: useSelector((state) => state.auth.isSyncing),
    privyReady: ready,
    privyAuthenticated: authenticated,
  };
}

