import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SUPABASE_URL = 'https://nisdlcfkjuwwuqbvwooe.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const imageAliases = [
  {
    matchers: ['aiims'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/AIIMS_-New_Delhi%27s_Ward_Block.jpg/640px-AIIMS_-New_Delhi%27s_Ward_Block.jpg',
  },
  {
    matchers: ['christian medical college', 'cmc vellore', 'cmc, vellore'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/CMCH_Vellore.JPG/640px-CMCH_Vellore.JPG',
  },
  {
    matchers: ['jipmer'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/JIPMER.jpg/640px-JIPMER.jpg',
  },
  {
    matchers: ['pgimer', 'pgims'],
    imageUrl: 'https://pgimer.edu.in/PGIMER_PORTAL/PGIMERPORTAL/Images/newslider/5.jpg',
  },
  {
    matchers: ['kasturba medical college', 'kmc manipal', 'kmc mangalore'],
    imageUrl: 'https://www.manipal.edu/content/dam/manipal/mu/default-thumbnail-images/968X328/manipal-building-968x328.jpg',
  },
  {
    matchers: ['institute of medical sciences', 'ims-bhu', 'sir sunderlal', 'sir sundar lal'],
    imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Sir_sundar_lal_hospital.jpg',
  },
  {
    matchers: ['king george medical university', 'kgmu'],
    imageUrl: 'https://www.kgmu.org/img/header-bg-slider-image/2.jpg',
  },
  {
    matchers: ['maulana azad medical college', 'mamc'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Maulana_Azad_Medical_College.jpg/640px-Maulana_Azad_Medical_College.jpg',
  },
  {
    matchers: ['madras medical college'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Mmc-new.jpg/640px-Mmc-new.jpg',
  },
  {
    matchers: ['armed forces medical college', 'afmc'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/AFMC_Main_Building.jpg/640px-AFMC_Main_Building.jpg',
  },
];

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

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

function isNumericToken(value) {
  return /^\d+$/.test(value.replace(/\s+/g, ''));
}

function inferImageUrl(name) {
  const normalized = normalize(name);

  for (const entry of imageAliases) {
    if (entry.matchers.some((matcher) => normalized.includes(matcher))) {
      return entry.imageUrl;
    }
  }

  return null;
}

function parseGovCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rows = [];

  for (const line of lines.slice(1)) {
    const parts = splitCsvLine(line);
    if (parts.length < 5) continue;

    const sno = parts[0];
    const estd = parts.at(-1) ?? '';
    const fees = parts.at(-2) ?? '';
    const state = parts.at(-3) ?? '';
    const name = parts.slice(1, -3).join(', ').trim();
    if (!name) continue;

    rows.push({
      name,
      state,
      city: null,
      fees,
      estd,
      type: 'Government',
      image_url: inferImageUrl(name),
      source_table: 'gov_medical_collage_csv',
      csv_id: sno,
    });
  }

  return rows;
}

function parseDeemedCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rows = [];

  for (const line of lines.slice(1)) {
    const parts = splitCsvLine(line);
    if (parts.length < 4) continue;

    let numericStart = parts.length;
    while (numericStart > 0 && isNumericToken(parts[numericStart - 1])) {
      numericStart -= 1;
    }

    const sno = parts[0];
    const fees = parts.slice(numericStart).join(',');
    const state = parts[numericStart - 1] ?? '';
    const name = parts.slice(1, numericStart - 1).join(', ').trim();
    if (!name) continue;

    rows.push({
      name,
      state,
      city: null,
      fees,
      estd: null,
      type: 'Deemed',
      image_url: inferImageUrl(name),
      source_table: 'deemed_medical_collage_csv',
      csv_id: sno,
    });
  }

  return rows;
}

function parsePrivateCsv(text) {
  const rawLines = text.split(/\r?\n/).map((line) => line.trim());
  const startIndex = rawLines.findIndex((line) => normalize(line).startsWith('state s no college city fees per year'));
  const lines = rawLines.slice(startIndex + 1).filter((line) => line && /[a-z0-9]/i.test(line));
  const rows = [];

  for (const line of lines) {
    const parts = splitCsvLine(line).filter((part, index, array) => part || index < array.length - 1);
    if (parts.length < 5) continue;

    const state = parts[0] || '';
    const sno = parts[1] || '';

    let tailIndex = parts.length - 1;
    let category = 'Private';
    if (parts[tailIndex] && !isNumericToken(parts[tailIndex])) {
      category = parts[tailIndex];
      tailIndex -= 1;
    }

    const feeParts = [];
    while (tailIndex >= 0 && isNumericToken(parts[tailIndex])) {
      feeParts.unshift(parts[tailIndex]);
      tailIndex -= 1;
    }

    const fees = feeParts.join(',');
    const city = parts[tailIndex] ?? '';
    const name = parts.slice(2, tailIndex).join(', ').trim();
    if (!name) continue;

    rows.push({
      name,
      state,
      city,
      fees,
      estd: null,
      type: category || 'Private',
      image_url: inferImageUrl(name),
      source_table: 'private_medical_collage_csv',
      csv_id: sno,
    });
  }

  return rows;
}

async function request(pathname, options = {}) {
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

async function main() {
  const existingCount = await loadExistingCount();
  if (existingCount > 0) {
    throw new Error(`public.colleges already has ${existingCount} rows. Refusing to import duplicates.`);
  }

  const govCsv = await readFile(path.resolve(__dirname, '../Gov-medical-collage.csv'), 'utf8');
  const privateCsv = await readFile(path.resolve(__dirname, '../Private medical collage.csv'), 'utf8');
  const deemedCsv = await readFile(path.resolve(__dirname, '../deemed-medical-collage.csv'), 'utf8');

  const records = [...parseGovCsv(govCsv), ...parsePrivateCsv(privateCsv), ...parseDeemedCsv(deemedCsv)].map(
    ({ csv_id, ...record }) => record,
  );

  const batchSize = 100;
  for (let index = 0; index < records.length; index += batchSize) {
    await insertBatch(records.slice(index, index + batchSize));
  }

  const finalCount = await loadExistingCount();
  console.log(JSON.stringify({ inserted: records.length, finalCount }, null, 2));
}

await main();
