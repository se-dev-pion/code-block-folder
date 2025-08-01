export interface TextBlock<T> {
    append(text: string): void;
    result: T;
}
