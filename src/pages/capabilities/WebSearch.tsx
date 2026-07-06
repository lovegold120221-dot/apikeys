import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';

export function WebSearch() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Web Search</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        Enhance model responses with up-to-date information by integrating Web Search capabilities via Tool Calling.
      </p>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Implementing Web Search</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Web search can be easily implemented by providing a <code>search_web</code> tool to an agent model like <code>eburon-agent</code>. The model will automatically trigger searches when it needs fresh context.
        </p>
        <CodeBlock language="json" code={`{
  "model": "eburon-agent",
  "messages": [
    {
      "role": "user",
      "content": "What are the latest AI news today?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "search_web",
        "description": "Search the internet for up-to-date information.",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "The search query."
            }
          },
          "required": ["query"]
        }
      }
    }
  ]
}`} />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Agent Execution</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          When the model triggers the <code>search_web</code> tool, your backend should execute a real search (e.g., using a search API) and feed the summarized results back into the conversation for the model to generate the final answer.
        </p>
      </div>
    </div>
  );
}
