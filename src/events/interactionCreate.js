export const name = 'interactionCreate';

export async function execute(interaction) {
  if (!interaction.isChatInputCommand?.()) return;
}

export default { name, execute };
