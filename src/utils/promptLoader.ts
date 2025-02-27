import { PromptSettings } from '../types/settings';

/**
 * Load default prompts from the original project's files and save them to Word settings
 */
export async function loadAndSaveDefaultPrompts(): Promise<void> {
    try {
        // Load default prompts from original project
        const systemPrompt = await loadPromptFile('systemPrompt');
        const management = await loadPromptFile('management');
        const technical = await loadPromptFile('technical');
        const hr = await loadPromptFile('hr');
        const legal = await loadPromptFile('legal');
        const junior = await loadPromptFile('junior');

        // Create default prompts object
        const defaultPrompts: PromptSettings = {
            systemPrompt,
            management,
            technical,
            hr,
            legal,
            junior
        };

        // Save each prompt as a default in Word settings
        await Office.context.document.settings.set('default_systemPrompt_prompt', systemPrompt);
        await Office.context.document.settings.set('default_management_prompt', management);
        await Office.context.document.settings.set('default_technical_prompt', technical);
        await Office.context.document.settings.set('default_hr_prompt', hr);
        await Office.context.document.settings.set('default_legal_prompt', legal);
        await Office.context.document.settings.set('default_junior_prompt', junior);

        // Save settings
        await Office.context.document.settings.saveAsync();
    } catch (error) {
        console.error('Error loading default prompts:', error);
        throw error;
    }
}

/**
 * Load a prompt file from the original project
 */
async function loadPromptFile(type: string): Promise<string> {
    try {
        const response = await fetch(`/Prompts/Defaults/${type}.txt`);
        if (!response.ok) {
            throw new Error(`Failed to load ${type} prompt`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error loading ${type} prompt:`, error);
        throw error;
    }
}

/**
 * Initialize default prompts when the add-in starts
 */
export async function initializeDefaultPrompts(): Promise<void> {
    try {
        // Check if default prompts are already loaded
        const hasDefaults = await Office.context.document.settings.get('default_systemPrompt_prompt');
        if (!hasDefaults) {
            await loadAndSaveDefaultPrompts();
        }
    } catch (error) {
        console.error('Error initializing default prompts:', error);
        throw error;
    }
}
