import * as React from 'react';
import { MessageBar, MessageBarType, IMessageBarStyles } from '@fluentui/react';

interface ErrorMessageProps {
    message: string;
    styles?: Partial<IMessageBarStyles>;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, styles }) => {
    const defaultStyles: Partial<IMessageBarStyles> = {
        root: {
            marginBottom: 10,
            marginTop: 10
        }
    };

    return (
        <MessageBar
            messageBarType={MessageBarType.error}
            styles={{ ...defaultStyles, ...styles }}
            isMultiline={true}
        >
            {message}
        </MessageBar>
    );
};
