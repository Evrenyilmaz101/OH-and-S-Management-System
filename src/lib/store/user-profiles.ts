import { getAll, getById, getFiltered, insertRow, updateRow } from './core';
import type { UserProfile } from '@/lib/types';

const TABLE = 'user_profiles';

export async function getUserProfiles(): Promise<UserProfile[]> { return getAll<UserProfile>(TABLE); }
export async function getUserProfile(id: string): Promise<UserProfile | undefined> { return getById<UserProfile>(TABLE, id); }

export async function getUserProfileByAuthId(authUserId: string): Promise<UserProfile | undefined> {
  const results = await getFiltered<UserProfile>(TABLE, 'auth_user_id', authUserId);
  return results[0];
}

export async function addUserProfile(p: Partial<UserProfile>): Promise<UserProfile | null> { return insertRow<UserProfile>(TABLE, p as UserProfile); }
export async function updateUserProfile(p: UserProfile): Promise<UserProfile | null> { return updateRow<UserProfile>(TABLE, p.id, p); }
