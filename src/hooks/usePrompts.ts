import { useState, useEffect } from 'react';
import { PersonaType } from '../types/feedback';
import { PromptSettings, STORAGE_KEYS } from '../types/settings';

const DEFAULT_PROMPTS: PromptSettings = {
    systemPrompt: '',
    management: '',
    technical: '',
    hr: '',
    legal: '',
    junior: ''
};

export const usePrompts = () => {
    const [prompts, setPrompts] = useState<PromptSettings>(DEFAULT_PROMPTS);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        try {
            const savedPrompts = await Office.context.document.settings.get(STORAGE_KEYS.prompts);
            if (savedPrompts) {
                setPrompts(JSON.parse(savedPrompts));
            } else {
                // Load default prompts
                const loadedPrompts: PromptSettings = {
                    systemPrompt: await loadDefaultPrompt('systemPrompt'),
                    management: await loadDefaultPrompt('management'),
                    technical: await loadDefaultPrompt('technical'),
                    hr: await loadDefaultPrompt('hr'),
                    legal: await loadDefaultPrompt('legal'),
                    junior: await loadDefaultPrompt('junior')
                };
                setPrompts(loadedPrompts);
                await savePrompts(loadedPrompts);
            }
        } catch (err) {
            setError('Failed to load prompts');
            console.error('Error loading prompts:', err);
        }
    };

    const loadDefaultPrompt = async (type: string): Promise<string> => {
        try {
            return await Office.context.document.settings.get(`default_${type}_prompt`) || '';
        } catch (err) {
            console.error(`Error loading default ${type} prompt:`, err);
            return '';
        }
    };

    const savePrompts = async (newPrompts: PromptSettings) => {
        try {
            await Office.context.document.settings.set(STORAGE_KEYS.prompts, JSON.stringify(newPrompts));
            await Office.context.document.settings.saveAsync();
            setPrompts(newPrompts);
            setError('');
        } catch (err) {
            setError('Failed to save prompts');
            console.error('Error saving prompts:', err);
        }
    };

    const updatePrompt = async (type: 'systemPrompt' | PersonaType, content: string) => {
        try {
            const newPrompts = { ...prompts, [type]: content };
            await savePrompts(newPrompts);
        } catch (err) {
            setError(`Failed to update ${type} prompt`);
            console.error(`Error updating ${type} prompt:`, err);
        }
    };

    const resetPrompt = async (type: 'systemPrompt' | PersonaType) => {
        try {
            const defaultContent = await loadDefaultPrompt(type);
            await updatePrompt(type, defaultContent);
        } catch (err) {
            setError(`Failed to reset ${type} prompt`);
            console.error(`Error resetting ${type} prompt:`, err);
        }
    };

    const resetAllPrompts = async () => {
        try {
            const defaultPrompts: PromptSettings = {
                systemPrompt: await loadDefaultPrompt('systemPrompt'),
                management: await loadDefaultPrompt('management'),
                technical: await loadDefaultPrompt('technical'),
                hr: await loadDefaultPrompt('hr'),
                legal: await loadDefaultPrompt('legal'),
                junior: await loadDefaultPrompt('junior')
            };
            await savePrompts(defaultPrompts);
        } catch (err) {
            setError('Failed to reset all prompts');
            console.error('Error resetting all prompts:', err);
        }
    };

    return {
        prompts,
        updatePrompt,
        resetPrompt,
        resetAllPrompts,
        error
    };
};
