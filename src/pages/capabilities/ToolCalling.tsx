import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';

export function ToolCalling() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Tool Calling</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        Tool calling allows Eburon models to interact with external APIs, databases, or functions. The model can decide when and how to call the tools you define.
      </p>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Defining Tools</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Provide a list of tools (functions) that the model can use. The model will return a structured response indicating which tool to call and the arguments to pass.
        </p>
        <CodeBlock language="json" code={`{
  "model": "eburon-agent",
  "messages": [
    {
      "role": "user",
      "content": "What is the weather in Paris?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get the current weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and country, e.g. Paris, France"
            }
          },
          "required": ["location"]
        }
      }
    }
  ]
}`} />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Handling Tool Calls</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          When the model decides to call a tool, it returns a <code>tool_calls</code> array. Your application must execute the tool locally and return the result back to the model in a new message with the role <code>tool</code>.
        </p>
        <CodeBlock language="json" code={`{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "get_weather",
              "arguments": "{\\"location\\": \\"Paris, France\\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ]
}`} />
      </div>
    </div>
  );
}
