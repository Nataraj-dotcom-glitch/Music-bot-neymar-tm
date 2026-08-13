/**
 * Neymar Music™ — Developer Configuration
 * Developer/Brand: Dark_Alise Development
 */

export const DEVELOPER_ID_1 = process.env.DEVELOPER_ID_1 || '';
export const DEVELOPER_ID_2 = process.env.DEVELOPER_ID_2 || '';
export const DEVELOPER_ID_3 = process.env.DEVELOPER_ID_3 || '';

export const DEVELOPERS = [DEVELOPER_ID_1, DEVELOPER_ID_2, DEVELOPER_ID_3].filter(Boolean);

export function isDeveloper(userId) {
  if (!userId) return false;
  return DEVELOPERS.includes(String(userId));
}

export default {
  DEVELOPER_ID_1,
  DEVELOPER_ID_2,
  DEVELOPER_ID_3,
  DEVELOPERS,
  isDeveloper
};
