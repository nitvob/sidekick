# Sidekick - AI Assistant Chrome Extension

A powerful Chrome extension that provides instant access to your personal AI assistant with configurable system prompts. Features a sleek popup chat interface that integrates directly with OpenAI's GPT-3.5-turbo API.

## ✨ Features

- 🚀 **Instant Access**: Click the extension icon for immediate AI assistance
- 🎯 **Smart System Prompts**: Pre-configured prompts for coding, creative writing, and professional tasks
- 🛠️ **Custom Prompts**: Create and manage your own specialized system prompts
- 💬 **Modern Chat Interface**: Clean, dark-themed UI with typing indicators and message copying
- 🔐 **Secure Storage**: API keys stored safely in Chrome's encrypted sync storage
- 🧹 **Privacy-First**: Chat history automatically clears when popup closes
- ⚡ **Lightweight**: Fast, responsive design with minimal resource usage
- 🔄 **Cross-Device Sync**: Settings sync across Chrome browsers when signed in

## 🏗️ Architecture

### Core Components

- **Popup Interface** (`popup.html`, `popup.js`, `popup.css`): Main chat interface
- **Options Page** (`options.html`, `options.js`): Settings management for API keys and custom prompts
- **Background Script** (`background.js`): Service worker for extension lifecycle and storage management
- **Manifest V3**: Modern Chrome extension architecture with enhanced security

### Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+), CSS3, HTML5
- **API Integration**: OpenAI GPT-3.5-turbo via REST API
- **Storage**: Chrome Storage API (sync and local)
- **Architecture**: Manifest V3 service worker model

## 🚀 Quick Start

### Prerequisites

- **Google Chrome** 88+ (or Chromium-based browser)
- **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Developer Mode** enabled in Chrome Extensions

### Installation & Setup

#### Step 1: Download the Extension

```bash
# Clone the repository
git clone <repository-url>
cd gpt-extension

# Or download and extract ZIP file
```

#### Step 2: Load in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Select the `gpt-extension` folder
6. The Sidekick icon should appear in your Chrome toolbar

#### Step 3: Configure API Key

1. Click the Sidekick extension icon
2. Click the settings gear (⚙️) button
3. In the settings page:
   - Paste your OpenAI API key in the "API Key" field
   - Click **"Save API Key"**
   - Click **"Test Connection"** to verify it works
   - ✅ You should see "Connection successful!"

#### Step 4: Start Chatting

1. Click the Sidekick icon to open the popup
2. Select a system prompt from the dropdown:
   - **Default Assistant**: General-purpose helper
   - **Coding Assistant**: Programming and debugging
   - **Creative Writer**: Stories, poetry, creative content
   - **Professional Helper**: Business communications
3. Type your message and press **Enter** or click the send button (➤)

## 🛠️ Local Development

### Development Setup

```bash
# Navigate to extension directory
cd gpt-extension

# The extension is ready to load - no build process required!
```

### Development Workflow

#### 1. Making Changes

```bash
# Edit any file (popup.js, options.js, manifest.json, etc.)
vim popup.js

# Or use your preferred editor
code .
```

#### 2. Testing Changes

1. **Reload Extension**:

   - Go to `chrome://extensions/`
   - Find "Sidekick" extension
   - Click the reload icon (🔄) or press `Ctrl+R`

2. **Test Popup Changes**:

   - Click extension icon to open popup
   - Changes to `popup.js`, `popup.html`, `popup.css` take effect immediately

3. **Test Settings Changes**:

   - Right-click extension icon → "Options"
   - Or click gear icon in popup
   - Changes to `options.js`, `options.html` take effect immediately

4. **Test Background Script Changes**:
   - Background script changes require extension reload
   - Check `chrome://extensions/` → "Inspect views" → "service worker" for logs

#### 3. Debugging

**Popup Debugging**:

```bash
# Right-click extension icon → "Inspect popup"
# Or open popup and press F12
console.log("Debug popup code here");
```

**Background Script Debugging**:

```bash
# Go to chrome://extensions/
# Click "Inspect views" → "service worker"
console.log("Debug background script");
```

**Options Page Debugging**:

```bash
# Open options page
# Press F12 for developer tools
console.log("Debug options page");
```

### File Structure

```
gpt-extension/
├── manifest.json           # Extension configuration & permissions
├── popup.html              # Main chat interface HTML
├── popup.css               # Popup styling & dark theme
├── popup.js                # Chat logic & OpenAI API integration
├── options.html            # Settings page HTML
├── options.js              # Settings management logic
├── background.js           # Service worker for lifecycle events
├── icon16.png              # 16x16 extension icon
├── icon48.png              # 48x48 extension icon
├── icon128.png             # 128x128 extension icon
├── ICONS.md                # Icon documentation
└── README.md               # This documentation
```

### Key Development Files

| File            | Purpose                            | Hot Reload         |
| --------------- | ---------------------------------- | ------------------ |
| `popup.js`      | Main chat functionality, API calls | ✅ Yes             |
| `popup.css`     | UI styling, animations             | ✅ Yes             |
| `options.js`    | Settings page logic                | ✅ Yes             |
| `background.js` | Extension lifecycle                | ❌ Requires reload |
| `manifest.json` | Extension config                   | ❌ Requires reload |

### Common Development Tasks

#### Adding New System Prompts

Edit the default prompts in `popup.js`:

```javascript
// In popup.js, line ~8
this.systemPrompts = {
  default: "You are a helpful assistant.",
  coding: "You are a coding assistant...",
  creative: "You are a creative writing assistant...",
  professional: "You are a professional assistant...",
  // Add your new prompt here
  translator: "You are a professional translator...",
};
```

#### Modifying API Parameters

Edit the OpenAI API call in `popup.js`:

```javascript
// In popup.js, callAI method, line ~200
body: JSON.stringify({
  model: "gpt-3.5-turbo-0125",  // Change model here
  messages: messages,
  max_tokens: 1000,             // Adjust response length
  temperature: 0.7,             // Adjust creativity (0-2)
}),
```

#### Styling Changes

Main CSS classes in `popup.css`:

- `.container` - Main popup container
- `.chat-messages` - Chat area styling
- `.message.user` / `.message.assistant` - Message bubbles
- `.input-section` - Input area styling

## 🔧 Configuration

### API Configuration

The extension supports the following OpenAI API configuration:

- **Model**: GPT-3.5-turbo-0125 (configurable in code)
- **Max Tokens**: 1000 (configurable in code)
- **Temperature**: 0.7 (configurable in code)
- **Timeout**: 30 seconds (browser default)

### Storage Usage

| Storage Type           | Purpose                           | Data                                          |
| ---------------------- | --------------------------------- | --------------------------------------------- |
| `chrome.storage.sync`  | Settings that sync across devices | API key, custom prompts, last selected prompt |
| `chrome.storage.local` | Temporary data                    | None currently used                           |

### Permissions

| Permission                 | Purpose                               |
| -------------------------- | ------------------------------------- |
| `storage`                  | Save API keys and settings            |
| `activeTab`                | Access current tab (unused currently) |
| `https://api.openai.com/*` | Make API calls to OpenAI              |

## 🧪 Testing

### Manual Testing Checklist

#### Basic Functionality

- [ ] Extension loads without errors
- [ ] Popup opens when clicking icon
- [ ] Settings page opens via gear icon
- [ ] API key can be saved and tested
- [ ] System prompts load correctly
- [ ] Messages send and receive responses
- [ ] Chat clears when popup closes

#### Error Handling

- [ ] Invalid API key shows error
- [ ] Network errors handled gracefully
- [ ] Empty messages don't send
- [ ] Large messages (>2000 chars) are limited

#### UI/UX

- [ ] Dark theme renders correctly
- [ ] Typing indicator appears during API calls
- [ ] Copy button works on assistant messages
- [ ] Responsive design works at different sizes
- [ ] Status indicators show correct states

#### Custom Prompts

- [ ] Can create new custom prompts
- [ ] Can modify default prompts
- [ ] Can restore default prompts
- [ ] Can delete custom prompts
- [ ] Prompts persist after browser restart

### Automated Testing

Currently no automated tests are included. Consider adding:

```javascript
// Example test structure for future implementation
describe("Sidekick Extension", () => {
  test("should load popup interface", () => {
    // Test popup loading
  });

  test("should save API key", () => {
    // Test API key storage
  });

  test("should send messages to OpenAI", () => {
    // Test API integration
  });
});
```

## 🚨 Troubleshooting

### Common Issues

**Extension Won't Load**

```bash
# Check Chrome version
chrome://version/

# Requirements: Chrome 88+, Manifest V3 support
# Solution: Update Chrome or use Chromium-based browser
```

**API Key Issues**

- ❌ **"Invalid API key format"** → Must start with `sk-`
- ❌ **"Unauthorized"** → Check API key validity at OpenAI platform
- ❌ **"Insufficient quota"** → Add billing to OpenAI account
- ❌ **"Connection failed"** → Check internet connection

**Chat Not Working**

- Clear Chrome storage: `chrome://settings/content/cookies`
- Reload extension in `chrome://extensions/`
- Check browser console for JavaScript errors
- Verify API key has sufficient credits

**Performance Issues**

- Check Chrome task manager: `Shift+Esc`
- Extension should use minimal CPU/memory
- Consider reducing `max_tokens` in API calls

### Debug Information

Get extension debug info:

```javascript
// In popup console (F12)
chrome.storage.sync.get(null, console.log); // View all settings
chrome.runtime.getManifest(); // View manifest
chrome.runtime.id; // Extension ID
```

### Log Files

Check extension logs:

1. Go to `chrome://extensions/`
2. Find Sidekick extension
3. Click "Inspect views" → "service worker"
4. Check console for background script logs

## 🔒 Security & Privacy

### Data Handling

- **API Keys**: Stored in Chrome's encrypted sync storage
- **Chat History**: Automatically cleared, never persisted
- **Custom Prompts**: Stored locally, sync across signed-in Chrome browsers
- **No Telemetry**: Extension doesn't collect usage data

### Network Communication

- **Only communicates with**: `https://api.openai.com`
- **No third-party tracking**: Extension makes no other network requests
- **HTTPS Only**: All API communication encrypted

### Permissions Audit

The extension requests minimal permissions:

- `storage`: Required for saving settings
- `activeTab`: Currently unused, can be removed
- `host_permissions`: Only for OpenAI API

## 📦 Distribution

### Chrome Web Store Preparation

```bash
# Create distribution package
zip -r sidekick-extension-v1.0.zip . \
  -x "*.git*" "*.DS_Store*" "node_modules/*" "*.md"

# Required for store submission:
# - 128x128 icon (✅ included)
# - Detailed description
# - Screenshots
# - Privacy policy
```

### Version Management

Update version in `manifest.json`:

```json
{
  "version": "1.1",
  "version_name": "1.1.0"
}
```

## 🤝 Contributing

### Development Setup

```bash
git clone <repository-url>
cd gpt-extension
# No build process required - start developing immediately!
```

### Code Style

- Use modern JavaScript (ES6+)
- Follow Chrome extension best practices
- Maintain Manifest V3 compatibility
- Keep functions focused and modular

### Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](link-to-issues)
- **Documentation**: This README
- **OpenAI API Help**: [OpenAI Documentation](https://platform.openai.com/docs)

## 🔗 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

---

**⚡ Ready to build amazing AI experiences? Start chatting with Sidekick today!**

_Note: This extension requires an OpenAI API key to function. API usage is subject to OpenAI's pricing and terms of service._
