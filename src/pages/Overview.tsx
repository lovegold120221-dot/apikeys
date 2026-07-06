import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export function Overview() {
  const apiHost = 'http://localhost:3000';

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Eburon AI Platform</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        Eburon AI provides a local-first, industry-standard API layer that routes requests to privately hosted local models. Developers can use familiar AI SDKs and request formats while keeping model execution local, private, and controllable.
      </p>
      
      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Why Eburon AI?</h2>
        <ul className="list-disc pl-5 space-y-2 text-[var(--text-secondary)]">
          <li><strong>Industry-Standard API:</strong> Use standard AI SDKs for Python, Node, and more without changing your integration logic.</li>
          <li><strong>Local-First:</strong> All models run locally on your own infrastructure. No data leaves your machine.</li>
          <li><strong>Private Runtime:</strong> Secure, isolated environment suitable for sensitive workloads.</li>
          <li><strong>Developer-Friendly:</strong> Get started in minutes with our transparent proxy architecture.</li>
        </ul>
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Base URL</h2>
        <p className="text-[var(--text-secondary)] mb-4">All API requests should be routed to our standard v1 endpoint:</p>
        <CodeBlock language="text" code={`${apiHost}/v1`} />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Quickstart Example</h2>
        <p className="text-[var(--text-secondary)] mb-4">Here is a quick example of a chat completion request using cURL.</p>
        <CodeBlock 
          language="bash" 
          code={`curl ${apiHost}/v1/chat/completions \\
  -H "Authorization: Bearer $EBURON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "eburon-core",
    "messages": [
      {
        "role": "user",
        "content": "Hello Eburon AI"
      }
    ]
  }'`} 
        />
      </div>
    </div>
  );
}
