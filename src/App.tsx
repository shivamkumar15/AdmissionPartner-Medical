import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarDays, ExternalLink, Facebook, Home, Info, Instagram, Linkedin, MessageCircle, Quote, Star, X, type LucideIcon } from 'lucide-react';
import { type CSSProperties, type ElementType, type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import logoImage from '../Logo.jpg';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4';
const FADE_DURATION_MS = 500;
const LOOP_RESET_DELAY_MS = 100;
const FADE_OUT_THRESHOLD_SECONDS = 0.55;
const MOTION_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ADMIN_EMAIL = 'kullucobra@gmail.com';
const FEEDBACK_TABLE = 'feedbacks';
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

function getSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment.');
  }

  return {
    key: SUPABASE_PUBLISHABLE_KEY,
    url: SUPABASE_URL,
  };
}

const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;
const TESTIMONIAL_ROTATE_INTERVAL_MS = 3200;
const proxyImage = (url: string) =>
  `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(url)}&w=1200&q=85`;
const wikimediaFile = (fileName: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
const avatarImage = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=101010&color=D7E2EA&bold=true&size=128`;

const marqueeColleges = [
  {
    name: 'AIIMS New Delhi',
    state: 'New Delhi',
    images: [
      'https://www.aiims.edu/images/layerslider/genius/rslide1.jpg',
      'https://www.aiims.edu/images/layerslider/genius/rslide2.jpg',
      'https://www.aiims.edu/images/layerslider/genius/rslide3.jpg',
      'https://www.aiims.edu/images/com_fwgallery/files/806/mid_aiims-entrance.JPG',
    ],
  },
  {
    name: 'Christian Medical College',
    state: 'Vellore',
    images: [
      wikimediaFile('CMCH_Vellore.JPG'),
      wikimediaFile('CMC Main building.jpg'),
      wikimediaFile('CMC Ranipet Panorama.jpg'),
      wikimediaFile('Out Patient Department courtyard.jpg'),
    ],
  },
  {
    name: 'JIPMER',
    state: 'Puducherry',
    images: [
      wikimediaFile('JIPMER.jpg'),
      wikimediaFile('JIPMER admin block.jpg'),
      wikimediaFile('Jipmer entrance moon.jpg'),
      wikimediaFile('New resident doctor hostel complex.jpg'),
    ],
  },
  {
    name: 'PGIMER',
    state: 'Chandigarh',
    images: [
      'https://pgimer.edu.in/PGIMER_PORTAL/PGIMERPORTAL/Images/newslider/1.jpg',
      'https://pgimer.edu.in/PGIMER_PORTAL/PGIMERPORTAL/Images/newslider/2.jpg',
      'https://pgimer.edu.in/PGIMER_PORTAL/PGIMERPORTAL/Images/newslider/3.jpg',
      'https://pgimer.edu.in/PGIMER_PORTAL/PGIMERPORTAL/Images/newslider/4.jpg',
    ],
  },
  {
    name: 'Kasturba Medical College',
    state: 'Manipal',
    images: [
      'https://www.manipal.edu/content/dam/manipal/mu/default-thumbnail-images/968X328/manipal-building-968x328.jpg',
      'https://www.manipal.edu/content/dam/manipal/mu/imagesnew/InstituteHome/KMC-Manipal.jpg',
      'https://www.manipal.edu/content/dam/manipal/mu/imagesnew/InstituteHome/KMC_Manipal_1.jpg',
      'https://www.manipal.edu/content/dam/manipal/mu/kmc-manipal/images/banners/KMC%20MANIPAL%20-%20nirf%20(pc).jpg',
    ],
  },
  {
    name: 'Institute of Medical Sciences',
    state: 'BHU Varanasi',
    images: [
      wikimediaFile('Sir sundar lal hospital.jpg'),
      wikimediaFile('Institute Of Medical Sciences BHU.jpg'),
      wikimediaFile('Institute of Medical Sciences, Banaras Hindu University Logo.png'),
    ],
  },
  {
    name: 'King George Medical University',
    state: 'Lucknow',
    images: [
      'https://www.kgmu.org/img/header-bg-slider-image/2.jpg',
      'https://www.kgmu.org/img/header-bg-slider-image/3.jpg',
      'https://www.kgmu.org/img/header-bg-slider-image/4.jpg',
      'https://www.kgmu.org/img/header-bg-slider-image/5.jpg',
    ],
  },
  {
    name: 'Maulana Azad Medical College',
    state: 'New Delhi',
    images: [
      'https://mamc.delhi.gov.in/sites/default/files/drugs/intro/mamc.jpg',
      wikimediaFile('Maulana_Azad_Medical_College.jpg'),
      'https://mamc.delhi.gov.in/sites/default/files/mamc/logo-new/mamc-logo.png',
      wikimediaFile('Maulana Azad Medical College logo.svg'),
    ],
  },
  {
    name: 'Madras Medical College',
    state: 'Chennai',
    images: [
      'https://mmc.tn.gov.in/static/newtheme/assets/images/slider_new01.jpg',
      'https://mmc.tn.gov.in/static/newtheme/assets/images/slider_new02.jpg',
      'https://mmc.tn.gov.in/media/filer_public/8f/de/8fde2040-f036-42b4-b31e-e0a82bed43f0/mmc_main_load.png',
      wikimediaFile('Mmc-new.jpg'),
    ],
  },
  {
    name: 'Armed Forces Medical College',
    state: 'Pune',
    images: [
      wikimediaFile('AFMC Main Building.jpg'),
      wikimediaFile('Armed Forces Medical College (India) Logo.png'),
      wikimediaFile('Armed Forces Medical College Pune 2012 stamp of India.jpg'),
      wikimediaFile('Dr. A.P.J. Abdul Kalam, Former President of India lighting the lamp at Illuminati 2014.JPG'),
    ],
  },
];

type CollegePreview = {
  images: string[];
  name: string;
  state: string;
};

const getAiimsPreviewImages = (offset: number) => {
  const images = marqueeColleges[0]?.images ?? [];
  return [...images.slice(offset), ...images.slice(0, offset)];
};

const aiimsPreviewColleges: CollegePreview[] = [
  { name: 'AIIMS New Delhi', state: 'New Delhi', images: getAiimsPreviewImages(0) },
  { name: 'AIIMS Bhopal', state: 'Madhya Pradesh', images: getAiimsPreviewImages(1) },
  { name: 'AIIMS Bhubaneswar', state: 'Odisha', images: getAiimsPreviewImages(2) },
  { name: 'AIIMS Jodhpur', state: 'Rajasthan', images: getAiimsPreviewImages(3) },
  { name: 'AIIMS Patna', state: 'Bihar', images: getAiimsPreviewImages(0) },
  { name: 'AIIMS Raipur', state: 'Chhattisgarh', images: getAiimsPreviewImages(1) },
  { name: 'AIIMS Rishikesh', state: 'Uttarakhand', images: getAiimsPreviewImages(2) },
  { name: 'AIIMS Nagpur', state: 'Maharashtra', images: getAiimsPreviewImages(3) },
  { name: 'AIIMS Bathinda', state: 'Punjab', images: getAiimsPreviewImages(0) },
  { name: 'AIIMS Deoghar', state: 'Jharkhand', images: getAiimsPreviewImages(1) },
  { name: 'AIIMS Gorakhpur', state: 'Uttar Pradesh', images: getAiimsPreviewImages(2) },
  { name: 'AIIMS Kalyani', state: 'West Bengal', images: getAiimsPreviewImages(3) },
  { name: 'AIIMS Mangalagiri', state: 'Andhra Pradesh', images: getAiimsPreviewImages(0) },
  { name: 'AIIMS Rae Bareli', state: 'Uttar Pradesh', images: getAiimsPreviewImages(1) },
  { name: 'AIIMS Bibinagar', state: 'Telangana', images: getAiimsPreviewImages(2) },
  { name: 'AIIMS Rajkot', state: 'Gujarat', images: getAiimsPreviewImages(3) },
];

const aboutDecorations = [
  {
    src: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png',
    alt: 'Moon icon',
    className: 'top-[4%] left-[1%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]',
    delay: 0.1,
    x: -80,
  },
  {
    src: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png',
    alt: 'Abstract 3D object',
    className: 'bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]',
    delay: 0.25,
    x: -80,
  },
  {
    src: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png',
    alt: 'Lego icon',
    className: 'top-[4%] right-[1%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]',
    delay: 0.15,
    x: 80,
  },
  {
    src: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png',
    alt: '3D group',
    className: 'bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]',
    delay: 0.3,
    x: 80,
  },
];

const services = [
  {
    number: '01',
    title: 'We provide 24x7 Help and Support to our registered aspirants.',
    description: '',
  },
  {
    number: '02',
    title: 'We provide Online Counselling and support as per your requirement.',
    description: '',
  },
  {
    number: '03',
    title: 'We have a Expert and Experienced team for Medical Counsellors to provide right and authentic information to our students.',
    description: '',
  },
  {
    number: '04',
    title: 'We have a team of professional counsellors and experts to select course, college and right path of admission based on their Entrance Score and their ability.',
    description: '',
  },
  {
    number: '05',
    title: 'We realise the value of your money and hence are cost effective. We diligently guide the students through every step of the admission procedure.',
    description: '',
  },
];

const additionalCollegeImages = [
  {
    name: 'Andhra Medical College',
    images: [
      proxyImage('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Rajah_of_Panagal_Building%2C_Andhra_Medical_College.jpg/640px-Rajah_of_Panagal_Building%2C_Andhra_Medical_College.jpg'),
      wikimediaFile('Rajah_of_Panagal_Building,_Andhra_Medical_College.jpg'),
    ],
  },
  {
    name: 'Sri Venkateswara Medical College',
    images: [
      proxyImage('https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Sri_Venkateswara_Medical_College_Tirupati.jpg/640px-Sri_Venkateswara_Medical_College_Tirupati.jpg'),
      wikimediaFile('Sri_Venkateswara_Medical_College_Tirupati.jpg'),
      proxyImage('https://svmctpt.edu.in/assets/images/banners/slider-2.jpg'),
      'https://svmctpt.edu.in/assets/images/banners/slider-2.jpg',
    ],
  },
  {
    name: 'Gauhati Medical College and Hospital',
    images: [
      proxyImage('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Gauhati_Medical_College_Auditorium.jpg/640px-Gauhati_Medical_College_Auditorium.jpg'),
      wikimediaFile('Gauhati_Medical_College_Auditorium.jpg'),
    ],
  },
  {
    name: 'Patna Medical College and Hospital',
    images: [
      proxyImage('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Patna_medical_college_%26_hospital.jpg/640px-Patna_medical_college_%26_hospital.jpg'),
      wikimediaFile('Patna_medical_college_&_hospital.jpg'),
    ],
  },
  {
    name: 'B. J. Medical College, Ahmedabad',
    images: [
      proxyImage('https://bjmcabd.edu.in/wp-content/uploads/2026/05/image-5-1024x315.jpg'),
      'https://bjmcabd.edu.in/wp-content/uploads/2026/05/image-5-1024x315.jpg',
      proxyImage('https://bjmcabd.edu.in/wp-content/uploads/2026/05/Rectangle-5-1-1024x315.png'),
      'https://bjmcabd.edu.in/wp-content/uploads/2026/05/Rectangle-5-1-1024x315.png',
    ],
  },
  {
    name: 'Sher-e-Kashmir Institute of Medical Sciences',
    images: [
      proxyImage('https://upload.wikimedia.org/wikipedia/en/thumb/6/65/Sher-i-Kashmir_Institute_of_Medical_Sciences_Logo.svg/640px-Sher-i-Kashmir_Institute_of_Medical_Sciences_Logo.svg.png'),
      'https://upload.wikimedia.org/wikipedia/en/thumb/6/65/Sher-i-Kashmir_Institute_of_Medical_Sciences_Logo.svg/640px-Sher-i-Kashmir_Institute_of_Medical_Sciences_Logo.svg.png',
    ],
  },
  {
    name: 'Assam Medical College and Hospital',
    images: [
      proxyImage('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Basic_Science_Building_of_AMCH.jpg/640px-Basic_Science_Building_of_AMCH.jpg'),
      wikimediaFile('Basic_Science_Building_of_AMCH.jpg'),
    ],
  },
  {
    name: 'Darbhanga Medical College and Hospital',
    images: [
      proxyImage('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/D.M.C.H.png/640px-D.M.C.H.png'),
      wikimediaFile('D.M.C.H.png'),
    ],
  },
  {
    name: 'Sri Krishna Medical College and Hospital',
    images: [
      proxyImage('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Sri_Krishna_Medical_College_and_Hospital_Main_Building.jpg/640px-Sri_Krishna_Medical_College_and_Hospital_Main_Building.jpg'),
      wikimediaFile('Sri_Krishna_Medical_College_and_Hospital_Main_Building.jpg'),
    ],
  },
  {
    name: 'Nalanda Medical College and Hospital',
    images: [
      proxyImage('https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Nalanda_Medical_College_and_Hospital.jpg/640px-Nalanda_Medical_College_and_Hospital.jpg'),
      wikimediaFile('Nalanda_Medical_College_and_Hospital.jpg'),
    ],
  },
];

const knownCollegeImages = new Map([...marqueeColleges, ...additionalCollegeImages].map((college) => [normalizeKey(college.name), college.images]));

const blockedCollegeImageUrls = new Set([
  'https://en.wikipedia.org/wiki/Special:FilePath/Sir_sundar_lal_hospital.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/AIIMS_-New_Delhi%27s_Ward_Block.jpg/640px-AIIMS_-New_Delhi%27s_Ward_Block.jpg',
  'https://pgimer.edu.in/PGIMER_PORTAL/PGIMERPORTAL/Images/newslider/5.jpg',
]);

const collegeNameCandidates = ['college', 'collage', 'college_name', 'collage_name', 'name', 'institution', 'title'];
const collegeStateCandidates = ['state', 'location', 'city', 'place'];
const collegeFeeCandidates = ['fees', 'fees_per_year', 'fees per year', 'fee', 'tuition_fee', 'tuition'];
const collegeEstdCandidates = ['estd', 'established', 'establishment_year', 'year'];
const collegeTypeCandidates = ['type', 'category', 'college_type', 'course_type'];
const collegeImageCandidates = ['image', 'image_url', 'imageurl', 'photo', 'photo_url', 'photourl', 'img', 'thumbnail', 'banner'];
const feedbackNameCandidates = ['name', 'student_name', 'full_name', 'username'];
const feedbackRoleCandidates = ['role', 'designation', 'course', 'title'];
const feedbackContentCandidates = ['content', 'feedback', 'message', 'review', 'testimonial', 'quote'];
const feedbackRatingCandidates = ['rating', 'stars', 'score'];
const feedbackAvatarCandidates = ['avatar', 'avatar_url', 'image', 'image_url', 'photo', 'photo_url'];
const feedbackPublishedCandidates = ['is_published', 'published', 'active', 'approved', 'visible'];

type CollegeTableRow = Record<string, unknown>;
type FeedbackRow = Record<string, unknown>;

type CollageCollege = {
  fees: string;
  id: string;
  imageSources: string[];
  name: string;
  sourceTable: string;
  state: string;
  type: string;
  year: string;
};

type FadeInProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
};

type AppointmentFormState = {
  email: string;
  fullName: string;
  message: string;
  phone: string;
  preferredDate: string;
};

type FeedbackFormState = {
  content: string;
  name: string;
  rating: number;
  role: string;
};

type AppointmentRow = {
  admin_email?: string;
  created_at?: string;
  email?: string;
  full_name?: string;
  id?: number | string;
  message?: string;
  phone?: string;
  preferred_date?: string;
};

type CollegeAdminRow = {
  city?: string;
  estd?: string;
  fees?: string;
  id: number | string;
  image_url?: string;
  name?: string;
  source_table?: string;
  state?: string;
  type?: string;
};

type FeedbackAdminRow = {
  avatar_url?: string;
  content?: string;
  created_at?: string;
  id: number | string;
  is_published?: boolean | string;
  name?: string;
  rating?: number | string;
  role?: string;
};

type NavMenuItem = {
  href: string;
  icon: LucideIcon;
  title: string;
  gradientFrom: string;
  gradientTo: string;
};

type StudentTestimonial = {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
};

const mainNavItems: NavMenuItem[] = [
  { title: 'Home', href: '/', icon: Home, gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
  { title: 'About', href: '/#jack-about', icon: Info, gradientFrom: '#56CCF2', gradientTo: '#2F80ED' },
  { title: 'Collage', href: '/collage', icon: BookOpen, gradientFrom: '#FF9966', gradientTo: '#FF5E62' },
  { title: 'Book', href: '/book-appointment', icon: CalendarDays, gradientFrom: '#80FF72', gradientTo: '#7EE8FA' },
];

const studentTestimonials: StudentTestimonial[] = [
  {
    id: 1,
    name: 'Vikas Kumar',
    role: 'Student',
    content: 'This website is very helpful and its counselors helped me a lot and now I am studying from one of the top engineering college in Chhattisgarh. Thank you.',
    rating: 5,
    avatar: avatarImage('Vikas Kumar'),
  },
  {
    id: 2,
    name: 'Anmol Pathak',
    role: 'Student',
    content: 'It is the best for student guidance. Raashid Sir not only guides students well, but also understands their feelings and helps them get admission in the best possible college.',
    rating: 5,
    avatar: avatarImage('Anmol Pathak'),
  },
  {
    id: 3,
    name: 'Md Zawed Alam',
    role: 'Student',
    content: 'They are very professional, friendly, helpful and explained all the details that I needed. I would strongly recommend their service and their consultancy in Patna.',
    rating: 5,
    avatar: avatarImage('Md Zawed Alam'),
  },
  {
    id: 4,
    name: 'Dip Roy',
    role: 'Student',
    content: 'Admission Partner helped me a lot in my counselling process. I got the best college for my profile with their support.',
    rating: 5,
    avatar: avatarImage('Dip Roy'),
  },
  {
    id: 5,
    name: 'Arnab',
    role: 'Student',
    content: 'My personal experience was good. My guide helped me a lot, picked my calls without hesitation and solved every issue with full transparency.',
    rating: 5,
    avatar: avatarImage('Arnab'),
  },
];

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function valueToString(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function valueToBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }

  const normalizedValue = valueToString(value).toLowerCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (['true', '1', 'yes', 'y'].includes(normalizedValue)) {
    return true;
  }

  if (['false', '0', 'no', 'n'].includes(normalizedValue)) {
    return false;
  }

  return undefined;
}

function valueToNumber(value: unknown, fallback: number) {
  const numericValue = Number.parseInt(valueToString(value), 10);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}


function pickRowValue(row: Record<string, unknown>, candidates: string[], fuzzy = true) {
  const entries = Object.entries(row);
  const normalizedCandidates = candidates.map(normalizeKey);

  for (const [key, value] of entries) {
    if (!valueToString(value)) {
      continue;
    }

    if (normalizedCandidates.includes(normalizeKey(key))) {
      return value;
    }
  }

  if (fuzzy) {
    for (const [key, value] of entries) {
      if (!valueToString(value)) {
        continue;
      }

      const normalizedKey = normalizeKey(key);

      if (normalizedCandidates.some((candidate) => normalizedKey.includes(candidate) || candidate.includes(normalizedKey))) {
        return value;
      }
    }
  }

  return undefined;
}

function imageCandidatesFromValue(value: unknown) {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.startsWith('http'));
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.startsWith('http'));
  }

  return [];
}

function sanitizeCollegeImageUrls(images: string[]) {
  return [...new Set(images.map((image) => image.trim()).filter((image) => image.startsWith('http') && !blockedCollegeImageUrls.has(image)))];
}

function fallbackImagesForCollege(name: string) {
  const normalizedName = normalizeKey(name);

  return sanitizeCollegeImageUrls(knownCollegeImages.get(normalizedName) ?? []);
}

function mapCollegeRow(row: CollegeTableRow, sourceTable: string, index: number): CollageCollege | null {
  const name = valueToString(pickRowValue(row, collegeNameCandidates));

  if (!name) {
    return null;
  }

  const directImages = sanitizeCollegeImageUrls(collegeImageCandidates.flatMap((candidate) => imageCandidatesFromValue(pickRowValue(row, [candidate]))));
  const imageSources = [...new Set([...directImages, ...fallbackImagesForCollege(name)])];
  const state = valueToString(pickRowValue(row, collegeStateCandidates, false)) || 'India';
  const fees = valueToString(pickRowValue(row, collegeFeeCandidates));
  const year = valueToString(pickRowValue(row, collegeEstdCandidates));
  const type = valueToString(pickRowValue(row, collegeTypeCandidates));
  const explicitId = valueToString(row.id ?? row.ID ?? row.Id ?? row['S.no'] ?? row.s_no ?? row.sno);

  return {
    fees,
    id: explicitId || `${sourceTable}-${index}-${normalizeKey(name)}`,
    imageSources,
    name,
    sourceTable,
    state,
    type,
    year,
  };
}

async function fetchColleges() {
  const { key, url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/colleges?select=id,name,state,city,fees,estd,type,image_url,source_table&order=id.asc&limit=1000`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load colleges: ${response.status}`);
  }

  const json = (await response.json()) as unknown;

  return Array.isArray(json) ? (json as CollegeTableRow[]) : [];
}

function mapFeedbackRow(row: FeedbackRow, index: number): StudentTestimonial | null {
  const publishedValue = pickRowValue(row, feedbackPublishedCandidates, false);
  const isPublished = valueToBoolean(publishedValue);

  if (isPublished === false) {
    return null;
  }

  const name = valueToString(pickRowValue(row, feedbackNameCandidates));
  const content = valueToString(pickRowValue(row, feedbackContentCandidates));

  if (!name || !content) {
    return null;
  }

  const role = valueToString(pickRowValue(row, feedbackRoleCandidates));
  const avatar = valueToString(pickRowValue(row, feedbackAvatarCandidates, false));

  return {
    id: valueToNumber(row.id ?? row.feedback_id ?? row.created_at ?? index + 1, index + 1),
    name,
    role: role || 'Student',
    content,
    rating: Math.max(1, Math.min(5, valueToNumber(pickRowValue(row, feedbackRatingCandidates, false), 5))),
    avatar: avatar || avatarImage(name),
  };
}

async function fetchPublishedFeedbacks() {
  const { key, url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${FEEDBACK_TABLE}?select=*&is_published=eq.true&order=created_at.desc`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (response.status === 404 || response.status === 400) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Failed to load feedbacks: ${response.status}`);
  }

  const json = (await response.json()) as unknown;
  return Array.isArray(json) ? (json as FeedbackRow[]) : [];
}

async function fetchAdminFeedbacks() {
  const { key, url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${FEEDBACK_TABLE}?select=*&order=created_at.desc`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (response.status === 404 || response.status === 400) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Failed to load admin feedbacks: ${response.status}`);
  }

  const json = (await response.json()) as unknown;
  return Array.isArray(json) ? (json as FeedbackAdminRow[]) : [];
}

async function createFeedbackSubmission(form: FeedbackFormState) {
  const { key, url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${FEEDBACK_TABLE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      name: form.name,
      role: form.role,
      content: form.content,
      rating: form.rating,
      avatar_url: avatarImage(form.name),
      is_published: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit feedback: ${response.status}`);
  }

  return response.json();
}

async function updateFeedbackApproval(id: string, isPublished: boolean) {
  const { key, url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${FEEDBACK_TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ is_published: isPublished }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update feedback ${id}: ${response.status}`);
  }

  const json = (await response.json()) as unknown;
  if (Array.isArray(json) && json[0]) {
    return json[0] as FeedbackAdminRow;
  }

  return null;
}

async function createAppointment(form: AppointmentFormState) {
  const { key, url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      full_name: form.fullName,
      email: form.email,
      phone: form.phone,
      preferred_date: form.preferredDate,
      message: form.message,
      admin_email: ADMIN_EMAIL,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create appointment: ${response.status}`);
  }

  return response.json();
}

async function fetchAppointments() {
  const { key, url } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/appointments?select=id,full_name,email,phone,preferred_date,message,created_at,admin_email&order=created_at.desc`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to load appointments: ${response.status}`);
  }

  const json = (await response.json()) as unknown;
  return Array.isArray(json) ? (json as AppointmentRow[]) : [];
}

async function fetchAdminColleges() {
  const { key, url } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/colleges?select=id,name,state,city,fees,estd,type,image_url,source_table&order=id.asc&limit=1000`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to load colleges for admin: ${response.status}`);
  }

  const json = (await response.json()) as unknown;
  return Array.isArray(json) ? (json as CollegeAdminRow[]) : [];
}

async function updateCollegeById(college: CollegeAdminRow) {
  const { key, url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/colleges?id=eq.${encodeURIComponent(String(college.id))}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      name: college.name ?? '',
      state: college.state ?? '',
      city: college.city ?? '',
      fees: college.fees ?? '',
      estd: college.estd ?? '',
      type: college.type ?? '',
      image_url: college.image_url ?? '',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update college ${college.id}: ${response.status}`);
  }

  const json = (await response.json()) as unknown;
  if (Array.isArray(json) && json[0]) {
    return json[0] as CollegeAdminRow;
  }

  return college;
}

async function signInAdminWithGoogle() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment.');
  }

  const redirectTo = `${window.location.origin}/admin`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) {
    throw error;
  }
}

async function signOutAdmin() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment.');
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

function FadeIn({
  as = 'div',
  children,
  className,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
}: FadeInProps) {
  const MotionComponent = useMemo(() => motion.create(as), [as]);

  return (
    <MotionComponent
      className={className}
      initial={{ opacity: 0, x, y }}
      transition={{ duration, delay, ease: MOTION_EASE }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
    >
      {children}
    </MotionComponent>
  );
}

function ContactButton() {
  return (
    <a
      className="inline-flex rounded-full border-2 border-white px-8 py-3 text-xs font-medium uppercase tracking-[0.28em] text-white outline outline-2 outline-white outline-offset-[-3px] transition-opacity duration-200 hover:opacity-90 sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base"
      href="mailto:jack@example.com"
      style={{
        background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
        boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
      }}
    >
      Contact Us
    </a>
  );
}

function GradientNavMenu({ items }: { items: NavMenuItem[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {items.map(({ href, icon: Icon, title, gradientFrom, gradientTo }) => (
        <li
          key={title}
          style={{ '--gradient-from': gradientFrom, '--gradient-to': gradientTo } as CSSProperties}
          className="group relative h-[56px] w-[56px] cursor-pointer rounded-full bg-white shadow-lg transition-all duration-500 hover:w-[168px] hover:shadow-none"
        >
          <a className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full" href={href}>
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100" />
            <span className="absolute inset-x-0 top-[10px] h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 blur-[15px] transition-all duration-500 group-hover:opacity-50" />
            <span className="relative z-10 transition-all duration-500 group-hover:scale-0">
              <Icon className="h-5 w-5 text-gray-500 transition-colors duration-500 group-hover:text-white" />
            </span>
            <span className="absolute z-10 scale-0 text-xs font-semibold uppercase tracking-[0.26em] text-white transition-all duration-500 group-hover:scale-100 sm:text-sm">
              {title}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function AnimatedCharacter({
  character,
  end,
  progress,
  start,
}: {
  character: string;
  end: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  start: number;
}) {
  const opacity = useTransform(progress, [start, end], [0.2, 1]);

  return (
    <span className="relative inline-block">
      <span className="invisible">{character === ' ' ? '\u00A0' : character}</span>
      <motion.span className="absolute left-0 top-0" style={{ opacity }}>
        {character === ' ' ? '\u00A0' : character}
      </motion.span>
    </span>
  );
}

function AnimatedText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });
  const characters = Array.from(text);

  return (
    <p
      ref={ref}
      className="mx-auto max-w-[1000px] text-center text-[clamp(1rem,2vw,1.35rem)] font-medium leading-relaxed text-[#D7E2EA]"
    >
      {characters.map((character, index) => {
        const start = index / characters.length;
        const end = (index + 1) / characters.length;

        return (
          <AnimatedCharacter
            key={`${character}-${index}`}
            character={character}
            end={end}
            progress={scrollYProgress}
            start={start}
          />
        );
      })}
    </p>
  );
}

function CollegeImage({ images, name }: { images: string[]; name: string }) {
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <img
      alt={name}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
      onError={() => {
        setImageIndex((currentIndex) => (currentIndex < images.length - 1 ? currentIndex + 1 : currentIndex));
      }}
      src={images[imageIndex]}
    />
  );
}

function CollegePreviewImage({ alt, className, images }: { alt: string; className: string; images: string[] }) {
  const [imageIndex, setImageIndex] = useState(0);
  const source = images[imageIndex] ?? images[0] ?? '';

  return (
    <img
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        setImageIndex((currentIndex) => (currentIndex < images.length - 1 ? currentIndex + 1 : currentIndex));
      }}
      src={source}
    />
  );
}

function CollegeDetailsModal({ college, onClose }: { college: CollageCollege; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/10 bg-[#111111] p-5 text-[#D7E2EA] shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:p-8"
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          onClick={(event) => event.stopPropagation()}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <button
            aria-label="Close college details"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div>
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
                {college.imageSources.length ? (
                  <img alt={college.name} className="h-[280px] w-full object-cover sm:h-[360px]" src={college.imageSources[0]} />
                ) : (
                  <div className="flex h-[280px] items-center justify-center bg-[radial-gradient(circle,rgba(255,255,255,0.12),rgba(255,255,255,0.04)_55%,transparent_100%)] px-6 text-center text-sm uppercase tracking-[0.24em] text-white/50 sm:h-[360px]">
                    Photo unavailable
                  </div>
                )}
              </div>

            </div>

            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">{college.sourceTable}</p>
                <h2 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-black leading-[0.95] text-white">{college.name}</h2>
                <p className="mt-3 text-sm uppercase tracking-[0.24em] text-white/60">{college.state}</p>
              </div>

              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                Review the available quick facts for this college before moving ahead with counselling, shortlist planning, and admission guidance.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Fees</p>
                  <p className="mt-2 text-base font-semibold text-white">{college.fees || 'Not available'}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Established</p>
                  <p className="mt-2 text-base font-semibold text-white">{college.year || 'Not available'}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Type</p>
                  <p className="mt-2 text-base font-semibold text-white">{college.type || 'Not available'}</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Admission Partner Note</p>
                <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                  Use this profile as a quick reference for comparing location, fee level, establishment year, and available college visuals. Contact Admission Partner for counselling support and a deeper eligibility review for this college.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#0C0C0C] transition-opacity hover:opacity-90"
                  href="/book-appointment"
                >
                  Book Counselling
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
                  href={`/collage?search=${encodeURIComponent(college.name)}`}
                >
                  Focus This College
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CinematicHeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);
  const restartTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    const cancelFade = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    const fadeTo = (targetOpacity: number, duration: number, onComplete?: () => void) => {
      cancelFade();

      const startOpacity = Number.parseFloat(video.style.opacity || '0');
      const startTime = performance.now();

      const step = (timestamp: number) => {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const nextOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
        video.style.opacity = String(nextOpacity);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
          return;
        }

        animationFrameRef.current = null;
        video.style.opacity = String(targetOpacity);
        onComplete?.();
      };

      animationFrameRef.current = requestAnimationFrame(step);
    };

    const playAndFadeIn = async () => {
      fadingOutRef.current = false;

      try {
        await video.play();
      } catch {
        return;
      }

      fadeTo(1, FADE_DURATION_MS);
    };

    const handleLoadedData = () => {
      video.style.opacity = video.style.opacity || '0';
      void playAndFadeIn();
    };

    const handleTimeUpdate = () => {
      const remainingTime = video.duration - video.currentTime;

      if (!Number.isFinite(remainingTime) || remainingTime > FADE_OUT_THRESHOLD_SECONDS) {
        return;
      }

      if (fadingOutRef.current) {
        return;
      }

      fadingOutRef.current = true;
      fadeTo(0, FADE_DURATION_MS);
    };

    const handleEnded = () => {
      cancelFade();
      video.style.opacity = '0';

      restartTimeoutRef.current = window.setTimeout(() => {
        video.currentTime = 0;
        void playAndFadeIn();
      }, LOOP_RESET_DELAY_MS);
    };

    video.style.opacity = '0';
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      handleLoadedData();
    }

    return () => {
      cancelFade();

      if (restartTimeoutRef.current !== null) {
        window.clearTimeout(restartTimeoutRef.current);
      }

      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        className="absolute inset-0 h-full w-full translate-y-[17%] object-cover"
        muted
        playsInline
        preload="metadata"
        src={VIDEO_URL}
        style={{ willChange: 'opacity, transform' }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_44%),linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.12))]" />

      <div className="relative flex min-h-screen flex-col">
        <nav className="relative z-20 px-6 py-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 rounded-[32px] px-4 py-3 md:flex-row md:justify-between md:px-6">
            <a className="flex items-center gap-3 text-lg font-semibold text-white" href="#">
              <img alt="Admission Partner logo" className="h-11 w-11 rounded-full object-cover" src={logoImage} />
              <span>Admission Partner</span>
            </a>

            <div className="hidden md:block">
              <GradientNavMenu items={mainNavItems} />
            </div>

            <div className="flex md:hidden">
              <GradientNavMenu items={mainNavItems.slice(1)} />
            </div>
          </div>
        </nav>

        <main className="relative z-10 flex flex-1 -translate-y-[20%] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[720px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),rgba(255,255,255,0.08)_38%,transparent_72%)] blur-3xl" />

          <h1
            className="relative mb-8 whitespace-nowrap text-5xl tracking-tight text-white md:text-6xl lg:text-7xl"
            style={{
              fontFamily: "'Instrument Serif', serif",
              textShadow: '0 4px 18px rgba(0, 0, 0, 0.3), 0 0 28px rgba(255, 255, 255, 0.16)',
            }}
          >
            Admission Partner
          </h1>

          <div className="relative w-full max-w-xl space-y-4">
            <form
              className="liquid-glass relative z-20 flex items-center gap-3 rounded-full py-2 pl-6 pr-2 shadow-[0_0_30px_rgba(255,255,255,0.08)]"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/40"
                placeholder="Enter your email"
                type="email"
              />
              <button aria-label="Submit email" className="rounded-full bg-white p-3 text-black" type="submit">
                <ArrowRight size={20} />
              </button>
            </form>

            <p className="px-4 text-sm leading-relaxed text-white" style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.28)' }}>
              Expert counselling for MBBS admissions in top medical colleges with complete support for counselling, documentation, and career guidance.</p>

            <div className="flex justify-center">
              <button
                className="liquid-glass rounded-full px-8 py-3 text-sm font-medium text-white shadow-[0_0_26px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/5"
                type="button"
              >
                Talk to MBBS Expert
              </button>
            </div>
          </div>
        </main>

        <footer className="relative z-10 flex flex-wrap justify-center gap-4 px-6 pb-12">
          <a
            aria-label="WhatsApp"
            className="rounded-full border border-white/15 bg-black/20 p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
            href="https://wa.me/919540108254"
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle size={20} />
          </a>
          <a
            aria-label="Instagram"
            className="rounded-full border border-white/15 bg-black/20 p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
            href="https://www.instagram.com/admissionpartner"
            rel="noreferrer"
            target="_blank"
          >
            <Instagram size={20} />
          </a>
          <a
            aria-label="Facebook"
            className="rounded-full border border-white/15 bg-black/20 p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
            href="https://www.facebook.com/admissionpartnr/"
            rel="noreferrer"
            target="_blank"
          >
            <Facebook size={20} />
          </a>
          <a
            aria-label="LinkedIn"
            className="rounded-full border border-white/15 bg-black/20 p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
            href="https://www.linkedin.com/company/admission-partner/about/"
            rel="noreferrer"
            target="_blank"
          >
            <Linkedin size={20} />
          </a>
        </footer>
      </div>
    </section>
  );
}

function MarqueeRow({
  colleges,
  direction,
}: {
  colleges: CollegePreview[];
  direction: 'left' | 'right';
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(200);
  const repeatedColleges = useMemo(() => [...colleges, ...colleges, ...colleges], [colleges]);

  useEffect(() => {
    const updateOffset = () => {
      const sectionTop = sectionRef.current?.offsetTop ?? 0;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    };

    updateOffset();
    window.addEventListener('scroll', updateOffset, { passive: true });
    window.addEventListener('resize', updateOffset, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateOffset);
      window.removeEventListener('resize', updateOffset);
    };
  }, []);

  const translateX = direction === 'right' ? offset - 200 : -(offset - 200);

  return (
    <div ref={sectionRef} className="overflow-hidden">
      <div className="flex w-max gap-3" style={{ transform: `translateX(${translateX}px)`, willChange: 'transform' }}>
        {repeatedColleges.map((college, index) => (
          <article key={`${direction}-${college.name}-${index}`} className="group relative h-[270px] w-[420px] overflow-hidden rounded-2xl">
            <CollegeImage images={college.images} name={college.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <p className="text-xl font-semibold leading-tight">{college.name}</p>
              <p className="mt-1 text-sm text-white/75">{college.state}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MarqueeSection() {
  return (
    <section className="portfolio-shell bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40">
      <div className="flex flex-col gap-3">
        <MarqueeRow colleges={marqueeColleges.slice(0, 5)} direction="right" />
        <MarqueeRow colleges={marqueeColleges.slice(5)} direction="left" />
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section
      id="jack-about"
      className="portfolio-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0C0C0C] px-5 py-20 sm:px-8 md:px-10"
    >
      {aboutDecorations.map((item) => (
        <FadeIn key={item.src} className={`absolute ${item.className}`} delay={item.delay} duration={0.9} x={item.x} y={0}>
          <img alt={item.alt} className="w-full object-contain" loading="lazy" src={item.src} />
        </FadeIn>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
        <FadeIn delay={0} y={40}>
          <h2 className="hero-heading text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight">
            About Us
          </h2>
        </FadeIn>

        <div className="flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
          <AnimatedText text="Admission Partner, an initiative of ONETEN ADMISSION PARTNER LLP, has been guiding medical aspirants since 2009. We specialize in MBBS admissions across India and abroad, helping students secure seats in reputed medical colleges through expert counselling and transparent guidance.

With partnerships across 500+ recognized institutions and a track record of 8000+ successful admissions, we provide complete support for NEET counselling, college selection, documentation, and education loan assistance — all under one platform.

 Our goal is simple:helping future doctors choose the right medical             college with confidence.

" />
          <ContactButton />
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section
      id="jack-services"
      className="portfolio-shell rounded-t-[40px] bg-white px-5 py-20 text-[#0C0C0C] sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <FadeIn delay={0} y={40}>
        <h2 className="mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28">
          Why Choose Us
        </h2>
      </FadeIn>

      <div className="mx-auto max-w-5xl">
        {services.map((service, index) => (
          <FadeIn key={service.number} delay={index * 0.1} y={30}>
            <div className="flex flex-col gap-6 border-t border-[rgba(12,12,12,0.15)] py-8 sm:flex-row sm:gap-10 sm:py-10 md:gap-14 md:py-12">
              <div className="text-[clamp(3rem,10vw,140px)] font-black leading-none text-[#0C0C0C]">{service.number}</div>
              <div className="flex flex-1 flex-col gap-3 pt-2 sm:pt-4">
                <h3 className="text-[clamp(1rem,2.2vw,2.1rem)] font-medium uppercase">{service.title}</h3>
                <p className="max-w-2xl text-[clamp(0.85rem,1.6vw,1.25rem)] font-light leading-relaxed opacity-60">
                  {service.description}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<StudentTestimonial[]>(studentTestimonials);
  const [feedbackMode, setFeedbackMode] = useState<'live' | 'fallback'>('fallback');
  const [form, setForm] = useState<FeedbackFormState>({
    name: '',
    role: 'Student',
    rating: 5,
    content: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const activeTestimonial = testimonials[activeIndex] ?? studentTestimonials[0];

  const onFormChange = (key: keyof FeedbackFormState, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onSubmitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await createFeedbackSubmission(form);
      setSubmitSuccess('Feedback submitted successfully. It will appear after admin approval.');
      setForm({ name: '', role: 'Student', rating: 5, content: '' });
    } catch (submitFeedbackError) {
      setSubmitError(submitFeedbackError instanceof Error ? submitFeedbackError.message : 'Failed to submit feedback.');
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadFeedbacks = async () => {
      try {
        const rows = await fetchPublishedFeedbacks();

        if (!mounted) {
          return;
        }

        const mappedTestimonials = rows
          .map((row, index) => ({
            testimonial: mapFeedbackRow(row, index),
            createdAt: valueToString(row.created_at),
          }))
          .filter((entry): entry is { createdAt: string; testimonial: StudentTestimonial } => entry.testimonial !== null)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
          .map((entry) => entry.testimonial);

        if (mappedTestimonials.length > 0) {
          setTestimonials(mappedTestimonials);
          setFeedbackMode('live');
          return;
        }

        setTestimonials(studentTestimonials);
        setFeedbackMode('fallback');
      } catch {
        if (!mounted) {
          return;
        }

        setTestimonials(studentTestimonials);
        setFeedbackMode('fallback');
      }
    };

    void loadFeedbacks();

    const channel = supabase
      ?.channel('homepage-feedbacks')
      .on('postgres_changes', { event: '*', schema: 'public', table: FEEDBACK_TABLE }, () => {
        void loadFeedbacks();
      })
      .subscribe();

    return () => {
      mounted = false;
      if (channel) {
        void supabase?.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    if (activeIndex < testimonials.length) {
      return;
    }

    setActiveIndex(0);
  }, [activeIndex, testimonials.length]);

  useEffect(() => {
    if (testimonials.length <= 1) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, TESTIMONIAL_ROTATE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section id="testimonials" className="portfolio-shell overflow-hidden bg-[#F5F5F1] px-5 py-20 text-[#0C0C0C] sm:px-8 sm:py-24 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-6xl items-start gap-12 md:grid-cols-[0.82fr_1.18fr] md:gap-16 lg:gap-20">
        <FadeIn y={40}>
          <div className="flex h-full flex-col gap-8 md:max-w-[420px]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0C0C0C]/5 px-4 py-2 text-sm font-medium text-[#6F3DFF]">
                <Star className="h-4 w-4 fill-current" />
                <span>{feedbackMode === 'live' ? 'Live student feedback' : 'Trusted by students'}</span>
              </div>

              <h2 className="text-[clamp(2.4rem,5.6vw,4.75rem)] font-black leading-[0.92] tracking-tight">Our Students Say</h2>

              <p className="max-w-[560px] text-base leading-relaxed text-[#0C0C0C]/65 sm:text-lg">
                {feedbackMode === 'live'
                  ? 'Fresh feedback from Supabase updates automatically on this page whenever a new review is added.'
                  : 'Real feedback from students who used Admission Partner for counselling, college selection, and admission support.'}
              </p>

              <div className="flex items-center gap-3 pt-4">
                {testimonials.map((testimonial, index) => (
                  <button
                    key={testimonial.id}
                    aria-label={`View testimonial ${index + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${activeIndex === index ? 'w-10 bg-[#6F3DFF]' : 'w-2.5 bg-[#0C0C0C]/20'}`}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <button
                className="rounded-full bg-[#0C0C0C] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#6F3DFF]"
                onClick={() => setIsFeedbackFormOpen((current) => !current)}
                type="button"
              >
                Give your feedback
              </button>

              {isFeedbackFormOpen ? (
                <form className="grid gap-4 rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_12px_40px_rgba(12,12,12,0.06)] sm:p-6" onSubmit={onSubmitFeedback}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#0C0C0C]/45">Share feedback</p>
                    <h3 className="mt-2 text-xl font-semibold text-[#0C0C0C]">Add your review</h3>
                  </div>

                  <input
                    required
                    className="rounded-2xl border border-black/10 bg-[#F5F5F1] px-4 py-3 text-sm text-[#0C0C0C] outline-none placeholder:text-[#0C0C0C]/35 focus:border-[#6F3DFF]/40"
                    onChange={(event) => onFormChange('name', event.target.value)}
                    placeholder="Your name"
                    type="text"
                    value={form.name}
                  />

                  <input
                    required
                    className="rounded-2xl border border-black/10 bg-[#F5F5F1] px-4 py-3 text-sm text-[#0C0C0C] outline-none placeholder:text-[#0C0C0C]/35 focus:border-[#6F3DFF]/40"
                    onChange={(event) => onFormChange('role', event.target.value)}
                    placeholder="Role or course"
                    type="text"
                    value={form.role}
                  />

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((ratingValue) => (
                      <button
                        key={ratingValue}
                        className="rounded-full p-1 text-[#0C0C0C]/20 transition-colors hover:text-[#F5B700]"
                        onClick={() => onFormChange('rating', ratingValue)}
                        type="button"
                      >
                        <Star className={`h-6 w-6 ${ratingValue <= form.rating ? 'fill-[#F5B700] text-[#F5B700]' : 'text-[#0C0C0C]/20'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-[#0C0C0C]/55">{form.rating}/5</span>
                  </div>

                  <textarea
                    required
                    className="min-h-28 rounded-2xl border border-black/10 bg-[#F5F5F1] px-4 py-3 text-sm text-[#0C0C0C] outline-none placeholder:text-[#0C0C0C]/35 focus:border-[#6F3DFF]/40"
                    onChange={(event) => onFormChange('content', event.target.value)}
                    placeholder="Write your feedback"
                    value={form.content}
                  />

                  {submitError ? <p className="text-sm text-rose-500">{submitError}</p> : null}
                  {submitSuccess ? <p className="text-sm text-emerald-600">{submitSuccess}</p> : null}

                  <button
                    className="rounded-full bg-[#0C0C0C] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#6F3DFF] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={submitLoading}
                    type="submit"
                  >
                    {submitLoading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} y={40}>
          <div className="relative mx-auto w-full max-w-[720px] pb-4 pl-4 pr-4 pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial.id}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -70, scale: 0.96 }}
                initial={{ opacity: 0, x: 70, scale: 0.96 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <div className="flex flex-col rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_20px_70px_rgba(12,12,12,0.08)] sm:p-8 md:p-10">
                  <div className="mb-5 flex gap-2">
                    {Array.from({ length: activeTestimonial.rating }).map((_, starIndex) => (
                      <Star key={`${activeTestimonial.id}-${starIndex}`} className="h-5 w-5 fill-[#F5B700] text-[#F5B700]" />
                    ))}
                  </div>

                  <div className="relative mb-6 pr-0 sm:pr-4">
                    <Quote className="absolute left-0 top-0 h-8 w-8 rotate-180 text-[#0C0C0C]/16 sm:h-9 sm:w-9" />
                    <p className="relative z-10 pl-8 pt-1 text-base font-medium leading-relaxed text-[#0C0C0C] sm:pl-10 sm:text-lg md:text-[1.08rem]">
                      &quot;{activeTestimonial.content}&quot;
                    </p>
                  </div>

                  <div className="my-4 h-px w-full bg-black/10" />

                  <div className="flex items-center gap-4">
                    <img alt={activeTestimonial.name} className="h-12 w-12 rounded-full border border-black/10 object-cover" src={activeTestimonial.avatar} />
                    <div>
                      <h3 className="font-semibold text-[#0C0C0C]">{activeTestimonial.name}</h3>
                      <p className="text-sm text-[#0C0C0C]/55">{activeTestimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-0 left-0 h-16 w-16 rounded-[20px] bg-[#6F3DFF]/7 sm:h-20 sm:w-20 sm:rounded-[24px]" />
            <div className="absolute right-0 top-0 h-16 w-16 rounded-[20px] bg-[#6F3DFF]/7 sm:h-20 sm:w-20 sm:rounded-[24px]" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function TopCollegeCard({
  college,
  index,
  totalCards,
}: {
  college: CollegePreview;
  index: number;
  totalCards: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);
  const uniqueImages = [...new Set(college.images)].filter(Boolean);
  const imageA = [uniqueImages[0]];
  const imageB = [uniqueImages[1], uniqueImages[2], uniqueImages[0]].filter(Boolean);
  const imageC = [uniqueImages[2], uniqueImages[1], uniqueImages[0]].filter(Boolean);

  return (
    <div ref={containerRef} className="relative h-[85vh]">
      <motion.article
        className="sticky top-24 rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:rounded-[50px] sm:p-6 md:top-32 md:rounded-[60px] md:p-8"
        style={{ scale, marginTop: `${index * 28}px` }}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="pt-2 sm:pt-4">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#D7E2EA]/70 sm:text-sm">Medical College</p>
              <h3 className="mt-3 text-[clamp(1.5rem,3vw,3.4rem)] font-medium uppercase leading-none text-[#D7E2EA]">
                {college.name}
              </h3>
              <p className="mt-3 text-sm uppercase tracking-[0.22em] text-[#D7E2EA]/65">{college.state}</p>
            </div>

            <div className="self-start lg:pt-4">
              <a
                className="inline-flex rounded-full border-2 border-[#D7E2EA] px-8 py-3 text-sm font-medium uppercase tracking-[0.28em] text-[#D7E2EA] transition-colors hover:bg-[#D7E2EA]/10 sm:px-10 sm:py-3.5 sm:text-base"
                href={`/collage?search=${encodeURIComponent(college.name)}`}
              >
                View Details
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[0.4fr_0.6fr] md:gap-6">
            <div className="flex flex-col gap-4 md:gap-6">
              <CollegePreviewImage alt={`${college.name} preview one`} className="project-image h-[clamp(130px,16vw,230px)]" images={imageA} />
              <CollegePreviewImage alt={`${college.name} preview two`} className="project-image h-[clamp(160px,22vw,340px)]" images={imageB} />
            </div>
            <CollegePreviewImage alt={`${college.name} hero preview`} className="project-image h-full min-h-[360px]" images={imageC} />
          </div>
        </div>
      </motion.article>
    </div>
  );
}

function ProjectsSection() {
  const [aiimsColleges, setAiimsColleges] = useState<CollegePreview[]>(aiimsPreviewColleges);

  useEffect(() => {
    let cancelled = false;

    const loadAiimsColleges = async () => {
      try {
        const rows = await fetchColleges();
        if (cancelled) {
          return;
        }

        const fallbackImages = aiimsPreviewColleges[0]?.images ?? [];
        const supabaseAiimsColleges = rows
          .map((row, index) => mapCollegeRow(row, 'colleges', index))
          .filter((college): college is CollageCollege => {
            if (!college) {
              return false;
            }

            const normalizedName = normalizeKey(college.name);
            return normalizedName.includes('aiims') || normalizedName.includes('allindiainstituteofmedicalsciences');
          })
          .map((college) => {
            const images = [...new Set([...college.imageSources, ...fallbackImages])].filter(Boolean);
            return {
              images,
              name: college.name,
              state: college.state,
            };
          })
          .sort((left, right) => left.name.localeCompare(right.name));

        const mergedColleges = new Map(aiimsPreviewColleges.map((college) => [normalizeKey(college.name), college]));
        for (const college of supabaseAiimsColleges) {
          mergedColleges.set(normalizeKey(college.name), college);
        }

        setAiimsColleges([...mergedColleges.values()].sort((left, right) => left.name.localeCompare(right.name)));
      } catch {
        if (!cancelled) {
          setAiimsColleges(aiimsPreviewColleges);
        }
      }
    };

    void loadAiimsColleges();

    return () => {
      cancelled = true;
    };
  }, []);

  const topMedicalColleges = aiimsColleges.length ? aiimsColleges : aiimsPreviewColleges;

  return (
    <section
      id="jack-projects"
      className="portfolio-shell relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-5 py-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 md:-mt-14 md:rounded-t-[60px] md:px-10 md:py-28"
    >
      <FadeIn delay={0} y={40}>
        <h2 className="hero-heading mb-14 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight sm:mb-16 md:mb-20">
          AIIMS Medical Collages
        </h2>
      </FadeIn>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-12">
        {topMedicalColleges.map((college, index) => (
          <TopCollegeCard key={college.name} college={college} index={index} totalCards={topMedicalColleges.length} />
        ))}
      </div>
    </section>
  );
}

function BookAppointmentSection() {
  const [form, setForm] = useState<AppointmentFormState>({
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onChange = (key: keyof AppointmentFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createAppointment(form);
      setSuccess('Appointment request sent successfully. We will contact you soon.');
      setForm({ fullName: '', email: '', phone: '', preferredDate: '', message: '' });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="book-appointment" className="portfolio-shell bg-[#0A0A0A] px-5 py-20 text-white sm:px-8 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 md:grid-cols-[0.42fr_0.58fr] md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Consultation Desk</p>
          <h2 className="mt-4 text-[clamp(2rem,6vw,4rem)] font-black uppercase leading-none tracking-tight">Book Appointment</h2>
          <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
            Fill in your details to schedule your MBBS counselling call. Your request is stored in the backend and reviewed by our admin team.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <input required className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40" onChange={(event) => onChange('fullName', event.target.value)} placeholder="Full name" type="text" value={form.fullName} />
          <input required className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40" onChange={(event) => onChange('email', event.target.value)} placeholder="Email" type="email" value={form.email} />
          <input required className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40" onChange={(event) => onChange('phone', event.target.value)} placeholder="Phone number" type="tel" value={form.phone} />
          <input required className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40" onChange={(event) => onChange('preferredDate', event.target.value)} type="date" value={form.preferredDate} />
          <textarea className="min-h-28 rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40" onChange={(event) => onChange('message', event.target.value)} placeholder="Anything specific you want help with?" value={form.message} />

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

          <button className="rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
            {loading ? 'Submitting...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </section>
  );
}

function BookAppointmentPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="portfolio-shell px-5 pt-8 sm:px-8 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3">
          <a className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em]" href="/">
            <img alt="Admission Partner logo" className="h-10 w-10 rounded-full object-cover" src={logoImage} />
            <span>Admission Partner</span>
          </a>
          <div className="flex items-center gap-5 text-xs uppercase tracking-[0.22em] text-white/70">
            <a className="transition-colors hover:text-white" href="/">
              Home
            </a>
            <a className="transition-colors hover:text-white" href="/collage">
              Collage
            </a>
          </div>
        </div>
      </div>

      <BookAppointmentSection />

      <footer className="portfolio-shell px-5 pb-12 sm:px-8 md:px-10">
        <div className="mx-auto flex max-w-6xl justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5">
          <a
            aria-label="WhatsApp"
            className="rounded-full border border-white/15 bg-black/20 p-3 text-white/80 transition-all hover:bg-white/5 hover:text-white"
            href="https://wa.me/919540108254"
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle size={18} />
          </a>
          <a
            aria-label="Instagram"
            className="rounded-full border border-white/15 bg-black/20 p-3 text-white/80 transition-all hover:bg-white/5 hover:text-white"
            href="https://www.instagram.com/admissionpartner"
            rel="noreferrer"
            target="_blank"
          >
            <Instagram size={18} />
          </a>
          <a
            aria-label="Facebook"
            className="rounded-full border border-white/15 bg-black/20 p-3 text-white/80 transition-all hover:bg-white/5 hover:text-white"
            href="https://www.facebook.com/admissionpartnr/"
            rel="noreferrer"
            target="_blank"
          >
            <Facebook size={18} />
          </a>
          <a
            aria-label="LinkedIn"
            className="rounded-full border border-white/15 bg-black/20 p-3 text-white/80 transition-all hover:bg-white/5 hover:text-white"
            href="https://www.linkedin.com/company/admission-partner/about/"
            rel="noreferrer"
            target="_blank"
          >
            <Linkedin size={18} />
          </a>
        </div>
      </footer>
    </main>
  );
}

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'appointments' | 'colleges' | 'feedback'>('appointments');
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [colleges, setColleges] = useState<CollegeAdminRow[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackAdminRow[]>([]);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [collegeStateFilter, setCollegeStateFilter] = useState('all');
  const [collegeTypeFilter, setCollegeTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [savingCollegeId, setSavingCollegeId] = useState<string>('');
  const [savingFeedbackId, setSavingFeedbackId] = useState<string>('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const adminEmail = session?.user.email?.toLowerCase() ?? '';
  const authorized = authReady && adminEmail === ADMIN_EMAIL;

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment.');
      setAuthReady(true);
      return () => {
        isMounted = false;
      };
    }

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
      }

      setSession(data.session ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setAuthReady(true);
      setError('');
      setNotice('');
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authorized) {
      return;
    }

    void loadAppointments();
  }, [authorized]);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const rows = await fetchAppointments();
      setAppointments(rows.filter((row) => (row.admin_email ?? ADMIN_EMAIL).toLowerCase() === ADMIN_EMAIL));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load appointments.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadColleges = async () => {
    setLoading(true);
    setError('');

    try {
      const rows = await fetchAdminColleges();
      setColleges(rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load colleges.');
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbacks = async () => {
    setLoading(true);
    setError('');

    try {
      const rows = await fetchAdminFeedbacks();
      setFeedbacks(rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load feedback submissions.');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCollegeField = (id: string, key: keyof CollegeAdminRow, value: string) => {
    setColleges((current) => current.map((row) => (String(row.id) === id ? { ...row, [key]: value } : row)));
  };

  const saveCollege = async (college: CollegeAdminRow) => {
    const id = String(college.id);
    setSavingCollegeId(id);
    setError('');
    setNotice('');

    try {
      const updated = await updateCollegeById(college);
      setColleges((current) => current.map((row) => (String(row.id) === id ? { ...row, ...updated } : row)));
      setNotice(`College ${id} updated successfully.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update college.');
    } finally {
      setSavingCollegeId('');
    }
  };

  const setFeedbackApproval = async (feedback: FeedbackAdminRow, isPublished: boolean) => {
    const id = String(feedback.id);
    setSavingFeedbackId(id);
    setError('');
    setNotice('');

    try {
      const updated = await updateFeedbackApproval(id, isPublished);
      setFeedbacks((current) => current.map((row) => (String(row.id) === id ? { ...row, ...(updated ?? {}), is_published: isPublished } : row)));
      setNotice(isPublished ? `Feedback ${id} approved.` : `Feedback ${id} hidden.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update feedback status.');
    } finally {
      setSavingFeedbackId('');
    }
  };

  const onAuthorize = async () => {
    setAuthLoading(true);
    setError('');
    setNotice('');

    try {
      await signInAdminWithGoogle();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Google sign-in failed.');
      setAuthLoading(false);
    }
  };

  const onSignOut = async () => {
    setAuthLoading(true);
    setError('');
    setNotice('');

    try {
      await signOutAdmin();
      setAppointments([]);
      setColleges([]);
      setFeedbacks([]);
      setCollegeSearch('');
      setCollegeStateFilter('all');
      setCollegeTypeFilter('all');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Sign out failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshActiveTab = () => {
    setNotice('');
    if (activeTab === 'appointments') {
      void loadAppointments();
      return;
    }
    if (activeTab === 'feedback') {
      void loadFeedbacks();
      return;
    }
    void loadColleges();
  };

  const adminCollegeStates = useMemo(() => {
    const states = colleges.map((row) => (row.state ?? '').trim()).filter(Boolean);
    return [...new Set(states)].sort((a, b) => a.localeCompare(b));
  }, [colleges]);

  const adminCollegeTypes = useMemo(() => {
    const types = colleges.map((row) => (row.type ?? '').trim()).filter(Boolean);
    return [...new Set(types)].sort((a, b) => a.localeCompare(b));
  }, [colleges]);

  const filteredAdminColleges = useMemo(() => {
    const normalizedSearch = collegeSearch.trim().toLowerCase();

    return colleges.filter((row) => {
      const matchesName = !normalizedSearch || (row.name ?? '').toLowerCase().includes(normalizedSearch);
      const matchesState = collegeStateFilter === 'all' || (row.state ?? '').toLowerCase() === collegeStateFilter.toLowerCase();
      const matchesType = collegeTypeFilter === 'all' || (row.type ?? '').toLowerCase() === collegeTypeFilter.toLowerCase();

      return matchesName && matchesState && matchesType;
    });
  }, [colleges, collegeSearch, collegeStateFilter, collegeTypeFilter]);

  return (
    <main className="portfolio-shell min-h-screen bg-[#0A0A0A] px-5 py-10 text-white sm:px-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3">
          <a className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em]" href="/">
            <img alt="Admission Partner logo" className="h-10 w-10 rounded-full object-cover" src={logoImage} />
            <span>Admission Partner</span>
          </a>
          <a className="text-xs uppercase tracking-[0.22em] text-white/65 transition-colors hover:text-white" href="/">
            Back to home
          </a>
        </div>

        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 md:p-10">
          <h1 className="text-[clamp(2rem,6vw,4rem)] font-black uppercase leading-none tracking-tight">Admin Dashboard</h1>
          <p className="mt-4 text-sm text-white/70 sm:text-base">Access is restricted to the configured admin Google account.</p>

          {!authReady ? <p className="mt-6 text-sm text-white/65">Checking admin session...</p> : null}

          {authReady && !session ? (
            <div className="mt-6 flex max-w-xl flex-col gap-4">
              <p className="text-sm text-white/75">Sign in with Google to continue to the admin panel.</p>
              <button className="w-fit rounded-full border border-white/25 bg-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] disabled:cursor-not-allowed disabled:opacity-60" disabled={authLoading} onClick={() => void onAuthorize()} type="button">
                {authLoading ? 'Connecting...' : 'Continue with Google'}
              </button>
            </div>
          ) : null}

          {authReady && session && !authorized ? (
            <div className="mt-6 flex max-w-xl flex-col gap-4">
              <p className="text-sm text-rose-300">Access denied for `{session.user.email ?? 'unknown user'}`. Sign in with `{ADMIN_EMAIL}` instead.</p>
              <button className="w-fit rounded-full border border-white/25 bg-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] disabled:cursor-not-allowed disabled:opacity-60" disabled={authLoading} onClick={() => void onSignOut()} type="button">
                {authLoading ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
          {notice ? <p className="mt-4 text-sm text-emerald-300">{notice}</p> : null}

          {authorized ? (
            <div className="mt-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                <span>Signed in as `{session?.user.email ?? ADMIN_EMAIL}`</span>
                <button className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60" disabled={authLoading} onClick={() => void onSignOut()} type="button">
                  {authLoading ? 'Signing Out...' : 'Sign Out'}
                </button>
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-3">
                <button
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                    activeTab === 'appointments' ? 'border-white/35 bg-white/10 text-white' : 'border-white/20 text-white/75 hover:bg-white/10'
                  }`}
                  onClick={() => {
                    setActiveTab('appointments');
                    setNotice('');
                    void loadAppointments();
                  }}
                  type="button"
                >
                  Appointments
                </button>
                <button
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                    activeTab === 'colleges' ? 'border-white/35 bg-white/10 text-white' : 'border-white/20 text-white/75 hover:bg-white/10'
                  }`}
                  onClick={() => {
                    setActiveTab('colleges');
                    setNotice('');
                    void loadColleges();
                  }}
                  type="button"
                >
                  Edit Colleges
                </button>
                <button
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                    activeTab === 'feedback' ? 'border-white/35 bg-white/10 text-white' : 'border-white/20 text-white/75 hover:bg-white/10'
                  }`}
                  onClick={() => {
                    setActiveTab('feedback');
                    setNotice('');
                    void loadFeedbacks();
                  }}
                  type="button"
                >
                  Feedback Moderation
                </button>
              </div>

              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                  {activeTab === 'appointments'
                    ? `${appointments.length} appointments`
                    : activeTab === 'feedback'
                      ? `${feedbacks.length} feedback submissions`
                      : `${filteredAdminColleges.length} colleges`}
                </p>
                <button className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/10" onClick={refreshActiveTab} type="button">
                  Refresh
                </button>
              </div>

              {activeTab === 'colleges' ? (
                <div className="mb-5 grid gap-3 md:grid-cols-3">
                  <input
                    className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
                    onChange={(event) => setCollegeSearch(event.target.value)}
                    placeholder="Search by college name"
                    type="text"
                    value={collegeSearch}
                  />
                  <select
                    className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                    onChange={(event) => setCollegeStateFilter(event.target.value)}
                    value={collegeStateFilter}
                  >
                    <option value="all">All states</option>
                    {adminCollegeStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                    onChange={(event) => setCollegeTypeFilter(event.target.value)}
                    value={collegeTypeFilter}
                  >
                    <option value="all">All types</option>
                    {adminCollegeTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {loading ? <p className="text-sm text-white/65">Loading...</p> : null}

              {!loading && activeTab === 'appointments' ? (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-white/[0.04] text-white/75">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Phone</th>
                        <th className="px-4 py-3 font-medium">Preferred Date</th>
                        <th className="px-4 py-3 font-medium">Message</th>
                        <th className="px-4 py-3 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((row) => (
                        <tr key={String(row.id ?? `${row.email}-${row.created_at}`)} className="border-t border-white/10 align-top text-white/85">
                          <td className="px-4 py-3">{row.full_name || '-'}</td>
                          <td className="px-4 py-3">{row.email || '-'}</td>
                          <td className="px-4 py-3">{row.phone || '-'}</td>
                          <td className="px-4 py-3">{row.preferred_date || '-'}</td>
                          <td className="px-4 py-3">{row.message || '-'}</td>
                          <td className="px-4 py-3">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {!loading && activeTab === 'colleges' ? (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-white/[0.04] text-white/75">
                      <tr>
                        <th className="px-4 py-3 font-medium">ID</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">State</th>
                        <th className="px-4 py-3 font-medium">City</th>
                        <th className="px-4 py-3 font-medium">Fees</th>
                        <th className="px-4 py-3 font-medium">Estd</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Image URL</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdminColleges.map((college) => {
                        const id = String(college.id);
                        const isSaving = savingCollegeId === id;

                        return (
                          <tr key={id} className="border-t border-white/10 align-top text-white/85">
                            <td className="px-4 py-3 text-xs text-white/60">{id}</td>
                            <td className="px-4 py-3"><input className="w-44 rounded border border-white/15 bg-black/20 px-2 py-1" onChange={(event) => updateCollegeField(id, 'name', event.target.value)} value={college.name ?? ''} /></td>
                            <td className="px-4 py-3"><input className="w-32 rounded border border-white/15 bg-black/20 px-2 py-1" onChange={(event) => updateCollegeField(id, 'state', event.target.value)} value={college.state ?? ''} /></td>
                            <td className="px-4 py-3"><input className="w-32 rounded border border-white/15 bg-black/20 px-2 py-1" onChange={(event) => updateCollegeField(id, 'city', event.target.value)} value={college.city ?? ''} /></td>
                            <td className="px-4 py-3"><input className="w-28 rounded border border-white/15 bg-black/20 px-2 py-1" onChange={(event) => updateCollegeField(id, 'fees', event.target.value)} value={college.fees ?? ''} /></td>
                            <td className="px-4 py-3"><input className="w-24 rounded border border-white/15 bg-black/20 px-2 py-1" onChange={(event) => updateCollegeField(id, 'estd', event.target.value)} value={college.estd ?? ''} /></td>
                            <td className="px-4 py-3"><input className="w-28 rounded border border-white/15 bg-black/20 px-2 py-1" onChange={(event) => updateCollegeField(id, 'type', event.target.value)} value={college.type ?? ''} /></td>
                            <td className="px-4 py-3"><input className="w-64 rounded border border-white/15 bg-black/20 px-2 py-1" onChange={(event) => updateCollegeField(id, 'image_url', event.target.value)} value={college.image_url ?? ''} /></td>
                            <td className="px-4 py-3">
                              <button className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/90 hover:bg-white/10 disabled:opacity-60" disabled={isSaving} onClick={() => void saveCollege(college)} type="button">
                                {isSaving ? 'Saving' : 'Save'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {!loading && activeTab === 'feedback' ? (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-white/[0.04] text-white/75">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Rating</th>
                        <th className="px-4 py-3 font-medium">Feedback</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Created</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbacks.map((feedback) => {
                        const id = String(feedback.id);
                        const isSaving = savingFeedbackId === id;
                        const isPublished = valueToBoolean(feedback.is_published) === true;

                        return (
                          <tr key={id} className="border-t border-white/10 align-top text-white/85">
                            <td className="px-4 py-3">{feedback.name || '-'}</td>
                            <td className="px-4 py-3">{feedback.role || '-'}</td>
                            <td className="px-4 py-3">{valueToNumber(feedback.rating, 5)}/5</td>
                            <td className="max-w-md px-4 py-3 text-white/80">{feedback.content || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${isPublished ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}`}>
                                {isPublished ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3">{feedback.created_at ? new Date(feedback.created_at).toLocaleString() : '-'}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button className="rounded-full border border-emerald-400/30 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-60" disabled={isSaving || isPublished} onClick={() => void setFeedbackApproval(feedback, true)} type="button">
                                  {isSaving && !isPublished ? 'Saving' : 'Approve'}
                                </button>
                                <button className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/90 hover:bg-white/10 disabled:opacity-60" disabled={isSaving || !isPublished} onClick={() => void setFeedbackApproval(feedback, false)} type="button">
                                  {isSaving && isPublished ? 'Saving' : 'Hide'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {!loading && activeTab === 'colleges' && filteredAdminColleges.length === 0 ? (
                <p className="mt-4 text-sm text-white/65">No colleges found for the current search/filter.</p>
              ) : null}

              {!loading && activeTab === 'feedback' && feedbacks.length === 0 ? (
                <p className="mt-4 text-sm text-white/65">No feedback submissions found.</p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function CollagePage() {
  const [colleges, setColleges] = useState<CollageCollege[]>([]);
  const [collegeSearch, setCollegeSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('search') || '';
    }
    return '';
  });
  const [collegeStateFilter, setCollegeStateFilter] = useState('all');
  const [collegeTypeFilter, setCollegeTypeFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState<CollageCollege | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadColleges = async () => {
      setLoading(true);
      setError('');

      try {
        const rows = await fetchColleges();

        if (cancelled) {
          return;
        }

        const mergedColleges = rows
          .map((row, index) => mapCollegeRow(row, 'colleges', index))
          .filter((college): college is CollageCollege => college !== null);

        if (!mergedColleges.length) {
          setError('No colleges were found in Supabase.');
          setColleges([]);
          return;
        }

        setColleges(mergedColleges);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load collage data.');
          setColleges([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadColleges();

    return () => {
      cancelled = true;
    };
  }, []);

  const collageStates = useMemo(() => {
    const states = colleges.map((college) => college.state.trim()).filter(Boolean);
    return [...new Set(states)].sort((a, b) => a.localeCompare(b));
  }, [colleges]);

  const collageTypes = useMemo(() => {
    const types = colleges.map((college) => college.type.trim()).filter(Boolean);
    return [...new Set(types)].sort((a, b) => a.localeCompare(b));
  }, [colleges]);

  const filteredColleges = useMemo(() => {
    const normalizedSearch = collegeSearch.trim().toLowerCase();

    return colleges
      .filter((college) => {
        const matchesName = !normalizedSearch || college.name.toLowerCase().includes(normalizedSearch);
        const matchesState = collegeStateFilter === 'all' || college.state.toLowerCase() === collegeStateFilter.toLowerCase();
        const matchesType = collegeTypeFilter === 'all' || college.type.toLowerCase() === collegeTypeFilter.toLowerCase();

        return matchesName && matchesState && matchesType;
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [colleges, collegeSearch, collegeStateFilter, collegeTypeFilter]);

  return (
    <main className="portfolio-shell min-h-screen bg-[#0C0C0C] px-5 py-6 text-[#D7E2EA] sm:px-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-12 flex flex-col gap-5 rounded-[32px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <a className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-white" href="/">
            <img alt="Admission Partner logo" className="h-10 w-10 rounded-full object-cover" src={logoImage} />
            <span>Admission Partner</span>
          </a>

          <GradientNavMenu items={mainNavItems} />
        </nav>

        <section className="mb-10 rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(255,255,255,0.04)_36%,rgba(255,255,255,0.02)_100%)] px-6 py-10 sm:px-8 md:px-10">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/55">Collage</p>
          <h1 className="mt-4 text-[clamp(2.6rem,8vw,6rem)] font-black uppercase leading-none tracking-tight text-white">All Medical Colleges</h1>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <input
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
              onChange={(event) => setCollegeSearch(event.target.value)}
              placeholder="Search by college name"
              type="text"
              value={collegeSearch}
            />
            <select
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              onChange={(event) => setCollegeStateFilter(event.target.value)}
              value={collegeStateFilter}
            >
              <option value="all">All states</option>
              {collageStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              onChange={(event) => setCollegeTypeFilter(event.target.value)}
              value={collegeTypeFilter}
            >
              <option value="all">All types</option>
              {collageTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5">
                <div className="h-56 animate-pulse bg-white/10" />
                <div className="space-y-3 p-6">
                  <div className="h-6 w-3/4 animate-pulse rounded-full bg-white/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-[30px] border border-amber-400/20 bg-amber-500/10 px-6 py-5 text-amber-100">
            <p className="text-lg font-semibold">Couldn&apos;t load colleges.</p>
            <p className="mt-2 text-sm text-amber-100/80">{error}</p>
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.24em] text-white/55">{filteredColleges.length} colleges shown</p>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">Filter by college name, state, and type</p>
          </div>
        ) : null}

        {!loading && !error ? (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredColleges.map((college) => (
              <article key={college.id} className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
                <div className="relative h-64 overflow-hidden bg-white/5">
                  {college.imageSources.length ? (
                    <CollegeImage images={college.imageSources} name={college.name} />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle,rgba(255,255,255,0.12),rgba(255,255,255,0.04)_55%,transparent_100%)] px-6 text-center text-sm uppercase tracking-[0.24em] text-white/50">
                      Photo unavailable
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/15 to-transparent" />
                </div>

                <div className="space-y-4 p-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/45">{college.sourceTable}</p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight text-white">{college.name}</h2>
                    <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/60">{college.state}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-white/75">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Fees</p>
                      <p className="mt-2 font-medium text-white">{college.fees || 'Not available'}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Established</p>
                      <p className="mt-2 font-medium text-white">{college.year || 'Not available'}</p>
                    </div>
                  </div>

                  {college.type ? (
                    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-white/70">
                      {college.type}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <p className="text-sm leading-relaxed text-white/55">Open a larger view to read the full college snapshot.</p>
                    <button
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0C0C0C] transition-opacity hover:opacity-90"
                      onClick={() => setSelectedCollege(college)}
                      type="button"
                    >
                      More Details
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {!loading && !error && filteredColleges.length === 0 ? (
          <p className="text-sm text-white/65">No colleges found for the current search/filter.</p>
        ) : null}

        {selectedCollege ? <CollegeDetailsModal college={selectedCollege} onClose={() => setSelectedCollege(null)} /> : null}
      </div>
    </main>
  );
}

function App() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  if (pathname === '/collage') {
    return <CollagePage />;
  }

  if (pathname === '/admin') {
    return <AdminPage />;
  }

  if (pathname === '/book-appointment') {
    return <BookAppointmentPage />;
  }

  return (
    <main>
      <CinematicHeroSection />
      <MarqueeSection />
      <AboutSection />
      <ProjectsSection />
      <ServicesSection />
      <TestimonialsSection />
    </main>
  );
}

export default App;
