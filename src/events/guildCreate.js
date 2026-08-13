export const name = 'guildCreate';

export async function execute(guild) {
  console.log(`📥 Joined guild: ${guild.name} (${guild.id})`);
}

export default { name, execute };
