import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { ext, guessLangFromText } from "@/utils/ext";
import { PendingSnippet } from '@/types';


interface QuickSaveProps {
  onSave?: () => void;
}

export const QuickSave: React.FC<QuickSaveProps> = ({ onSave }) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    const checkPendingSnippet = async () => {
      const { pendingSnippet } = await ext.storage.local.get("pendingSnippet");
      if (pendingSnippet) {
        const snippet = pendingSnippet as PendingSnippet;
        setContent(snippet.content || "");
        setLanguage(snippet.language || "");
        setTitle(snippet.content?.split("\n")[0]?.slice(0, 50) || "");
        await ext.storage.local.remove("pendingSnippet");
      }
    };
    checkPendingSnippet();
  }, []);


  const handleSave = async () => {
    if (!content.trim()) {
      setStatus('Nothing to save');
      return;
    }

    setLoading(true);
    setStatus('Saving...');

    try {
      const tabs = await ext.tabs.query({ active: true, currentWindow: true });
      const sourceUrl = tabs[0]?.url || '';
      const sourceTitle = tabs[0]?.title || '';

      const res = await fetch(`${settings.apiBaseUrl}/api/v1/snippets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title || 'Untitled snippet',
          body: content,
          language: language || guessLangFromText(content) || 'text',
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          meta: { sourceUrl, sourceTitle }
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setStatus('Saved');
      setContent('');
      setLanguage('');
      setTitle('');
      setTags('');
      onSave?.();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>Quick Save</h2>
      <div className="row">
        <label>Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Snippet title"
        />
      </div>
      <div className="row">
        <label>Language</label>
        <input
          value={language}
          onChange={e => setLanguage(e.target.value)}
          placeholder="e.g., javascript"
        />
      </div>
      <div className="row">
        <label>Tags (comma)</label>
        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="e.g., array, util"
        />
      </div>
      <div className="row">
        <label>Content</label>
        <textarea
          rows={6}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your code here"
        />
      </div>
      <button onClick={handleSave} disabled={loading}>Save to Vault</button>
      <div className="status-container">
        <div className="muted">{status}</div>
        {loading && <div className="loader" />}
      </div>
    </section>
  );
};