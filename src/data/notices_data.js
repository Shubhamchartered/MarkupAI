/* ═══════════════════════════════════════════════════════════════
   notices_data.js — GST Litigation Notice Database
   Real notices come from:
     1. Manual upload via "Upload Notice" button
     2. Ymail auto-fetch (gandhisanjeev@ymail.com)
   No sample/fake data — only real client notices will appear.
   ═══════════════════════════════════════════════════════════════ */

export const NOTICES_DB = {
  notices:   [],   // populated by uploads and Ymail fetch
  documents: [],   // populated when documents are uploaded per notice
  drafts:    [],   // populated by AI drafting engine
};
