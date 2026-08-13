const cooldowns = new Map();

export function checkCooldown(userId, commandName, timeInSeconds = 3) {
  const key = `${userId}-${commandName}`;
  if (cooldowns.has(key)) {
    const expirationTime = cooldowns.get(key);
    if (Date.now() < expirationTime) {
      return (expirationTime - Date.now()) / 1000;
    }
  }
  cooldowns.set(key, Date.now() + timeInSeconds * 1000);
  return 0;
}

export default { checkCooldown };
