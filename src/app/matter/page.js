"use client";

import { useState } from 'react';
import { UserCircle, WarningOctagon, Scales, Notepad, FolderOpen, Lightning, Trash, FileCode } from '@phosphor-icons/react';
import { MatterEngine } from '@/lib/matter_engine';
import { CLIENT_DATA } from '@/data/client_data';

export default function MatterPage() {
  const [activeTab, setActiveTab] = useState('mt-client');

  const [formData, setFormData] = useState({
    matterId: '', legalName: '', gstin: '', tradeName: '', businessDesc: '', state: '', regType: 'Regular',
    noticeType: '', sectionInvoked: '', noticeNumber: '', issueDate: '', dueDate: '', issuingAuthority: '', periodFrom: '', periodTo: '',
    taxDemand: '', interest: '', penalty: '', totalExposure: '',
    gstr1Status: '', gstr3bStatus: '', gstr9Status: '', reconciliationStatus: 'Pending', paymentDetails: '', itcPosition: '', priorCorrespondence: '',
    draftType: 'Formal Reply', tone: 'Respectful and corrective', additionalInstructions: '', strategyReason: '',
    includeRecon: true, flagPending: true, includeCaselaw: true, includeWP: true
  });
  
  const [issues, setIssues] = useState([]);
  const [docs, setDocs] = useState({
    scn: false,
    returns: false,
    recon: false,
    challans: false,
    books: false,
    eway: false,
    agreement: false
  });

  const [output, setOutput] = useState('');

  const updateForm = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
       ...prev, 
       [id.replace('mf-', '')]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleGenerate = () => {
    // Generate Strategy Draft uses the MatterEngine.
    const matter = {
      matterId: formData.matterId,
      legalName: formData.legalName,
      gstin: formData.gstin,
      state: formData.state,
      noticeType: formData.noticeType,
      noticeNumber: formData.noticeNumber,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      periodFrom: formData.periodFrom,
      periodTo: formData.periodTo,
      sectionInvoked: formData.sectionInvoked,
      strategy: 'FACTUAL', // Simply default to factual
      issuingAuthority: formData.issuingAuthority,
      issues: issues,
      documentsReady: Object.keys(docs).filter(k => docs[k]),
      pendingDocs: Object.keys(docs).filter(k => !docs[k]),
    };
    
    const draft = MatterEngine.generate(matter);
    setOutput(draft.full);
    setActiveTab('mt-output');
  };

  return (
    <section className="view active" id="view-matter">
      <div className="page-header">
        <div>
          <h1>Matter Record</h1>
          <p>Complete the intake form to generate a department-ready GST reply tailored to your chosen strategy.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setOutput('')}><Trash /> Clear Form</button>
          <button className="btn-primary" onClick={handleGenerate}><FileCode /> Generate Strategy Draft</button>
        </div>
      </div>

      <div className="matter-tabs">
        <button className={`mtab ${activeTab === 'mt-client' ? 'active' : ''}`} onClick={() => setActiveTab('mt-client')}><UserCircle /> Client Profile</button>
        <button className={`mtab ${activeTab === 'mt-notice' ? 'active' : ''}`} onClick={() => setActiveTab('mt-notice')}><WarningOctagon /> Notice Details</button>
        <button className={`mtab ${activeTab === 'mt-docs' ? 'active' : ''}`} onClick={() => setActiveTab('mt-docs')}><FolderOpen /> Documents</button>
        <button className={`mtab ${activeTab === 'mt-output' ? 'active' : ''}`} onClick={() => setActiveTab('mt-output')}><Lightning /> Output</button>
      </div>

      <div className="matter-content">
        {activeTab === 'mt-client' && (
          <div className="matter-tab-panel active">
            <div className="mf-grid">
              <div className="mf-group span2">
                <label className="mf-label">Legal Name</label>
                <input type="text" className="mf-input" id="mf-legalName" value={formData.legalName} onChange={updateForm} list="clientNameList" />
                <datalist id="clientNameList">
                  {CLIENT_DATA.map(c => <option key={c.gstin || Math.random()} value={c.userName} />)}
                </datalist>
              </div>
              <div className="mf-group span2">
                <label className="mf-label">GSTIN</label>
                <input type="text" className="mf-input" id="mf-gstin" value={formData.gstin} onChange={updateForm} />
              </div>
              <div className="mf-group">
                <label className="mf-label">State</label>
                <select className="mf-select" id="mf-state" value={formData.state} onChange={updateForm}>
                  <option value="">— Select State —</option>
                  <option>Maharashtra</option>
                  <option>Gujarat</option>
                  <option>Delhi</option>
                  <option>Karnataka</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mt-notice' && (
          <div className="matter-tab-panel active">
            <div className="mf-grid">
              <div className="mf-group">
                <label className="mf-label">Notice Type</label>
                <select className="mf-select" id="mf-noticeType" value={formData.noticeType} onChange={updateForm}>
                  <option value="">— Select —</option>
                  <option value="SCN u/s 73">SCN u/s 73</option>
                  <option value="SCN u/s 74">SCN u/s 74</option>
                  <option value="ASMT-10">ASMT-10</option>
                  <option value="ADT-02">ADT-02</option>
                  <option value="GSTR-3A">GSTR-3A</option>
                </select>
              </div>
              <div className="mf-group">
                <label className="mf-label">Notice Number</label>
                <input type="text" className="mf-input" id="mf-noticeNumber" value={formData.noticeNumber} onChange={updateForm} />
              </div>
              <div className="mf-group">
                <label className="mf-label">Issue Date</label>
                <input type="date" className="mf-input" id="mf-issueDate" value={formData.issueDate} onChange={updateForm} />
              </div>
              <div className="mf-group">
                <label className="mf-label">Due Date</label>
                <input type="date" className="mf-input" id="mf-dueDate" value={formData.dueDate} onChange={updateForm} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mt-docs' && (
          <div className="matter-tab-panel active">
            <div className="mf-section-heading">Document Checklist</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
              {Object.keys(docs).map(k => (
                <label key={k} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <input type="checkbox" checked={docs[k]} onChange={e => setDocs({...docs, [k]: e.target.checked})} />
                  {k.toUpperCase()} Document verified
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mt-output' && (
          <div className="matter-tab-panel active">
            {!output && <button className="btn-primary" onClick={handleGenerate}><FileCode /> Generate Draft Now</button>}
            {output && (
              <div style={{marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: '1.5'}}>
                {output}
              </div>
            )}
          </div>
        )}
      </div>

    </section>
  );
}
