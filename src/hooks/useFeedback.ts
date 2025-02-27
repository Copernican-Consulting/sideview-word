import { useState } from 'react';
import { AIService } from '../services/api/aiService';
import { WordService } from '../services/office/wordService';
import { FeedbackResponse, PERSONAS, PersonaType } from '../types/feedback';
import { PromptSettings } from '../types/settings';

interface FeedbackState {
    [key: string]: FeedbackResponse | null;
}

export const useFeedback = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string>('');
    const [feedback, setFeedback] = useState<FeedbackState>({});

    const aiService = AIService.getInstance();
    const wordService = WordService.getInstance();

    const processFeedback = async (prompts: PromptSettings) => {
        setIsProcessing(true);
        setError('');

        try {
            // Get document content
            const content = await wordService.getDocumentContent();
            if (!content.trim()) {
                throw new Error('Document is empty');
            }

            // Clear existing comments
            await wordService.clearComments();

            // Process feedback for each persona
            for (const personaType of Object.keys(PERSONAS) as PersonaType[]) {
                const persona = PERSONAS[personaType];
                
                // Process feedback
                const feedbackResponse = await aiService.processFeedback(content, prompts, personaType);

                // Store feedback
                setFeedback(prev => ({
                    ...prev,
                    [personaType]: feedbackResponse
                }));

                // Add comments and summary
                await wordService.addFeedbackComments(feedbackResponse, persona);
                await wordService.addSummarySection(feedbackResponse, persona);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            console.error('Error processing feedback:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const clearFeedback = async () => {
        try {
            await wordService.clearComments();
            setFeedback({});
            setError('');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(`Failed to clear feedback: ${errorMessage}`);
            console.error('Error clearing feedback:', err);
        }
    };

    const getFeedbackForPersona = (personaType: PersonaType): FeedbackResponse | null => {
        return feedback[personaType] || null;
    };

    return {
        isProcessing,
        error,
        processFeedback,
        clearFeedback,
        getFeedbackForPersona
    };
};
