import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getVerifiedCollegeImageRecord, KNOWN_BAD_IMAGE_URLS, VERIFIED_COLLEGE_IMAGES } from './verified-college-images.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const options = {
    apply: false,
    batchSize: 25,
    help: false,
    limit: 250,
    offset: 0,
    overwrite: false,
    reportFile: path.resolve(__dirname, './output/college-image-update-report.json'),
  };

  for (const arg of argv) {
    if (arg === '--apply') {
      options.apply = true;
      continue;
    }

    if (arg === '--overwrite') {
      options.overwrite = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg.startsWith('--batch-size=')) {
      options.batchSize = Number.parseInt(arg.split('=')[1] ?? '', 10);
      continue;
    }

    if (arg.startsWith('--limit=')) {
      options.limit = Number.parseInt(arg.split('=')[1] ?? '', 10);
      continue;
    }

    if (arg.startsWith('--offset=')) {
      options.offset = Number.parseInt(arg.split('=')[1] ?? '', 10);
      continue;
    }

    if (arg.startsWith('--report-file=')) {
      options.reportFile = path.resolve(process.cwd(), arg.split('=')[1] ?? '');
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(options.batchSize) || options.batchSize <= 0) {
    throw new Error('--batch-size must be a positive number');
  }

  if (!Number.isFinite(options.limit) || options.limit <= 0) {
    throw new Error('--limit must be a positive number');
  }

  if (!Number.isFinite(options.offset) || options.offset < 0) {
    throw new Error('--offset must be zero or a positive number');
  }

  return options;
}

function printHelp() {
  console.log(`Safer college image updater

Usage:
  node scripts/update-college-images.mjs [--limit=250] [--offset=0] [--batch-size=25] [--overwrite] [--apply]

Defaults:
  Dry run only. Writes a JSON report and does not modify Supabase.

Flags:
  --apply                Apply the planned updates to Supabase
  --overwrite            Replace existing non-empty image URLs, not just known bad/missing ones
  --limit=<number>       Maximum colleges to scan in this run
  --offset=<number>      Row offset for batch processing
  --batch-size=<number>  Fetch and write batch size
  --report-file=<path>   Custom JSON report output path
  --help, -h             Show this help message

Environment:
  SUPABASE_URL is required for dry runs and updates.
  SUPABASE_SERVICE_ROLE_KEY is required for dry runs and updates.
`);
}

function requireSupabaseUrl() {
  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is required');
  }

  return SUPABASE_URL;
}

function requireServiceRoleKey() {
  if (!SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  }

  return SERVICE_ROLE_KEY;
}

async function request(pathname, options = {}) {
  const supabaseUrl = requireSupabaseUrl();
  const serviceRoleKey = requireServiceRoleKey();
  const response = await fetch(`${supabaseUrl}${pathname}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(options.headers ?? {}),
    },
  });

  return response;
}

async function fetchCollegeBatch(offset, limit) {
  const response = await request(`/rest/v1/colleges?select=id,name,image_url&order=id.asc&offset=${offset}&limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch colleges: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function patchCollegeImage(id, imageUrl) {
  const response = await request(`/rest/v1/colleges?id=eq.${encodeURIComponent(String(id))}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ image_url: imageUrl }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update college ${id}: ${response.status} ${await response.text()}`);
  }
}

function valueToString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function planCollegeImageUpdate(row, overwrite) {
  const currentImageUrl = valueToString(row.image_url);
  const verifiedRecord = getVerifiedCollegeImageRecord(valueToString(row.name));

  if (!verifiedRecord) {
    return {
      action: 'unmatched',
      currentImageUrl,
      id: row.id,
      name: valueToString(row.name),
    };
  }

  if (currentImageUrl === verifiedRecord.imageUrl) {
    return {
      action: 'already_verified',
      currentImageUrl,
      id: row.id,
      matchedCanonicalName: verifiedRecord.canonicalName,
      name: valueToString(row.name),
      nextImageUrl: verifiedRecord.imageUrl,
      sourceKind: verifiedRecord.sourceKind,
      sourcePageUrl: verifiedRecord.sourcePageUrl,
    };
  }

  const canReplaceCurrentImage = !currentImageUrl || KNOWN_BAD_IMAGE_URLS.has(currentImageUrl) || overwrite;

  if (!canReplaceCurrentImage) {
    return {
      action: 'skipped_existing',
      currentImageUrl,
      id: row.id,
      matchedCanonicalName: verifiedRecord.canonicalName,
      name: valueToString(row.name),
      nextImageUrl: verifiedRecord.imageUrl,
      sourceKind: verifiedRecord.sourceKind,
      sourcePageUrl: verifiedRecord.sourcePageUrl,
    };
  }

  return {
    action: 'update',
    currentImageUrl,
    id: row.id,
    matchedCanonicalName: verifiedRecord.canonicalName,
    name: valueToString(row.name),
    nextImageUrl: verifiedRecord.imageUrl,
    sourceKind: verifiedRecord.sourceKind,
    sourcePageUrl: verifiedRecord.sourcePageUrl,
  };
}

async function writeReport(reportFile, report) {
  await mkdir(path.dirname(reportFile), { recursive: true });
  await writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

async function applyUpdatesInBatches(updates, batchSize) {
  let updated = 0;

  for (let index = 0; index < updates.length; index += batchSize) {
    const batch = updates.slice(index, index + batchSize);
    await Promise.all(batch.map((entry) => patchCollegeImage(entry.id, entry.nextImageUrl)));
    updated += batch.length;
  }

  return updated;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const plans = [];
  let processed = 0;
  let offset = options.offset;

  while (processed < options.limit) {
    const fetchLimit = Math.min(options.batchSize, options.limit - processed);
    const rows = await fetchCollegeBatch(offset, fetchLimit);

    if (!Array.isArray(rows) || rows.length === 0) {
      break;
    }

    plans.push(...rows.map((row) => planCollegeImageUpdate(row, options.overwrite)));

    processed += rows.length;
    offset += rows.length;

    if (rows.length < fetchLimit) {
      break;
    }
  }

  const updates = plans.filter((entry) => entry.action === 'update');
  const report = {
    applyMode: options.apply,
    batchSize: options.batchSize,
    generatedAt: new Date().toISOString(),
    limit: options.limit,
    manifestEntries: VERIFIED_COLLEGE_IMAGES.length,
    offset: options.offset,
    overwrite: options.overwrite,
    processed,
    summary: {
      alreadyVerified: plans.filter((entry) => entry.action === 'already_verified').length,
      skippedExisting: plans.filter((entry) => entry.action === 'skipped_existing').length,
      unmatched: plans.filter((entry) => entry.action === 'unmatched').length,
      updatesPlanned: updates.length,
    },
    unmatchedCollegeNames: [...new Set(plans.filter((entry) => entry.action === 'unmatched').map((entry) => entry.name))].sort((left, right) => left.localeCompare(right)),
    updates,
  };

  if (options.apply && updates.length > 0) {
    report.summary.updated = await applyUpdatesInBatches(updates, options.batchSize);
  }

  await writeReport(options.reportFile, report);
  console.log(JSON.stringify({ reportFile: options.reportFile, ...report.summary }, null, 2));
}

await main();
