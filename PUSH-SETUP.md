Push notifications setup (Supabase project xuofkjjhupgmrphzgyun)
Already done in Supabase
Migration push_notifications_tables: push_tokens, push_prefs, push_log (RLS on), RPCs register_push_token / unregister_push_token.
Edge Function send-push (verify_jwt off; protected by x-push-secret). It returns 503 until the secrets below exist.
Nothing existing was changed. Brevo, email_prefs, notifications and unsubscribe are untouched.
1. Firebase (you must do this)
console.firebase.google.com → create/select a project → Add app → Web. Copy the web config.
Project settings → Cloud Messaging → Web Push certificates → Generate key pair. Copy the public key (VAPID).
Project settings → Service accounts → Generate new private key. Keep that JSON file private.
Confirm "Firebase Cloud Messaging API (V1)" is enabled (Cloud Messaging tab).
2. Supabase secrets (Edge Functions → Secrets)