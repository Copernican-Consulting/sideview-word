import * as React from 'react';
import {
    Stack,
    PrimaryButton,
    DefaultButton,
    Text,
    IconButton,
    IIconProps,
} from '@fluentui/react';
import { SettingsPanel } from '../Settings/SettingsPanel';
import { SummaryPanel } from '../Summary/SummaryPanel';
import { LoadingSpinner } from '../Loading/LoadingSpinner';
import { ErrorMessage } from '../Error/ErrorMessage';
import { ProgressIndicator } from '../Progress/ProgressIndicator';
import { useSettings } from '../../hooks/useSettings';
import { usePrompts } from '../../hooks/usePrompts';
import { useFeedback } from '../../hooks/useFeedback';
import { PERSONAS, PersonaType } from '../../types/feedback';
import { WordService } from '../../services/office/wordService';

const settingsIcon: IIconProps = { iconName: 'Settings' };

export const TaskPane: React.FC = () => {
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [activePersona, setActivePersona] = React.useState<PersonaType | null>(null);

    const { settings, saveSettings, error: settingsError } = useSettings();
    const { prompts, updatePrompt, error: promptsError } = usePrompts();
    const {
        isProcessing,
        currentPersona,
        processedCount,
        totalPersonas,
        error: feedbackError,
        processFeedback,
        clearFeedback,
        getFeedbackForPersona
    } = useFeedback();

    const handleProcessClick = async () => {
        await processFeedback(prompts);
    };

    const handleClearClick = async () => {
        await clearFeedback();
        setActivePersona(null);
    };

    const handlePersonaClick = (personaType: PersonaType) => {
        setActivePersona(personaType);
    };

    const handleSettingsSave = async (newSettings: any) => {
        await saveSettings(newSettings);
        setIsSettingsOpen(false);
    };

    const handleSettingsClose = () => {
        setIsSettingsOpen(false);
    };

    // Check Word API version on component mount
    React.useEffect(() => {
        const checkApiVersion = async () => {
            try {
                const wordService = WordService.getInstance();
                const isSupported = await wordService.checkWordApiVersion();
                if (!isSupported) {
                    console.error('Word API version check failed - comments functionality may not be available');
                }
            } catch (error) {
                console.error('Error checking Word API version:', error);
            }
        };
        
        checkApiVersion();
    }, []);

    // Combine all errors
    const error = settingsError || promptsError || feedbackError;

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

            {error && <ErrorMessage message={error} />}

            <Stack.Item>
                <Text>
                    Click the button below to analyze your document and receive feedback from different perspectives.
                </Text>
            </Stack.Item>

            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <PrimaryButton
                    text={isProcessing ? 'Processing...' : 'Analyze Document'}
                    onClick={handleProcessClick}
                    disabled={isProcessing}
                />
                <DefaultButton
                    text="Clear Feedback"
                    onClick={handleClearClick}
                    disabled={isProcessing}
                />
            </Stack>

            {isProcessing && (
                <ProgressIndicator
                    currentPersona={currentPersona}
                    isComplete={false}
                    totalPersonas={totalPersonas}
                    processedPersonas={processedCount}
                />
            )}

            {!isProcessing && !error && (
                <Stack tokens={{ childrenGap: 10 }}>
                    <Stack horizontal wrap tokens={{ childrenGap: 10 }}>
                        {Object.entries(PERSONAS).map(([type, persona]) => {
                            const feedback = getFeedbackForPersona(type as PersonaType);
                            return (
                                <DefaultButton
                                    key={type}
                                    text={persona.name}
                                    onClick={() => handlePersonaClick(type as PersonaType)}
                                    disabled={!feedback}
                                    styles={{
                                        root: {
                                            backgroundColor: activePersona === type ? persona.color : undefined,
                                            color: activePersona === type ? 'white' : undefined,
                                        },
                                    }}
                                />
                            );
                        })}
                    </Stack>

                    {activePersona && getFeedbackForPersona(activePersona) && (
                        <Stack.Item>
                            <SummaryPanel
                                feedback={getFeedbackForPersona(activePersona)!}
                                persona={PERSONAS[activePersona]}
                            />
                        </Stack.Item>
                    )}
                </Stack>
            )}

            <SettingsPanel
                isOpen={isSettingsOpen}
                onSave={handleSettingsSave}
                onClose={handleSettingsClose}
                initialSettings={settings}
            />
        </Stack>
    );
};
