# Extension Icons

The Chrome extension requires the following icon files to be added:

## Required Icons

- `icon16.png` - 16x16 pixels (for the extension toolbar)
- `icon48.png` - 48x48 pixels (for the extension management page)
- `icon128.png` - 128x128 pixels (for the Chrome Web Store)

## Icon Requirements

- **Format**: PNG format
- **Background**: Transparent or solid color
- **Design**: Simple, recognizable design that represents ChatGPT/AI
- **Colors**: Should work well in both light and dark themes

## Suggested Design

- A simple chat bubble icon with "AI" or "GPT" text
- A robot or brain icon
- A minimalist design with ChatGPT's signature green/blue colors

## How to Add Icons

1. Create or download the icon files in the required sizes
2. Save them as `icon16.png`, `icon48.png`, and `icon128.png` in the extension root directory
3. The manifest.json file is already configured to use these icons

## Temporary Solution

If you want to test the extension without custom icons, you can:

1. Use any 16x16, 48x48, and 128x128 PNG files
2. Rename them to match the required names
3. Place them in the extension directory

The extension will work without icons, but Chrome will show a default placeholder icon.
