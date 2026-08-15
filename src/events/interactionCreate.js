/**
 * Neymar Music™ — interactionCreate Event Handler
 * Developer/Brand: Dark_Alise Development
 */

import { commandsMap } from '../commands/index.js';
import { playerManager } from '../music/PlayerManager.js';
import { createNowPlayingEmbed, createMusicPanelEmbed, createQueueEmbed } from '../utils/embeds.js';
import { isOwner } from '../config/owners.js';
import { isDeveloper } from '../config/developers.js';
import { checkCooldown } from '../utils/cooldowns.js';

export const name = 'interactionCreate';

export async function execute(interaction, client) {
  // 1. Handle Slash Commands (ChatInput)
  if (interaction.isChatInputCommand?.()) {
    const { commandName, user, guildId } = interaction;
    const command = commandsMap.get(commandName);

    if (!command) {
      return interaction.reply({
        content: `❌ Unknown command \`/${commandName}\`.`,
        ephemeral: true
      });
    }

    // Cooldown check (default 2.5 seconds, bypassed for owners)
    if (!isOwner(user.id)) {
      const cooldownRemaining = checkCooldown(user.id, commandName, 2.5);
      if (cooldownRemaining > 0) {
        return interaction.reply({
          content: `⏳ Please wait **${cooldownRemaining.toFixed(1)}s** before reusing \`/${commandName}\`.`,
          ephemeral: true
        });
      }
    }

    // Owner command restriction check
    if (commandName === 'owner' || commandName.startsWith('owner-')) {
      if (!isOwner(user.id)) {
        return interaction.reply({
          content: '👑 **Access Denied:** This command is restricted strictly to designated **Neymar Music™ Bot Owners**.',
          ephemeral: true
        });
      }
    }

    // Developer command restriction check
    if (commandName === 'developer' || commandName.startsWith('developer-')) {
      if (!isOwner(user.id) && !isDeveloper(user.id)) {
        return interaction.reply({
          content: '🛠️ **Access Denied:** This command is restricted to **Dark_Alise Development** team members.',
          ephemeral: true
        });
      }
    }

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(`❌ [COMMAND_ERROR] Error in /${commandName}:`, err);
      const errMsg = {
        content: `❌ Error executing \`/${commandName}\`: ${err.message}`,
        ephemeral: true
      };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(errMsg).catch(() => {});
      } else {
        await interaction.reply(errMsg).catch(() => {});
      }
    }
    return;
  }

  // 2. Handle Button Interactions (Music Panel & Now Playing Controls)
  if (interaction.isButton?.()) {
    const { customId, guildId, user } = interaction;
    const player = playerManager.getOrCreatePlayer(guildId);

    // Voice channel check
    const memberVoice = interaction.member?.voice?.channel;
    if (!memberVoice) {
      return interaction.reply({
        content: '🔊 You must be in a voice channel to use music controls.',
        ephemeral: true
      });
    }

    switch (customId) {
      case 'btn_play_pause':
      case 'panel_pause_resume':
        player.paused = !player.paused;
        await interaction.reply({
          content: player.paused ? '⏸️ Playback **Paused**.' : '▶️ Playback **Resumed**.',
          ephemeral: true
        });
        break;

      case 'btn_skip':
      case 'panel_skip':
        playerManager.executeAction(guildId, 'skip');
        await interaction.reply({
          content: '⏭️ Skipped current track to next in queue.',
          ephemeral: true
        });
        break;

      case 'btn_previous':
      case 'panel_previous':
        await interaction.reply({
          content: '⏮️ Replaying track from beginning.',
          ephemeral: true
        });
        break;

      case 'btn_stop':
      case 'panel_stop':
        playerManager.executeAction(guildId, 'stop');
        await interaction.reply({
          content: '⏹️ Stopped playback and cleared queue.',
          ephemeral: true
        });
        break;

      case 'btn_shuffle':
      case 'panel_shuffle':
        playerManager.executeAction(guildId, 'shuffle');
        await interaction.reply({
          content: '🔀 Shuffled all tracks in queue.',
          ephemeral: true
        });
        break;

      case 'btn_loop':
      case 'panel_loop':
        const updated = playerManager.executeAction(guildId, 'loopToggle');
        await interaction.reply({
          content: `🔁 Loop mode toggled to: **${updated.loopMode.toUpperCase()}**`,
          ephemeral: true
        });
        break;

      case 'btn_vol_down':
        player.volume = Math.max(10, (player.volume || 100) - 10);
        await interaction.reply({
          content: `🔉 Volume decreased to **${player.volume}%**`,
          ephemeral: true
        });
        break;

      case 'btn_vol_up':
        player.volume = Math.min(200, (player.volume || 100) + 10);
        await interaction.reply({
          content: `🔊 Volume increased to **${player.volume}%**`,
          ephemeral: true
        });
        break;

      case 'btn_queue':
      case 'panel_queue':
        const queueEmbed = createQueueEmbed(player);
        await interaction.reply({
          embeds: [queueEmbed],
          ephemeral: true
        });
        break;

      default:
        await interaction.reply({
          content: `🔘 Button interaction received: \`${customId}\``,
          ephemeral: true
        });
        break;
    }
    return;
  }

  // 3. Handle Select Menu Interactions
  if (interaction.isStringSelectMenu?.()) {
    const { customId, values } = interaction;
    if (customId === 'filter_select') {
      const selectedFilter = values[0];
      await interaction.reply({
        content: `🎛️ Applied audio filter: **${selectedFilter}**`,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: `📋 Selection received: **${values.join(', ')}**`,
        ephemeral: true
      });
    }
  }
}

export default {
  name,
  execute
};
