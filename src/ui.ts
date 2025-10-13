
import { persistence } from './libs/persistence';

export const ui = {
  private: {
    lastScore: 0,
  },

  setScore(score: number): void {
    const scoreEl = document.getElementById('score');
    if (!scoreEl) return;

    scoreEl.textContent = `Score: ${score}`;

    // Always pulse on setScore for difficulty increases
    scoreEl.classList.add('score-pulse');
    setTimeout(() => {
      scoreEl.classList.remove('score-pulse');
    }, 300);
  },

  updateScore(score: number): void {
    const scoreEl = document.getElementById('score');
    if (!scoreEl) return;

    const wasHigher = score > this.private.lastScore;
    this.private.lastScore = score;
    scoreEl.textContent = `Score: ${score}`;

    if (wasHigher) {
      // Apply pulse effect for score increase
      scoreEl.classList.add('score-pulse');
      setTimeout(() => {
        scoreEl.classList.remove('score-pulse');
      }, 300); // Match CSS transition duration
    }
  },

  setHighScore(highScore: number): void {
    const highScoreEl = document.getElementById('high-score');
    if (highScoreEl) highScoreEl.textContent = `High Score: ${highScore}`;
  },

  showControls(): void {
    const controlsEl = document.getElementById('controls');
    if (controlsEl) controlsEl.style.display = 'block';
  },

  hideControls(): void {
    const controlsEl = document.getElementById('controls');
    if (controlsEl) controlsEl.style.display = 'none';
  },

  showGameOver(): void {
    const gameOverEl = document.getElementById('game-over');
    if (gameOverEl) gameOverEl.style.display = 'block';
  },

  hideGameOver(): void {
    const gameOverEl = document.getElementById('game-over');
    if (gameOverEl) gameOverEl.style.display = 'none';
  },

  async saveHighScore(score: number): Promise<void> {
    const currentHigh = await persistence.getItem('highScore');
    const parsedHigh = parseInt(currentHigh ?? '0');
    if (score > parsedHigh) {
      await persistence.setItem('highScore', score.toString());
      this.setHighScore(score);
    }
  },
};
