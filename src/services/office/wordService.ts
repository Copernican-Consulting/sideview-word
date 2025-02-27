import { PersonaInfo, SnippetFeedback, FeedbackResponse } from '../../types/feedback';

export class WordService {
    private static instance: WordService;

    private constructor() {}

    public static getInstance(): WordService {
        if (!WordService.instance) {
            WordService.instance = new WordService();
        }
        return WordService.instance;
    }

    /**
     * Gets the current document's content
     */
    public async getDocumentContent(): Promise<string> {
        return new Promise((resolve, reject) => {
            Word.run(async (context) => {
                const body = context.document.body;
                body.load('text');
                
                try {
                    await context.sync();
                    resolve(body.text);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    /**
     * Adds comments to the document based on feedback
     */
    public async addFeedbackComments(feedback: FeedbackResponse, persona: PersonaInfo): Promise<void> {
        return Word.run(async (context) => {
            const body = context.document.body;
            body.load('text');
            await context.sync();

            // Add snippet-specific comments
            for (const snippet of feedback.snippetFeedback) {
                await this.addComment(context, snippet, persona);
            }

            // Add general comments at the end of the document
            if (feedback.generalComments.length > 0) {
                const generalComment = feedback.generalComments.join('\n\n');
                const paragraphs = body.paragraphs;
                paragraphs.load('items');
                await context.sync();

                const lastParagraph = paragraphs.items[paragraphs.items.length - 1];
                const newParagraph = lastParagraph.insertParagraph(`[${persona.name} - General Feedback]`, 'After');
                newParagraph.getRange().insertComment(generalComment);
            }

            await context.sync();
        });
    }

    /**
     * Adds a single comment to the document
     */
    private async addComment(
        context: Word.RequestContext,
        snippet: SnippetFeedback,
        persona: PersonaInfo
    ): Promise<void> {
        const body = context.document.body;
        const searchResults = body.search(snippet.snippet);
        searchResults.load('items');
        await context.sync();

        if (searchResults.items.length > 0) {
            const range = searchResults.items[0].getRange();
            range.select();
            range.insertComment(snippet.comment);
            await context.sync();
        }
    }

    /**
     * Clears all comments from the document
     */
    public async clearComments(): Promise<void> {
        return Word.run(async (context) => {
            const comments = context.document.body.getRange().getComments();
            comments.load('items');
            await context.sync();

            comments.items.forEach(comment => {
                comment.delete();
            });

            await context.sync();
        });
    }

    /**
     * Gets all comments in the document
     */
    public async getComments(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            Word.run(async (context) => {
                const comments = context.document.body.getRange().getComments();
                comments.load('items');
                
                try {
                    await context.sync();
                    resolve(comments.items);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    /**
     * Adds a summary section at the end of the document
     */
    public async addSummarySection(feedback: FeedbackResponse, persona: PersonaInfo): Promise<void> {
        return Word.run(async (context) => {
            const body = context.document.body;
            const paragraphs = body.paragraphs;
            paragraphs.load('items');
            await context.sync();

            // Add summary header
            const lastParagraph = paragraphs.items[paragraphs.items.length - 1];
            const headerParagraph = lastParagraph.insertParagraph(`\n[${persona.name} - Feedback Summary]`, 'After');
            
            // Add scores
            const scores = feedback.scores;
            const scoreText = Object.entries(scores)
                .map(([criterion, score]) => `${criterion}: ${score}%`)
                .join('\n');
            
            headerParagraph.insertParagraph(scoreText, 'After');

            await context.sync();
        });
    }
}
