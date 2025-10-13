"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ui = void 0;
const persistence_1 = require("./libs/persistence");
exports.ui = {
    private: {
        lastScore: 0,
    },
    setScore(score) {
        const scoreEl = document.getElementById('score');
        if (!scoreEl)
            return;
        scoreEl.textContent = `Score: ${score}`;
        // Always pulse on setScore for difficulty increases
        scoreEl.classList.add('score-pulse');
        setTimeout(() => {
            scoreEl.classList.remove('score-pulse');
        }, 300);
    },
    updateScore(score) {
        const scoreEl = document.getElementById('score');
        if (!scoreEl)
            return;
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
    setHighScore(highScore) {
        const highScoreEl = document.getElementById('high-score');
        if (highScoreEl)
            highScoreEl.textContent = `High Score: ${highScore}`;
    },
    showControls() {
        const controlsEl = document.getElementById('controls');
        if (controlsEl)
            controlsEl.style.display = 'block';
    },
    hideControls() {
        const controlsEl = document.getElementById('controls');
        if (controlsEl)
            controlsEl.style.display = 'none';
    },
    showGameOver() {
        const gameOverEl = document.getElementById('game-over');
        if (gameOverEl)
            gameOverEl.style.display = 'block';
    },
    hideGameOver() {
        const gameOverEl = document.getElementById('game-over');
        if (gameOverEl)
            gameOverEl.style.display = 'none';
    },
    async saveHighScore(score) {
        const currentHigh = await persistence_1.persistence.getItem('highScore');
        const parsedHigh = parseInt(currentHigh !== null && currentHigh !== void 0 ? currentHigh : '0');
        if (score > parsedHigh) {
            await persistence_1.persistence.setItem('highScore', score.toString());
            this.setHighScore(score);
        }
    },
};
