/**
 * Neymar Music™ — Central Configuration Index
 * Developer/Brand: Dark_Alise Development
 */

import { isOwner, OWNERS } from './owners.js';
import { isDeveloper, DEVELOPERS } from './developers.js';

export const BOT_NAME = process.env.BOT_NAME || 'Neymar Music™';
export const DEVELOPER_NAME = process.env.DEVELOPER_NAME || 'Dark_Alise Development';
export const VERSION = '2.5.0';
export const DEFAULT_PREFIX = '/'; // Slash commands only!
export const EMBED_COLOR = '#5865F2';
export const SUCCESS_COLOR = '#57F287';
export const ERROR_COLOR = '#ED4245';
export const WARNING_COLOR = '#FEE75C';
export const FREE_REQUEST_LIMIT = parseInt(process.env.FREE_REQUEST_LIMIT || '3', 10);
export const DEFAULT_VOLUME = 100;
export const SUPPORT_SERVER = process.env.SUPPORT_SERVER || 'https://discord.gg/darkalise';
export const PREMIUM_URL = process.env.PREMIUM_URL || 'https://neymarmusic.app/premium';

export const LAVALINK = {
  host: process.env.LAVALINK_HOST || '127.0.0.1',
  port: parseInt(process.env.LAVALINK_PORT || '2333', 10),
  password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
  secure: process.env.LAVALINK_SECURE === 'true'
};

export { OWNERS, isOwner, DEVELOPERS, isDeveloper };

export default {
  BOT_NAME,
  DEVELOPER_NAME,
  VERSION,
  DEFAULT_PREFIX,
  EMBED_COLOR,
  SUCCESS_COLOR,
  ERROR_COLOR,
  WARNING_COLOR,
  FREE_REQUEST_LIMIT,
  DEFAULT_VOLUME,
  SUPPORT_SERVER,
  PREMIUM_URL,
  LAVALINK,
  OWNERS,
  isOwner,
  DEVELOPERS,
  isDeveloper
};
