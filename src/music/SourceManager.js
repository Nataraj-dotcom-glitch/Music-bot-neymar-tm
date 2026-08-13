export class SourceManager {
  static detectSource(url) {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    if (url.includes('apple.com')) return 'apple';
    if (url.includes('deezer.com')) return 'deezer';
    return 'youtube';
  }
}

export default SourceManager;
