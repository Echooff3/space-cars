# Space Cars - Neon Drift Simulator 🚗💫

A fast-paced, neon-styled endless runner where you dodge obstacles by jumping and switching lanes mid-air. Build massive combos with perfectly timed jumps to unlock powerful double-jump abilities and rack up high scores!

## 🎮 [Play Now!](https://echooff3.github.io/space-cars/)

**👉 [https://echooff3.github.io/space-cars/](https://echooff3.github.io/space-cars/) 👈**

---

## 🎮 How to Play

- **Tap** anywhere to jump
- **Swipe left/right** to change lanes (even mid-air!)
- **Jump over obstacles** to earn points
- **Chain multiple jumps** to build combos and unlock multipliers
- **Double jump** (unlocked after 2x combo) for extra air time and height

### Scoring System
- Base: **30 points** per obstacle cleared
- **Combo multiplier**: Each consecutive successful jump increases your multiplier (up to 10x = 300 points!)
- **Double Jump**: Unlocks every 2 obstacles cleared when you have a 2x+ combo
- **Combo timeout**: 2 seconds between jumps to maintain your streak

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm

### Clone and Run

```bash
# Clone the repository
git clone https://github.com/Echooff3/space-cars.git
cd space-cars

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173/`

### Build for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

## 🎯 Game Mechanics

### Jump System
- **Pre-jump dip**: Car dips down slightly before launching (adds weight and anticipation)
- **Dynamic hang time**: Successfully clearing obstacles extends your current jump duration
- **Increasing jump power**: Each successful jump permanently increases your base jump duration (up to 2.5x)
- **Double jump**: Tap again mid-air when unlocked for a boost (power scales with combo multiplier)

### Combo System
- Build combos by clearing obstacles consecutively
- Higher combos = more points per obstacle
- Lose your combo if you wait too long between jumps (2 second timeout)
- 2x+ combo unlocks double jump ability
- Clear 2 more obstacles to recharge double jump

### Difficulty Progression
- Game speed increases every 500 points
- Obstacle spawn rate increases with level
- More obstacles = more opportunities for combos!

## 🛠️ Tech Stack

- **Three.js**: 3D rendering and graphics
- **TypeScript**: Type-safe game logic
- **Vite**: Fast development and optimized builds
- **CSS3**: Neon styling and animations

## 📁 Project Structure

```
space-cars/
├── src/
│   ├── main.ts          # Entry point and game loop
│   ├── game.ts          # Core game logic and state
│   ├── entities.ts      # Car, Obstacle, and Background classes
│   ├── ui.ts            # Score, combo notifications, and UI
│   ├── utils.ts         # Helper functions for 3D objects
│   ├── definitions.ts   # Game constants and configuration
│   ├── libs/
│   │   └── persistence.ts  # High score storage
│   └── styles/
│       └── index.css    # UI styling and animations
├── index.html           # Main HTML file
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## 🎨 Features

- **Neon aesthetic** with glowing obstacles and dynamic colors
- **Combo visual feedback** with color-coded flashes and floating text
- **Particle effects** for successful jumps
- **Responsive controls** optimized for touch devices
- **High score persistence** using localStorage
- **Smooth animations** with easing functions for natural movement

## 📄 License

MIT

---

Made with ☕ and ✨
