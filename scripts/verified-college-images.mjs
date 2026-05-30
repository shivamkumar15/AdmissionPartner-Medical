function normalizeCollegeName(value) {
  return value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeHostname(value) {
  return value.toLowerCase().replace(/^www\./, '');
}

function getRegistrableDomain(value) {
  const parts = normalizeHostname(value).split('.').filter(Boolean);
  return parts.slice(-2).join('.');
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isTrustedWikimediaUrl(value) {
  const parsedUrl = parseUrl(value);

  if (!parsedUrl) {
    return false;
  }

  const hostname = normalizeHostname(parsedUrl.hostname);
  return hostname === 'commons.wikimedia.org' || hostname === 'upload.wikimedia.org';
}

function isTrustedOfficialUrl(imageUrl, sourcePageUrl) {
  const parsedImageUrl = parseUrl(imageUrl);
  const parsedSourceUrl = parseUrl(sourcePageUrl);

  if (!parsedImageUrl || !parsedSourceUrl) {
    return false;
  }

  return getRegistrableDomain(parsedImageUrl.hostname) === getRegistrableDomain(parsedSourceUrl.hostname);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export const KNOWN_BAD_IMAGE_URLS = new Set([
  'https://en.wikipedia.org/wiki/Special:FilePath/Sir_sundar_lal_hospital.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/AIIMS_-New_Delhi%27s_Ward_Block.jpg/640px-AIIMS_-New_Delhi%27s_Ward_Block.jpg',
  'https://pgimer.edu.in/PGIMER_PORTAL/PGIMERPORTAL/Images/newslider/5.jpg',
]);

export const VERIFIED_COLLEGE_IMAGES = [
  {
    aliases: ['AIIMS New Delhi', 'AIIMS, New Delhi', 'All India Institute of Medical Sciences Delhi', 'All India Institute of Medical Sciences, New Delhi'],
    canonicalName: 'AIIMS New Delhi',
    imageUrl: 'https://www.aiims.edu/images/layerslider/genius/rslide1.jpg',
    sourceKind: 'official',
    sourcePageUrl: 'https://www.aiims.edu/en.html',
  },
  {
    aliases: ['Christian Medical College Vellore', 'Christian Medical College, Vellore', 'Christian Medical College, Vellore, 53,000', 'CMC Vellore'],
    canonicalName: 'Christian Medical College Vellore',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/CMCH_Vellore.JPG',
    sourceKind: 'wikimedia',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:CMCH_Vellore.JPG',
  },
  {
    aliases: ['JIPMER', 'JIPMER Puducherry', 'Jawaharlal Institute of Post Graduate Medical Education and Research', 'Jawaharlal Institute of Post Graduate Medical Education and Research Puducherry'],
    canonicalName: 'JIPMER',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/JIPMER.jpg',
    sourceKind: 'wikimedia',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:JIPMER.jpg',
  },
  {
    aliases: ['PGIMER', 'PGIMER Chandigarh', 'Post Graduate Institute of Medical Education and Research', 'Post Graduate Institute of Medical Education and Research, Chandigarh'],
    canonicalName: 'PGIMER',
    imageUrl: 'https://pgimer.edu.in/PGIMER_PORTAL/PGIMERPORTAL/Images/newslider/1.jpg',
    sourceKind: 'official',
    sourcePageUrl: 'https://pgimer.edu.in/PGIMER_PORTAL/PGIMERPORTAL/home.jsp',
  },
  {
    aliases: ['Kasturba Medical College Manipal', 'Kasturba Medical College, Manipal', 'Kasturba Medical College, Manipal, Karnataka', 'KMC Manipal'],
    canonicalName: 'Kasturba Medical College Manipal',
    imageUrl: 'https://www.manipal.edu/content/dam/manipal/mu/imagesnew/InstituteHome/KMC-Manipal.jpg',
    sourceKind: 'official',
    sourcePageUrl: 'https://www.manipal.edu/kmc-manipal.html',
  },
  {
    aliases: ['Institute of Medical Sciences BHU', 'Institute Of Medical Sciences BHU', 'IMS BHU Varanasi', 'Banaras Hindu University', 'BHU IMS Varanasi'],
    canonicalName: 'Institute of Medical Sciences BHU',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sir%20sundar%20lal%20hospital.jpg',
    sourceKind: 'wikimedia',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Sir_sundar_lal_hospital.jpg',
  },
  {
    aliases: ['King George Medical University', "King George's Medical University", 'King George`s Medical University', 'King George Med Coll. Lucknow', 'KGMU Lucknow'],
    canonicalName: 'King George Medical University',
    imageUrl: 'https://www.kgmu.org/img/header-bg-slider-image/2.jpg',
    sourceKind: 'official',
    sourcePageUrl: 'https://www.kgmu.org/',
  },
  {
    aliases: ['Maulana Azad Medical College', 'Maulana Azad Medical College, New Delhi', 'Maulana Azad MC, New Delhi', 'MAMC Delhi'],
    canonicalName: 'Maulana Azad Medical College',
    imageUrl: 'https://mamc.delhi.gov.in/sites/default/files/drugs/intro/mamc.jpg',
    sourceKind: 'official',
    sourcePageUrl: 'https://mamc.delhi.gov.in/',
  },
  {
    aliases: ['Madras Medical College', 'Madras Medical College Chennai', 'Madras MC, Chennai', 'Madras Medical College and Government General Hospital Chennai'],
    canonicalName: 'Madras Medical College',
    imageUrl: 'https://mmc.tn.gov.in/static/newtheme/assets/images/slider_new01.jpg',
    sourceKind: 'official',
    sourcePageUrl: 'https://mmc.tn.gov.in/',
  },
  {
    aliases: ['Armed Forces Medical College', 'Armed Force Medical College', 'AFMC Pune'],
    canonicalName: 'Armed Forces Medical College',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/AFMC%20Main%20Building.jpg',
    sourceKind: 'wikimedia',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:AFMC_Main_Building.jpg',
  },
  {
    aliases: ['Andhra Medical College', 'Andhra Medical College, Visakhapatnam', 'Andhra MC, Visakhapatnam', 'AMC Visakhapatnam'],
    canonicalName: 'Andhra Medical College',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rajah_of_Panagal_Building,_Andhra_Medical_College.jpg',
    sourceKind: 'wikimedia',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Rajah_of_Panagal_Building,_Andhra_Medical_College.jpg',
  },
  {
    aliases: ['Sri Venkateswara Medical College', 'Sri Venkateswara Medical College Tirupati', 'Sri Venkateswara MC, Tirupati', 'SVMC Tirupati'],
    canonicalName: 'Sri Venkateswara Medical College',
    imageUrl: 'https://svmctpt.edu.in/assets/images/banners/slider-2.jpg',
    sourceKind: 'official',
    sourcePageUrl: 'https://svmctpt.edu.in/',
  },
  {
    aliases: ['Gauhati Medical College and Hospital', 'Gauhati Medical College & Hospital', 'Gauhati Medical College', 'GMCH Guwahati'],
    canonicalName: 'Gauhati Medical College and Hospital',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gauhati_Medical_College_Auditorium.jpg',
    sourceKind: 'wikimedia',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Gauhati_Medical_College_Auditorium.jpg',
  },
  {
    aliases: ['Patna Medical College and Hospital', 'Patna Medical College & Hospital', 'Patna Medical College', 'PMCH Patna'],
    canonicalName: 'Patna Medical College and Hospital',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Patna_medical_college_%26_hospital.jpg',
    sourceKind: 'wikimedia',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Patna_medical_college_%26_hospital.jpg',
  },
  {
    aliases: ['B. J. Medical College, Ahmedabad', 'BJ Medical College Ahmedabad', 'B J Medical College Ahmedabad'],
    canonicalName: 'B. J. Medical College, Ahmedabad',
    imageUrl: 'https://bjmcabd.edu.in/wp-content/uploads/2026/05/image-5-1024x315.jpg',
    sourceKind: 'official',
    sourcePageUrl: 'https://bjmcabd.edu.in/',
  },
  {
    aliases: ['Assam Medical College and Hospital', 'Assam Medical College & Hospital', 'Assam Medical College', 'AMCH Dibrugarh'],
    canonicalName: 'Assam Medical College and Hospital',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Basic_Science_Building_of_AMCH.jpg',
    sourceKind: 'wikimedia',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Basic_Science_Building_of_AMCH.jpg',
  },
  {
    aliases: ['Darbhanga Medical College and Hospital', 'Darbhanga Medical College & Hospital', 'Darbhanga Medical College', 'DMCH Darbhanga'],
    canonicalName: 'Darbhanga Medical College and Hospital',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/D.M.C.H.png',
    sourceKind: 'wikimedia',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:D.M.C.H.png',
  },
  {
    aliases: ['Sri Krishna Medical College and Hospital', 'Sri Krishna Medical College & Hospital', 'Sri Krishna Medical College', 'SKMCH Muzaffarpur'],
    canonicalName: 'Sri Krishna Medical College and Hospital',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sri_Krishna_Medical_College_and_Hospital_Main_Building.jpg',
    sourceKind: 'wikimedia',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Sri_Krishna_Medical_College_and_Hospital_Main_Building.jpg',
  },
  {
    aliases: ['Nalanda Medical College and Hospital', 'Nalanda Medical College & Hospital', 'Nalanda Medical College', 'NMCH Patna'],
    canonicalName: 'Nalanda Medical College and Hospital',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nalanda_Medical_College_and_Hospital.jpg',
    sourceKind: 'wikimedia',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Nalanda_Medical_College_and_Hospital.jpg',
  },
];

function validateEntry(entry) {
  assert(entry.canonicalName, 'Verified image entry is missing canonicalName');
  assert(Array.isArray(entry.aliases) && entry.aliases.length > 0, `Verified image entry ${entry.canonicalName} is missing aliases`);
  assert(entry.imageUrl, `Verified image entry ${entry.canonicalName} is missing imageUrl`);
  assert(entry.sourcePageUrl, `Verified image entry ${entry.canonicalName} is missing sourcePageUrl`);
  assert(entry.sourceKind === 'official' || entry.sourceKind === 'wikimedia', `Verified image entry ${entry.canonicalName} has invalid sourceKind`);

  if (entry.sourceKind === 'wikimedia') {
    assert(isTrustedWikimediaUrl(entry.imageUrl), `Verified image entry ${entry.canonicalName} must use a Wikimedia image URL`);
    assert(isTrustedWikimediaUrl(entry.sourcePageUrl), `Verified image entry ${entry.canonicalName} must use a Wikimedia source page URL`);
  }

  if (entry.sourceKind === 'official') {
    assert(isTrustedOfficialUrl(entry.imageUrl, entry.sourcePageUrl), `Verified image entry ${entry.canonicalName} must use the same official domain for image and source page`);
  }
}

const verifiedImageLookup = new Map();

for (const entry of VERIFIED_COLLEGE_IMAGES) {
  validateEntry(entry);

  for (const alias of entry.aliases) {
    const normalizedAlias = normalizeCollegeName(alias);
    const existingEntry = verifiedImageLookup.get(normalizedAlias);

    assert(!existingEntry || existingEntry.canonicalName === entry.canonicalName, `Duplicate verified image alias detected: ${alias}`);
    verifiedImageLookup.set(normalizedAlias, entry);
  }
}

export function getVerifiedCollegeImageRecord(name) {
  return verifiedImageLookup.get(normalizeCollegeName(name)) ?? null;
}

export { normalizeCollegeName };
