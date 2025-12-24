# Getting Started with Voltronussy 🚀

Welcome! This guide will get you from zero to running your first game in about 5 minutes.

## Prerequisites

You'll need these installed on your computer:

### 1. Node.js (v20 or higher)

**Windows:**
```powershell
# Using winget (built into Windows 11)
winget install OpenJS.NodeJS.LTS

# Or download from: https://nodejs.org/
```

**Mac:**
```bash
# Using Homebrew
brew install node@20
```

**Linux:**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

Verify it's installed:
```bash
node --version  # Should show v20.x.x or higher
```

### 2. pnpm (our package manager)

```bash
# Works on all platforms
npm install -g pnpm
```

Verify:
```bash
pnpm --version  # Should show 9.x.x or higher
```

### 3. Git

**Windows:**
```powershell
winget install Git.Git
```

**Mac:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt install git  # Debian/Ubuntu
sudo dnf install git  # Fedora
```

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/kylebjordahl/voltronussy.git
cd voltronussy
```

---

## Step 2: Install Dependencies

```bash
cd typescript
pnpm install
```

This downloads all the engine packages. Takes about a minute.

---

## Step 3: Run an Example Game

```bash
pnpm game example-web
```

This opens a browser with a playable demo! Use arrow keys or WASD to move.

Try the headless example too:
```bash
pnpm game example-headless
```

---

## Step 4: Create Your Own Game

### Copy the template

```bash
# From the typescript/ folder
cp -r games/_template games/my-game
```

On Windows PowerShell:
```powershell
Copy-Item -Recurse games/_template games/my-game
```

### Edit your game info

Open `games/my-game/game.json` and update it:

```json
{
  "id": "my-game",
  "name": "My Awesome Game",
  "version": "0.1.0",
  "engineApiVersion": "0.1",
  "author": "your-github-username",
  "description": "A game about...",
  "adapter": "adapter-webcanvas",
  "plugins": []
}
```

### Write your game code

Open `games/my-game/src/index.ts` — the template has comments explaining everything!

The basic pattern is:

```typescript
// 1. Define components (data)
class Position {
  constructor(public x = 0, public y = 0) {}
}

class Health {
  constructor(public current = 100, public max = 100) {}
}

// 2. Define systems (logic)
const MovementSystem: System = {
  name: 'Movement',
  fixedUpdate(world, dt) {
    // Your logic here
  }
};

// 3. Register systems
scheduler.addSystem(MovementSystem);

// 4. Spawn entities
const player = world.spawn();
world.addComponent(player, Position, new Position(100, 100));
world.addComponent(player, Health, new Health(100, 100));
```

### Run your game

```bash
pnpm game my-game
```

---

## Step 5: Submit Your Game

When you're ready to share:

```bash
# Go to repo root
cd ..

# Create a branch
git checkout -b my-game

# Stage only your game folder
git add typescript/games/my-game

# Commit
git commit -m "game: add my-game"

# Push
git push origin my-game
```

Then open a Pull Request on GitHub!

---

## Common Issues

### "pnpm: command not found"

Make sure you installed pnpm globally:
```bash
npm install -g pnpm
```

Then restart your terminal.

### "node: command not found"

Node.js isn't installed or isn't in your PATH. Reinstall Node.js and restart your terminal.

### Game doesn't start

Make sure you're in the `typescript/` folder when running `pnpm game`.

### Port already in use

Another process is using the port. Either:
- Close the other process
- Or wait a few seconds and try again

### TypeScript errors

Run `pnpm build` to see all errors. The error messages tell you which file and line to fix.

---

## Project Structure (Quick Reference)

```
voltronussy/
├── typescript/                 # ← You work here
│   ├── games/
│   │   ├── _template/         # Copy this to make a new game
│   │   ├── example-web/       # Browser demo
│   │   └── example-headless/  # Terminal demo
│   ├── plugins/
│   │   └── _template/         # Copy this to make a shared plugin
│   └── packages/              # Engine internals (don't touch)
├── python/                    # Experimental Python track
├── docs/                      # Contribution guides
└── GETTING_STARTED.md         # You are here!
```

---

## Next Steps

1. **Read the template code** — `games/_template/src/index.ts` has lots of comments
2. **Check example-web** — See how a complete game is structured
3. **Read CONTRIBUTING.md** — Learn the PR process
4. **Ask for help** — Open a Discussion on GitHub if you're stuck

---

## Quick Commands Reference

| Command | What it does |
|---------|--------------|
| `pnpm install` | Install all dependencies |
| `pnpm game <name>` | Run a game |
| `pnpm test` | Run all tests |
| `pnpm build` | Build everything |
| `pnpm lint` | Check code style |

---

Happy coding! 🎮

