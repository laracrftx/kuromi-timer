# App icon

Export a square Kuromi icon from LibreSprite at a large canvas (128×128 is a
good working size, pixel art scales up cleanly) and save these files here:

| File          | Used for                                  |
|---------------|--------------------------------------------|
| `icon.png`    | Window icon, tray icon, Linux build icon   |
| `icon.ico`    | Windows build icon (multi-size .ico)       |
| `icon.icns`   | macOS build icon                           |

`icon.png` is required for the app to run at all — everything works with
just that one while you're developing; `.ico` / `.icns` are only needed
when you run `npm run dist` to build an installer.

Free converters like https://icoconvert.com or the `png2icons` npm package
can turn one PNG into both `.ico` and `.icns` if you don't have LibreSprite
export options for those formats.
