'use client';

import { useState } from 'react';
import { GroupedContent } from '@/types/content';

interface ContentEditorProps {
  initialGrouped: GroupedContent;
}

export default function ContentEditor({ initialGrouped }: ContentEditorProps) {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const dict: Record<string, string> = {};
    for (const rows of Object.values(initialGrouped)) {
      for (const row of rows) {
        dict[row.content_key] = row.content_value || '';
      }
    }
    return dict;
  });

  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFlash(null);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formData }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFlash({ type: 'ok', message: data.message || 'Content uplink successful — front site updated.' });
      } else {
        setFlash({ type: 'err', message: data.error || 'Failed to update content.' });
      }
    } catch (err: unknown) {
      setFlash({ type: 'err', message: err instanceof Error ? err.message : 'Network error.' });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {flash && (
        <div className={`flash ${flash.type === 'ok' ? 'ok' : 'err'}`}>
          {flash.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {Object.entries(initialGrouped).map(([section, rows]) => (
          <details key={section} className="section-block" open>
            <summary>
              {`${section.toUpperCase()} // ${rows.length} FIELDS`}
            </summary>
            <div className="fields">
              {rows.map((row) => {
                const currentVal = formData[row.content_key] ?? row.content_value ?? '';
                const isLong = currentVal.length > 80 || row.content_key.includes('text') || row.content_key.includes('subtitle');

                return (
                  <div key={row.content_key} className="field-row">
                    <label htmlFor={`c_${row.content_key}`}>{row.label}</label>
                    {isLong ? (
                      <textarea
                        id={`c_${row.content_key}`}
                        value={currentVal}
                        onChange={(e) => handleChange(row.content_key, e.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        id={`c_${row.content_key}`}
                        value={currentVal}
                        onChange={(e) => handleChange(row.content_key, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        ))}

        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'UPLINKING...' : 'SAVE ALL CHANGES →'}
        </button>
      </form>
    </div>
  );
}
