import { FeedbackResponse, PersonaType, PERSONAS } from '../../types/feedback';

declare namespace Word {
    interface Comment {
        author: string;
        authorColor?: string;
        delete(): void;
    }

    interface Comments {
        items: Comment[];
    }

    interface Document {
        comments: Comments;
        body: Body;
    }
}

export class WordService {
    private static instance: WordService;

    private constructor() {}

    public static getInstance(): WordService {
        if (!WordService.instance) {
            WordService.instance = new WordService();
        }
        return WordService.instance;
    }

    public async getDocumentText(): Promise<string> {
        return await Word.run(async (context) => {
            const body = context.document.body;
            body.load('text');
            await context.sync();
            return body.text;
        });
    }

    private async findRangeLocation(context: Word.RequestContext, position: number): Promise<Word.Range> {
        const body = context.document.body;
        body.load('text');
        await context.sync();

        // Convert position to paragraph and character offset
        let currentPos = 0;
        const paragraphs = body.paragraphs;
        paragraphs.load('text');
        await context.sync();

        for (let i = 0; i < paragraphs.items.length; i++) {
            const paragraph = paragraphs.items[i];
            const length = paragraph.text.length;
            
            if (currentPos + length >= position) {
                // Found the paragraph containing our position
                const offset = position - currentPos;
                return paragraph.getRange().getRange('Start').expandTo(
                    paragraph.getRange().getRange('Start').moveStartPosition(Word.RangeLocation.start, offset)
                );
            }
            
            currentPos += length + 1; // +1 for paragraph break
        }

        // If position is beyond document length, return end of document
        return body.getRange('End');
    }

    public async addFeedback(feedback: FeedbackResponse, personaType: PersonaType): Promise<void> {
        await Word.run(async (context) => {
            const persona = PERSONAS[personaType];
            const comments = feedback.comments || [];

            // Add each comment at its specified location
            for (const comment of comments) {
                const range = await this.findRangeLocation(context, comment.position);
                const commentObj = range.insertComment(comment.text);
                
                // Set comment author to persona name
                commentObj.author = persona.name;
                
                // Add persona-specific styling (if supported by Word API)
                try {
                    if ('authorColor' in commentObj) {
                        (commentObj as any).authorColor = persona.color;
                    }
                } catch (e) {
                    console.warn('Comment color not supported in this version of Word');
                }
            }

            await context.sync();
        });
    }

    public async clearFeedback(): Promise<void> {
        await Word.run(async (context) => {
            const comments = context.document.comments;
            comments.load('items');
            await context.sync();

            comments.items.forEach((comment: Word.Comment) => comment.delete());
            await context.sync();
        });
    }

    public async getCommentCount(): Promise<number> {
        return await Word.run(async (context) => {
            const comments = context.document.comments;
            comments.load('items');
            await context.sync();
            return comments.items.length;
        });
    }
}
