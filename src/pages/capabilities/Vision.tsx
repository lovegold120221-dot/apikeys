import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';

export function Vision() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Vision</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        Eburon Vision models can analyze and extract information from images. You can pass images as base64 encoded strings alongside your text prompts.
      </p>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Analyzing Images</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          To use vision capabilities, select the <code>eburon-vision</code> model and structure your message content as an array of parts (text and image URLs).
        </p>
        <CodeBlock language="json" code={`{
  "model": "eburon-vision",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is in this image?"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
          }
        }
      ]
    }
  ]
}`} />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Use Cases</h2>
        <ul className="list-disc pl-5 space-y-2 text-[var(--text-secondary)]">
          <li><strong>Document OCR:</strong> Extract structured text from scanned documents or receipts.</li>
          <li><strong>UI to Code:</strong> Convert screenshots of user interfaces into frontend code.</li>
          <li><strong>Image Classification:</strong> Categorize or tag images based on their visual contents.</li>
        </ul>
      </div>
    </div>
  );
}
