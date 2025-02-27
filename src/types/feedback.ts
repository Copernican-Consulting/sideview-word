export interface FeedbackScores {
    clarity: number;
    tone: number;
    alignment: number;
    efficiency: number;
    completeness: number;
}

export interface SnippetRange {
    start: number;
    end: number;
}

export interface SnippetFeedback {
    snippet: string;
    comment: string;
    range: SnippetRange;
}

export interface FeedbackResponse {
    scores: FeedbackScores;
    snippetFeedback: SnippetFeedback[];
    generalComments: string[];
}

export type PersonaType = 'management' | 'technical' | 'hr' | 'legal' | 'junior';

export interface PersonaInfo {
    id: PersonaType;
    name: string;
    color?: string;
}

export const PERSONAS: Record<PersonaType, PersonaInfo> = {
    management: {
        id: 'management',
        name: 'Senior Management',
        color: '#4CAF50' // Green
    },
    technical: {
        id: 'technical',
        name: 'Technical Project Manager',
        color: '#2196F3' // Blue
    },
    hr: {
        id: 'hr',
        name: 'HR',
        color: '#9C27B0' // Purple
    },
    legal: {
        id: 'legal',
        name: 'Legal',
        color: '#F44336' // Red
    },
    junior: {
        id: 'junior',
        name: 'New Junior Team Member',
        color: '#FF9800' // Orange
    }
};
