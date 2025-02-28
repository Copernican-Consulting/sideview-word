import { Settings, PromptSettings } from '../../types/settings';
import { FeedbackResponse } from '../../types/feedback';

export class AIService {
    private static instance: AIService;
    private settings: Settings;

    private constructor() {
        // Initialize with default settings
        this.settings = {
            apiProvider: 'ollama',
            ollamaModel: 'llama2',
            openrouterKey: '',
            openrouterModel: 'openai/gpt-3.5-turbo',
            contextWindow: 4096,
            timeout: 120,
            temperature: 0.75
        };
    }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    public updateSettings(settings: Settings): void {
        this.settings = { ...settings };
    }

    private async callOllama(text: string, prompts: PromptSettings, personaType: string): Promise<FeedbackResponse> {
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.settings.ollamaModel,
                    prompt: `${prompts.systemPrompt}\n\n${prompts[personaType]}\n\nUser: ${text}\n\nAssistant:`,
                    stream: false,
                    temperature: this.settings.temperature,
                    seed: this.settings.seed
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Ollama API error: ${error}`);
            }

            const ollamaResponse = await response.json();
            
            // Check if the response contains an error
            if (ollamaResponse.error) {
                throw new Error(`Ollama API error: ${JSON.stringify(ollamaResponse)}`);
            }

            // Validate that we have a response property
            if (!ollamaResponse.response) {
                throw new Error('Invalid response from Ollama API');
            }

            try {
                return JSON.parse(ollamaResponse.response);
            } catch (parseError) {
                throw new Error('Failed to parse Ollama response as JSON');
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('model') && error.message.includes('not found')) {
                throw new Error(`Model '${this.settings.ollamaModel}' not found. Please make sure Ollama is running and the model is installed.`);
            }
            throw error;
        }
    }

    private async callOpenRouter(text: string, prompts: PromptSettings, personaType: string): Promise<FeedbackResponse> {
        if (!this.settings.openrouterKey) {
            throw new Error('OpenRouter API key is required');
        }

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.openrouterKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Sideview.Word'
                },
                body: JSON.stringify({
                    model: this.settings.openrouterModel,
                    messages: [
                        { role: "system", content: prompts.systemPrompt },
                        { role: "system", content: prompts[personaType] },
                        { role: "user", content: text }
                    ],
                    temperature: this.settings.temperature,
                    max_tokens: this.settings.contextWindow
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'OpenRouter API error');
            }

            const openRouterResponse = await response.json();
            
            if (!openRouterResponse.choices?.[0]?.message?.content) {
                throw new Error('Invalid response from OpenRouter API');
            }

            try {
                return JSON.parse(openRouterResponse.choices[0].message.content);
            } catch (parseError) {
                throw new Error('Failed to parse OpenRouter response as JSON');
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('API key')) {
                throw new Error('Invalid or missing OpenRouter API key. Please check your settings.');
            }
            throw error;
        }
    }

    public async processFeedback(text: string, prompts: PromptSettings, personaType: string): Promise<FeedbackResponse> {
        try {
            if (this.settings.apiProvider === 'ollama') {
                return await this.callOllama(text, prompts, personaType);
            } else {
                return await this.callOpenRouter(text, prompts, personaType);
            }
        } catch (error) {
            console.error('Error processing feedback:', error);
            throw error;
        }
    }
}
