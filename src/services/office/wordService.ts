import { FeedbackResponse, PersonaType, PERSONAS } from '../../types/feedback';

export class WordService {
    private static instance: WordService;

    private constructor() {}

    public static getInstance(): WordService {
        if (!WordService.instance) {
            WordService.instance = new WordService();
        }
        return WordService.instance;
    }

    private async verifyDocumentAccess(context: Word.RequestContext): Promise<void> {
        try {
            // Try to access document properties to verify we have access
            const body = context.document.body;
            body.load('text');
            await context.sync();
        } catch (error) {
            console.error('Error verifying document access:', error);
            throw new Error('Unable to access document. Please make sure a document is open and you have permission to modify it.');
        }
    }

    public async getDocumentText(): Promise<string> {
        try {
            return await Word.run(async (context) => {
                await this.verifyDocumentAccess(context);
                const body = context.document.body;
                body.load('text');
                await context.sync();
                return body.text;
            });
        } catch (error) {
            console.error('Error getting document text:', error);
            throw new Error('Failed to read document content. Please make sure a document is open.');
        }
    }

    private async findRangeLocation(context: Word.RequestContext, position: number): Promise<Word.Range> {
        try {
            await this.verifyDocumentAccess(context);
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
                    return paragraph.getRange().getRange(Word.RangeLocation.start).expandTo(
                        paragraph.getRange().getRange(Word.RangeLocation.start).moveStartPosition(Word.RangeLocation.start, offset)
                    );
                }
                
                currentPos += length + 1; // +1 for paragraph break
            }

            // If position is beyond document length, return end of document
            return body.getRange(Word.RangeLocation.end);
        } catch (error) {
            console.error('Error finding range location:', error);
            throw new Error('Failed to locate position in document. Please make sure the document is accessible.');
        }
    }

    public async addFeedback(feedback: FeedbackResponse, personaType: PersonaType): Promise<void> {
        try {
            await Word.run(async (context) => {
                await this.verifyDocumentAccess(context);
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
                            (commentObj as Word.Comment).authorColor = persona.color;
                        }
                    } catch (e) {
                        console.warn('Comment color not supported in this version of Word');
                    }

                    // Sync after each comment to ensure it's properly added
                    await context.sync();
                }
            });
        } catch (error) {
            console.error('Error adding feedback:', error);
            throw new Error('Failed to add feedback comments. Please make sure you have permission to add comments.');
        }
    }

    public async clearFeedback(): Promise<void> {
        try {
            await Word.run(async (context) => {
                await this.verifyDocumentAccess(context);

                // Get all comments
                const comments = context.document.comments;
                comments.load('items');
                await context.sync();

                // Check if there are any comments
                if (!comments.items || comments.items.length === 0) {
                    // No comments to clear, exit gracefully
                    return;
                }

                // Delete comments one by one with individual error handling
                for (const comment of comments.items) {
                    try {
                        comment.delete();
                        // Sync after each deletion to ensure it's processed
                        await context.sync();
                    } catch (e) {
                        console.warn('Failed to delete individual comment:', e);
                        // Continue with other comments even if one fails
                    }
                }
            });
        } catch (error) {
            console.error('Error in clearFeedback:', error);
            throw new Error('Failed to clear comments. Please make sure you have permission to modify comments and try again.');
        }
    }

    public async getCommentCount(): Promise<number> {
        try {
            return await Word.run(async (context) => {
                await this.verifyDocumentAccess(context);
                const comments = context.document.comments;
                comments.load('items');
                await context.sync();
                return comments.items ? comments.items.length : 0;
            });
        } catch (error) {
            console.error('Error getting comment count:', error);
            return 0;
        }
    }
}
