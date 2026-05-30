import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getVerifiedCollegeImageRecord } from './verified-college-images.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isDryRun = process.argv.includes('--dry-run');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function splitCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function inferImageUrl(name) {
  return getVerifiedCollegeImageRecord(name)?.imageUrl ?? null;
}

function parseCollegeCsv(text, type, sourceTable) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rows = [];

  for (const line of lines.slice(1)) {
    const parts = splitCsvLine(line);
    if (parts.length < 6) continue;

    const sno = parts[0];
    const name = parts[1]?.trim() ?? '';
    const city = parts[2]?.trim() || null;
    const state = parts[3]?.trim() ?? '';
    const estd = parts[4]?.trim() || null;
    const fees = parts.slice(5).join(',').trim();
    if (!name) continue;

    rows.push({
      name,
      state,
      city,
      fees,
      estd,
      type,
      image_url: inferImageUrl(name),
      source_table: sourceTable,
      csv_id: sno,
    });
  }

  return rows;
}

async function request(pathname, options = {}) {
  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is required');
  }

  if (!SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  }

  const response = await fetch(`${SUPABASE_URL}${pathname}`, {
    ...options,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      ...(options.headers ?? {}),
    },
  });

  return response;
}

async function loadExistingCount() {
  const response = await request('/rest/v1/colleges?select=id&limit=1', {
    headers: {
      Prefer: 'count=exact',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to check colleges count: ${response.status} ${await response.text()}`);
  }

  const range = response.headers.get('content-range') ?? '*/0';
  const count = Number(range.split('/')[1] ?? '0');
  return count;
}

async function insertBatch(batch) {
  const response = await request('/rest/v1/colleges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(batch),
  });

  if (!response.ok) {
    throw new Error(`Failed to insert batch: ${response.status} ${await response.text()}`);
  }
}

async function deleteExistingColleges() {
  const response = await request('/rest/v1/colleges?id=not.is.null', {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete existing colleges: ${response.status} ${await response.text()}`);
  }
}

async function main() {
  const govCsv = await readFile(path.resolve(__dirname, '../Government-Medical-Collage.csv'), 'utf8');
  const privateCsv = await readFile(path.resolve(__dirname, '../Private-Medical-Collage.csv'), 'utf8');
  const deemedCsv = await readFile(path.resolve(__dirname, '../Deemed-Medical-Collage.csv'), 'utf8');

  const records = [
    ...parseCollegeCsv(govCsv, 'Government', 'government_medical_collage_csv'),
    ...parseCollegeCsv(privateCsv, 'Private', 'private_medical_collage_csv'),
    ...parseCollegeCsv(deemedCsv, 'Deemed', 'deemed_medical_collage_csv'),
  ].map(({ csv_id, ...record }) => record);

  if (isDryRun) {
    console.log(
      JSON.stringify(
        {
          parsed: records.length,
          byType: records.reduce((counts, record) => {
            counts[record.type] = (counts[record.type] ?? 0) + 1;
            return counts;
          }, {}),
        },
        null,
        2,
      ),
    );
    return;
  }

  const existingCount = await loadExistingCount();

  if (existingCount > 0) {
    await deleteExistingColleges();
  }

  const batchSize = 100;
  for (let index = 0; index < records.length; index += batchSize) {
    await insertBatch(records.slice(index, index + batchSize));
  }

  const finalCount = await loadExistingCount();
  console.log(JSON.stringify({ deleted: existingCount, inserted: records.length, finalCount }, null, 2));
}

await main();
