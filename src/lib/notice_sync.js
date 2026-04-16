/* ═══════════════════════════════════════════════════════════════
   notice_sync.js — Central Data Sync Utility
   Cross-references CLIENT_DATA ↔ NOTICES_DB by GSTN/client name
   ═══════════════════════════════════════════════════════════════ */

import { CLIENT_DATA } from '@/data/client_data';
import { NOTICES_DB } from '@/data/notices_data';

/**
 * Get all notices for a given GSTN
 * @param {string} gstn - The GSTIN to search for
 * @returns {Array} Array of notice objects matching the GSTN
 */
export function getNoticesForClient(gstn) {
  if (!gstn) return [];
  const normalised = gstn.trim().toUpperCase();
  return (NOTICES_DB.notices || []).filter(
    n => (n.gstin || '').toUpperCase() === normalised
  );
}

/**
 * Get the client entry from CLIENT_DATA that matches a GSTIN
 * @param {string} gstin - The GSTIN from a notice
 * @returns {object|null} Matching client or null
 */
export function getClientForNotice(gstin) {
  if (!gstin) return null;
  const normalised = gstin.trim().toUpperCase();
  return CLIENT_DATA.find(
    c => (c.gstn || '').toUpperCase() === normalised
  ) || null;
}

/**
 * Get all documents related to a given notice_id
 * @param {string} noticeId 
 * @returns {Array} Array of document objects
 */
export function getDocumentsForNotice(noticeId) {
  if (!noticeId) return [];
  return (NOTICES_DB.documents || []).filter(d => d.notice_id === noticeId);
}

/**
 * Get all drafts related to a given notice_id
 * @param {string} noticeId
 * @returns {Array} Array of draft objects
 */
export function getDraftsForNotice(noticeId) {
  if (!noticeId) return [];
  return (NOTICES_DB.drafts || []).filter(d => d.notice_id === noticeId);
}

/**
 * Enrich a list of notices with matched client data from CLIENT_DATA
 * Adds: userId, password, matched (boolean)
 * @param {Array} notices 
 * @returns {Array} Enriched notice objects
 */
export function syncNoticesWithClients(notices) {
  return (notices || []).map(n => {
    const client = getClientForNotice(n.gstin);
    return {
      ...n,
      matched_client: client ? {
        userName: client.userName,
        userId: client.userId,
        gstn: client.gstn,
      } : null,
      is_synced: !!client,
    };
  });
}

/**
 * Build a full client details object with all related notices, docs, and drafts
 * @param {object} client - A CLIENT_DATA entry
 * @returns {object} Full client detail with notices, documents, drafts
 */
export function getFullClientDetails(client) {
  if (!client) return null;
  const notices = getNoticesForClient(client.gstn);
  return {
    ...client,
    notices: notices.map(n => ({
      ...n,
      documents: getDocumentsForNotice(n.notice_id),
      drafts: getDraftsForNotice(n.notice_id),
    })),
    totalNotices: notices.length,
    criticalCount: notices.filter(n => n.status === 'Critical').length,
    openCount: notices.filter(n => n.status === 'Open').length,
    repliedCount: notices.filter(n => n.status === 'Replied').length,
  };
}

/**
 * Search clients by name, userId, or GSTN
 * @param {string} query - Search term
 * @param {number} limit - Max results (default 10)
 * @returns {Array} Matching client objects with notice counts
 */
export function searchClients(query, limit = 10) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  return CLIENT_DATA
    .filter(c =>
      (c.userName || '').toLowerCase().includes(q) ||
      (c.userId || '').toLowerCase().includes(q) ||
      (c.gstn || '').toLowerCase().includes(q)
    )
    .slice(0, limit)
    .map(c => ({
      ...c,
      noticeCount: getNoticesForClient(c.gstn).length,
    }));
}

/**
 * Get all clients that have at least one notice
 * @returns {Array} Clients with notices
 */
export function getClientsWithNotices() {
  return CLIENT_DATA.filter(c => getNoticesForClient(c.gstn).length > 0)
    .map(c => ({
      ...c,
      notices: getNoticesForClient(c.gstn),
      noticeCount: getNoticesForClient(c.gstn).length,
    }));
}
