/**
 * Neymar Music™ — Main Discord Bot Entrypoint
 * Developer/Brand: Dark_Alise Development
 */

import { BOT_NAME, DEVELOPER_NAME } from './config/index.js';

let dummyClient = {
  user: {
    id: '1234567890123456789',
    tag: 'Neymar Music™#0001',
    username: 'Neymar Music™'
  }
};

export function startBot() {
  console.log(`🤖 Starting ${BOT_NAME} engine by ${DEVELOPER_NAME}...`);
  return dummyClient;
}

export function getClient() {
  return dummyClient;
}

export default {
  startBot,
  getClient
};
