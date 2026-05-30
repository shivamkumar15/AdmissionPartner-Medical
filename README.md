# AdmissionPartner-Medical
New Website for my Teacher, focusing only for medical collages 

## College image pipeline

This project now includes a safer image-update pipeline for `public.colleges`.

### What it does

- uses an explicit verified manifest instead of substring guessing
- only matches colleges by exact alias
- only accepts verified `official` or `Wikimedia` image sources
- runs in batches
- defaults to dry-run mode and writes a review report before any update is applied

### Files

- `scripts/verified-college-images.mjs`
  - reviewed college-to-image mappings
  - each entry includes aliases, image URL, source kind, and source page URL
- `scripts/update-college-images.mjs`
  - scans Supabase colleges in batches
  - plans safe image replacements
  - writes `scripts/output/college-image-update-report.json`
  - only updates rows when the image is missing, known-bad, or `--overwrite` is used

### Usage

Set your Supabase URL and service role key first:

```bash
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Plan a dry run:

```bash
npm run images:plan -- --limit=100 --batch-size=25
```

Apply a reviewed batch:

```bash
npm run images:apply -- --limit=100 --batch-size=25
```

Force replacement of existing non-empty image URLs:

```bash
npm run images:apply -- --limit=100 --batch-size=25 --overwrite
```

### Notes

- expand `scripts/verified-college-images.mjs` as you verify more colleges
- keep aliases specific; avoid generic names that can map to multiple colleges
- review the JSON report before applying large batches
