/**
 * Neymar Music™ — voiceStateUpdate Event Handler
 * Developer/Brand: Dark_Alise Development
 */

import { playerManager } from '../music/PlayerManager.js';
import { voiceManager } from '../music/VoiceManager.js';

export const name = 'voiceStateUpdate';

const leaveTimeouts = new Map();

export async function execute(oldState, newState, client) {
  const guildId = oldState.guild.id || newState.guild.id;
  const botId = client.user?.id;

  if (!botId) return;

  const botVoiceState = oldState.guild.members.me?.voice;
  if (!botVoiceState || !botVoiceState.channelId) {
    if (leaveTimeouts.has(guildId)) {
      clearTimeout(leaveTimeouts.get(guildId));
      leaveTimeouts.delete(guildId);
    }
    return;
  }

  const channel = botVoiceState.channel;
  const player = playerManager.getOrCreatePlayer(guildId);

  // Check 24/7 mode
  if (player?.twentyFourSeven || player?.mode247) {
    return;
  }

  // Count non-bot members in voice channel
  const humanMembers = channel.members.filter(m => !m.user.bot);

  if (humanMembers.size === 0) {
    if (!leaveTimeouts.has(guildId)) {
      const timeout = setTimeout(async () => {
        const currentBotVoice = oldState.guild.members.me?.voice;
        if (currentBotVoice?.channel) {
          const currentHumans = currentBotVoice.channel.members.filter(m => !m.user.bot);
          if (currentHumans.size === 0) {
            await playerManager.executeAction(guildId, 'stop');
            voiceManager.leaveVoice(guildId);
            currentBotVoice.disconnect().catch(() => {});
            console.log(`👋 [AUTO_LEAVE] Disconnected from empty voice channel in guild ${guildId}`);
          }
        }
        leaveTimeouts.delete(guildId);
      }, 30000); // 30 seconds auto-leave countdown

      leaveTimeouts.set(guildId, timeout);
    }
  } else {
    // If members rejoined, cancel leave timeout
    if (leaveTimeouts.has(guildId)) {
      clearTimeout(leaveTimeouts.get(guildId));
      leaveTimeouts.delete(guildId);
    }
  }
}

export default {
  name,
  execute
};
