const crypto = require('crypto');
const SUPABASE_URL = 'https://xuofkjjhupgmrphzgyun.supabase.co';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function samePin(a, b) {
  const x = crypto.createHash('sha256').update(String(a || '')).digest();
  const y = crypto.createHash('sha256').update(String(b || '')).digest();
  return crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ADMIN_PIN || !samePin(req.headers['x-admin-pin'], process.env.ADMIN_PIN))
    return res.status(401).json({ error: 'Wrong PIN' });

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  const base = SUPABASE_URL + '/rest/v1/reviews';
  const { action, id, status, filter } = req.body || {};

  try {
    if (action === 'list') {
      let url = base + '?select=*&order=created_at.desc&limit=200';
      if (filter === 'new') url += '&status=eq.new';
      else if (['review', 'bug', 'suggestion'].includes(filter)) url += '&category=eq.' + filter;
      const r = await fetch(url, { headers: h });
      if (!r.ok) return res.status(502).json({ error: 'Could not load reviews' });
      return res.status(200).json(await r.json());
    }

    if (!UUID.test(String(id || ''))) return res.status(400).json({ error: 'Bad id' });

    if (action === 'update') {
      if (!['new', 'resolved'].includes(status)) return res.status(400).json({ error: 'Bad status' });
      const r = await fetch(base + '?id=eq.' + id, { method: 'PATCH', headers: h, body: JSON.stringify({ status }) });
      return r.ok ? res.status(200).json({ ok: true }) : res.status(502).json({ error: 'Update failed' });
    }

    if (action === 'delete') {
      const r = await fetch(base + '?id=eq.' + id, { method: 'DELETE', headers: h });
      return r.ok ? res.status(200).json({ ok: true }) : res.status(502).json({ error: 'Delete failed' });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
};
