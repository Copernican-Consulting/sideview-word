# Sideview.Word

AI-powered document feedback and analysis for Microsoft Word. This add-in provides multi-persona feedback on your documents using AI, with each persona providing comments and suggestions directly in Word's review system.

## Features

- Multiple AI personas providing feedback (Management, Technical, HR, Legal, Junior)
- Direct integration with Word's commenting system
- Support for both Ollama and OpenRouter AI providers
- Configurable settings for AI parameters
- Summary section with feedback scores
- Easy-to-use taskpane interface

## Prerequisites

- [Node.js](https://nodejs.org) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Microsoft Word 2016 or later
- For local AI: [Ollama](https://ollama.ai/) running locally
- For cloud AI: An [OpenRouter](https://openrouter.ai/) API key

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sideview-word.git
   cd sideview-word
   ```

2. Run the setup script:
   ```bash
   npm run setup
   ```

3. Start the add-in:
   ```bash
   # For desktop Word
   npm run start:desktop
   
   # For Word Online
   npm run start:web
   ```

## Manual Development Setup

If you prefer to set up the development environment manually:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate development certificates:
   ```bash
   npm run dev-certs
   ```

3. Build the project:
   ```bash
   npm run build:dev
   ```

4. Start the development server:
   ```bash
   npm run start
   ```

## Configuration

### AI Provider Setup

#### Ollama (Local)
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull your preferred model:
   ```bash
   ollama pull llama2
   ```
3. Start Ollama and ensure it's running on `localhost:11434`

#### OpenRouter (Cloud)
1. Create an account at [OpenRouter](https://openrouter.ai)
2. Generate an API key
3. Enter the API key in the add-in's settings panel

## Development Commands

- `npm run setup` - Run the development setup script
- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run code linting
- `npm run lint:fix` - Fix linting issues
- `npm run validate` - Validate the manifest file
- `npm run clean` - Clean build artifacts and dependencies
- `npm run clean:all` - Clean everything including dev certificates

## Project Structure

```
sideview-word/
├── assets/              # Icons and images
├── scripts/            # Development and build scripts
├── src/
│   ├── components/     # React components
│   │   ├── Error/     # Error handling components
│   │   ├── Loading/   # Loading indicators
│   │   ├── Settings/  # Settings panel
│   │   ├── Summary/   # Feedback summary
│   │   └── TaskPane/  # Main taskpane
│   ├── hooks/         # React hooks
│   ├── services/      # API and Word services
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── taskpane.html  # Main HTML template
│   └── taskpane.tsx   # Main entry point
├── manifest.xml        # Add-in manifest
└── webpack.config.js   # Build configuration
```

## Troubleshooting

### Common Issues

1. **Certificate Errors**
   - Run `npm run dev-certs:clean` followed by `npm run dev-certs`
   - Restart your browser/Word

2. **Build Errors**
   - Run `npm run clean`
   - Delete node_modules and run `npm install`

3. **Add-in Not Loading**
   - Check the manifest.xml is properly sideloaded
   - Verify the development server is running
   - Check browser console for errors

### Development Tips

- Use `npm run watch` for automatic rebuilds during development
- Check the browser console and Word add-in debugging tools for errors
- Use the settings panel to switch between Ollama and OpenRouter
- Test with different document types and lengths

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details
