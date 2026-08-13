export class PlaylistService {
  static async createPlaylist(ownerId, name, description = '') {
    return { ownerId, name, description, tracks: [] };
  }
}

export default PlaylistService;
