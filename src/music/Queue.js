export class Queue {
  constructor() {
    this.tracks = [];
  }

  add(track) {
    this.tracks.push(track);
  }

  clear() {
    this.tracks = [];
  }

  shuffle() {
    this.tracks.sort(() => Math.random() - 0.5);
  }
}

export default Queue;
