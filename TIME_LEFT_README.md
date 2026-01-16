# ⏰ Time Left - Desktop Countdown App

A beautiful, minimalist desktop application that displays a countdown to July 27, 2044, with integrated Microsoft To-Do task management.

![Time Left App](https://img.shields.io/badge/Electron-App-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)

## ✨ Features

- 🎨 **Modern UI Design**: Beautiful, eye-comfortable interface with smooth animations
- 🌓 **Light/Dark Mode**: Toggle between light and dark themes with persistent preferences
- ⏱️ **Live Countdown**: Real-time countdown display showing years, months, days, hours, minutes, and seconds
- ✅ **Microsoft To-Do Integration**: View and manage your Microsoft To-Do tasks directly in the app
- 🔝 **Always on Top**: Window stays visible above other applications
- 📏 **Resizable Window**: Adjustable window size with sensible min/max limits
- 🎯 **Expandable Task Panel**: Show/hide your tasks with a smooth slide animation

## 🚀 Quick Start

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd time-left
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Microsoft To-Do (Optional)**

   - Copy `env.example` to `.env`
   - Follow the [Azure Setup Guide](AZURE_SETUP.md) to get your credentials
   - Add your Azure AD Client ID to the `.env` file

4. **Start the app**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Microsoft To-Do Setup

To enable Microsoft To-Do integration:

1. Create a `.env` file in the project root:

   ```bash
   cp env.example .env
   ```

2. Add your Azure AD credentials:

   ```env
   MS_CLIENT_ID=your-client-id-here
   MS_REDIRECT_URI=http://localhost
   MS_SCOPES=Tasks.Read,Tasks.ReadWrite,User.Read
   ```

3. See the detailed [Azure Setup Guide](AZURE_SETUP.md) for complete instructions

### Window Settings

The app window is configured with the following limits:

- **Default size**: 320px × 140px
- **Minimum size**: 280px × 120px
- **Maximum size**: 500px × 600px
- **Expanded height**: 460px (when tasks panel is open)

## 🎨 UI Themes

### Dark Mode (Default)

- Deep dark blue-black background
- Purple accent colors (#818cf8)
- Reduced eye strain for extended use

### Light Mode

- Clean white/gray background
- Purple accent colors (#6366f1)
- High contrast for bright environments

**Toggle theme**: Click the sun/moon icon in the top-right corner

## 📦 Building for Production

### Package the app

```bash
npm run package
```

This will create a distributable package for your current platform in the `release/build` directory.

### Build for specific platforms

```bash
# Windows
npm run package -- --win

# macOS
npm run package -- --mac

# Linux
npm run package -- --linux
```

## 🛠️ Development

### Project Structure

```
time-left/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Main entry point
│   │   └── preload.ts  # Preload script for IPC
│   └── renderer/       # React application
│       ├── App.tsx     # Main React component
│       ├── App.css     # Styles and themes
│       └── index.tsx   # React entry point
├── assets/             # App icons and resources
├── env.example         # Environment variables template
├── AZURE_SETUP.md     # Microsoft setup guide
└── package.json        # Dependencies and scripts
```

### Available Scripts

- `npm start` - Start development server
- `npm run package` - Build production package
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🔐 Security

- The `.env` file is automatically ignored by git
- Never commit your Azure credentials
- Access tokens expire after 1 hour for security
- All API calls use HTTPS

## 🐛 Troubleshooting

### Window not resizing

- Make sure you're using the latest version
- Try restarting the app

### Microsoft To-Do not working

- Check your `.env` file is correctly configured
- Verify Azure AD app permissions are granted
- See the [Azure Setup Guide](AZURE_SETUP.md) for details

### Tasks not showing

- Ensure you have incomplete tasks in Microsoft To-Do
- Check browser console for API errors
- Re-authenticate if token expired

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Built with [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate)
- Microsoft Graph API for To-Do integration
- [Outfit Font](https://fonts.google.com/specimen/Outfit) by Google Fonts

---

Made with ❤️ using Electron and React
