import * as React from 'react';
import {
    Stack,
    TextField,
    Dropdown,
    IDropdownOption,
    Slider,
    Label,
    PrimaryButton,
    DefaultButton,
    Link,
    MessageBar,
    MessageBarType,
    Panel,
    PanelType,
    Pivot,
    PivotItem,
    mergeStyleSets,
} from '@fluentui/react';
import { Settings, DEFAULT_SETTINGS, ApiProvider } from '../../types/settings';
import { PromptEditor } from './PromptEditor';
import { usePrompts } from '../../hooks/usePrompts';

interface SettingsPanelProps {
    isOpen: boolean;
    onSave: (settings: Settings) => void;
    onClose: () => void;
    initialSettings?: Settings;
}

const classNames = mergeStyleSets({
    content: {
        padding: '0 20px',
        height: '100%',
        overflowY: 'auto',
    },
    settingsGroup: {
        padding: '10px 0',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        backgroundColor: 'white',
        borderTop: '1px solid #edebe9',
    },
    mainContent: {
        marginBottom: '80px', // Space for button container
    }
});

const apiProviderOptions: IDropdownOption[] = [
    { key: 'ollama', text: 'Ollama' },
    { key: 'openrouter', text: 'OpenRouter' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isOpen,
    onSave,
    onClose,
    initialSettings = DEFAULT_SETTINGS,
}) => {
    const [settings, setSettings] = React.useState<Settings>(initialSettings);
    const [error, setError] = React.useState<string>('');
    const { prompts, updatePrompt, error: promptError } = usePrompts();

    React.useEffect(() => {
        console.log('Settings panel isOpen:', isOpen);
    }, [isOpen]);

    const handleApiProviderChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        if (option) {
            setSettings({ ...settings, apiProvider: option.key as ApiProvider });
        }
    };

    const handleSave = () => {
        if (settings.apiProvider === 'openrouter' && !settings.openrouterKey) {
            setError('OpenRouter API key is required');
            return;
        }
        onSave(settings);
    };

    const handlePromptSave = async (newPrompts: any) => {
        try {
            await updatePrompt('systemPrompt', newPrompts.systemPrompt);
            Object.entries(newPrompts).forEach(async ([key, value]) => {
                if (key !== 'systemPrompt') {
                    await updatePrompt(key as any, value as string);
                }
            });
        } catch (err) {
            setError('Failed to save prompts');
        }
    };

    return (
        <Panel
            isOpen={isOpen}
            onDismiss={onClose}
            type={PanelType.medium}
            headerText="Settings"
            closeButtonAriaLabel="Close"
            isLightDismiss={true}
        >
            <div className={classNames.content}>
                <div className={classNames.mainContent}>
                    <Pivot>
                        <PivotItem headerText="API Settings">
                            <Stack tokens={{ childrenGap: 15 }} className={classNames.settingsGroup}>
                                <Stack.Item>
                                    <Label>API Provider</Label>
                                    <Dropdown
                                        selectedKey={settings.apiProvider}
                                        options={apiProviderOptions}
                                        onChange={handleApiProviderChange}
                                    />
                                </Stack.Item>

                                {settings.apiProvider === 'ollama' && (
                                    <Stack.Item>
                                        <Label>Ollama Model</Label>
                                        <TextField
                                            value={settings.ollamaModel}
                                            onChange={(_, value) => setSettings({ ...settings, ollamaModel: value || '' })}
                                        />
                                    </Stack.Item>
                                )}

                                {settings.apiProvider === 'openrouter' && (
                                    <>
                                        <Stack.Item>
                                            <Label>OpenRouter API Key</Label>
                                            <TextField
                                                type="password"
                                                value={settings.openrouterKey}
                                                onChange={(_, value) => setSettings({ ...settings, openrouterKey: value || '' })}
                                            />
                                            <Link href="https://openrouter.ai/keys" target="_blank">
                                                Get your API key
                                            </Link>
                                        </Stack.Item>
                                        <Stack.Item>
                                            <Label>OpenRouter Model</Label>
                                            <TextField
                                                value={settings.openrouterModel}
                                                onChange={(_, value) => setSettings({ ...settings, openrouterModel: value || '' })}
                                                placeholder="e.g., openai/gpt-4"
                                            />
                                        </Stack.Item>
                                    </>
                                )}

                                <Stack.Item>
                                    <Label>Context Window</Label>
                                    <TextField
                                        type="number"
                                        value={settings.contextWindow.toString()}
                                        onChange={(_, value) =>
                                            setSettings({ ...settings, contextWindow: parseInt(value || '4096') })
                                        }
                                    />
                                </Stack.Item>

                                <Stack.Item>
                                    <Label>Temperature ({settings.temperature})</Label>
                                    <Slider
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={settings.temperature}
                                        onChange={(value) => setSettings({ ...settings, temperature: value })}
                                    />
                                </Stack.Item>

                                <Stack.Item>
                                    <Label>Seed (optional)</Label>
                                    <TextField
                                        type="number"
                                        value={settings.seed?.toString() || ''}
                                        onChange={(_, value) =>
                                            setSettings({ ...settings, seed: value ? parseInt(value) : undefined })
                                        }
                                        placeholder="Leave empty for random"
                                    />
                                </Stack.Item>
                            </Stack>
                        </PivotItem>

                        <PivotItem headerText="Prompts">
                            <PromptEditor
                                prompts={prompts}
                                onSave={handlePromptSave}
                                onClose={() => {}}
                            />
                        </PivotItem>
                    </Pivot>
                </div>

                <div className={classNames.buttonContainer}>
                    {(error || promptError) && (
                        <MessageBar messageBarType={MessageBarType.error} styles={{ root: { marginBottom: 10 } }}>
                            {error || promptError}
                        </MessageBar>
                    )}

                    <Stack horizontal tokens={{ childrenGap: 10 }} horizontalAlign="end">
                        <PrimaryButton onClick={handleSave} text="Save Settings" />
                        <DefaultButton onClick={onClose} text="Cancel" />
                    </Stack>
                </div>
            </div>
        </Panel>
    );
};
