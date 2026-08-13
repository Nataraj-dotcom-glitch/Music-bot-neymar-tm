export const name = 'ready';
export const once = true;

export async function execute(client) {
  console.log(`✅ ${client.user.tag} is online and ready across all shards!`);
}

export default { name, once, execute };
