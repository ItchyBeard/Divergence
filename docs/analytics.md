# Google Analytics 4

Measurement ID: `G-Q3YGCRGKM2`. The standard asynchronous Google tag is declared in
an inert template in `index.html`; it is inserted into the document only after
analytics consent in a production build. Development, localhost preview builds
and Netlify deploy-preview hosts do not load the tag. No additional packages or
environment variables are required.

## Required GA4 account setting before launch

In GA4, open **Admin → Data streams → the web stream → Enhanced measurement**
and turn **Enhanced measurement off**. This disables automatic history-based
page views and automatic scroll, click, form, file-download and other interaction
events. Do not install a second Google tag through Netlify or Tag Manager.

`send_page_view: false` disables the initial automatic view; it does not override
the web stream's history-based Enhanced Measurement setting. Vue Router sends
one manual view for the initial consented page and each successful change to a
different named page. Query-only changes (mode/search/weapon targets) and hash
changes are not new page views. Redirects and failed/duplicate navigations do
not add views. Navigating back to a previously visited page does add a view.

See Google's [manual page-view documentation](https://developers.google.com/analytics/devguides/collection/ga4/views).

## Consent and data

The compact prompt gives accept and reject equal prominence and explains Google
cookies and usage/device/network data, with a link to Google's information.
**Analytics preferences** below the footer reopens it on desktop or mobile.
Rejecting after acceptance immediately disables collection, clears this
integration's prefixed GA cookies and queued events, and reloads to unload GA.
Withdrawal also applies in other open tabs. Already transmitted visits cannot be
retracted by changing browser consent.

The essential consent preference is stored separately under
`divergence.analytics-consent.v1`, expires after 180 days, and is not part of game
saves, reset or JSON import/export. If storage is blocked, analytics remains off
until a choice is made for that visit. No pre-consent Google tag requests or
consent-mode pings are sent.

Only an allowlisted page path and fixed page title are supplied by the app.
Query strings, fragments, unknown URLs and external referrers are excluded.
Tracker saves, progression, weapon/camo interactions, searches and user identifiers
are never read or sent by this integration. Google signals and advertising
personalisation are disabled; advertising consent is always denied. GA still
receives normal consented analytics device/network data and generates its usual
session/engagement metadata. It is not anonymous or free of personal-data processing.

Before launch, the site owner should publish the applicable privacy information
(including controller contact, Google's processing, retention and visitor rights)
and review the property's retention/data-sharing settings. This implementation
uses prior opt-in and easy withdrawal as described by the
[ICO's cookie guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/).

After the owner authorises deployment, verify consented visits in GA4 Realtime or
DebugView and confirm the stream settings above. No deployment or live collection
was performed as part of implementation.
