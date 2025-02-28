import * as React from 'react';
import {
    Stack,
    TextField,
    PrimaryButton,
    DefaultButton,
    Label,
    Pivot,
    PivotItem,
    ScrollablePane,
    Sticky,
    StickyPositionType,
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
        height: 'calc(100vh - 200px)',
        position: 'relative',
        maxWidth: '100%',
        overflowX: 'hidden',
    },
    pivotItem: {
        padding: '10px 0',
    },
    textField: {
        width: '100%',
        '& textarea': {
            minHeight: '200px',
            resize: 'vertical',
        },
    },
    buttonContainer: {
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'white',
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
        <Stack tokens={{ childrenGap: 10 }} className={classNames.root}>
            <Sticky stickyPosition={StickyPositionType.Header}>
                <Label>Edit Prompts</Label>
            </Sticky>

            <ScrollablePane>
                <Stack tokens={{ childrenGap: 15 }}>
                    <Pivot>
                        <PivotItem headerText="System" className={classNames.pivotItem}>
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
                            <PivotItem key={type} headerText={persona.name} className={classNames.pivotItem}>
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
                </Stack>
            </ScrollablePane>

            <Stack 
                horizontal 
                tokens={{ childrenGap: 10 }} 
                horizontalAlign="end"
                className={classNames.buttonContainer}
            >
                <PrimaryButton onClick={handleSave} text="Save" />
                <DefaultButton onClick={onClose} text="Cancel" />
            </Stack>
        </Stack>
    );
};
