import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export function ChatCompletions() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Chat Completions</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        Given a list of messages comprising a conversation, the model will return a response. This endpoint follows the industry-standard API format.
      </p>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Endpoint</h2>
        <CodeBlock language="http" code="POST /v1/chat/completions" />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Example Request</h2>
        <p className="text-[var(--text-secondary)] mb-4">You must use Eburon model names only.</p>
        <CodeBlock language="json" code={`{
  "model": "eburon-code",
  "messages": [
    {
      "role": "system",
      "content": "You are Eburon AI, a helpful coding assistant."
    },
    {
      "role": "user",
      "content": "Write a Python function that checks if a number is prime."
    }
  ],
  "temperature": 0.7,
  "stream": false
}`} />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Example Response</h2>
        <CodeBlock language="json" code={`{
  "id": "chatcmpl-eburon-001",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "eburon-code",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Here is a Python function..."
      },
      "finish_reason": "stop"
    }
  ]
}`} />
      </div>
    </div>
  );
}
