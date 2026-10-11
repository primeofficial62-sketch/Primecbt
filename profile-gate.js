// Shared by auth.html, home.html and profile-setup.html.
// Set this to the date/time you deploy this feature. Google accounts created
// BEFORE it are treated as already set up, so existing users are not forced
// through the setup page.
const PROFILE_SETUP_CUTOFF = '2026-10-11T00:00:00Z';

// True only for Google sign-ups that have not finished the setup page yet.
// Email/password users are never sent to setup.
function needsProfileSetup(user) {
  if (!user) return false;
  const isGoogle = !!(user.app_metadata && user.app_metadata.provider === 'google');
  const done = !!(user.user_metadata && user.user_metadata.profile_completed === true);
  const isNew = new Date(user.created_at) >= new Date(PROFILE_SETUP_CUTOFF);
  return isGoogle && !done && isNew;
}
