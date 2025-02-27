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
        this.settings = settings;
    }

    private async callOllama(text: string, prompts: PromptSettings, personaType: string): Promise<FeedbackResponse> {
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
        return JSON.parse(ollamaResponse.response);
    }

    private async callOpenRouter(text: string, prompts: PromptSettings, personaType: string): Promise<FeedbackResponse> {
        if (!this.settings.openrouterKey) {
            throw new Error('OpenRouter API key is required');
        }

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

        const openRouterResponse = await response.json();
        if (!response.ok) {
            throw new Error(openRouterResponse.error?.message || 'OpenRouter API error');
        }

        return JSON.parse(openRouterResponse.choices[0].message.content);
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
