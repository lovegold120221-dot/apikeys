import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export function Embeddings() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Embeddings</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        Get a vector representation of a given input that can be easily consumed by machine learning models and algorithms. Perfect for Search and RAG workflows.
      </p>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Endpoint</h2>
        <CodeBlock language="http" code="POST /v1/embeddings" />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Example Request</h2>
        <p className="text-[var(--text-secondary)] mb-4">Always use the <code>eburon-embed</code> model name.</p>
        <CodeBlock language="json" code={`{
  "model": "eburon-embed",
  "input": "Eburon AI is a local-first, industry-standard AI platform."
}`} />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Example Response</h2>
        <CodeBlock language="json" code={`{
  "object": "list",
  "model": "eburon-embed",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.0123, -0.0045, 0.0987]
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "total_tokens": 12
  }
}`} />
      </div>
      
      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Use Cases</h2>
        <ul className="list-disc pl-5 space-y-2 text-[var(--text-secondary)]">
          <li><strong>Semantic Search:</strong> Rank results by relevance to a query string.</li>
          <li><strong>RAG (Retrieval-Augmented Generation):</strong> Retrieve relevant context to inject into LLM prompts.</li>
          <li><strong>Clustering & Classification:</strong> Group or categorize text strings based on vector similarity.</li>
        </ul>
      </div>
    </div>
  );
}
