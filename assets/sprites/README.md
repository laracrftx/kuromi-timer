# Kuromi sprites — LibreSprite spec

Drop your exported PNGs directly into this folder using these **exact filenames**.
The app checks for them on launch; anything missing just falls back to a
CSS-drawn placeholder mascot, so you can build these one at a time.

| Filename              | When it's shown                          |
|-----------------------|-------------------------------------------|
| `kuromi-idle.png`     | Timer paused / not started                |
| `kuromi-focus.png`    | Focus session running                     |
| `kuromi-break.png`    | Short or long break running               |
| `kuromi-alert.png`    | Brief flash (~1.4s) when a session ends   |

## Format

- **Canvas size in LibreSprite:** 32 × 32 px per frame
- **Sheet layout:** horizontal strip, 4 frames, so the exported PNG is
  **128 × 32 px** total (4 frames side by side, left to right).
- **Export as:** PNG, no trimming/padding between frames (File → Export
  Sprite Sheet → Horizontal Strip, frame size 32×32).
- Keep the background transparent.
- Frames animate in order 0→1→2→3→loop at ~220ms per frame — a simple
  2-frame idle "breathe" repeated, or a 4-frame bounce/blink, both read fine
  at that speed.

## Suggested poses

- **idle** — standing, slow blink or ear twitch
- **focus** — a bit more mischievous/determined, maybe arms crossed
- **break** — relaxed, lying down or stretching
- **alert** — surprised/jumping, mouth open (this one only needs to look good
  for its first frame or two since it only shows briefly)

## App icon

There's also `assets/icons/` for the window/taskbar/tray icon — see the
README there for sizes.
