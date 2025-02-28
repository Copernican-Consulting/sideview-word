import * as React from 'react';
import {
    Stack,
    Text,
    ProgressIndicator as FluentProgressIndicator,
    mergeStyleSets,
    IProgressIndicatorStyles,
} from '@fluentui/react';
import { PERSONAS, PersonaType } from '../../types/feedback';

interface ProgressIndicatorProps {
    currentPersona: PersonaType | null;
    isComplete: boolean;
    totalPersonas: number;
    processedPersonas: number;
}

const classNames = mergeStyleSets({
    root: {
        padding: '10px 0',
    },
    status: {
        marginBottom: '8px',
    },
});

const getProgressStyles = (color?: string): Partial<IProgressIndicatorStyles> => ({
    progressBar: {
        backgroundColor: color,
    },
});

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    currentPersona,
    isComplete,
    totalPersonas,
    processedPersonas,
}) => {
    const percentComplete = processedPersonas / totalPersonas;
    const currentColor = currentPersona ? PERSONAS[currentPersona].color : undefined;

    return (
        <Stack className={classNames.root}>
            <Text className={classNames.status}>
                {isComplete ? (
                    'Analysis Complete'
                ) : currentPersona ? (
                    `Processing ${PERSONAS[currentPersona].name} Feedback...`
                ) : (
                    'Starting Analysis...'
                )}
            </Text>
            <FluentProgressIndicator
                percentComplete={percentComplete}
                styles={getProgressStyles(currentColor)}
            />
            <Text>
                {processedPersonas} of {totalPersonas} personas processed
            </Text>
        </Stack>
    );
};
