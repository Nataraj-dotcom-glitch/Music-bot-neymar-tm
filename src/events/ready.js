/**
 * Neymar Music™ — ready Event Handler
 * Developer/Brand: Dark_Alise Development
 */

import { BOT_NAME, DEVELOPER_NAME, VERSION, OWNERS } from '../config/index.js';

export const name = 'ready';
export const once = true;

export async function execute(client) {
  console.log(`🤖 ${BOT_NAME} v${VERSION} Gateway Connected!`);
  console.log(`📡 Logged in as ${client.user.tag} (ID: ${client.user.id})`);
  console.log(`👑 Fixed Primary Owner: 1353995912006860871`);
  console.log(`🛠️ Brand: ${DEVELOPER_NAME}`);
}

export default { name, once, execute };
