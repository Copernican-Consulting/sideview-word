import * as React from 'react';
import {
    Stack,
    TextField,
    PrimaryButton,
    DefaultButton,
    Label,
    Pivot,
    PivotItem,
} from '@fluentui/react';
import { PromptSettings } from '../../types/settings';
import { PERSONAS, PersonaType } from '../../types/feedback';

interface PromptEditorProps {
    prompts: PromptSettings;
    onSave: (prompts: PromptSettings) => void;
    onClose: () => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
    prompts,
    onSave,
    onClose,
}) => {
    const [currentPrompts, setCurrentPrompts] = React.useState<PromptSettings>(prompts);

    const handlePromptChange = (key: keyof PromptSettings, value: string) => {
        setCurrentPrompts(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        onSave(currentPrompts);
    };

    return (
        <Stack tokens={{ childrenGap: 15, padding: 10 }}>
            <Label>Edit Prompts</Label>
            
            <Pivot>
                <PivotItem headerText="System">
                    <Stack tokens={{ childrenGap: 10, padding: 10 }}>
                        <TextField
                            label="System Prompt"
                            multiline
                            rows={10}
                            value={currentPrompts.systemPrompt}
                            onChange={(_, value) => handlePromptChange('systemPrompt', value || '')}
                        />
                    </Stack>
                </PivotItem>

                {Object.entries(PERSONAS).map(([type, persona]) => (
                    <PivotItem key={type} headerText={persona.name}>
                        <Stack tokens={{ childrenGap: 10, padding: 10 }}>
                            <TextField
                                label={`${persona.name} Prompt`}
                                multiline
                                rows={10}
                                value={currentPrompts[type as PersonaType]}
                                onChange={(_, value) => handlePromptChange(type as PersonaType, value || '')}
                            />
                        </Stack>
                    </PivotItem>
                ))}
            </Pivot>

            <Stack horizontal tokens={{ childrenGap: 10 }} horizontalAlign="end">
                <PrimaryButton onClick={handleSave} text="Save" />
                <DefaultButton onClick={onClose} text="Cancel" />
            </Stack>
        </Stack>
    );
};
