
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

  showJumpBonus(points: number = 30, multiplier: number = 1): void {
    // Create floating points text with multiplier
    const bonus = document.createElement('div');
    
    // Display text with multiplier if > 1
    if (multiplier > 1) {
      bonus.innerHTML = `+${points}<br><span style="font-size: 2rem;">x${multiplier} COMBO!</span>`;
    } else {
      bonus.textContent = `+${points}`;
    }
    
    bonus.style.position = 'absolute';
    bonus.style.top = '50%';
    bonus.style.left = '50%';
    bonus.style.transform = 'translate(-50%, -50%)';
    bonus.style.fontSize = multiplier > 1 ? '4rem' : '3rem'; // Bigger for combos
    bonus.style.fontWeight = '900';
    
    // Color changes based on multiplier
    const colors = [
      '#ffff00', // 1x - yellow
      '#ffaa00', // 2x - orange
      '#ff6600', // 3x - orange-red
      '#ff3300', // 4x - red-orange
      '#ff00ff', // 5x+ - magenta
    ];
    const colorIndex = Math.min(multiplier - 1, colors.length - 1);
    const color = colors[colorIndex];
    
    bonus.style.color = color;
    bonus.style.textShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
    bonus.style.pointerEvents = 'none';
    bonus.style.zIndex = '100';
    bonus.style.animation = 'floatUp 1s ease-out forwards';
    bonus.style.fontFamily = "'Orbitron', sans-serif";
    bonus.style.textAlign = 'center';
    bonus.style.lineHeight = '1.2';
    
    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(bonus);
      setTimeout(() => {
        bonus.remove();
      }, 1000);
    }
  },

  showDoubleJumpReady(): void {
    // Create floating "DOUBLE JUMP READY!" text
    const message = document.createElement('div');
    message.innerHTML = '⚡ DOUBLE JUMP<br>UNLOCKED! ⚡';
    message.style.position = 'absolute';
    message.style.top = '35%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.fontSize = '2.5rem';
    message.style.fontWeight = '900';
    message.style.color = '#00ffff';
    message.style.textShadow = '0 0 30px #00ffff, 0 0 60px #00ffff, 0 0 90px #00ffff';
    message.style.pointerEvents = 'none';
    message.style.zIndex = '100';
    message.style.animation = 'pulse 0.5s ease-in-out';
    message.style.fontFamily = "'Orbitron', sans-serif";
    message.style.textAlign = 'center';
    message.style.lineHeight = '1.2';
    
    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(message);
      setTimeout(() => {
        message.remove();
      }, 1500);
    }
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
