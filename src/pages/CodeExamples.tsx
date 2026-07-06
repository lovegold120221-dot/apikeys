import React, { useState } from 'react';
import { CodeBlock, cn } from '../components/CodeBlock';

export function CodeExamples() {
  const apiHost = 'http://localhost:3000';
  
  const examples = [
    {
      id: 'curl',
      label: 'cURL',
      language: 'bash',
      code: `curl ${apiHost}/v1/chat/completions \\
  -H "Authorization: Bearer $EBURON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "eburon-core",
    "messages": [
      {
        "role": "user",
        "content": "Explain local AI inference in simple terms."
      }
    ]
  }'`
    },
    {
      id: 'js',
      label: 'JavaScript',
      language: 'javascript',
      code: `const response = await fetch("${apiHost}/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.EBURON_API_KEY}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "eburon-core",
    messages: [{ role: "user", content: "Explain local AI inference in simple terms." }]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`
    },
    {
      id: 'node',
      label: 'Node.js (Fetch)',
      language: 'javascript',
      code: `const response = await fetch("${apiHost}/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.EBURON_API_KEY}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "eburon-code",
    messages: [
      {
        role: "user",
        content: "Build me a simple REST API in Express."
      }
    ]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`
    },
    {
      id: 'python',
      label: 'Python (Requests)',
      language: 'python',
      code: `import requests
import os

url = "${apiHost}/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {os.getenv('EBURON_API_KEY')}",
    "Content-Type": "application/json"
}
data = {
    "model": "eburon-core",
    "messages": [
        {
            "role": "user",
            "content": "Explain local AI inference in simple terms."
        }
    ]
}

response = requests.post(url, headers=headers, json=data)
print(response.json()["choices"][0]["message"]["content"])`
    }
  ];

  const [activeTab, setActiveTab] = useState(examples[0].id);
  const activeExample = examples.find(e => e.id === activeTab);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Code Examples</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        Use standard AI SDKs or HTTP clients to interact with Eburon AI. Simply override the base URL and ensure you are using Eburon-branded model names.
      </p>

      <div className="pt-6">
        <div className="flex space-x-1 border-b border-[var(--border-color)] overflow-x-auto pb-px">
          {examples.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setActiveTab(ex.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === ex.id 
                  ? "border-[var(--text-primary)] text-[var(--text-primary)]" 
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]"
              )}
            >
              {ex.label}
            </button>
          ))}
        </div>
        
        <div className="mt-6">
          {activeExample && (
            <CodeBlock language={activeExample.language} code={activeExample.code} />
          )}
        </div>
      </div>
    </div>
  );
}
