import { FeedbackResponse, PersonaType, PERSONAS } from '../../types/feedback';

export class WordService {
    private static instance: WordService;

    private constructor() {}

    /**
     * Check if the Word API version supports comments
     * This will help diagnose issues with the comments API
     */
    public async checkWordApiVersion(): Promise<boolean> {
        try {
            return await Word.run(async (context) => {
                console.log('Checking Word API version...');
                
                // Try to access the API version
                const apiVersion = Office.context.requirements.isSetSupported('WordApi', '1.3');
                console.log(`WordApi 1.3+ supported: ${apiVersion}`);
                
                // Even if the API reports as supported, let's verify we can actually use comments
                try {
                    if (context.document.comments) {
                        const comments = context.document.comments;
                        comments.load('items');
                        await context.sync();
                        console.log(`Comments API available. Comment count: ${comments.items ? comments.items.length : 0}`);
                        return true;
                    } else {
                        console.warn('Comments property is undefined on document');
                        return false;
                    }
                } catch (commentsError) {
                    console.error('Error accessing comments API:', commentsError);
                    return false;
                }
            });
        } catch (error) {
            console.error('Error checking Word API version:', error);
            return false;
        }
    }

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

    private async isDocumentProtected(context: Word.RequestContext): Promise<boolean> {
        try {
            // Check if document protection is available and enabled
            // Use type assertion since protection might not be in the TypeScript definitions
            const doc = context.document as any;
            if (doc.protection) {
                doc.protection.load('protected');
                await context.sync();
                console.log(`Document protection state: ${doc.protection.protected}`);
                return doc.protection.protected;
            }
            return false;
        } catch (error) {
            console.warn('Could not determine document protection state:', error);
            return false;
        }
    }

    private async isCommentsApiSupported(context: Word.RequestContext): Promise<boolean> {
        console.log('Checking comments API support...');
        
        try {
            // Check if comments API exists
            if (!context.document.comments) {
                console.warn('Comments API not available (context.document.comments is undefined)');
                return false;
            }
            
            console.log('Comments API exists on document object');
            
            // Try to load and access the comments collection
            try {
                const comments = context.document.comments;
                comments.load('items');
                await context.sync();
                
                // Log the result
                if (comments.items) {
                    console.log(`Successfully loaded comments items. Count: ${comments.items.length}`);
                    return true;
                } else {
                    console.log('Comments items is null or undefined even though sync succeeded');
                    return false;
                }
            } catch (syncError) {
                console.warn('Comments API exists but operation failed:', syncError);
                return false;
            }
        } catch (error) {
            console.warn('Comments API check failed with exception:', error);
            return false;
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
                
                // Check if document is protected
                const isProtected = await this.isDocumentProtected(context);
                if (isProtected) {
                    console.warn('Document is protected, cannot add comments');
                    throw new Error('The document is protected. Please disable protection to add comments.');
                }
                
                // Check if comments API is available
                if (!context.document.comments) {
                    console.warn('Comments API not available in this version of Word');
                    throw new Error('Comments functionality is not supported in this version of Word.');
                }

                // Verify comments API is fully supported
                const isSupported = await this.isCommentsApiSupported(context);
                if (!isSupported) {
                    throw new Error('Comments functionality is not fully supported in this version of Word.');
                }
                
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
            
            // Provide more specific error messages based on the error
            if (error instanceof Error) {
                if (error.message.includes('not supported') || error.message.includes('not available')) {
                    throw new Error('Comments functionality is not supported in this version of Word. Please try using a newer version.');
                } else if (error.message.includes('protected')) {
                    throw new Error('Failed to add feedback comments. The document appears to be protected or in read-only mode.');
                } else if (error.message.includes('permission')) {
                    throw new Error('Failed to add feedback comments. Please make sure you have permission to add comments.');
                } else {
                    throw new Error(`Failed to add feedback comments: ${error.message}`);
                }
            } else {
                throw new Error('Failed to add feedback comments due to an unknown error. Please try again.');
            }
        }
    }

    public async clearFeedback(): Promise<void> {
        try {
            await Word.run(async (context) => {
                await this.verifyDocumentAccess(context);

                // Check if document is protected
                const isProtected = await this.isDocumentProtected(context);
                if (isProtected) {
                    console.warn('Document is protected, cannot modify comments');
                    throw new Error('The document is protected. Please disable protection to modify comments.');
                }

                // Check if comments API is available
                if (!context.document.comments) {
                    console.warn('Comments API not available in this version of Word');
                    throw new Error('Comments functionality is not supported in this version of Word.');
                }

                // Verify comments API is fully supported
                const isSupported = await this.isCommentsApiSupported(context);
                if (!isSupported) {
                    throw new Error('Comments functionality is not fully supported in this version of Word.');
                }

                // Get all comments
                const comments = context.document.comments;
                comments.load('items');
                
                try {
                    await context.sync();
                } catch (syncError) {
                    console.error('Error syncing comments:', syncError);
                    throw new Error('Unable to access comments in this document.');
                }

                // Check if there are any comments
                if (!comments.items || comments.items.length === 0) {
                    console.log('No comments to clear');
                    return;
                }

                console.log(`Found ${comments.items.length} comments to delete`);

                // Try bulk deletion first if available
                // Note: deleteAll might not be available in all Word versions
                try {
                    // Use type assertion to avoid TypeScript errors
                    const commentsAny = comments as any;
                    if (commentsAny.deleteAll && typeof commentsAny.deleteAll === 'function') {
                        commentsAny.deleteAll();
                        await context.sync();
                        console.log('Successfully deleted all comments at once');
                        return;
                    }
                } catch (bulkError) {
                    console.warn('Bulk deletion failed, falling back to individual deletion:', bulkError);
                    // Continue with individual deletion
                }

                // Delete comments one by one with individual error handling
                let successCount = 0;
                let failCount = 0;
                
                for (let i = 0; i < comments.items.length; i++) {
                    try {
                        const comment = comments.items[i];
                        comment.delete();
                        
                        // Sync after each deletion to ensure it's processed
                        // Using a try/catch here to handle sync errors separately
                        try {
                            await context.sync();
                            successCount++;
                            console.log(`Successfully deleted comment ${i+1}/${comments.items.length}`);
                        } catch (syncError) {
                            failCount++;
                            console.warn(`Failed to sync after deleting comment ${i+1}:`, syncError);
                        }
                    } catch (deleteError) {
                        failCount++;
                        console.warn(`Failed to delete comment ${i+1}:`, deleteError);
                        // Continue with other comments even if one fails
                    }
                }
                
                console.log(`Comment deletion results: ${successCount} succeeded, ${failCount} failed`);
                
                // If we couldn't delete any comments, throw an error
                if (failCount > 0 && successCount === 0) {
                    throw new Error(`Failed to delete any comments. You may not have permission to modify comments in this document.`);
                }
                
                // If we deleted some but not all, log a warning but don't throw
                if (failCount > 0) {
                    console.warn(`Warning: ${failCount} comments could not be deleted.`);
                }
            });
        } catch (error) {
            console.error('Error in clearFeedback:', error);
            
            // Provide more specific error messages based on the error
            if (error instanceof Error) {
                if (error.message.includes('not supported') || error.message.includes('not available')) {
                    throw new Error('Comments functionality is not supported in this version of Word. Please try using a newer version.');
                } else if (error.message.includes('permission')) {
                    throw new Error('Failed to clear comments. Please make sure you have permission to modify comments and try again.');
                } else if (error.message.includes('protected')) {
                    throw new Error('Failed to clear comments. The document appears to be protected or in read-only mode.');
                } else {
                    throw new Error(`Failed to clear comments: ${error.message}`);
                }
            } else {
                throw new Error('Failed to clear comments due to an unknown error. Please try again.');
            }
        }
    }

    public async getCommentCount(): Promise<number> {
        try {
            return await Word.run(async (context) => {
                await this.verifyDocumentAccess(context);
                
                // Check if comments API is available
                if (!context.document.comments) {
                    console.warn('Comments API not available in this version of Word');
                    return 0;
                }
                
                try {
                    const comments = context.document.comments;
                    comments.load('items');
                    await context.sync();
                    return comments.items ? comments.items.length : 0;
                } catch (syncError) {
                    console.warn('Error syncing comments:', syncError);
                    return 0;
                }
            });
        } catch (error) {
            console.error('Error getting comment count:', error);
            return 0;
        }
    }
}
