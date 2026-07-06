import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export function Errors() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Errors</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        Eburon AI follows standard API error formatting, abstracting internal runtime failures into clean, predictable error codes.
      </p>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Error Format</h2>
        <p className="text-[var(--text-secondary)] mb-4">When an API error occurs, a JSON object is returned containing the details of the failure.</p>
        <CodeBlock language="json" code={`{
  "error": {
    "message": "Model not found: eburon-unknown",
    "type": "invalid_request_error",
    "code": "model_not_found"
  }
}`} />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Common Error Codes</h2>
        <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">Status Code</th>
                <th className="px-4 py-3 font-medium">Error Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              <tr className="hover:bg-[var(--bg-secondary)]/50">
                <td className="px-4 py-3 font-mono">401</td>
                <td className="px-4 py-3 font-mono">authentication_error</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">Missing or invalid Bearer token.</td>
              </tr>
              <tr className="hover:bg-[var(--bg-secondary)]/50">
                <td className="px-4 py-3 font-mono">404</td>
                <td className="px-4 py-3 font-mono">invalid_request_error</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">The requested public model alias was not found.</td>
              </tr>
              <tr className="hover:bg-[var(--bg-secondary)]/50">
                <td className="px-4 py-3 font-mono">500</td>
                <td className="px-4 py-3 font-mono">server_error</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">Internal server error or generic failure.</td>
              </tr>
              <tr className="hover:bg-[var(--bg-secondary)]/50">
                <td className="px-4 py-3 font-mono">503</td>
                <td className="px-4 py-3 font-mono">server_error</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">Eburon AI local runtime is currently unreachable (e.g. inference engine offline).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
