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

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sideview-word.git
   cd sideview-word
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate development certificates:
   ```bash
   npm run dev-certs
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Sideload the add-in in Word:
   - Windows: [Sideload Office Add-ins on Windows](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins)
   - Mac: [Sideload Office Add-ins on Mac](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-an-office-add-in-on-mac)

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

## Building for Production

1. Update the production URL in `webpack.config.js`:
   ```javascript
   const urlProd = "https://your-production-domain.com/";
   ```

2. Build the production package:
   ```bash
   npm run build
   ```

The production files will be available in the `dist` directory.

## Deployment

### Office Store Deployment
1. Follow the [Office Store validation guidelines](https://learn.microsoft.com/en-us/office/dev/store/validation-policies)
2. Package your add-in:
   ```bash
   npm run build
   ```
3. Submit through the [Partner Center](https://partner.microsoft.com/dashboard/office/overview)

### Enterprise Deployment
For enterprise deployment, follow Microsoft's [enterprise deployment guide](https://learn.microsoft.com/en-us/office/dev/add-ins/publish/enterprise-deployment).

## Development Commands

- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Run code linting
- `npm run validate` - Validate the manifest file

## Project Structure

```
sideview-word/
├── assets/              # Icons and images
├── src/
│   ├── components/     # React components
│   ├── services/       # API and Word services
│   ├── types/         # TypeScript type definitions
│   ├── taskpane.html  # Main HTML template
│   └── taskpane.tsx   # Main entry point
├── manifest.xml        # Add-in manifest
└── webpack.config.js   # Build configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC License - See LICENSE file for details
