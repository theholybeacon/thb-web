// Chat message used for completions via the OpenAI API
export interface ContextMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
