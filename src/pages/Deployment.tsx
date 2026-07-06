import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export function Deployment() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Local Deployment</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        Eburon AI acts as a proxy to local inference runtimes. Follow these steps to set up the environment and run the API layer.
      </p>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">1. Setup Inference Runtime</h2>
        <p className="text-[var(--text-secondary)] mb-4">Ensure your local inference engine is running and models are installed.</p>
        <CodeBlock language="bash" code={`# Start your local inference engine
ollama serve

# Verify installed models
ollama list`} />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">2. Setup Eburon API Proxy</h2>
        <p className="text-[var(--text-secondary)] mb-4">Install dependencies and start the proxy server.</p>
        <CodeBlock language="bash" code={`# Install Node.js dependencies
npm install

# Start the full-stack server (Frontend + Proxy API)
npm run dev`} />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Internal Model Configuration</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          The mapping between Eburon public model aliases (e.g. <code>eburon-core</code>) and your raw local models is controlled via environment variables in the <code>.env</code> file.
          This mapping must never be exposed to public frontend users.
        </p>
        <CodeBlock language="env" code={`# .env
EBURON_CORE_MODEL=actual-local-model-name
EBURON_FAST_MODEL=actual-local-model-name
EBURON_CODE_MODEL=actual-local-model-name
EBURON_REASONING_MODEL=actual-local-model-name
EBURON_VISION_MODEL=actual-local-model-name
EBURON_EMBED_MODEL=actual-local-model-name
EBURON_AGENT_MODEL=actual-local-model-name
EBURON_LOCAL_MODEL=actual-local-model-name`} />
      </div>
    </div>
  );
}
