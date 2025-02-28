import * as React from 'react';
import { FeedbackResponse, PersonaType } from '../types/feedback';
import { WordService } from '../services/office/wordService';
import { AIService } from '../services/api/aiService';
import { PromptSettings } from '../types/settings';

interface FeedbackState {
    [key: string]: FeedbackResponse | null;
}

export const useFeedback = () => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [currentPersona, setCurrentPersona] = React.useState<PersonaType | null>(null);
    const [processedCount, setProcessedCount] = React.useState(0);
    const [feedback, setFeedback] = React.useState<FeedbackState>({});
    const [error, setError] = React.useState<string | null>(null);

    const wordService = WordService.getInstance();
    const aiService = AIService.getInstance();

    const clearFeedback = async () => {
        try {
            await wordService.clearFeedback();
            setFeedback({});
            setProcessedCount(0);
            setCurrentPersona(null);
            setError(null);
        } catch (err) {
            setError('Failed to clear feedback');
            console.error('Error clearing feedback:', err);
        }
    };

    const processFeedback = async (prompts: PromptSettings) => {
        try {
            setIsProcessing(true);
            setError(null);
            setProcessedCount(0);

            // Get document content
            const documentText = await wordService.getDocumentText();
            if (!documentText) {
                throw new Error('No document content found');
            }

            // Clear existing feedback
            await clearFeedback();

            // Process each persona
            const personas: PersonaType[] = ['management', 'technical', 'hr', 'legal', 'junior'];
            const newFeedback: FeedbackState = {};

            for (const persona of personas) {
                try {
                    setCurrentPersona(persona);
                    const response = await aiService.processFeedback(documentText, prompts, persona);
                    newFeedback[persona] = response;
                    await wordService.addFeedback(response, persona);
                    setProcessedCount(prev => prev + 1);
                } catch (err) {
                    console.error(`Error processing ${persona} feedback:`, err);
                    newFeedback[persona] = null;
                }
            }

            setFeedback(newFeedback);
            setCurrentPersona(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process feedback');
            console.error('Error processing feedback:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const getFeedbackForPersona = (persona: PersonaType): FeedbackResponse | null => {
        return feedback[persona] || null;
    };

    return {
        isProcessing,
        currentPersona,
        processedCount,
        totalPersonas: 5,
        error,
        processFeedback,
        clearFeedback,
        getFeedbackForPersona,
    };
};
