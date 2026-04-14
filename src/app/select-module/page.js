"use client";

import { Receipt, Buildings, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

function MarkupAILogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
      <div style={{
        width: 52, height: 52, borderRadius: '14px',
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 900, fontSize: '1.5rem'
      }}>M</div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>
          MARKUP<span style={{ color: '#8B5CF6' }}>.AI</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', letterSpacing: '0.1em' }}>INTELLIGENT TAX PLATFORM</div>
      </div>
    </div>
  );
}

export default function SelectModule() {
  const router = useRouter();

  return (
    <div className="module-container">
      <div className="module-header">
        <MarkupAILogo />
        <p style={{ marginTop: '1rem' }}>Select a workspace to continue</p>
      </div>

      <div className="module-grid">
        <div className="module-card it-card" onClick={() => router.push('/income-tax-dashboard')}>
          <div className="mc-icon">
            <Buildings weight="duotone" />
          </div>
          <div className="mc-content">
            <h2>Income Tax Dashboard</h2>
            <p>Manage ITR filings, assessments, Income Tax notices, and appeals.</p>
          </div>
          <div className="mc-action">
            <span className="coming-soon">Coming Soon</span>
          </div>
        </div>

        <div className="module-card gst-card" onClick={() => router.push('/')}>
          <div className="mc-icon">
            <Receipt weight="duotone" />
          </div>
          <div className="mc-content">
            <h2>GST Dashboard</h2>
            <p>Manage GST clients, notices, automated litigation drafting and compliance.</p>
          </div>
          <div className="mc-action">
            <span className="enter-text">Enter Workspace <ArrowRight /></span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .module-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at 60% 20%, rgba(99, 102, 241, 0.15), transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(139, 92, 246, 0.1), transparent 50%), var(--bg);
          padding: 2rem;
        }
        .module-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        .module-header p {
          color: var(--text-soft);
          font-size: 1.1rem;
        }
        .module-grid {
          display: flex;
          gap: 2rem;
          max-width: 900px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .module-card {
          flex: 1;
          min-width: 320px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 2.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .module-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: var(--border);
          transition: background 0.3s ease;
        }
        .module-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
          border-color: var(--text-soft);
        }
        .gst-card:hover::before { background: var(--primary-color); }
        .it-card:hover::before { background: var(--success-color); }
        .mc-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
        }
        .gst-card .mc-icon { color: var(--primary-color); }
        .it-card .mc-icon { color: var(--success-color); }
        .mc-content { flex: 1; }
        .mc-content h2 { font-size: 1.5rem; margin-bottom: 0.8rem; }
        .mc-content p { color: var(--text-soft); line-height: 1.6; }
        .mc-action { margin-top: 2rem; display: flex; align-items: center; font-weight: 500; }
        .enter-text { color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem; }
        .coming-soon {
          color: var(--text-soft); background: var(--bg);
          padding: 0.4rem 0.8rem; border-radius: 20px;
          font-size: 0.85rem; border: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}
