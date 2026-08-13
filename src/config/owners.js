/**
 * Neymar Music™ — Owner Configuration
 * Developer/Brand: Dark_Alise Development
 */

export const OWNER_ID_1 = '1353995912006860871';
export const OWNER_ID_2 = process.env.OWNER_ID_2 || '';
export const OWNER_ID_3 = process.env.OWNER_ID_3 || '';

export const OWNERS = [OWNER_ID_1, OWNER_ID_2, OWNER_ID_3].filter(Boolean);

export function isOwner(userId) {
  if (!userId) return false;
  return OWNERS.includes(String(userId));
}

export default {
  OWNER_ID_1,
  OWNER_ID_2,
  OWNER_ID_3,
  OWNERS,
  isOwner
};
