import * as React from 'react';
import {
    Stack,
    PrimaryButton,
    DefaultButton,
    Spinner,
    SpinnerSize,
    MessageBar,
    MessageBarType,
    Text,
    IconButton,
    IIconProps,
} from '@fluentui/react';
import { SettingsPanel } from '../Settings/SettingsPanel';
import { AIService } from '../../services/api/aiService';
import { WordService } from '../../services/office/wordService';
import { Settings, DEFAULT_SETTINGS } from '../../types/settings';
import { PERSONAS, PersonaType } from '../../types/feedback';

const settingsIcon: IIconProps = { iconName: 'Settings' };

export const TaskPane: React.FC = () => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [error, setError] = React.useState<string>('');
    const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

    const aiService = AIService.getInstance();
    const wordService = WordService.getInstance();

    const handleSettingsSave = (newSettings: Settings) => {
        setSettings(newSettings);
        aiService.updateSettings(newSettings);
        setIsSettingsOpen(false);
    };

    const processFeedback = async () => {
        try {
            setIsProcessing(true);
            setError('');

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
                
                // Get system and persona prompts
                const systemPrompt = await Office.context.document.settings.get('systemPrompt') || '';
                const personaPrompt = await Office.context.document.settings.get(`${personaType}Prompt`) || '';

                // Process feedback
                const feedback = await aiService.processFeedback(content, {
                    systemPrompt,
                    persona: personaPrompt
                });

                // Add comments and summary
                await wordService.addFeedbackComments(feedback, persona);
                await wordService.addSummarySection(feedback, persona);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Stack tokens={{ childrenGap: 10, padding: 10 }}>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                <Text variant="xLarge">Sideview.Word</Text>
                <IconButton
                    iconProps={settingsIcon}
                    title="Settings"
                    onClick={() => setIsSettingsOpen(true)}
                />
            </Stack>

            {error && (
                <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
            )}

            <Stack.Item>
                <Text>
                    Click the button below to analyze your document and receive feedback from different perspectives.
                </Text>
            </Stack.Item>

            <Stack.Item>
                <PrimaryButton
                    text={isProcessing ? 'Processing...' : 'Analyze Document'}
                    onClick={processFeedback}
                    disabled={isProcessing}
                />
            </Stack.Item>

            {isProcessing && (
                <Stack.Item align="center">
                    <Spinner size={SpinnerSize.large} label="Processing document..." />
                </Stack.Item>
            )}

            <SettingsPanel
                isOpen={isSettingsOpen}
                onSave={handleSettingsSave}
                onClose={() => setIsSettingsOpen(false)}
                initialSettings={settings}
            />
        </Stack>
    );
};
