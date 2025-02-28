declare namespace Word {
    interface RequestContext {
        document: Document;
        sync(): Promise<void>;
    }

    interface Document {
        body: Body;
        comments: Comments;
    }

    interface Body {
        text: string;
        paragraphs: Paragraphs;
        getRange(location?: RangeLocation): Range;
        load(properties: string): void;
    }

    interface Paragraphs {
        items: Paragraph[];
        load(properties: string): void;
    }

    interface Paragraph {
        text: string;
        getRange(): Range;
    }

    interface Range {
        text: string;
        insertComment(text: string): Comment;
        getRange(location?: RangeLocation): Range;
        expandTo(range: Range): Range;
        moveStartPosition(units: RangeLocation, count: number): Range;
    }

    interface Comment {
        author: string;
        authorColor?: string;
        delete(): void;
    }

    interface Comments {
        items: Comment[];
        load(properties: string): void;
    }

    enum RangeLocation {
        whole = "Whole",
        start = "Start",
        end = "End",
        after = "After",
        content = "Content"
    }

    function run<T>(callback: (context: RequestContext) => Promise<T>): Promise<T>;
}
