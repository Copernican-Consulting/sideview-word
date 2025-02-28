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

    const wordService = React.useMemo(() => WordService.getInstance(), []);
    const aiService = React.useMemo(() => AIService.getInstance(), []);

    const clearFeedback = React.useCallback(async () => {
        try {
            setError(null);
            await wordService.clearFeedback();
            setFeedback({});
            setProcessedCount(0);
            setCurrentPersona(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to clear feedback';
            setError(errorMessage);
            console.error('Error clearing feedback:', err);
            throw err; // Re-throw to be caught by the caller
        }
    }, [wordService]);

    const processFeedback = React.useCallback(async (prompts: PromptSettings) => {
        try {
            setIsProcessing(true);
            setError(null);
            setProcessedCount(0);
            setCurrentPersona(null);

            // Get document content
            const documentText = await wordService.getDocumentText();
            if (!documentText) {
                throw new Error('No document content found. Please make sure a document is open and contains text.');
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
                    const errorMessage = err instanceof Error ? err.message : `Failed to process ${persona} feedback`;
                    setError(errorMessage);
                    // Continue with other personas even if one fails
                }
            }

            setFeedback(newFeedback);
            setCurrentPersona(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to process feedback';
            setError(errorMessage);
            console.error('Error processing feedback:', err);
            // Clear any partial feedback if there was an error
            try {
                await clearFeedback();
            } catch (clearErr) {
                console.error('Error clearing partial feedback:', clearErr);
            }
        } finally {
            setIsProcessing(false);
        }
    }, [wordService, aiService, clearFeedback]);

    const getFeedbackForPersona = React.useCallback((persona: PersonaType): FeedbackResponse | null => {
        return feedback[persona] || null;
    }, [feedback]);

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
