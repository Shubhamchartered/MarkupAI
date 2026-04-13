"use client";

import { useState } from 'react';
import { FileText, CalendarBlank, DownloadSimple, PaperPlaneTilt, UploadSimple } from '@phosphor-icons/react';
import { NOTICES_DB } from '@/data/notices_data';

export default function LegalPage() {
  const [drafts, setDrafts] = useState(NOTICES_DB.drafts || []);

  const handleUploadData = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      alert('Notice data uploaded successfully! Extracting metadata and generating AI draft...');
      const newDraft = {
        draft_id: `DRF-AUTO-${Math.floor(Math.random()*1000)}`,
        draft_type: 'Auto-Generated Reply (AI)',
        client_name: 'Uploaded Data Client',
        notice_ref: 'SCN/AUTO/2026',
        date_generated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Needs Review'
      };
      setDrafts([newDraft, ...drafts]);
    }
  };

  return (
    <section className="view active" id="view-legal">
      <div className="page-header">
        <div>
          <h1>Litigation Draft Centre</h1>
          <p>AI-assisted department-ready reply drafts. Review all markers before filing.</p>
        </div>
        <div className="header-actions">
          <input 
            type="file" 
            id="legal-data-upload" 
            style={{display: 'none'}} 
            onChange={handleUploadData}
            accept=".pdf,.json,.xlsx" 
          />
          <button className="btn-primary" onClick={() => document.getElementById('legal-data-upload').click()}>
            <UploadSimple /> Upload Notice Data
          </button>
        </div>
      </div>

      <div className="drafts-grid">
        {drafts.map((d, i) => (
          <div className="draft-card" key={d.draft_id || i}>
            <div className="dc-header">
              <div className="dc-type">{d.draft_type}</div>
              <span className={`status-badge ${d.status === 'Needs Review' ? 'warning' : 'success'}`}>
                {d.status}
              </span>
            </div>
            <div className="dc-title">{d.client_name}</div>
            <div className="dc-meta">
              <span>Ref: {d.notice_ref}</span>
              <span><CalendarBlank /> {d.date_generated}</span>
            </div>
            <div className="dc-actions">
              <button className="btn-secondary" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}>
                <FileText /> Edit
              </button>
              <div style={{marginLeft: 'auto'}}>
                <button className="icon-btn-sm tooltip" data-tip="Download Word"><DownloadSimple /></button>
                <button className="icon-btn-sm tooltip" data-tip="Email to Client"><PaperPlaneTilt /></button>
              </div>
            </div>
          </div>
        ))}
        {drafts.length === 0 && (
          <div style={{gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-soft)'}}>
            No litigation drafts generated yet. Use the Matter Record to generate one.
          </div>
        )}
      </div>
    </section>
  );
}
