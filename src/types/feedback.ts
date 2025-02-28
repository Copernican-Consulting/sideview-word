export interface Comment {
    text: string;
    position: number;
}

export interface FeedbackResponse {
    comments: Comment[];
    scores: {
        clarity: number;
        tone: number;
        impact: number;
        actionability: number;
    };
    summary: string;
}

export type PersonaType = 'management' | 'technical' | 'hr' | 'legal' | 'junior';

interface Persona {
    name: string;
    color: string;
    description: string;
}

export const PERSONAS: Record<PersonaType, Persona> = {
    management: {
        name: 'Management',
        color: '#0078D4',
        description: 'Strategic and business-focused perspective'
    },
    technical: {
        name: 'Technical',
        color: '#107C10',
        description: 'Technical accuracy and implementation details'
    },
    hr: {
        name: 'HR',
        color: '#8764B8',
        description: 'People and policy perspective'
    },
    legal: {
        name: 'Legal',
        color: '#C43E1C',
        description: 'Legal and compliance perspective'
    },
    junior: {
        name: 'Junior',
        color: '#FFB900',
        description: 'Fresh perspective and clarity check'
    }
};
