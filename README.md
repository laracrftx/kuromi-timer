Kuromi Timer 🖤
A Kuromi-themed Pomodoro timer, built as a desktop app with Electron.

## What's here

```
kuromi-timer/
├── package.json          ← app metadata + dependencies + build config
├── src/
│   ├── main.js            ← Electron main process (window, tray, notifications)
│   ├── preload.js         ← safe bridge between main process and the UI
│   ├── index.html          ← app UI structure
│   ├── style.css           ← Kuromi visual theme
│   └── renderer.js         ← timer logic, sprite animation, settings
└── assets/
    ├── icons/              ← app icon (see assets/icons/README.md)
    └── sprites/            ← your LibreSprite mascot frames (see assets/sprites/README.md)
```

## 1. Install Node.js

You need Node.js installed (which includes `npm`). Get it from
https://nodejs.org (LTS version). Check it worked:

```
node -v
npm -v
```

## 2. Install dependencies

Open a terminal in this folder and run:

```
npm install
```

This downloads Electron itself — it's a few hundred MB the first time,
that's normal.

## 3. Run the app

```
npm start
```

A small dark window with a pink ring should open. That's your timer.


## 4. How the timer works

- Default: 25 min focus → 5 min short break, repeating, with a 15 min long
  break every 4th focus session. All of this is editable from the
  **Settings** button in the app itself — nothing to edit in code.
- Closing the window (the × button) hides it to the system tray rather than
  quitting, so the timer can keep running in the background. Right-click
  the tray icon to bring it back or quit for real.

## 5. Building an installable app (.exe / .dmg / .AppImage)

Once you're happy with it:

```
npm run dist
```

This uses `electron-builder` to produce an installer in a new `dist/`
folder — a `.exe` on Windows, `.dmg` on macOS, `.AppImage`/`.deb` on Linux
(it builds for whichever OS you run this command on). You'll need the
`.ico` / `.icns` icon files mentioned above for Windows/macOS builds to
look right.
