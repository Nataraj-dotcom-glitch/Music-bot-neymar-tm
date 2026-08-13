import { isOwner } from '../config/owners.js';
import { isDeveloper } from '../config/developers.js';

export function checkPermission(userId, requiredLevel) {
  if (isOwner(userId)) return true;
  if (requiredLevel === 'developer' && isDeveloper(userId)) return true;
  if (requiredLevel === 'user') return true;
  return false;
}

export default { checkPermission };
