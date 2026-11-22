// profile-gate.js
// Shared by auth.html, home.html and profile-setup.html.
// Google accounts created BEFORE this date are treated as already set up,
// so existing users are not forced through the setup page.
const PROFILE_SETUP_CUTOFF_MS = Date.parse('2026-10-11T00:00:00Z');

// user_metadata keys that profile-setup.html must save.
// Edit these to match the keys your setup page writes.
const REQUIRED_PROFILE_FIELDS = ['college', 'whatsapp'];

function hasRequiredProfileFields(user) {
  const meta = user.user_metadata || {};
  return REQUIRED_PROFILE_FIELDS.every((key) => {
    const v = meta[key];
    return typeof v === 'string' ? v.trim() !== '' : Boolean(v);
  });
}

// True only for Google sign-ups that have not finished the setup page yet.
// Email/password users are never sent to setup.
function needsProfileSetup(user) {
  if (!user) return false;
  if (user.app_metadata?.provider !== 'google') return false;
  const createdMs = Date.parse(user.created_at);
  if (!Number.isFinite(createdMs) || createdMs < PROFILE_SETUP_CUTOFF_MS) return false;
  if (user.user_metadata?.profile_completed !== true) return true;
  return !hasRequiredProfileFields(user);
}
