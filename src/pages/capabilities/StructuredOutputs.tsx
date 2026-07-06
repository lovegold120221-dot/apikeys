import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';

export function StructuredOutputs() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Structured Outputs</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        Ensure the model returns output in a strict, parseable format like JSON. This is critical when extracting data, generating code configurations, or integrating AI into automated workflows.
      </p>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">JSON Mode</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          To force the model to output valid JSON, set the <code>response_format</code> parameter to <code>{`{ "type": "json_object" }`}</code> and instruct the model to return JSON in the system prompt.
        </p>
        <CodeBlock language="json" code={`{
  "model": "eburon-core",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful data extraction assistant. Always return your response in JSON format."
    },
    {
      "role": "user",
      "content": "Extract the names and ages from this text: John is 25 and Sarah is 30."
    }
  ],
  "response_format": { "type": "json_object" }
}`} />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">JSON Schema Validation</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          You can also provide a strict JSON schema that the model must adhere to. This guarantees the structure of the output.
        </p>
        <CodeBlock language="json" code={`{
  "model": "eburon-code",
  "messages": [
    {
      "role": "user",
      "content": "List two programming languages."
    }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "programming_languages",
      "schema": {
        "type": "object",
        "properties": {
          "languages": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "required": ["languages"]
      }
    }
  }
}`} />
      </div>
    </div>
  );
}
