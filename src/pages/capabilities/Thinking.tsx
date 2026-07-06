import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';

export function Thinking() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Thinking & Reasoning</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        Eburon reasoning models can perform complex chain-of-thought analysis before returning their final response. This allows the model to break down difficult problems, plan steps, and correct itself.
      </p>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Using Reasoning Models</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          To use reasoning capabilities, simply select a reasoning-optimized model like <code>eburon-reasoning</code>. The model will output its internal thought process inside special <code>&lt;think&gt;</code> tags.
        </p>
        <CodeBlock language="json" code={`{
  "model": "eburon-reasoning",
  "messages": [
    {
      "role": "user",
      "content": "Solve this math puzzle..."
    }
  ]
}`} />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Parsing the Response</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          The model's response will contain a <code>&lt;think&gt;</code> block followed by the final answer. You can parse this block in your application to display the reasoning process to the user.
        </p>
        <CodeBlock language="text" code={`<think>
1. First, I need to analyze the puzzle requirements.
2. The user wants to find...
3. Let's calculate the intermediate steps.
</think>

Here is the final solution to the math puzzle...`} />
      </div>
    </div>
  );
}
