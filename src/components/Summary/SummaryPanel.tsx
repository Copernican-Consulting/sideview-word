import * as React from 'react';
import {
    Stack,
    Text,
    Label,
    mergeStyleSets,
    DetailsList,
    IColumn,
    SelectionMode,
} from '@fluentui/react';
import { FeedbackResponse, PERSONAS, PersonaType } from '../../types/feedback';

interface SummaryPanelProps {
    feedback: FeedbackResponse;
    persona: {
        name: string;
        color: string;
        description: string;
    };
}

const classNames = mergeStyleSets({
    root: {
        padding: '10px',
    },
    header: {
        marginBottom: '15px',
    },
    scoreContainer: {
        marginBottom: '20px',
    },
    score: {
        fontSize: '24px',
        fontWeight: 'bold',
    },
    scoreLabel: {
        fontSize: '12px',
        color: '#666',
    },
    summary: {
        marginBottom: '20px',
    },
    commentList: {
        marginTop: '10px',
    },
});

const scoreColumns: IColumn[] = [
    {
        key: 'metric',
        name: 'Metric',
        fieldName: 'metric',
        minWidth: 100,
        maxWidth: 150,
    },
    {
        key: 'score',
        name: 'Score',
        fieldName: 'score',
        minWidth: 50,
        maxWidth: 70,
    },
];

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
    feedback,
    persona,
}) => {
    const scoreItems = React.useMemo(() => [
        { metric: 'Clarity', score: feedback.scores.clarity },
        { metric: 'Tone', score: feedback.scores.tone },
        { metric: 'Impact', score: feedback.scores.impact },
        { metric: 'Actionability', score: feedback.scores.actionability },
    ], [feedback.scores]);

    return (
        <Stack className={classNames.root}>
            <Stack className={classNames.header}>
                <Text variant="xLarge" styles={{ root: { color: persona.color } }}>
                    {persona.name} Feedback
                </Text>
                <Text>{persona.description}</Text>
            </Stack>

            <Stack className={classNames.summary}>
                <Label>Summary</Label>
                <Text>{feedback.summary}</Text>
            </Stack>

            <Stack className={classNames.scoreContainer}>
                <Label>Scores</Label>
                <DetailsList
                    items={scoreItems}
                    columns={scoreColumns}
                    selectionMode={SelectionMode.none}
                    isHeaderVisible={true}
                />
            </Stack>

            <Stack className={classNames.commentList}>
                <Label>Comments</Label>
                {feedback.comments.map((comment, index) => (
                    <Text key={index} block styles={{ root: { marginBottom: '8px' } }}>
                        {comment.text}
                    </Text>
                ))}
            </Stack>
        </Stack>
    );
};
