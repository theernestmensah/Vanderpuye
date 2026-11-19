# Campaign website

Run `python -m http.server 4173` from this folder, then open http://localhost:4173. The site uses relative asset paths compatible with GitHub Pages project sites. Serve it over HTTP.

## Participation
Donate buttons navigate to the donation section with preset and custom GHS amount controls. No payment provider or verified campaign payment destination has been supplied; checkout clearly reports that online donations are unavailable.

The volunteer form offers role selection and validates contact details, region and consent. Its save button downloads a local JSON file. Nothing is submitted or retained by the website. Connect a campaign-approved form endpoint and privacy notice before enabling live applications.

## Design and verification
Existing self-hosted fonts and portrait assets retained. Added hero print-wipe motion, participation heading reveals, selection feedback, scroll progress, persistent donation navigation, mobile menu and ticker pause. System reduced-motion preference is respected.

JavaScript syntax, local asset references, unique IDs and anchor destinations checked. Independent code review completed and findings corrected. Rendered desktop/mobile QA could not be completed because available browser previews could not access the local site.

## GitHub Pages
Push index.html, assets/, img/, and .nojekyll to the repository root. README.md and DESIGN.md are optional documentation. In repository Settings > Pages, select Deploy from a branch, main, /(root), then Save. No build command is needed.
