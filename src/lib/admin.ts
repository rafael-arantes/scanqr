import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for admin operations (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface AdminUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Verify if a user is an admin by checking their role in the database
 * @param userId - The user's ID from auth.uid()
 * @returns AdminUser object if user is admin, null otherwise
 */
export async function getAdminUser(userId: string): Promise<AdminUser | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, role')
      .eq('id', userId)
      .eq('role', 'admin')
      .single();

    if (error || !data) {
      console.error('Error checking admin status:', error);
      return null;
    }

    // Get email from auth.users
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

    return {
      id: data.id,
      email: authUser?.user?.email || '',
      role: data.role,
    } as AdminUser;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return null;
  }
}

/**
 * Simple helper to check if a user is admin
 * @param userId - The user's ID from auth.uid()
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const adminUser = await getAdminUser(userId);
  return adminUser !== null;
}

/**
 * Get all users (admin only)
 * @param userId - The requesting user's ID (must be admin)
 * @returns Array of users or null if not authorized
 */
export async function getAllUsers(userId: string) {
  // Verify admin
  if (!(await isAdmin(userId))) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name, role, subscription_tier, created_at, avatar_url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return null;
    }

    // Get emails from auth.users for each user
    const usersWithEmails = await Promise.all(
      data.map(async (user) => {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
        return {
          ...user,
          email: authUser?.user?.email || '',
        };
      })
    );

    return usersWithEmails;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return null;
  }
}

/**
 * Toggle user role between 'user' and 'admin' (admin only)
 * @param adminUserId - The requesting user's ID (must be admin)
 * @param targetUserId - The user whose role should be toggled
 * @returns Updated user or null if not authorized/failed
 */
export async function toggleUserRole(adminUserId: string, targetUserId: string) {
  // Verify admin
  if (!(await isAdmin(adminUserId))) {
    return null;
  }

  // Prevent admins from removing their own admin role
  if (adminUserId === targetUserId) {
    throw new Error('Cannot modify your own role');
  }

  try {
    // Get current role
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', targetUserId)
      .single();

    if (fetchError || !currentUser) {
      console.error('Error fetching user:', fetchError);
      return null;
    }

    // Toggle role
    const newRole = currentUser.role === 'admin' ? 'user' : 'admin';

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', targetUserId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in toggleUserRole:', error);
    return null;
  }
}
