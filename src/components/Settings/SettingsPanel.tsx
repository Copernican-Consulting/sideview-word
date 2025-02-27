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
} from '@fluentui/react';
import { Settings, DEFAULT_SETTINGS, ApiProvider } from '../../types/settings';

interface SettingsPanelProps {
    isOpen: boolean;
    onSave: (settings: Settings) => void;
    onClose: () => void;
    initialSettings?: Settings;
}

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
        onClose();
    };

    return (
        <Stack tokens={{ childrenGap: 15, padding: 20 }}>
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

            {error && (
                <Stack.Item>
                    <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
                </Stack.Item>
            )}

            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
                <DefaultButton onClick={onClose}>Cancel</DefaultButton>
            </Stack>
        </Stack>
    );
};
