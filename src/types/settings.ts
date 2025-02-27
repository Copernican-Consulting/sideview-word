export type ApiProvider = 'ollama' | 'openrouter';

export interface Settings {
    apiProvider: ApiProvider;
    ollamaModel: string;
    openrouterKey: string;
    openrouterModel: string;
    contextWindow: number;
    timeout: number;
    temperature: number;
    seed?: number;
}

export interface PromptSettings {
    systemPrompt: string;
    management: string;
    technical: string;
    hr: string;
    legal: string;
    junior: string;
    [key: string]: string; // Allow indexing with string
}

export const DEFAULT_SETTINGS: Settings = {
    apiProvider: 'ollama',
    ollamaModel: 'llama2',
    openrouterKey: '',
    openrouterModel: 'openai/gpt-3.5-turbo',
    contextWindow: 4096,
    timeout: 120,
    temperature: 0.75
};

export interface StorageKeys {
    settings: string;
    prompts: string;
}

export const STORAGE_KEYS: StorageKeys = {
    settings: 'sideview_word_settings',
    prompts: 'sideview_word_prompts'
};
