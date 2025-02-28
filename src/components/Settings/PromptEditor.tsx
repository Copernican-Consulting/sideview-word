import * as React from 'react';
import {
    Stack,
    TextField,
    PrimaryButton,
    DefaultButton,
    Label,
    Pivot,
    PivotItem,
    mergeStyleSets,
} from '@fluentui/react';
import { PromptSettings } from '../../types/settings';
import { PERSONAS, PersonaType } from '../../types/feedback';

interface PromptEditorProps {
    prompts: PromptSettings;
    onSave: (prompts: PromptSettings) => void;
    onClose: () => void;
}

const classNames = mergeStyleSets({
    root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        padding: '10px 0',
    },
    textField: {
        width: '100%',
        marginBottom: '20px',
        '& textarea': {
            minHeight: '150px',
            maxHeight: '300px',
            resize: 'vertical',
        },
    },
    buttonContainer: {
        marginTop: 'auto',
        padding: '10px 0',
        borderTop: '1px solid #edebe9',
    },
});

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
        <div className={classNames.root}>
            <div className={classNames.content}>
                <Pivot>
                    <PivotItem headerText="System">
                        <TextField
                            label="System Prompt"
                            multiline
                            autoAdjustHeight
                            value={currentPrompts.systemPrompt}
                            onChange={(_, value) => handlePromptChange('systemPrompt', value || '')}
                            className={classNames.textField}
                        />
                    </PivotItem>

                    {Object.entries(PERSONAS).map(([type, persona]) => (
                        <PivotItem key={type} headerText={persona.name}>
                            <TextField
                                label={`${persona.name} Prompt`}
                                multiline
                                autoAdjustHeight
                                value={currentPrompts[type as PersonaType]}
                                onChange={(_, value) => handlePromptChange(type as PersonaType, value || '')}
                                className={classNames.textField}
                            />
                        </PivotItem>
                    ))}
                </Pivot>
            </div>

            <Stack 
                horizontal 
                tokens={{ childrenGap: 10 }} 
                horizontalAlign="end"
                className={classNames.buttonContainer}
            >
                <PrimaryButton onClick={handleSave} text="Save" />
                <DefaultButton onClick={onClose} text="Cancel" />
            </Stack>
        </div>
    );
};
