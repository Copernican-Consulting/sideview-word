import * as React from 'react';
import { Spinner, SpinnerSize, Stack, Text } from '@fluentui/react';

interface LoadingSpinnerProps {
    label?: string;
    size?: SpinnerSize;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    label = 'Loading...',
    size = SpinnerSize.large
}) => {
    return (
        <Stack
            horizontalAlign="center"
            verticalAlign="center"
            tokens={{ childrenGap: 10 }}
            className="loading-container"
        >
            <Spinner size={size} />
            {label && <Text>{label}</Text>}
        </Stack>
    );
};
