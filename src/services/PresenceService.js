export class PresenceService {
  constructor() {
    this.mode = 'dnd';
    this.type = 'playing';
    this.message = '🎵 /play | Neymar Music™';
    this.rotationEnabled = true;
    this.rotationList = [
      '🎵 /play | Neymar Music™',
      '👀 100+ Slash Commands',
      '🎧 Premium Music Quality',
      '🏆 Developed by Dark_Alise Development'
    ];
  }

  setPresence(mode, type, text) {
    this.mode = mode || this.mode;
    this.type = type || this.type;
    this.message = text || this.message;
  }
}

export const presenceService = new PresenceService();
export default presenceService;
