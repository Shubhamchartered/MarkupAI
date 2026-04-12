"use client";

import { FileText, CalendarBlank, DownloadSimple, PaperPlaneTilt } from '@phosphor-icons/react';
import { NOTICES_DB } from '@/data/notices_data';

export default function LegalPage() {
  const drafts = NOTICES_DB.drafts || [];

  return (
    <section className="view active" id="view-legal">
      <div className="page-header">
        <div>
          <h1>Litigation Draft Centre</h1>
          <p>AI-assisted department-ready reply drafts. Review all markers before filing.</p>
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
