# PRIME CBT SEO upgrade: setup, deploy and test

Canonical domain: https://prime-cbt.name.ng (non-www).

## 1. Deploy
Copy everything from `site/` into the root of your project (same folder as your other .html files), replacing: index.html, auth.html, sitemap.xml, robots.txt, vercel.json. New files: about.html, funaab-cbt-practice.html, funaab-past-questions.html, online-exam-practice.html, funaab-study-materials.html, seo-pages.css, analytics.js. Push to Git; Vercel redeploys.

## 2. Make non-www the only hostname (Vercel dashboard)
Project > Settings > Domains: set `prime-cbt.name.ng` as primary and make `www.prime-cbt.name.ng` redirect to it (308). I did not put this in vercel.json because a wrong rule could create a redirect loop with your current domain setting.

## 3. Add your GA4 Measurement ID
Open `analytics.js`, line `var GA_MEASUREMENT_ID = '';`, paste e.g. `'G-ABC123DEF4'`, redeploy. Until then analytics is fully off (no script, no banner). When on, a consent banner appears; GA loads only after "Accept".
Test: GA4 > Reports > Realtime (open your site, accept, browse). DebugView: install the "Google Analytics Debugger" Chrome extension, turn it on, reload the site, then open GA4 Admin > DebugView.
Events wired now: page_view (all pages with the script), cta_clicked (any link to auth.html or element with data-cta), login and sign_up (email, in auth.html), cta_clicked for Google sign-in.
Still to wire (I do not have those files). Add `<script src="/analytics.js" defer></script>` to home.html, practice.html, materials.html, etc., then call:
- `PrimeAnalytics.track('practice_started', {course:'...', topic:'...'})`
- `PrimeAnalytics.track('practice_completed', {course:'...', question_count: 20, score_band:'60-79'})`
- `PrimeAnalytics.track('material_opened', {material_type:'pdf'})`
Never pass names, emails, matric numbers or answers; unknown parameters are dropped automatically.

## 4. Search Console
Property https://prime-cbt.name.ng/ > Sitemaps > submit `sitemap.xml`. URL Inspection > Request indexing for /, /about and the four landing pages. If you use a Domain property, no change is needed. The verification meta tag was also added to index.html.

## 5. Post-deployment checklist
- [ ] /sitemap.xml and /robots.txt load; sitemap lists 7 URLs
- [ ] /about and the 4 landing pages return 200; /about.html redirects to /about
- [ ] www.prime-cbt.name.ng redirects to https://prime-cbt.name.ng
- [ ] View source on each page: one canonical, no noindex (private pages return X-Robots-Tag: noindex)
- [ ] Rich Results Test (search.google.com/test/rich-results) and validator.schema.org on /, /about, one landing page
- [ ] Login, sign-up, Google sign-in still work; consent banner (once ID added)
- [ ] GA4 Realtime shows page_view and cta_clicked
- [ ] Mobile layout check at 360px, 768px, 1280px
