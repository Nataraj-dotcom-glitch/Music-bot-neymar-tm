export const name = 'guildDelete';

export async function execute(guild) {
  console.log(`📤 Left guild: ${guild.name} (${guild.id})`);
}

export default { name, execute };
