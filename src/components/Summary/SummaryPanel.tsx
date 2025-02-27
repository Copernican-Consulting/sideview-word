import * as React from 'react';
import {
    Stack,
    Text,
    Label,
    MessageBar,
    MessageBarType,
    Separator,
} from '@fluentui/react';
import { FeedbackResponse, PersonaInfo } from '../../types/feedback';

interface SummaryPanelProps {
    feedback: FeedbackResponse;
    persona: PersonaInfo;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ feedback, persona }) => {
    const getScoreClass = (score: number) => {
        if (score >= 85) return 'high';
        if (score >= 70) return 'medium';
        return 'low';
    };

    return (
        <Stack tokens={{ childrenGap: 15, padding: 10 }}>
            <Stack.Item>
                <Text variant="large" block>
                    {persona.name} Feedback Summary
                </Text>
            </Stack.Item>

            <Separator />

            <Stack.Item>
                <Label>Scores</Label>
                <div className="feedback-scores">
                    {Object.entries(feedback.scores).map(([criterion, score]) => (
                        <div key={criterion} className="score-bar">
                            <div className="score-label">
                                <span>{criterion.charAt(0).toUpperCase() + criterion.slice(1)}</span>
                                <span>{score}%</span>
                            </div>
                            <div className="score-progress">
                                <div
                                    className={`score-fill ${getScoreClass(score)}`}
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Stack.Item>

            <Separator />

            <Stack.Item>
                <Label>General Comments</Label>
                {feedback.generalComments.map((comment, index) => (
                    <MessageBar
                        key={index}
                        messageBarType={MessageBarType.info}
                        styles={{
                            root: {
                                marginBottom: 8,
                            },
                        }}
                    >
                        {comment}
                    </MessageBar>
                ))}
            </Stack.Item>

            <Stack.Item>
                <Label>Specific Feedback</Label>
                <Text>
                    {feedback.snippetFeedback.length} comments added to the document
                </Text>
            </Stack.Item>
        </Stack>
    );
};
