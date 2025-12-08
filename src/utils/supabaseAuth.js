import { supabase } from './supabase';

/**
 * Sync Privy user data to Supabase users table
 * @param {Object} privyUser - Privy user object
 * @returns {Promise<Object>} Supabase user data
 */
export async function syncPrivyUserToSupabase(privyUser) {
  if (!privyUser?.id) {
    throw new Error('Privy user ID is required');
  }

  try {
    // Extract user data from Privy user object
    const email = privyUser.email?.address || privyUser.linkedAccounts?.find(
      acc => acc.type === 'email'
    )?.address || null;
    
    const walletAddresses = privyUser.linkedAccounts
      ?.filter(acc => acc.type === 'wallet')
      ?.map(acc => acc.address) || [];

    const primaryWallet = walletAddresses[0] || null;

    // Prepare user data for Supabase
    const userData = {
      privy_id: privyUser.id,
      email: email,
      wallet_address: primaryWallet,
      wallet_addresses: walletAddresses,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('privy_id', privyUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error checking existing user:', fetchError);
      throw fetchError;
    }

    let result;
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          email: email,
          wallet_address: primaryWallet,
          wallet_addresses: walletAddresses,
          updated_at: new Date().toISOString(),
        })
        .eq('privy_id', privyUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user in Supabase:', error);
        throw error;
      }

      result = data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user in Supabase:', error);
        throw error;
      }

      result = data;
    }

    return {
      supabaseUserId: result.id,
      privyId: result.privy_id,
      email: result.email,
      walletAddress: result.wallet_address,
      walletAddresses: result.wallet_addresses,
    };
  } catch (error) {
    console.error('Error syncing Privy user to Supabase:', error);
    throw error;
  }
}

/**
 * Get or create Supabase user from Privy user ID
 * @param {string} privyUserId - Privy user ID
 * @returns {Promise<Object>} Supabase user data
 */
export async function getOrCreateSupabaseUser(privyUserId) {
  if (!privyUserId) {
    throw new Error('Privy user ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('privy_id', privyUserId)
      .single();

    if (error && error.code === 'PGRST116') {
      // User not found - return null, caller should create
      return null;
    }

    if (error) {
      console.error('Error fetching user from Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting Supabase user:', error);
    throw error;
  }
}

/**
 * Sync wallet addresses to Supabase
 * @param {string} privyUserId - Privy user ID
 * @param {Array<string>} walletAddresses - Array of wallet addresses
 * @returns {Promise<Object>} Updated user data
 */
export async function syncWalletAddresses(privyUserId, walletAddresses) {
  if (!privyUserId) {
    throw new Error('Privy user ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        wallet_addresses: walletAddresses || [],
        wallet_address: walletAddresses?.[0] || null,
        updated_at: new Date().toISOString(),
      })
      .eq('privy_id', privyUserId)
      .select()
      .single();

    if (error) {
      console.error('Error syncing wallet addresses:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error syncing wallet addresses to Supabase:', error);
    throw error;
  }
}

/**
 * Clear Supabase session (if using Supabase Auth)
 * Note: This app uses Privy for auth, but we may store session data
 */
export async function clearSupabaseSession() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error && error.message !== 'Not logged in') {
      console.error('Error clearing Supabase session:', error);
    }
  } catch (error) {
    // Ignore errors if Supabase Auth is not being used
    console.log('Supabase Auth not configured, skipping session clear');
  }
}

