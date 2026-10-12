import { useEffect, useMemo, useRef, useState } from 'react'

/* =====================================================================
   MediCare – Hospital Appointment & Patient Management System (frontend)

   BACKEND SWITCH
   - USE_BACKEND = false  -> everything stays in this page's memory (demo).
   - USE_BACKEND = true   -> calls the Spring Boot API at API_BASE.
   Nothing is ever shown as "saved" unless it really was.

   All doctors, patients, schedules and bookings below are FICTIONAL DEMO DATA.
   ===================================================================== */

const USE_BACKEND = true
const API_BASE = 'http://localhost:8080/api'

async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('medicare_token')

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body.message || body.error || ''
    } catch {
      // Some API errors do not return JSON.
    }
    throw new Error(detail || `Server responded with ${res.status}`)
  }

  if (res.status === 204) return null

  // Some successful API endpoints return an empty body. Do not throw
  // "Unexpected end of JSON input" when refreshing notifications.
  const responseText = await res.text()
  if (!responseText || !responseText.trim()) return null
  try {
    return JSON.parse(responseText)
  } catch {
    throw new Error('The server returned an invalid response. Check the backend logs.')
  }
}

/* ----------------------------- Data -------------------------------- */


const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'General Medicine',
  'Gynecology',
  'Dentistry',
  'Ophthalmology',
  'ENT',
  'Psychiatry',
  'Gastroenterology',
  'Endocrinology',
  'Urology',
  'Pulmonology',
]

const DEPT_ICON = {
  All: 'layers',
  Cardiology: 'heart',
  Neurology: 'brain',
  Pediatrics: 'baby',
  Dermatology: 'sparkle',
  Orthopedics: 'bone',
  'General Medicine': 'stethoscope',
  Gynecology: 'heart',
  Dentistry: 'smile',
  Ophthalmology: 'eye',
  ENT: 'ear',
  Psychiatry: 'brain',
  Gastroenterology: 'activity',
  Endocrinology: 'activity',
  Urology: 'activity',
  Pulmonology: 'wind',
}

const DOCTORS = [
  {
    id: 1,
    name: 'Dr. Aanya Rao',
    hospital: 'Apollo Hospitals',
    hospitalArea: 'Jubilee Hills, Hyderabad, Telangana',
    specialty: 'Interventional Cardiologist',
    department: 'Cardiology',
    years: 14,
    languages: ['English', 'Hindi', 'Telugu'],
    focus: ['Heart rhythm checks', 'Blood pressure care', 'Cardiac follow-up'],
    bio: 'Fictional demo profile for cardiology appointments.',
    look: { bg: '#c5ebe8', skin: '#e0ac86', hair: '#1d2b30', long: true },
  },
  {
    id: 2,
    name: 'Dr. Marcus Bell',
    hospital: 'Yashoda Hospitals',
    hospitalArea: 'Somajiguda, Hyderabad, Telangana',
    specialty: 'Neurologist',
    department: 'Neurology',
    years: 11,
    languages: ['English', 'Spanish'],
    focus: ['Migraine management', 'Nerve conditions', 'Memory concerns'],
    bio: 'Fictional demo profile for neurological consultations.',
    look: { bg: '#d8f8ea', skin: '#8d5a3b', hair: '#14181a', long: false },
  },
  {
    id: 3,
    name: 'Dr. Priya Nair',
    hospital: "Rainbow Children's Hospital",
    hospitalArea: 'Mansoorabad, Hyderabad, Telangana',
    specialty: 'Child Health Specialist',
    department: 'Pediatrics',
    years: 9,
    languages: ['English', 'Malayalam', 'Hindi'],
    focus: ['Child checkups', 'Growth and development', 'Vaccination guidance'],
    bio: 'Fictional demo profile for pediatric consultations.',
    look: { bg: '#dff4f3', skin: '#c98d65', hair: '#2a1c16', long: true },
  },
  {
    id: 4,
    name: 'Dr. Samuel Okafor',
    hospital: 'Apollo Hospitals',
    hospitalArea: 'Secunderabad, Hyderabad region, Telangana',
    specialty: 'Orthopedic Specialist',
    department: 'Orthopedics',
    years: 16,
    languages: ['English'],
    focus: ['Joint pain', 'Sports injuries', 'Rehabilitation'],
    bio: 'Fictional demo profile for orthopedic consultations.',
    look: { bg: '#c5ebe8', skin: '#6b4429', hair: '#0f1213', long: false },
  },
  {
    id: 5,
    name: 'Dr. Elena Torres',
    hospital: 'AIG Hospitals',
    hospitalArea: 'Gachibowli, Hyderabad, Telangana',
    specialty: 'Dermatologist',
    department: 'Dermatology',
    years: 8,
    languages: ['English', 'Spanish'],
    focus: ['Skin concerns', 'Allergic reactions', 'Skin care'],
    bio: 'Fictional demo profile for dermatology appointments.',
    look: { bg: '#d8f8ea', skin: '#f0c8a4', hair: '#6b3b1f', long: true },
  },
  {
    id: 6,
    name: 'Dr. Rohan Mehta',
    hospital: 'PACE Hospitals',
    hospitalArea: 'Madinaguda, Hyderabad, Telangana',
    specialty: 'Family Physician',
    department: 'General Medicine',
    years: 12,
    languages: ['English', 'Hindi', 'Gujarati'],
    focus: ['General checkups', 'Preventive care', 'Chronic conditions'],
    bio: 'Fictional demo profile for general medical consultations.',
    look: { bg: '#dff4f3', skin: '#d39b73', hair: '#1d2b30', long: false },
  },
  {
    id: 7,
    name: 'Dr. Hana Kim',
    hospital: 'Yashoda Hospitals',
    hospitalArea: 'Hitec City, Hyderabad, Telangana',
    specialty: 'Headache Specialist',
    department: 'Neurology',
    years: 7,
    languages: ['English', 'Korean'],
    focus: ['Chronic headaches', 'Sleep concerns', 'Lifestyle planning'],
    bio: 'Fictional demo profile for neurology appointments.',
    look: { bg: '#c5ebe8', skin: '#ecc19b', hair: '#14181a', long: true },
  },
  {
    id: 8,
    name: 'Dr. Leila Haddad',
    hospital: 'Yashoda Hospitals',
    hospitalArea: 'Malakpet, Hyderabad, Telangana',
    specialty: 'Preventive Cardiologist',
    department: 'Cardiology',
    years: 10,
    languages: ['English', 'Arabic', 'French'],
    focus: ['Heart health screening', 'Cholesterol care', 'Prevention'],
    bio: 'Fictional demo profile for preventive cardiology.',
    look: { bg: '#d8f8ea', skin: '#b97c55', hair: '#241711', long: true },
  },
  {
    id: 9,
    name: 'Dr. Test Doctor',
    hospital: 'Apollo Hospitals',
    hospitalArea: 'Hyderguda, Hyderabad, Telangana',
    specialty: 'General Physician',
    department: 'General Medicine',
    years: 5,
    languages: ['English'],
    focus: ['General consultations', 'Routine checkups'],
    bio: 'Fictional test profile for appointment system testing.',
    look: { bg: '#dff4f3', skin: '#c98d65', hair: '#2a1c16', long: false },
  },
  {
    id: 10,
    name: 'Dr. Kavya Reddy',
    hospital: "Rainbow Children's Hospital",
    hospitalArea: 'Banjara Hills, Hyderabad, Telangana',
    specialty: 'Gynecologist',
    department: 'Gynecology',
    years: 10,
    languages: ['English', 'Hindi', 'Telugu'],
    focus: ['Women’s health', 'Menstrual health', 'Preventive screening'],
    bio: 'Fictional demo profile for gynecology appointments.',
    look: { bg: '#f8dce8', skin: '#c98d65', hair: '#2a1c16', long: true },
  },
  {
    id: 11,
    name: 'Dr. Arjun Varma',
    hospital: 'Apollo Hospitals',
    hospitalArea: 'Jubilee Hills, Hyderabad, Telangana',
    specialty: 'Dentist',
    department: 'Dentistry',
    years: 8,
    languages: ['English', 'Hindi', 'Telugu'],
    focus: ['Dental checkups', 'Tooth pain', 'Oral hygiene'],
    bio: 'Fictional demo profile for dental consultations.',
    look: { bg: '#d8f8ea', skin: '#d39b73', hair: '#1d2b30', long: false },
  },
  {
    id: 12,
    name: 'Dr. Meera Shah',
    hospital: 'Yashoda Hospitals',
    hospitalArea: 'Somajiguda, Hyderabad, Telangana',
    specialty: 'Ophthalmologist',
    department: 'Ophthalmology',
    years: 9,
    languages: ['English', 'Hindi', 'Telugu'],
    focus: ['Vision checks', 'Eye irritation', 'Eye health'],
    bio: 'Fictional demo profile for eye consultations.',
    look: { bg: '#dff4f3', skin: '#e0ac86', hair: '#241711', long: true },
  },
  {
    id: 13,
    name: 'Dr. David Thomas',
    hospital: 'AIG Hospitals',
    hospitalArea: 'Gachibowli, Hyderabad, Telangana',
    specialty: 'ENT Specialist',
    department: 'ENT',
    years: 12,
    languages: ['English', 'Hindi'],
    focus: ['Ear problems', 'Sinus concerns', 'Throat conditions'],
    bio: 'Fictional demo profile for ENT consultations.',
    look: { bg: '#c5ebe8', skin: '#8d5a3b', hair: '#14181a', long: false },
  },
  {
    id: 14,
    name: 'Dr. Nisha Kapoor',
    hospital: 'Apollo Hospitals',
    hospitalArea: 'Jubilee Hills, Hyderabad, Telangana',
    specialty: 'Psychiatrist',
    department: 'Psychiatry',
    years: 11,
    languages: ['English', 'Hindi'],
    focus: ['Mental health consultations', 'Stress management', 'Wellbeing'],
    bio: 'Fictional demo profile for psychiatry appointments.',
    look: { bg: '#f8dce8', skin: '#c98d65', hair: '#2a1c16', long: true },
  },
  {
    id: 15,
    name: 'Dr. Vivek Sharma',
    hospital: 'PACE Hospitals',
    hospitalArea: 'Madinaguda, Hyderabad, Telangana',
    specialty: 'Gastroenterologist',
    department: 'Gastroenterology',
    years: 13,
    languages: ['English', 'Hindi', 'Telugu'],
    focus: ['Digestive health', 'Acidity concerns', 'Abdominal symptoms'],
    bio: 'Fictional demo profile for gastroenterology consultations.',
    look: { bg: '#d8f8ea', skin: '#d39b73', hair: '#1d2b30', long: false },
  },
]

/* Fictional demonstration patients (used only when USE_BACKEND is false). */
const SAMPLE_PATIENTS = [
  {
    id: 'P-1001',
    name: 'Asha Verma',
    age: 34,
    gender: 'Female',
    phone: '+00 00000 10001',
    diagnosis: 'Seasonal allergic rhinitis',
    notes: 'Advised to avoid known triggers. Review in four weeks if symptoms persist.',
    appointments: [
      { date: '2026-09-02', doctor: 'Dr. Rohan Mehta', department: 'General Medicine', status: 'Completed' },
      { date: '2026-09-30', doctor: 'Dr. Elena Torres', department: 'Dermatology', status: 'Completed' },
    ],
  },
  {
    id: 'P-1002',
    name: 'Daniel Joseph',
    age: 52,
    gender: 'Male',
    phone: '+00 00000 10002',
    diagnosis: 'Hypertension, routine follow-up',
    notes: 'Blood pressure readings stable. Continue lifestyle changes. Next review in three months.',
    appointments: [
      { date: '2026-08-18', doctor: 'Dr. Aanya Rao', department: 'Cardiology', status: 'Completed' },
      { date: '2026-11-05', doctor: 'Dr. Leila Haddad', department: 'Cardiology', status: 'Scheduled' },
    ],
  },
  {
    id: 'P-1003',
    name: 'Meera Iyer',
    age: 8,
    gender: 'Female',
    phone: '+00 00000 10003',
    diagnosis: 'Routine growth and vaccination review',
    notes: 'Growth within the expected range. Vaccination schedule discussed with parent.',
    appointments: [
      { date: '2026-09-12', doctor: 'Dr. Priya Nair', department: 'Pediatrics', status: 'Completed' },
    ],
  },
  {
    id: 'P-1004',
    name: 'Kenji Watanabe',
    age: 41,
    gender: 'Male',
    phone: '+00 00000 10004',
    diagnosis: 'Lower back strain',
    notes: 'Physiotherapy exercises recommended. Avoid heavy lifting for two weeks.',
    appointments: [
      { date: '2026-09-22', doctor: 'Dr. Samuel Okafor', department: 'Orthopedics', status: 'Completed' },
      { date: '2026-10-20', doctor: 'Dr. Samuel Okafor', department: 'Orthopedics', status: 'Scheduled' },
    ],
  },
  {
    id: 'P-1005',
    name: 'Fatima Noor',
    age: 29,
    gender: 'Female',
    phone: '+00 00000 10005',
    diagnosis: 'Recurring tension headaches',
    notes: 'Sleep and hydration routine discussed. Headache diary requested before next visit.',
    appointments: [
      { date: '2026-09-27', doctor: 'Dr. Hana Kim', department: 'Neurology', status: 'Completed' },
    ],
  },
]

const SLOT_TIMES = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:30 PM', '04:00 PM', '04:30 PM',
]

const FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every 8 hours',
  'Only when needed',
]

const STATUS = {
  available: { label: 'Available today', cls: 'st-available' },
  limited: { label: 'Few slots today', cls: 'st-limited' },
  soon: { label: 'Next slot soon', cls: 'st-soon' },
  full: { label: 'Fully booked', cls: 'st-full' },
}

/* --------------------------- Helpers -------------------------------- */

const pad = (n) => String(n).padStart(2, '0')
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function getUpcomingDays(count = 7) {
  const base = new Date()
  const out = []
  for (let i = 0; i < count; i += 1) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    out.push({
      key: toKey(d),
      index: i,
      dow: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      long: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    })
  }
  return out
}

function toMinutes(t) {
  const [hm, ap] = t.split(' ')
  let [h, m] = hm.split(':').map(Number)
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return h * 60 + m
}

/* Deterministic pseudo-random demo availability (no backend involved). */
function isSlotUnavailable(docId, dayKey, time, isToday) {
  if (isToday) {
    const now = new Date()
    if (toMinutes(time) <= now.getHours() * 60 + now.getMinutes() + 30) return true
  }
  let h = 7
  const s = `${docId}|${dayKey}|${time}`
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 4 === 0
}

function availabilityFor(doc) {
  const days = getUpcomingDays(7)
  const freeToday = SLOT_TIMES.filter((t) => !isSlotUnavailable(doc.id, days[0].key, t, true)).length
  let next = null
  for (const d of days) {
    for (const t of SLOT_TIMES) {
      if (!isSlotUnavailable(doc.id, d.key, t, d.index === 0)) {
        next = { day: d, time: t }
        break
      }
    }
    if (next) break
  }
  let status = 'full'
  if (freeToday > 3) status = 'available'
  else if (freeToday > 0) status = 'limited'
  else if (next) status = 'soon'
  const nextLabel = next
    ? `${next.day.index === 0 ? 'Today' : next.day.index === 1 ? 'Tomorrow' : `${next.day.dow} ${next.day.day}`} · ${next.time}`
    : 'No slots this week'
  return { status, next, nextLabel }
}

function formatDate(value) {
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

/* ----------------- Patient records / prescriptions API --------------- */

/* Converts a patient from the Spring Boot response into the shape used here. */

const normalizePatient = (p) => ({
  id: String(p.id),
  name: p.name,
  age: p.age,
  gender: p.gender,
  phone: p.phone,
  diagnosis: p.diagnosis || 'Not recorded',
  notes: p.doctorNotes || '',
  appointments: (p.appointments || []).map((a) => ({
    date: a.appointmentDate,
    doctor: a.doctorName,
    department: a.department,
    status: a.status,
  })),
})

async function searchPatients(query) {
  const q = query.trim()
  if (!USE_BACKEND) {
    const lower = q.toLowerCase()
    return SAMPLE_PATIENTS.filter(
      (p) => !lower || p.id.toLowerCase().includes(lower) || p.name.toLowerCase().includes(lower)
    )
  }
  const data = await apiRequest('/patients')
const patients = data.map(normalizePatient)
const lower = q.toLowerCase()

return patients.filter(
  (p) => !lower || p.id.toLowerCase().includes(lower) || p.name.toLowerCase().includes(lower)
)
}

/* ------------------------------ Icons ------------------------------- */

const ICONS = {
  calendar: (<><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M8 2.5v4M16 2.5v4M3 10h18" /></>),
  file: (<><path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>),
  pill: (<><rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)" /><path d="M9.6 9.6l4.8 4.8" /></>),
  search: (<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  shield: (<><path d="M12 3l7 3v5.5c0 4.3-3 8-7 9.5-4-1.5-7-5.2-7-9.5V6z" /><path d="M9 12l2.2 2.2L15.5 10" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  mail: (<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3.5 7l8.5 6 8.5-6" /></>),
  pin: (<><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>),
  brain: (<><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 4.5A3 3 0 0 0 9 20h3V4z" /><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 4.5A3 3 0 0 1 15 20h-3" /></>),
  baby: (<><circle cx="12" cy="12" r="8.5" /><path d="M9 10.5h.01M15 10.5h.01M9.2 14.5c1.4 1.5 4.2 1.5 5.6 0M12 3.5c1 0 2 .6 2 1.5" /></>),
  bone: (<><path d="M8.5 15.5l7-7" /><circle cx="6.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="6.5" r="2.5" /><circle cx="5.5" cy="14.5" r="1.6" /><circle cx="18.5" cy="9.5" r="1.6" /></>),
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />,
  stethoscope: (<><path d="M6 3v6a4 4 0 0 0 8 0V3" /><path d="M10 13v2a5 5 0 0 0 10 0v-1" /><circle cx="20" cy="12" r="2" /></>),
  layers: <path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />,
  alert: (<><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16h.01" /></>),
  lock: (<><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>),
  award: (<><circle cx="12" cy="9" r="5.5" /><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7" /></>),
  printer: (<><path d="M7 9V3h10v6" /><rect x="3.5" y="9" width="17" height="8" rx="2" /><path d="M7 14h10v7H7z" /></>),
}

function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  )
}

function Logo({ light = false }) {
  return (
    <span className={`logo ${light ? 'logo-light' : ''}`}>
      <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <rect width="40" height="40" rx="12" fill="#17324D" />
        <path d="M17 9h6v8h8v6h-8v8h-6v-8H9v-6h8z" fill="#7FE0CF" />
        <circle cx="31" cy="9.5" r="2.6" fill="#ffffff" />
      </svg>
      <span className="logo-text">Medi<b>Care</b></span>
    </span>
  )
}

function Avatar({ look, size = 88 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <rect width="100" height="100" fill={look.bg} />
      {look.long && <path d="M29 46c0-20 9-31 21-31s21 11 21 31v28H29z" fill={look.hair} />}
      <path d="M10 100c2-20 17-28 40-28s38 8 40 28z" fill="#ffffff" />
      <path d="M40 73l10 14 10-14z" fill="#087F8C" />
      <rect x="43" y="56" width="14" height="18" rx="6" fill={look.skin} />
      <ellipse cx="50" cy="44" rx="15" ry="17" fill={look.skin} />
      <path d="M34 42c0-13 7-20 16-20s16 7 16 20c-4-7-9-10-16-10s-12 3-16 10z" fill={look.hair} />
    </svg>
  )
}

/* --------------------------- Small components ---------------------- */

function Field({ id, label, error, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && (
        <p className="err" id={`${id}-err`}>
          <Icon name="alert" size={15} /> {error}
        </p>
      )}
    </div>
  )
}

function Modal({ titleId, onClose, size = 'md', children }) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    const node = ref.current
    const previous = document.activeElement
    const focusables = () =>
      node.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )
    node.focus()
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeRef.current()
        return
      }
      if (e.key === 'Tab') {
        const items = focusables()
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (previous && document.contains(previous) && previous.focus) previous.focus()
    }
  }, [])

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={ref}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="x" size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}

function DemoNote({ children, className = '' }) {
  return (
    <p className={`demo-note ${className}`}>
      <Icon name="alert" size={18} />
      <span>{children}</span>
    </p>
  )
}

/* ------------------------- Doctor profile modal --------------------- */

function DoctorModal({ doctor, info, onBook, onClose }) {
  const st = STATUS[info.status]
  return (
    <Modal titleId="doc-title" onClose={onClose}>
      <div className="dm-head">
        <div className="avatar avatar-lg"><Avatar look={doctor.look} size={104} /></div>
        <div>
          <h2 id="doc-title">{doctor.name}</h2>
          <p className="dm-spec">{doctor.specialty}</p>
          <div className="dm-tags">
            <span className="tag"><Icon name={DEPT_ICON[doctor.department]} size={15} /> {doctor.department}</span>
            <span className={`pill ${st.cls}`}><span className="dot" /> {st.label}</span>
          </div>
        </div>
      </div>
      <p className="dm-bio">{doctor.bio}</p>
      <p className="doc-meta">🏥 Hospital: {doctor.hospital}</p>
      <p className="doc-meta">📍 Location: {doctor.hospitalArea}</p>
      <dl className="dm-list">
        <div><dt><Icon name="award" size={18} /> Experience</dt><dd>{doctor.years} years (sample data)</dd></div>
        <div><dt><Icon name="globe" size={18} /> Languages</dt><dd>{doctor.languages.join(', ')}</dd></div>
        <div><dt><Icon name="stethoscope" size={18} /> Focus areas</dt><dd>{doctor.focus.join(' · ')}</dd></div>
        <div><dt><Icon name="clock" size={18} /> Next demo slot</dt><dd>{info.nextLabel}</dd></div>
      </dl>
      <DemoNote>This is a fictional profile used for demonstration. Schedules shown are generated sample data.</DemoNote>
      <div className="modal-actions">
        <button type="button" className="btn btn-primary" onClick={() => onBook(doctor)}>
          Book appointment <Icon name="arrow" size={18} />
        </button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  )
}

/* ------------------------- Booking modal ---------------------------- */

function BookingModal({ doctor, onClose, notify }) {
  const days = useMemo(() => getUpcomingDays(7), [])
  const [form, setForm] = useState({
    doctorId: doctor ? String(doctor.id) : '',
    name: '',
    email: '',
    phone: '',
    reason: '',
  })
  const [dayKey, setDayKey] = useState('')
  const [slot, setSlot] = useState('')
  const [errors, setErrors] = useState({})
  const [confirmed, setConfirmed] = useState(null)

  const selDoc = DOCTORS.find((d) => String(d.id) === form.doctorId)
  const selDay = days.find((d) => d.key === dayKey)
  const hospitalName = selDoc?.hospital || 'Hospital not assigned'
const hospitalLocation = selDoc?.hospitalArea || 'Location not available'
  const slots =
    selDoc && selDay
      ? SLOT_TIMES.map((t) => ({
          time: t,
          off: isSlotUnavailable(selDoc.id, selDay.key, t, selDay.index === 0),
        }))
      : []
  const freeCount = slots.filter((s) => !s.off).length

  const clearError = (k) => {
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const setField = (k) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [k]: value }))
    clearError(k)
    if (k === 'doctorId') setSlot('')
  }

  const pickDay = (key) => {
    setDayKey(key)
    setSlot('')
    clearError('date')
  }

  const pickSlot = (t) => {
    setSlot(t)
    clearError('slot')
  }

  const inputProps = (id, key) => ({
    id,
    'aria-invalid': errors[key] ? 'true' : 'false',
    'aria-describedby': errors[key] ? `${id}-err` : undefined,
    className: errors[key] ? 'has-error' : undefined,
  })

  const validate = () => {
    const e = {}
    if (!form.doctorId) e.doctorId = 'Please choose a doctor.'
    if (!dayKey) e.date = 'Please select a date.'
    else if (!slot) e.slot = 'Please pick an available time slot.'
    if (form.name.trim().length < 2) e.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if (!/^[+\d][\d\s-]{6,17}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number (7–15 digits).'
    if (form.reason.trim().length < 5) e.reason = 'Briefly describe the reason for your visit.'
    return e
  }

  const focusMap = {
    doctorId: 'bk-doctor',
    date: 'bk-dates',
    slot: 'bk-slots',
    name: 'bk-name',
    email: 'bk-email',
    phone: 'bk-phone',
    reason: 'bk-reason',
  }

 
const submit = async (e) => {
  e.preventDefault()
  const er = validate()
  setErrors(er)
  const keys = Object.keys(er)

  if (keys.length) {
    const el = document.getElementById(focusMap[keys[0]])
    if (el) el.focus()
    notify('error', 'Please fix the highlighted fields to continue.')
    return
  }

  try {
    const saved = await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify({
        patientName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        doctorName: selDoc.name,
        department: selDoc.department,
        appointmentDate: dayKey,
        appointmentTime: slot,
        reason: form.reason.trim(),
      }),
    })

    setConfirmed({
      ref: `APT-${saved.id}`,
      doc: selDoc,
      day: selDay,
      slot,
      name: form.name.trim(),
    })

    notify('success', 'Appointment saved successfully.')
  } catch (error) {
    notify('error', 'Could not save the appointment. Please check that the backend is running and try again.')
  }
}
  const reset = () => {
    setConfirmed(null)
    setForm({ doctorId: '', name: '', email: '', phone: '', reason: '' })
    setDayKey('')
    setSlot('')
    setErrors({})
  }

  if (confirmed) {
    return (
      <Modal titleId="bk-title" onClose={onClose}>
        <div className="success">
          <span className="success-icon"><Icon name="check" size={34} /></span>
          <h2 id="bk-title">Appointment booked successfully!!!</h2>
          <p className="success-sub">
            Thanks, {confirmed.name.split(' ')[0]}. Your appointment has been saved successfully.
          </p>
          <dl className="summary">
            <div><dt>Reference</dt><dd>{confirmed.ref}</dd></div>
            <div><dt>Doctor</dt><dd>{confirmed.doc.name} · {confirmed.doc.department}</dd></div>
            <div><dt>Date</dt><dd>{confirmed.day.long}</dd></div>
            <div><dt>Time</dt><dd>{confirmed.slot}</dd></div>
          </dl>
          <DemoNote>Your appointment details are saved in the database.</DemoNote>
          <div className="modal-actions">
            <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
            <button type="button" className="btn btn-ghost" onClick={reset}>Book another</button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal titleId="bk-title" size="lg" onClose={onClose}>
      <p className="eyebrow">Step by step</p>
      <h2 id="bk-title" className="modal-title">Book an appointment</h2>
      <DemoNote>Your booking will be saved to the backend database.</DemoNote>

      <form onSubmit={submit} noValidate className="form">
        <Field id="bk-doctor" label="Doctor" error={errors.doctorId}>
          <select {...inputProps('bk-doctor', 'doctorId')} value={form.doctorId} onChange={setField('doctorId')}>
            <option value="">Select a doctor</option>
            {DOCTORS.map((d) => (
              <option key={d.id} value={d.id}>{d.name} — {d.department}</option>
            ))}
          </select>
        </Field>
                {selDoc && (
          <div className="field">
            <span className="label">Hospital Details</span>
            <p>🏥 {hospitalName}</p>
            <p>📍 {hospitalLocation}</p>
          </div>
        )}
        <div className="field">
          <span className="label" id="bk-dates-label">Choose a date</span>
          <div
            className="dates"
            id="bk-dates"
            role="group"
            aria-labelledby="bk-dates-label"
            tabIndex={-1}
            aria-describedby={errors.date ? 'bk-dates-err' : undefined}
          >
            {days.map((d) => (
              <button
                key={d.key}
                type="button"
                className="date-btn"
                aria-pressed={dayKey === d.key}
                onClick={() => pickDay(d.key)}
              >
                <span>{d.dow}</span>
                <b>{d.day}</b>
                <span>{d.month}</span>
              </button>
            ))}
          </div>
          {errors.date && <p className="err" id="bk-dates-err"><Icon name="alert" size={15} /> {errors.date}</p>}
        </div>

        <div className="field">
          <span className="label" id="bk-slots-label">Available time slots</span>
          <div
            className="slots"
            id="bk-slots"
            role="group"
            aria-labelledby="bk-slots-label"
            tabIndex={-1}
            aria-describedby={errors.slot ? 'bk-slots-err' : undefined}
          >
            {!selDoc || !selDay ? (
              <p className="hint">Select a doctor and a date to see demo time slots.</p>
            ) : freeCount === 0 ? (
              <p className="hint">No demo slots left for this day. Try another date.</p>
            ) : (
              slots.map((s) => (
                <button
                  key={s.time}
                  type="button"
                  className="slot"
                  disabled={s.off}
                  aria-pressed={slot === s.time}
                  onClick={() => pickSlot(s.time)}
                >
                  {s.time}
                </button>
              ))
            )}
          </div>
          {errors.slot && <p className="err" id="bk-slots-err"><Icon name="alert" size={15} /> {errors.slot}</p>}
        </div>

        <div className="row">
          <Field id="bk-name" label="Full name" error={errors.name}>
            <input {...inputProps('bk-name', 'name')} type="text" autoComplete="name" value={form.name} onChange={setField('name')} />
          </Field>
          <Field id="bk-phone" label="Phone number" error={errors.phone}>
            <input {...inputProps('bk-phone', 'phone')} type="tel" autoComplete="tel" value={form.phone} onChange={setField('phone')} />
          </Field>
        </div>
        <Field id="bk-email" label="Email address" error={errors.email}>
          <input {...inputProps('bk-email', 'email')} type="email" autoComplete="email" value={form.email} onChange={setField('email')} />
        </Field>
        <Field id="bk-reason" label="Reason for visit" error={errors.reason}>
          <textarea {...inputProps('bk-reason', 'reason')} rows={3} value={form.reason} onChange={setField('reason')} />
        </Field>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary">Book appointment</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  )
}

/* --------------------------- Auth modal ----------------------------- */

function AuthModal({ initialMode, onClose, notify, role = 'PATIENT', onLoginSuccess }) {
  const [mode, setMode] = useState(
  role === 'DOCTOR' ? 'login' : initialMode
)
  const [f, setF] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const isReg = mode === 'register'

  const set = (k) => (e) => {
    const value = e.target.value
    setF((s) => ({ ...s, [k]: value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const switchMode = (m) => {
    setMode(m)
    setErrors({})
  }

  const props = (key) => ({
    id: `au-${key}`,
    'aria-invalid': errors[key] ? 'true' : 'false',
    'aria-describedby': errors[key] ? `au-${key}-err` : undefined,
    className: errors[key] ? 'has-error' : undefined,
  })

  const submit = async (e) => {
    e.preventDefault()

    const er = {}

    if (isReg && f.name.trim().length < 2) {
      er.name = 'Enter your full name.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
      er.email = 'Enter a valid email address.'
    }

    if (isReg ? f.password.length < 8 : !f.password) {
      er.password = isReg
        ? 'Use at least 8 characters.'
        : 'Enter your password.'
    }

    if (isReg && f.confirm !== f.password) {
      er.confirm = 'Passwords do not match.'
    }

    setErrors(er)

    const first = Object.keys(er)[0]

    if (first) {
      document.getElementById(`au-${first}`)?.focus()
      notify('error', 'Please fix the highlighted fields.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `http://localhost:8080/api/auth/${isReg ? 'register' : 'login'}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            isReg
              ? {
                  name: f.name.trim(),
                  email: f.email.trim(),
                  password: f.password,
                }
              : {
                  email: f.email.trim(),
                  password: f.password,
                }
          ),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Request failed.')
      }

      if (isReg) {
        notify('success', 'Registration successful! Please sign in.');
        switchMode('login');
        setF((old) => ({ ...old, password: '', confirm: '' }));
        return;
      }

      
if (data.role !== role) {
  throw new Error(`This account is not registered as a ${role.toLowerCase()}. Please choose the correct login option.`);
}

if (!data.token) {
  throw new Error('Login response did not include an authentication token.');
}

sessionStorage.setItem('medicare_token', data.token);

notify('success', `Welcome back, ${data.name}!`);
onLoginSuccess?.(data);
onClose();

    } catch (error) {
      notify(
        'error',
        error.message || 'Could not connect to the backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal titleId="au-title" onClose={onClose}>
      <p className="eyebrow">{role === 'DOCTOR' ? 'Doctor portal' : 'Patient portal'}</p>

      <h2 id="au-title" className="modal-title">
        {isReg ? 'Create your patient account' : `${role === 'DOCTOR' ? 'Doctor' : 'Patient'} sign in`}
      </h2>

      <div className="tabs" role="tablist" aria-label="Account options">
        <button
          type="button"
          role="tab"
          aria-selected={!isReg}
          className="tab"
          onClick={() => switchMode('login')}
        >
          Sign in
        </button>

                {role === 'PATIENT' && (
          <button
            type="button"
            role="tab"
            aria-selected={isReg}
            className="tab"
            onClick={() => switchMode('register')}
          >
            Register
          </button>
        )}
      </div>

      <form onSubmit={submit} noValidate className="form" role="tabpanel">
        {isReg && (
          <Field id="au-name" label="Full name" error={errors.name}>
            <input
              {...props('name')}
              type="text"
              autoComplete="name"
              value={f.name}
              onChange={set('name')}
            />
          </Field>
        )}

        <Field id="au-email" label="Email address" error={errors.email}>
          <input
            {...props('email')}
            type="email"
            autoComplete="email"
            value={f.email}
            onChange={set('email')}
          />
        </Field>

        <Field
          id="au-password"
          label="Password"
          error={errors.password}
          hint={isReg ? 'At least 8 characters.' : undefined}
        >
          <input
            {...props('password')}
            type="password"
            autoComplete={isReg ? 'new-password' : 'current-password'}
            value={f.password}
            onChange={set('password')}
          />
        </Field>

        {isReg && (
          <Field
            id="au-confirm"
            label="Confirm password"
            error={errors.confirm}
          >
            <input
              {...props('confirm')}
              type="password"
              autoComplete="new-password"
              value={f.confirm}
              onChange={set('confirm')}
            />
          </Field>
        )}

        <div className="modal-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isReg
                ? 'Create account'
                : 'Sign in'}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}


/* ----------------------- Patient records modal ---------------------- */

function PatientRecordsModal({ prescriptions, onClose }) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [lastQuery, setLastQuery] = useState('')

  const run = async (q) => {
    setLoading(true)
    setLoadError('')
    try {
      const found = await searchPatients(q)
      setResults(found)
      setSelectedId(found.length ? found[0].id : null)
      setLastQuery(q)
    } catch {
      setResults([])
      setSelectedId(null)
      setLoadError('Could not load patient records from the backend. Check that the Spring Boot server is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    run('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) {
      setError('Enter a patient ID or name to search.')
      return
    }
    if (q.length < 2) {
      setError('Enter at least 2 characters.')
      return
    }
    if (!/^[\w\s.'-]+$/.test(q)) {
      setError('Use only letters, numbers, spaces, dots, hyphens or apostrophes.')
      return
    }
    setError('')
    run(q)
  }

  const onReset = () => {
    setQuery('')
    setError('')
    run('')
  }

  const selected = results.find((p) => p.id === selectedId) || null
  const rxForPatient = selected
    ? prescriptions.filter((r) => r.patientId.toLowerCase() === selected.id.toLowerCase())
    : []

  return (
    <Modal titleId="pr-title" size="xl" onClose={onClose}>
      <p className="eyebrow">Healthcare services</p>
      <h2 id="pr-title" className="modal-title">Patient records</h2>
      <DemoNote>
        {USE_BACKEND
          ? 'Records are loaded from the Spring Boot backend.'
          : 'Demonstration data: every patient shown here is a fictional sample, not a real patient record.'}
      </DemoNote>

      <form className="pr-search" onSubmit={onSearch} noValidate>
        <div className="field pr-search-field">
          <label htmlFor="pr-query">Search by patient ID or name</label>
          <input
            id="pr-query"
            type="search"
            placeholder="For example P-1001 or Asha"
            value={query}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'pr-query-err' : undefined}
            className={error ? 'has-error' : undefined}
            onChange={(e) => {
              setQuery(e.target.value)
              if (error) setError('')
            }}
          />
          {error && (
            <p className="err" id="pr-query-err"><Icon name="alert" size={15} /> {error}</p>
          )}
        </div>
        <div className="pr-search-actions">
          <button type="submit" className="btn btn-primary">
            <Icon name="search" size={18} /> Search
          </button>
          <button type="button" className="btn btn-ghost" onClick={onReset}>Show all</button>
        </div>
      </form>

      {loadError && (
        <p className="err pr-load-err" role="alert"><Icon name="alert" size={16} /> {loadError}</p>
      )}

      <p className="count" role="status" aria-live="polite">
        {loading ? 'Loading records…' : `Showing ${results.length} ${results.length === 1 ? 'record' : 'records'}`}
      </p>

      {!loading && !loadError && results.length === 0 ? (
        <div className="empty">
          <Icon name="search" size={30} />
          <h3>No records found</h3>
          <p>
            No patient matches “{lastQuery}”. Check the patient ID (for example P-1001) or try a different name.
          </p>
          <button type="button" className="btn btn-dark btn-sm" onClick={onReset}>Show all records</button>
        </div>
      ) : (
        !loadError && (
          <div className="pr-grid">
            <ul className="pr-list" aria-label="Patient list">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="pr-item"
                    aria-pressed={selectedId === p.id}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <strong>{p.name}</strong>
                    <span>{p.id}</span>
                  </button>
                </li>
              ))}
            </ul>

            {selected && (
              <article className="pr-detail" aria-label={`Record for ${selected.name}`}>
                <div className="pr-detail-head">
                  <h3>{selected.name}</h3>
                  <span className="tag">{selected.id}</span>
                </div>
                <dl className="facts">
                  <div className="fact"><dt>Age</dt><dd>{selected.age}</dd></div>
                  <div className="fact"><dt>Gender</dt><dd>{selected.gender}</dd></div>
                  <div className="fact"><dt>Contact</dt><dd>{selected.phone}</dd></div>
                </dl>

                <div className="pr-block">
                  <h4>Diagnosis</h4>
                  <p>{selected.diagnosis}</p>
                </div>
                <div className="pr-block">
                  <h4>Doctor notes</h4>
                  <p>{selected.notes}</p>
                </div>

                <div className="pr-block">
                  <h4>Appointment history</h4>
                  {selected.appointments.length === 0 ? (
                    <p className="hint">No appointments on record.</p>
                  ) : (
                    <div className="table-wrap">
                      <table className="hist">
                        <caption className="sr-only">Appointment history for {selected.name}</caption>
                        <thead>
                          <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Doctor</th>
                            <th scope="col">Department</th>
                            <th scope="col">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.appointments.map((a, i) => (
                            <tr key={`${a.date}-${i}`}>
                              <td>{formatDate(a.date)}</td>
                              <td>{a.doctor}</td>
                              <td>{a.department}</td>
                              <td>
                                <span className={`pill ${a.status === 'Completed' ? 'st-available' : a.status === 'Scheduled' ? 'st-soon' : 'st-limited'}`}>
                                  {a.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {rxForPatient.length > 0 && (
                  <div className="pr-block">
                    <h4>Prescriptions written in this session</h4>
                    <ul className="rx-mini">
                      {rxForPatient.map((r) => (
                        <li key={r.ref}>
                          <Icon name="pill" size={18} />
                          <span>
                            <strong>{r.medicine}</strong> · {r.dosage} · {r.frequency} · {r.duration} days
                            <em>{r.storage === 'backend' ? ' (saved to backend)' : ' (frontend memory only)'}</em>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            )}
          </div>
        )
      )}

      <div className="modal-actions">
        <button type="button" className="btn btn-dark" onClick={onClose}>Close</button>
      </div>
    </Modal>
  )
}

/* -------------------- Patient prescriptions modal -------------------- */

function PatientPrescriptionsModal({ onClose }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        // The backend uses the signed-in patient's JWT to filter prescriptions.
        // Do not send a patient ID from the browser.
        const data = await apiRequest('/prescriptions')
        if (!cancelled) setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load prescriptions. Please sign in again and try once more.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return (
    <Modal titleId="patient-rx-title" size="xl" onClose={onClose}>
      <p className="eyebrow">Your health information</p>
      <h2 id="patient-rx-title" className="modal-title">My prescriptions</h2>
      <DemoNote>These prescriptions are loaded from the backend for your signed-in patient account.</DemoNote>

      {loading && <p className="sub" role="status">Loading your prescriptions…</p>}
      {error && <p className="err" role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <div className="empty">
          <Icon name="pill" size={30} />
          <h3>No prescriptions found</h3>
          <p>Your doctor has not saved a prescription for this account yet.</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ display: 'grid', gap: 16 }}>
          {items.map((rx) => (
            <article key={rx.id} className="rx-sheet">
              <div className="rx-head">
                <div>
                  <h3 style={{ marginBottom: 4 }}>Prescription {rx.id ? `#${rx.id}` : ''}</h3>
                  <p className="sub">{rx.createdAt ? formatDateTime(rx.createdAt) : 'Date not available'}</p>
                </div>
                <span className="tag">Saved prescription</span>
              </div>
              <dl className="rx-people">
                <div><dt>Patient</dt><dd>{rx.patientName || '—'}</dd></div>
                <div><dt>Doctor</dt><dd>{rx.doctorName || '—'}</dd></div>
                <div><dt>Appointment</dt><dd>{rx.appointmentId ?? '—'}</dd></div>
              </dl>
              <div className="rx-block"><h4>Diagnosis</h4><p>{rx.diagnosis || 'Not recorded'}</p></div>
              <div className="table-wrap">
                <table className="rx-table">
                  <thead><tr><th scope="col">Medicine</th><th scope="col">Dosage</th><th scope="col">Frequency</th><th scope="col">Duration</th></tr></thead>
                  <tbody><tr>
                    <td>{rx.medicineName || '—'}</td>
                    <td>{rx.dosage || '—'}</td>
                    <td>{rx.frequency || '—'}</td>
                    <td>{rx.durationDays ? `${rx.durationDays} ${Number(rx.durationDays) === 1 ? 'day' : 'days'}` : '—'}</td>
                  </tr></tbody>
                </table>
              </div>
              <div className="rx-block"><h4>Instructions</h4><p>{rx.instructions || 'No additional instructions recorded.'}</p></div>
            </article>
          ))}
        </div>
      )}

      <div className="modal-actions">
        <button type="button" className="btn btn-dark" onClick={onClose}>Close</button>
      </div>
    </Modal>
  )
}

/* --------------------- Digital prescription modal ------------------- */

const EMPTY_RX = {
  patientId: '',
  patientName: '',
  doctor: '',
  diagnosis: '',
  medicine: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
}

function validateRx(f) {
  const e = {}
  if (!/^[A-Za-z0-9-]{3,20}$/.test(f.patientId.trim())) {
    e.patientId = 'Enter a patient ID of 3–20 letters, numbers or hyphens (for example P-1001).'
  }
  if (f.patientName.trim().length < 2) e.patientName = 'Enter the patient name.'
  if (!f.doctor) e.doctor = 'Please choose the prescribing doctor.'
  if (f.diagnosis.trim().length < 3) e.diagnosis = 'Enter a diagnosis.'
  if (f.medicine.trim().length < 2) e.medicine = 'Enter the medicine name.'
  if (!/\d/.test(f.dosage)) e.dosage = 'Include an amount, for example 500 mg.'
  if (!f.frequency) e.frequency = 'Choose how often to take it.'
  const days = Number(f.duration)
  if (!f.duration || !Number.isInteger(days) || days < 1 || days > 365) {
    e.duration = 'Enter a whole number of days from 1 to 365.'
  }
  if (f.instructions.trim().length < 5) e.instructions = 'Add short instructions for the patient.'
  return e
}

function RxSheet({ rx }) {
  const storageText =
    rx.storage === 'backend'
      ? 'Saved to the backend database.'
      : rx.storage === 'frontend'
        ? 'Stored in frontend memory only (demo).'
        : 'Preview only. Not saved.'
  return (
    <section className="rx-sheet" aria-label="Prescription">
      <div className="rx-head">
        <Logo />
        <div className="rx-meta">
          <strong>Digital Prescription</strong>
          <span>Ref: {rx.ref}</span>
          <span>{formatDateTime(rx.createdAt)}</span>
        </div>
      </div>

      <dl className="rx-people">
        <div><dt>Patient</dt><dd>{rx.patientName}</dd></div>
        <div><dt>Patient ID</dt><dd>{rx.patientId}</dd></div>
        <div><dt>Prescribed by</dt><dd>{rx.doctor}</dd></div>
      </dl>

      <div className="rx-block">
        <h4>Diagnosis</h4>
        <p>{rx.diagnosis}</p>
      </div>

      <div className="table-wrap">
        <table className="rx-table">
          <caption className="sr-only">Prescribed medicine</caption>
          <thead>
            <tr>
              <th scope="col">Medicine</th>
              <th scope="col">Dosage</th>
              <th scope="col">Frequency</th>
              <th scope="col">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{rx.medicine}</td>
              <td>{rx.dosage}</td>
              <td>{rx.frequency}</td>
              <td>{rx.duration} {Number(rx.duration) === 1 ? 'day' : 'days'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rx-block">
        <h4>Instructions</h4>
        <p>{rx.instructions}</p>
      </div>

      <p className="rx-foot">
        {storageText}
        {rx.storage !== 'backend' && ' Demonstration document, not a valid medical prescription.'}
      </p>
    </section>
  )
}

function PrescriptionModal({ appointment, onSave, onClose, notify }) {
  
 const [form, setForm] = useState(() => ({
  ...EMPTY_RX,
  appointmentId: appointment?.id ?? null,
  patientId: appointment?.patientId ? String(appointment.patientId) : '',
  patientName: appointment?.patientName || '',
  doctor: appointment?.doctorName || '',
}))

  const [errors, setErrors] = useState({})
  const [view, setView] = useState('form')
  const [sheet, setSheet] = useState(null)
  const [saving, setSaving] = useState(false)

  const setField = (k) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [k]: value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const ip = (key) => ({
    id: `rx-${key}`,
    'aria-invalid': errors[key] ? 'true' : 'false',
    'aria-describedby': errors[key] ? `rx-${key}-err` : undefined,
    className: errors[key] ? 'has-error' : undefined,
    value: form[key],
    onChange: setField(key),
  })

  const onPatientIdBlur = () => {
    if (USE_BACKEND || form.patientName.trim()) return
    const match = SAMPLE_PATIENTS.find((p) => p.id.toLowerCase() === form.patientId.trim().toLowerCase())
    if (match) setForm((f) => ({ ...f, patientName: match.name }))
  }

  const check = () => {
    const er = validateRx(form)
    setErrors(er)
    const keys = Object.keys(er)
    if (keys.length) {
      const el = document.getElementById(`rx-${keys[0]}`)
      if (el) el.focus()
      notify('error', 'Please fix the highlighted fields.')
      return false
    }
    return true
  }

  const cleanData = () => ({
  appointmentId: appointment?.id ?? form.appointmentId ?? null,
  patientId: form.patientId.trim(),
  patientName: form.patientName.trim(),
  doctor: form.doctor,
  diagnosis: form.diagnosis.trim(),
  medicine: form.medicine.trim(),
  dosage: form.dosage.trim(),
  frequency: form.frequency,
  duration: Number(form.duration),
  instructions: form.instructions.trim(),
})

  const handlePreview = () => {
    if (!check()) return
    setSheet({ ...cleanData(), ref: 'Preview (not saved)', createdAt: new Date().toISOString(), storage: null })
    setView('preview')
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!check()) return
    setSaving(true)
    try {
      const rx = await onSave(cleanData())
      setSheet(rx)
      setView('saved')
      notify(
        'success',
        rx.storage === 'backend'
          ? 'Prescription saved to the backend.'
          : 'Demo prescription kept in frontend memory only. Nothing was sent to a server.'
      )
    } catch {
      notify('error', 'The prescription could not be saved and nothing was stored. Check the backend server and try again.')
    } finally {
      setSaving(false)
    }
  }

  const startNew = () => {
    setForm(EMPTY_RX)
    setErrors({})
    setSheet(null)
    setView('form')
  }

  if (view === 'saved' && sheet) {
    return (
      <Modal titleId="rx-title" size="lg" onClose={onClose}>
        <h2 id="rx-title" className="modal-title no-print">Prescription saved</h2>
        <p className="ok-banner no-print" role="status">
          <Icon name="check" size={20} />
          <span>
            {sheet.storage === 'backend'
              ? 'Saved to the Spring Boot backend and stored in the MySQL database.'
              : 'Saved in frontend memory only. It is not stored in any backend or database and will disappear when you refresh the page.'}
          </span>
        </p>
        <RxSheet rx={sheet} />
        <div className="modal-actions no-print">
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            <Icon name="printer" size={18} /> Print / Save as PDF
          </button>
          <button type="button" className="btn btn-ghost" onClick={startNew}>New prescription</button>
          <button type="button" className="btn btn-dark" onClick={onClose}>Close</button>
        </div>
      </Modal>
    )
  }

  if (view === 'preview' && sheet) {
    return (
      <Modal titleId="rx-title" size="lg" onClose={onClose}>
        <h2 id="rx-title" className="modal-title no-print">Prescription preview</h2>
        <DemoNote className="no-print">This preview has not been saved yet.</DemoNote>
        <RxSheet rx={sheet} />
        <div className="modal-actions no-print">
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save prescription'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
            <Icon name="printer" size={18} /> Print
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setView('form')}>Back to edit</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal titleId="rx-title" size="lg" onClose={onClose}>
      <p className="eyebrow">Healthcare services</p>
      <h2 id="rx-title" className="modal-title">Digital prescription</h2>
      <DemoNote>
        {USE_BACKEND
          ? 'Prescriptions are sent to the Spring Boot backend when you press Save.'
          : 'Demo mode: prescriptions stay in this page’s memory only and disappear on refresh. Nothing is sent to a server or database.'}
      </DemoNote>

      <form onSubmit={handleSave} noValidate className="form">
        <div className="row">
          <Field id="rx-patientId" label="Patient ID" error={errors.patientId} hint={USE_BACKEND ? undefined : 'Try a sample ID such as P-1001.'}>
            <input {...ip('patientId')} type="text" autoComplete="off" onBlur={onPatientIdBlur} />
          </Field>
          <Field id="rx-patientName" label="Patient name" error={errors.patientName}>
            <input {...ip('patientName')} type="text" autoComplete="off" />
          </Field>
        </div>

        <div className="row">
          <Field id="rx-doctor" label="Doctor name" error={errors.doctor}>
            <select {...ip('doctor')}>
              <option value="">Select a doctor</option>
              {DOCTORS.map((d) => (
                <option key={d.id} value={d.name}>{d.name} — {d.department}</option>
              ))}
            </select>
          </Field>
          <Field id="rx-diagnosis" label="Diagnosis" error={errors.diagnosis}>
            <input {...ip('diagnosis')} type="text" autoComplete="off" />
          </Field>
        </div>

        <Field id="rx-medicine" label="Medicine name" error={errors.medicine}>
          <input {...ip('medicine')} type="text" autoComplete="off" />
        </Field>

        <div className="row row-3">
          <Field id="rx-dosage" label="Dosage" error={errors.dosage} hint="Example: 500 mg">
            <input {...ip('dosage')} type="text" autoComplete="off" />
          </Field>
          <Field id="rx-frequency" label="Frequency" error={errors.frequency}>
            <select {...ip('frequency')}>
              <option value="">Select</option>
              {FREQUENCIES.map((fq) => (
                <option key={fq} value={fq}>{fq}</option>
              ))}
            </select>
          </Field>
          <Field id="rx-duration" label="Duration (days)" error={errors.duration}>
            <input {...ip('duration')} type="number" min="1" max="365" inputMode="numeric" />
          </Field>
        </div>

        <Field id="rx-instructions" label="Instructions" error={errors.instructions}>
          <textarea {...ip('instructions')} rows={3} />
        </Field>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save prescription'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handlePreview}>
            <Icon name="printer" size={18} /> View / Print
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  )
}


const HOSPITALS = [
  { name: 'Apollo Health City', area: 'Jubilee Hills, Hyderabad' },
  { name: 'Apollo Hospitals', area: 'Secunderabad, Hyderabad' },
  { name: 'Apollo Hospitals', area: 'Hyderguda, Hyderabad' },
  { name: 'Apollo Hospitals', area: 'DRDO, Kanchanbagh, Hyderabad' },
  { name: 'Yashoda Hospitals', area: 'Somajiguda, Hyderabad' },
  { name: 'Yashoda Hospitals', area: 'Secunderabad, Hyderabad' },
  { name: 'Yashoda Hospitals', area: 'Malakpet, Hyderabad' },
  { name: 'Yashoda Hospitals', area: 'Hitec City, Hyderabad' },
  { name: 'AIG Hospitals', area: 'Gachibowli, Hyderabad' },
  { name: 'AIG Hospitals', area: 'Banjara Hills, Hyderabad' },
  { name: "Rainbow Children's Hospital", area: 'Mansoorabad, Hyderabad' },
  { name: 'PACE Hospitals', area: 'Madinaguda, Hyderabad' },
]

function HospitalLocations() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(HOSPITALS[0])

  const filtered = HOSPITALS.filter((hospital) =>
    `${hospital.name} ${hospital.area}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const mapQuery = encodeURIComponent(
    `${selected.name}, ${selected.area}`
  )

  return (
    <section className="sec" id="locations">
      <div className="wrap">
        <div className="sec-head">
          <p className="eyebrow">Hospital directory</p>
          <h2>Find a hospital near you.</h2>
          <p className="sub">
            Explore hospital locations and open Google Maps for directions.
            These are external hospitals, not MediCare-owned facilities.
          </p>
        </div>

        <div className="field">
          <label htmlFor="hospital-search">Search hospitals or areas</label>
          <input
            id="hospital-search"
            type="search"
            placeholder="Search by hospital name or area"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
          gap: 20,
          marginTop: 24
        }}>
          <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
            {filtered.map((hospital, index) => (
              <button
                key={`${hospital.name}-${hospital.area}`}
                type="button"
                className={selected === hospital ? 'btn btn-primary' : 'btn btn-ghost'}
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => setSelected(hospital)}
              >
                <span>
                  <strong>{hospital.name}</strong>
                  <br />
                  <small>{hospital.area}</small>
                </span>
              </button>
            ))}

            {filtered.length === 0 && (
              <p>No hospitals match your search.</p>
            )}
          </div>

          <div style={{
            border: '1px solid #D5E1E8',
            borderRadius: 18,
            padding: 16,
            minWidth: 0
          }}>
            <h3>{selected.name}</h3>
            <p>{selected.area}</p>

            <iframe
              key={mapQuery}
              title={`Map of ${selected.name}, ${selected.area}`}
              src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: 12 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <p style={{ marginTop: 16 }}>
              <a
                className="btn btn-primary"
                href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
              >
                Get Directions on Google Maps
              </a>
            </p>

            <p className="hint">
              Verify the exact address and branch in Google Maps before travelling.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}


/* ------------------------------ App --------------------------------- */

function App() {
  const [query, setQuery] = useState('')
  const [dashboardTheme, setDashboardTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('medicare-theme')
      return ['blue', 'teal', 'purple', 'green', 'rose', 'amber'].includes(savedTheme) ? savedTheme : 'blue'
    } catch {
      return 'blue'
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('medicare-theme', dashboardTheme)
    } catch {
      // The theme still works for this session if browser storage is unavailable.
    }
  }, [dashboardTheme])
  const [dept, setDept] = useState('All')
  const [modal, setModal] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [appointmentsError, setAppointmentsError] = useState('')
  const [dashboardNotifications, setDashboardNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState('')
  const [toast, setToast] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const [prescriptions, setPrescriptions] = useState([])
  const [authenticatedUser, setAuthenticatedUser] = useState(null)
  const [assistantQuestion, setAssistantQuestion] = useState('')
  const [assistantReply, setAssistantReply] = useState('')
  const [profile, setProfile] = useState({ dateOfBirth: '', gender: '', bloodGroup: '', heightCm: '', weightKg: '', allergies: '', conditions: '', medications: '', surgeries: '', emergencyName: '', emergencyPhone: '', address: '' })
  const [profileMessage, setProfileMessage] = useState('')
  const [profileErrors, setProfileErrors] = useState({})
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)

  const avail = useMemo(
    () => Object.fromEntries(DOCTORS.map((d) => [d.id, availabilityFor(d)])),
    []
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DOCTORS.filter((d) => {
      const inDept = dept === 'All' || d.department === dept
      const hay = `${d.name} ${d.specialty} ${d.department}`.toLowerCase()
      return inDept && (!q || hay.includes(q))
    })
  }, [query, dept])

  const notify = (kind, msg) => setToast({ kind, msg, id: Date.now() })
  const bmiValue = Number(profile.heightCm) > 0 && Number(profile.weightKg) > 0 ? (Number(profile.weightKg) / ((Number(profile.heightCm) / 100) ** 2)).toFixed(1) : ''
  const emptyProfile = {
    dateOfBirth: '', gender: '', bloodGroup: '', heightCm: '', weightKg: '',
    allergies: '', conditions: '', medications: '', surgeries: '',
    emergencyName: '', emergencyPhone: '', address: '',
  }

  // Load the signed-in account's saved profile from MySQL through Spring Boot.
  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      if (!authenticatedUser?.id) {
        setProfile(emptyProfile)
        setProfileMessage('')
        setProfileLoading(false)
        return
      }

      setProfileLoading(true)
      setProfileMessage('Loading your saved profile…')
      try {
        const saved = await apiRequest(`/patients/${authenticatedUser.id}`)
        if (cancelled) return
        setProfile({
          dateOfBirth: saved.dateOfBirth || '',
          gender: saved.gender || '',
          bloodGroup: saved.bloodGroup || '',
          heightCm: saved.heightCm == null ? '' : String(saved.heightCm),
          weightKg: saved.weightKg == null ? '' : String(saved.weightKg),
          allergies: saved.allergies || '',
          conditions: saved.existingConditions || '',
          medications: saved.currentMedications || '',
          surgeries: saved.previousSurgeries || '',
          emergencyName: saved.emergencyContactName || '',
          emergencyPhone: saved.emergencyContactPhone || '',
          address: saved.address || '',
        })
        setProfileMessage('Your saved profile has been loaded.')
      } catch (error) {
        if (!cancelled) {
          setProfileMessage(error.message || 'Could not load your saved profile. Check that the backend is running and you are signed in.')
        }
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    loadProfile()
    return () => { cancelled = true }
    // Load again when the signed-in account changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser?.id, authenticatedUser?.role])

  const saveProfile = async (e) => {
    e.preventDefault()
    const errors = {}
    if (profile.heightCm && (Number(profile.heightCm) < 30 || Number(profile.heightCm) > 250)) errors.heightCm = 'Enter a height between 30 and 250 cm.'
    if (profile.weightKg && (Number(profile.weightKg) < 2 || Number(profile.weightKg) > 500)) errors.weightKg = 'Enter a weight between 2 and 500 kg.'
    if (profile.emergencyPhone && !/^[+\d][\d\s()-]{6,18}$/.test(profile.emergencyPhone.trim())) errors.emergencyPhone = 'Enter a valid emergency phone number.'
    setProfileErrors(errors)
    if (Object.keys(errors).length) { setProfileMessage('Please correct the highlighted fields.'); return }
    if (!authenticatedUser?.id || !sessionStorage.getItem('medicare_token')) {
      setProfileMessage('Please sign in again before saving your profile.')
      return
    }

    setProfileSaving(true)
    setProfileMessage('')
    try {
      const saved = await apiRequest(`/patients/${authenticatedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          bloodGroup: profile.bloodGroup,
          heightCm: profile.heightCm === '' ? null : Number(profile.heightCm),
          weightKg: profile.weightKg === '' ? null : Number(profile.weightKg),
          allergies: profile.allergies,
          existingConditions: profile.conditions,
          currentMedications: profile.medications,
          previousSurgeries: profile.surgeries,
          emergencyContactName: profile.emergencyName,
          emergencyContactPhone: profile.emergencyPhone,
          address: profile.address,
        }),
      })

      setProfile({
        dateOfBirth: saved.dateOfBirth || '',
        gender: saved.gender || '',
        bloodGroup: saved.bloodGroup || '',
        heightCm: saved.heightCm == null ? '' : String(saved.heightCm),
        weightKg: saved.weightKg == null ? '' : String(saved.weightKg),
        allergies: saved.allergies || '',
        conditions: saved.existingConditions || '',
        medications: saved.currentMedications || '',
        surgeries: saved.previousSurgeries || '',
        emergencyName: saved.emergencyContactName || '',
        emergencyPhone: saved.emergencyContactPhone || '',
        address: saved.address || '',
      })
      setProfileMessage('Profile saved successfully to the hospital database.')
      notify('success', 'Your profile was saved to the hospital database.')
    } catch (error) {
      setProfileMessage(error.message || 'Could not save your profile. Check that the backend is running, then try again.')
    } finally {
      setProfileSaving(false)
    }
  }
  const loadAppointments = async () => {
    setAppointmentsLoading(true)
    setAppointmentsError('')

    try {
      const data = await apiRequest('/appointments')
      setAppointments(data)
    } catch (error) {
      setAppointmentsError(
        'Could not load appointments. Check that the backend is running.'
      )
    } finally {



      setAppointmentsLoading(false)
    }
  }

  const loadNotifications = async () => {
    if (!authenticatedUser) return
    setNotificationsLoading(true)
    setNotificationsError('')
    try {
      const data = await apiRequest('/notifications')
      setDashboardNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      setNotificationsError(error.message || 'Could not load dashboard notifications.')
    } finally {
      setNotificationsLoading(false)
    }
  }

  
const markNotificationRead = async (id) => {
  try {
    await apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    })

    setDashboardNotifications((items) =>
      items.map((item) => String(item.id) === String(id) ? { ...item, read: true } : item)
    )
  } catch (error) {
    notify('error', error.message || 'Could not update notification.')
  }
}


  
const markAllNotificationsRead = async () => {
  try {
    await apiRequest('/notifications/read-all', {
      method: 'PUT',
    })

    setDashboardNotifications((items) => items.map((item) => ({ ...item, read: true })))
  } catch (error) {
    notify('error', error.message || 'Could not mark notifications as read.')
  }
}


const clearNotifications = async () => {
  if (!dashboardNotifications.length || notificationsLoading) return
  if (!window.confirm('Clear all notifications for your account? This cannot be undone.')) return

  setNotificationsLoading(true)
  setNotificationsError('')
  try {
    const deletedCount = await apiRequest('/notifications', { method: 'DELETE' })
    setDashboardNotifications([])
    notify('success', `Notifications cleared${Number.isFinite(Number(deletedCount)) ? ` (${Number(deletedCount)} removed)` : ''}.`)
  } catch (error) {
    notify('error', error.message || 'Could not clear notifications. Please try again.')
  } finally {
    setNotificationsLoading(false)
  }
}


  // Load only the appointments permitted for the signed-in account.
  useEffect(() => {
    if (!authenticatedUser) return
    loadAppointments()
    loadNotifications()
    // Refresh updates while the dashboard is open, so changes from another
    // account appear without requiring a manual page reload.
    const refreshId = window.setInterval(() => {
      loadNotifications()
    }, 15000)
    return () => window.clearInterval(refreshId)
    // The login identity determines which appointments and notifications the backend returns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser?.id, authenticatedUser?.role])


  
  const handleCancelAppointment = async (id) => {
    if (!window.confirm(`Cancel appointment #${id}?`)) return

    try {
      await apiRequest(`/appointments/${id}/cancel`, {
        method: 'PUT',
      })

      setAppointments((previous) =>
        previous.filter(
          (appointment) => String(appointment.id) !== String(id)
        )
      )

      await loadNotifications()
      notify('success', 'Appointment cancelled successfully. Notification list refreshed.')
    } catch (error) {
      notify(
        'error',
        error.message || 'Could not cancel appointment. Please try again.'
      )
    }
  }

  const handleRescheduleAppointment = async (appointment) => {
    const newDate = window.prompt(
      'Enter new date (YYYY-MM-DD):',
      appointment.appointmentDate
    )

    if (newDate === null) return

    const newTime = window.prompt(
      'Enter new time (for example, 09:00 AM):',
      appointment.appointmentTime
    )

    if (newTime === null) return

    if (!newDate.trim() || !newTime.trim()) {
      notify('error', 'Date and time are required.')
      return
    }

    try {
      await apiRequest(`/appointments/${appointment.id}/reschedule`, {
        method: 'PUT',
        body: JSON.stringify({
          appointmentDate: newDate.trim(),
          appointmentTime: newTime.trim(),
        }),
      })

      await loadAppointments()
      await loadNotifications()
      notify('success', 'Appointment rescheduled successfully.')
    } catch (error) {
      notify(
        'error',
        error.message || 'Could not reschedule appointment. Please try again.'
      )
    }
  }

      /* Saves a prescription: to the backend if enabled, otherwise to frontend state only. */
  

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 5500)
    return () => clearTimeout(t)
  }, [toast])

const handleSavePrescription = async (data) => {
  let rx

  if (USE_BACKEND) {
    const appointmentId = Number(data.appointmentId)

    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      notify('error', 'Appointment ID is missing. Close this form and open Create prescription from the appointment card.')
      throw new Error('A valid appointment ID is required.')
    }

    const saved = await apiRequest('/prescriptions', {
      method: 'POST',
      body: JSON.stringify({
        appointmentId,
        patientCode: data.patientId,
        diagnosis: data.diagnosis,
        medicineName: data.medicine,
        dosage: data.dosage,
        frequency: data.frequency,
        durationDays: Number(data.duration),
        instructions: data.instructions,
      }),
    })

    rx = {
      ...data,
      appointmentId,
      patientAccountId: saved.patientAccountId,
      patientName: saved.patientName,
      doctor: saved.doctorName,
      ref: `RX-${saved.id}`,
      createdAt: saved.createdAt || new Date().toISOString(),
      storage: 'backend',
    }
  } else {
    rx = {
      ...data,
      ref: `RX-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      storage: 'frontend',
    }
  }

  setPrescriptions((list) => [rx, ...list])
  return rx
}

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined
    const ids = ['home', 'services', 'doctors', 'how', 'about']
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(en.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
    setMenuOpen(false)
  }

  const go = (id) => (e) => {
    e.preventDefault()
    scrollToId(id)
  }

  const openBook = (doc = null) => {
    setMenuOpen(false)
    setModal({ type: 'book', doctor: doc })
  }
  const openAuth = (mode) => {
    setMenuOpen(false)
    setModal({ type: 'auth', mode })
  }
  const openRecords = () => setModal({ type: 'records' })
   const openRx = (appointment = null) => {
  setMenuOpen(false)
  setModal({ type: 'rx', appointment })
}
  const closeModal = () => setModal(null)

  const heroDoc = DOCTORS[0]
  const heroInfo = avail[heroDoc.id]
  const heroNext = heroInfo.next

  const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'doctors', label: 'Find Doctors' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'about', label: 'About' },
  { id: 'locations', label: 'Hospitals' },
]

  // First screen: visitors must choose a role before seeing the main website.
  if (!authenticatedUser) {
    return (
      <div className="mc" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: 'linear-gradient(180deg,#E6F5F2,#F7FAFC)' }}>
        <style>{css}</style>
        <main style={{ width: 'min(760px,100%)', background: '#fff', padding: 'clamp(24px,5vw,52px)', borderRadius: '28px', boxShadow: '0 24px 70px -35px rgba(23,50,77,.45)', textAlign: 'center', border: '1px solid #D5E1E8' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}><Logo /></div>
          <p className="eyebrow">Hospital appointment & patient management</p>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', marginBottom: '14px' }}>Welcome to MediCare</h1>
          <p style={{ color: '#526575', margin: '0 auto 30px', maxWidth: '500px' }}>Choose your portal to continue.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', textAlign: 'left' }}>
            <section style={{ border: '1px solid #D5E1E8', borderRadius: '20px', padding: '24px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👤</div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Patient portal</h2>
              <p style={{ color: '#526575', marginBottom: '18px' }}>Sign in or create a patient account to continue.</p>
              <div style={{ display: 'grid', gap: '10px' }}>
                <button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'auth', mode: 'login', role: 'PATIENT' })}>Patient Login</button>
                <button type="button" className="btn btn-ghost" onClick={() => setModal({ type: 'auth', mode: 'register', role: 'PATIENT' })}>Patient Registration</button>
              </div>
            </section>
            <section style={{ border: '1px solid #D5E1E8', borderRadius: '20px', padding: '24px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🩺</div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Doctor portal</h2>
              <p style={{ color: '#526575', marginBottom: '18px' }}>For authorized doctor accounts only.</p>
              <button type="button" className="btn btn-dark" style={{ width: '100%' }} onClick={() => setModal({ type: 'auth', mode: 'login', role: 'DOCTOR' })}>Doctor Login</button>
            </section>
          </div>
          <p style={{ color: '#526575', fontSize: '.82rem', marginTop: '24px' }}>Demo project: role-specific dashboards and secure sessions are still being implemented. Do not enter real medical information.</p>
        </main>
        {toast && <div className={`toast toast-${toast.kind}`} style={{ background: '#142235', color: '#F1F5F9', border: '1px solid #35536A', borderLeft: `5px solid ${toast.kind === 'error' ? '#FCA5A5' : '#5EEAD4'}`, boxShadow: '0 18px 42px rgba(0,0,0,.45)' }} role={toast.kind === 'error' ? 'alert' : 'status'}><span>{toast.msg}</span><button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">×</button></div>}
        {modal && modal.type === 'auth' && (
          <AuthModal key={`auth-${modal.mode}-${modal.role}`} initialMode={modal.mode} role={modal.role} onClose={closeModal} notify={notify} onLoginSuccess={setAuthenticatedUser} />
        )}
      </div>
    )
  }

  // Separate role dashboards: patient accounts never see the doctor prescription-writing tools.
  if (authenticatedUser) {
    const isDoctor = authenticatedUser.role === 'DOCTOR'
    const signOut = () => {
      sessionStorage.removeItem('medicare_token')
      setAuthenticatedUser(null)
      setAppointments([])
      setPrescriptions([])
      setAssistantReply('')
      setModal(null)
      notify('success', 'You have signed out.')
    }

    const askAssistant = (e) => {
      e.preventDefault()
      const q = assistantQuestion.trim().toLowerCase()
      if (!q) return

      // Simple symptom-to-specialty guidance for this student demo; not an AI diagnosis.
      const urgentWords = ['chest pain', 'difficulty breathing', "can't breathe", 'cannot breathe', 'fainting', 'unconscious', 'severe bleeding', 'stroke', 'seizure', 'suicidal']
      if (urgentWords.some((word) => q.includes(word))) {
        setAssistantReply('⚠️ This may be an emergency. Please contact local emergency services or go to the nearest emergency department now. Do not wait for an online assistant or try to treat this at home.')
        return
      }

      if (q.includes('book') || q.includes('appointment')) {
        setAssistantReply('To book an appointment, use the Book button on a doctor card, choose an available date and time, and submit the form. If you describe your concern, I can suggest a suitable specialty to start with.')
      } else if (q.includes('cancel') || q.includes('reschedule')) {
        setAssistantReply('Open your Appointments section, find the appointment, and use Cancel or Reschedule. If it is not listed, refresh the appointments or contact the hospital directly.')
      } else if (q.includes('hospital') || q.includes('direction') || q.includes('address') || q.includes('map')) {
        setAssistantReply('Open Hospital locations below, search for a hospital or area, then select “Get Directions on Google Maps”. Check the exact branch and address before travelling.')
      } else {
        let department = ''
        let care = ''
        if (/(tooth|teeth|toothache|gum|dental)/.test(q)) {
          department = 'Dentistry'; care = 'Until you are seen, gently rinse with warm salt water and avoid very hot, cold or sugary foods if they worsen the pain.'
        } else if (/(rash|itchy skin|itching|acne|skin|pimple)/.test(q)) {
          department = 'Dermatology'; care = 'Avoid scratching and stop using any new product that seems to irritate your skin. Seek urgent care for facial swelling or trouble breathing.'
        } else if (/(eye pain|eyes|vision|blurry vision|red eye)/.test(q)) {
          department = 'Ophthalmology'; care = 'Avoid rubbing your eyes and remove contact lenses. Sudden vision loss or severe eye pain needs urgent medical attention.'
        } else if (/(period|menstrual|pregnan|women.s health|gynec)/.test(q)) {
          department = 'Gynecology'; care = 'Note your symptoms and dates to discuss with the clinician. Severe pain, fainting, or heavy bleeding needs urgent care.'
        } else if (/(ear pain|earache|sinus|throat|tonsil|nose block|blocked nose|sore throat)/.test(q)) {
          department = 'ENT'; care = 'Rest, drink fluids, and try warm drinks or a saline nasal spray if appropriate. Seek care promptly if swallowing or breathing is difficult.'
        } else if (/(stomach|abdomen|abdominal|acidity|heartburn|digestion|vomit|nausea|diarrhea|diarrhoea)/.test(q)) {
          department = 'Gastroenterology'; care = 'Sip fluids regularly and eat small, bland meals if tolerated. Blood in vomit or stool, severe pain, or signs of dehydration need urgent care.'
        } else if (/(headache|migraine|dizzy|dizziness|numbness|tingling|memory)/.test(q)) {
          department = 'Neurology'; care = 'Rest somewhere quiet and drink water if you can. A sudden severe headache, weakness, confusion, or trouble speaking needs emergency care.'
        } else if (/(joint|knee|back pain|bone|fracture|sprain|ankle|shoulder)/.test(q)) {
          department = 'Orthopedics'; care = 'Avoid activities that worsen the pain and protect the affected area. After a serious injury, deformity, or inability to bear weight, seek urgent care.'
        } else if (/(heart|blood pressure|palpitation)/.test(q)) {
          department = 'Cardiology'; care = 'Arrange a clinician review. Chest pain, fainting, or breathing difficulty is an emergency—do not wait for an appointment.'
        } else if (/(cough|cold|fever|flu|weakness|body pain|body ache|runny nose)/.test(q)) {
          department = 'General Medicine'; care = 'Rest, drink fluids, and monitor your temperature. Seek medical advice if symptoms worsen, fever persists, or you are at higher risk.'
        } else if (/(stress|anxiety|panic|depress|mental health|sleep problem)/.test(q)) {
          department = 'Psychiatry'; care = 'Try a calm environment and speak with someone you trust. If you may harm yourself or someone else, seek immediate local emergency support.'
        } else if (/(child|baby|infant|vaccin|pediatric)/.test(q)) {
          department = 'Pediatrics'; care = 'For a child, use age-appropriate professional advice and do not give adult medicines. Babies with fever or difficulty breathing need prompt medical assessment.'
        }

        if (department) {
          const matches = DOCTORS.filter((d) => d.department === department).slice(0, 3)
          const doctorList = matches.length
            ? matches.map((d) => `${d.name} (${d.specialty}) — ${d.hospital}, ${d.hospitalArea}`).join('; ')
            : `a ${department} specialist`
          setAssistantReply(`Based on the words you entered, a reasonable place to start is ${department} (this is not a diagnosis). Suggested demo listings: ${doctorList}.

General care: ${care}

I can’t safely prescribe a medicine or dose here. Medicines depend on age, allergies, pregnancy, other conditions, and current medicines; ask a qualified clinician or pharmacist before using one. Book a consultation if symptoms are severe, persistent, or getting worse. The doctors and availability shown are demo data.`)
        } else if (q.includes('medicine') || q.includes('tablet') || q.includes('home remedy') || q.includes('home medicine') || q.includes('prescription') || q.includes('diagnos')) {
          setAssistantReply('I can offer general self-care guidance and help you choose a suitable doctor, but I can’t diagnose you or prescribe a medicine/dose. Tell me the main symptom (without your name, phone number, or other private details), how long it has lasted, and whether it is mild or severe. A pharmacist or qualified clinician can check which over-the-counter medicine is safe for you.')
        } else {
          setAssistantReply('I can help with booking, cancelling/rescheduling, hospital directions, and matching a symptom to a doctor specialty. Try asking “I have a cough and fever”, “tooth pain”, “skin rash”, or “stomach pain”. I can suggest general self-care, but not diagnose or prescribe medicine. For severe or rapidly worsening symptoms, seek urgent medical care.')
        }
      }
    }

    return (
      <div className={`mc mc-dashboard theme-${dashboardTheme}`} style={{ minHeight: '100vh', background: '#0b1220' }}>
        <style>{css}</style>
        <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
          <div className="sidebar-brand"><Logo light /></div>
          <p className="sidebar-label">WORKSPACE</p>
          <a href="#dashboard-home" className="sidebar-link"><span>◫</span> Overview</a>
          <a href="#dashboard-appointments" className="sidebar-link"><span>▦</span> Appointments</a>
          {!isDoctor && <a href="#dashboard-doctors" className="sidebar-link"><span>✚</span> Find doctors</a>}
          {!isDoctor && <a href="#dashboard-profile" className="sidebar-link"><span>♙</span> My profile</a>}
          <a href="#dashboard-notifications" className="sidebar-link"><span>♧</span> Notifications</a>
          <a href="#dashboard-records" className="sidebar-link"><span>▤</span> Medical records</a>
          <div className="sidebar-bottom"><span className="sidebar-user-dot">{(authenticatedUser.name || 'M').slice(0,1).toUpperCase()}</span><div><strong>{authenticatedUser.name}</strong><small>{isDoctor ? 'Doctor account' : 'Patient account'}</small></div></div>
        </aside>
        <header className="nav scrolled dashboard-topbar">
          <div className="wrap nav-inner" style={{ justifyContent: 'space-between' }}>
            <Logo />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span><strong>{isDoctor ? 'Doctor dashboard' : 'Patient dashboard'}</strong> · {authenticatedUser.name}</span>
              <label className="dashboard-theme-control">
                <span>Theme</span>
                <select
                  aria-label="Dashboard colour theme"
                  value={dashboardTheme}
                  onChange={(event) => setDashboardTheme(event.target.value)}
                >
                  <option value="blue">Sky & Cloud</option>
                  <option value="teal">Sea Glass</option>
                  <option value="purple">Lavender Mist</option>
                  <option value="green">Sage Garden</option>
                  <option value="rose">Blush Pink</option>
                  <option value="amber">Warm Sand</option>
                </select>
              </label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={signOut}>Sign out</button>
            </div>
          </div>
        </header>

        <main id="main" className="wrap dashboard-main" style={{ paddingTop: 112, paddingBottom: 48 }}>
          <div id="dashboard-home" className="sec-head dashboard-welcome" style={{ textAlign: 'left', marginBottom: 24 }}>
            <p className="eyebrow">MediCare secure portal</p>
            <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Welcome, {authenticatedUser.name}</h1>
            <p className="sub">{isDoctor ? 'Review your assigned appointments and open patient records only through authorized backend access.' : 'Manage your appointments, find doctors and hospitals, and get help navigating the portal.'}</p>
          </div>

          {!isDoctor && <section id="dashboard-profile" className="sec dashboard-panel" style={{ padding: '24px 0' }} aria-labelledby="profile-heading">
            <div className="sec-head sec-head-split"><div><p className="eyebrow">Your information</p><h2 id="profile-heading">Personal &amp; health profile</h2><p className="sub">Update your details. Only enter information you are comfortable using in this academic demo.</p></div><div className="bmi-card"><span>Calculated BMI</span><strong>{bmiValue || '—'}</strong><small>{bmiValue ? 'Based on entered height and weight' : 'Enter height and weight'}</small></div></div>
            <form className="profile-form" onSubmit={saveProfile} noValidate>
              <h3>Personal details</h3><div className="profile-grid">
                <label>Date of birth<input type="date" value={profile.dateOfBirth} onChange={e=>setProfile(p=>({...p,dateOfBirth:e.target.value}))} /></label>
                <label>Gender<select value={profile.gender} onChange={e=>setProfile(p=>({...p,gender:e.target.value}))}><option value="">Select</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></label>
                <label>Blood group<select value={profile.bloodGroup} onChange={e=>setProfile(p=>({...p,bloodGroup:e.target.value}))}><option value="">Select</option>{['A+','A−','B+','B−','AB+','AB−','O+','O−','Unknown'].map(v=><option key={v}>{v}</option>)}</select></label>
                <label>Address<input maxLength="200" value={profile.address} onChange={e=>setProfile(p=>({...p,address:e.target.value}))} placeholder="City / address (optional)" /></label>
                <label>Height (cm)<input type="number" min="30" max="250" step="0.1" value={profile.heightCm} aria-invalid={!!profileErrors.heightCm} onChange={e=>setProfile(p=>({...p,heightCm:e.target.value}))} />{profileErrors.heightCm && <small className="profile-error">{profileErrors.heightCm}</small>}</label>
                <label>Weight (kg)<input type="number" min="2" max="500" step="0.1" value={profile.weightKg} aria-invalid={!!profileErrors.weightKg} onChange={e=>setProfile(p=>({...p,weightKg:e.target.value}))} />{profileErrors.weightKg && <small className="profile-error">{profileErrors.weightKg}</small>}</label>
              </div>
              <h3>Health information</h3><div className="profile-grid">
                <label>Allergies<textarea rows="2" maxLength="1000" value={profile.allergies} onChange={e=>setProfile(p=>({...p,allergies:e.target.value}))} placeholder="Known allergies, or leave blank" /></label>
                <label>Existing conditions<textarea rows="2" maxLength="1000" value={profile.conditions} onChange={e=>setProfile(p=>({...p,conditions:e.target.value}))} placeholder="Optional" /></label>
                <label>Current medications<textarea rows="2" maxLength="1000" value={profile.medications} onChange={e=>setProfile(p=>({...p,medications:e.target.value}))} placeholder="Optional" /></label>
                <label>Previous surgeries<textarea rows="2" maxLength="1000" value={profile.surgeries} onChange={e=>setProfile(p=>({...p,surgeries:e.target.value}))} placeholder="Optional" /></label>
                <label>Emergency contact name<input maxLength="100" value={profile.emergencyName} onChange={e=>setProfile(p=>({...p,emergencyName:e.target.value}))} /></label>
                <label>Emergency contact phone<input type="tel" maxLength="20" aria-invalid={!!profileErrors.emergencyPhone} value={profile.emergencyPhone} onChange={e=>setProfile(p=>({...p,emergencyPhone:e.target.value}))} />{profileErrors.emergencyPhone && <small className="profile-error">{profileErrors.emergencyPhone}</small>}</label>
              </div>
              <div className="profile-actions"><button type="submit" className="btn btn-primary" disabled={profileSaving || profileLoading}>{profileSaving ? 'Saving…' : profileLoading ? 'Loading profile…' : 'Save profile'}</button>{profileMessage && <p role="status" className="profile-message">{profileMessage}</p>}</div>
              <p className="profile-note">Your profile is loaded from and saved to the hospital database for the signed-in account. Use fictional information for this academic demo.</p>
            </form>
          </section>}

          <section id="dashboard-notifications" className="sec dashboard-panel" style={{ padding: '20px 0' }} aria-labelledby="dashboard-notifications-heading">
            <div className="sec-head sec-head-split">
              <div><p className="eyebrow">Updates</p><h2 id="dashboard-notifications-heading">Notifications {dashboardNotifications.filter((n) => !n.read).length > 0 && <span className="tag">{dashboardNotifications.filter((n) => !n.read).length} new</span>}</h2><p className="sub">Appointment booking, cancellation and rescheduling updates for this account.</p></div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button type="button" className="btn btn-ghost btn-sm" onClick={loadNotifications} disabled={notificationsLoading}>{notificationsLoading ? 'Refreshing…' : 'Refresh notifications'}</button><button type="button" className="btn btn-ghost btn-sm" onClick={markAllNotificationsRead} disabled={!dashboardNotifications.some((n) => !n.read)}>Mark all read</button><button type="button" className="btn btn-sm" onClick={clearNotifications} disabled={!dashboardNotifications.length || notificationsLoading} style={{ background: '#7F1D1D', color: '#FFFFFF', border: '1px solid #B91C1C', opacity: !dashboardNotifications.length || notificationsLoading ? 0.55 : 1 }}>{notificationsLoading ? 'Please wait…' : 'Clear notifications'}</button></div>
            </div>
            {notificationsError && <p className="err" role="alert">{notificationsError}</p>}
            {!notificationsError && !notificationsLoading && dashboardNotifications.length === 0 && <p className="sub">No notifications yet. Appointment updates will appear here.</p>}
            <div style={{ display: 'grid', gap: 10, maxWidth: 900 }}>
              {dashboardNotifications.map((item) => <article key={item.id} className="doc-card" style={{ color: '#E7EEF8', padding: 16, borderLeft: item.read ? '4px solid #40516A' : '4px solid #5EEAD4', background: item.read ? '#111D2D' : '#16263A' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start', flexWrap: 'wrap' }}>
                  <div><h3 style={{ marginBottom: 6 }}>{item.title}</h3><p style={{ margin: '0 0 6px' }}>{item.message}</p><p className="hint" style={{ margin: 0 }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''} {item.appointmentId ? ` · Appointment #${item.appointmentId}` : ''}</p></div>
                  {!item.read && <button type="button" className="btn btn-ghost btn-sm" onClick={() => markNotificationRead(item.id)}>Mark read</button>}
                </div>
              </article>)}
            </div>
          </section>

          <section id="dashboard-appointments" className="sec dashboard-panel" style={{ padding: '24px 0' }} aria-labelledby="dashboard-appointments-heading">
            <div className="sec-head sec-head-split">
              <div><p className="eyebrow">Your care schedule</p><h2 id="dashboard-appointments-heading">{isDoctor ? 'Assigned appointments' : 'My appointments'}</h2></div>
              <button type="button" className="btn btn-primary" onClick={() => openBook(null)}>Book appointment</button>
            </div>
            <button type="button" className="btn btn-ghost" onClick={loadAppointments} disabled={appointmentsLoading}>
              {appointmentsLoading ? 'Loading…' : 'Refresh appointments'}
            </button>
            {appointmentsError && <p className="err" role="alert">{appointmentsError}</p>}
            {!appointmentsLoading && !appointmentsError && appointments.length === 0 && <p className="sub">No appointments found for this account yet.</p>}
            <div className="doc-grid" style={{ marginTop: 18 }}>
              {appointments
  .filter((appointment) => appointment.status?.toLowerCase() !== 'cancelled')
  .map((appointment) => (
                <article className="doc-card" key={appointment.id} style={{ padding: 20 }}>
                  <h3>{isDoctor ? appointment.patientName : appointment.doctorName}</h3>
                  <p className="doc-spec">{appointment.department || 'Department not provided'}</p>
                  <p><strong>Appointment:</strong> #{appointment.id}</p>
                  <p><strong>Date:</strong> {appointment.appointmentDate} · {appointment.appointmentTime}</p>
                  <p><strong>Status:</strong> {appointment.status}</p>
                  {!isDoctor && <><p><strong>Hospital:</strong> {DOCTORS.find(d => d.name === appointment.doctorName)?.hospital || 'Confirm with the hospital'}</p><p><strong>Reason:</strong> {appointment.reason || 'Not provided'}</p></>}
                  {isDoctor ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'records' })}>Open authorized patient records</button>
                      
{appointment.status !== 'Cancelled' && (
  <>
    <button
      type="button"
      className="btn btn-dark btn-sm"
      onClick={() => openRx(appointment)}
    >
      Create prescription
    </button>

    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={() => handleRescheduleAppointment(appointment)}
    >
      Reschedule appointment
    </button>
    
<button
  type="button"
  className="btn btn-danger btn-sm"
  onClick={() => handleCancelAppointment(appointment.id)}
>
  Cancel appointment
</button>

  </>
)}

                    </div>
                  ) : appointment.status !== 'Cancelled' ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleCancelAppointment(appointment.id)}>Cancel</button>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleRescheduleAppointment(appointment)}>Reschedule</button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          {!isDoctor && (
            <>
              <section id="dashboard-doctors" className="sec dashboard-panel" style={{ padding: '24px 0' }}>
                <div className="sec-head sec-head-split"><div><p className="eyebrow">Care team</p><h2>Find a doctor</h2><p className="sub">Search by specialty and book a consultation.</p></div></div>
                <div className="toolbar">
                  <div className="search"><Icon name="search" size={20}/><input aria-label="Search doctors" placeholder="Search doctor or specialty" value={query} onChange={e => setQuery(e.target.value)} /></div>
                  <div className="chips">{['All', ...DEPARTMENTS].map(d => <button key={d} type="button" className="chip" aria-pressed={dept === d} onClick={() => setDept(d)}>{d}</button>)}</div>
                </div>
                <div className="doc-grid">
                  {filtered.map(doc => <article className="doc-card" key={doc.id}><div className="doc-body"><h3>{doc.name}</h3><p className="doc-spec">{doc.specialty}</p><p className="doc-meta">🏥 {doc.hospital}</p><p className="doc-meta">📍 {doc.hospitalArea}</p></div><div className="doc-actions"><button type="button" className="btn btn-ghost" onClick={() => setModal({ type: 'doctor', doctor: doc })}>Details</button><button type="button" className="btn btn-primary" onClick={() => openBook(doc)}>Book</button></div></article>)}
                </div>
              </section>

              <section id="dashboard-records" className="sec dashboard-panel" style={{ padding: '24px 0' }}>
                <div className="sec-head"><p className="eyebrow">Your health information</p><h2>My records and prescriptions</h2><p className="sub">View your health records and prescriptions saved by your doctor.</p></div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><button type="button" className="btn btn-dark" onClick={openRecords}>View my records</button><button type="button" className="btn btn-ghost" onClick={() => setModal({ type: 'patient-prescriptions' })}>View my prescriptions</button></div>
              </section>

              <section className="sec" style={{ padding: '24px 0' }}>
                <div className="sec-head"><p className="eyebrow">Portal helper</p><h2>Patient health assistant</h2><p className="sub">Get general self-care tips and suggestions for which doctor specialty to consult. This demo cannot diagnose or prescribe medicines.</p></div>
                <form className="form" onSubmit={askAssistant} style={{ maxWidth: 760 }}><Field id="assistant-question" label="What do you need help with?" hint="Avoid entering personal or sensitive medical information."><textarea id="assistant-question" rows={3} value={assistantQuestion} onChange={e => setAssistantQuestion(e.target.value)} placeholder="For example: I have a cough and fever, or I have tooth pain. Which doctor should I see?" /></Field><button type="submit" className="btn btn-primary">Ask assistant</button></form>
                {assistantReply && <p className="ok-banner" role="status" style={{ marginTop: 16 }}>{assistantReply}</p>}
              </section>
            </>
          )}

          {isDoctor && <section className="sec" style={{ padding: '24px 0' }}><div className="sec-head"><p className="eyebrow">Clinical workspace</p><h2>Patient records & prescriptions</h2><p className="sub">Open records from an assigned appointment. The backend must enforce doctor-to-patient authorization; hiding buttons alone is not security.</p></div><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><button type="button" className="btn btn-dark" onClick={openRecords}>Open authorized patient records</button></div></section>}

          <section className="sec" style={{ padding: '24px 0' }}><HospitalLocations /></section>
          <footer style={{ padding: '24px 0', color: '#526575' }}>Academic demonstration only. Do not enter real medical information. In an emergency, contact local emergency services.</footer>
        </main>

        {modal && modal.type === 'doctor' && <DoctorModal key={`doc-${modal.doctor.id}`} doctor={modal.doctor} info={avail[modal.doctor.id]} onBook={openBook} onClose={closeModal} />}
        {modal && modal.type === 'book' && <BookingModal key={`book-${modal.doctor ? modal.doctor.id : 'any'}`} doctor={modal.doctor} onClose={closeModal} notify={notify} />}
        {modal && modal.type === 'records' && <PatientRecordsModal key="records" prescriptions={prescriptions} onClose={closeModal} />}
        {modal && modal.type === 'patient-prescriptions' && authenticatedUser?.role === 'PATIENT' && <PatientPrescriptionsModal onClose={closeModal} />}
        
{modal && modal.type === 'rx' && isDoctor && (
  <PrescriptionModal
    key={`rx-${modal.appointment?.id || 'new'}`}
    appointment={modal.appointment}
    onSave={handleSavePrescription}
    onClose={closeModal}
    notify={notify}
  />
)}

        {modal && modal.type === 'auth' && <AuthModal key={`auth-${modal.mode}-${modal.role || 'PATIENT'}`} initialMode={modal.mode} role={modal.role || 'PATIENT'} onClose={closeModal} notify={notify} onLoginSuccess={setAuthenticatedUser} />}
        {toast && <div className={`toast toast-${toast.kind}`} style={{ background: '#142235', color: '#F1F5F9', border: '1px solid #35536A', borderLeft: `5px solid ${toast.kind === 'error' ? '#FCA5A5' : '#5EEAD4'}`, boxShadow: '0 18px 42px rgba(0,0,0,.45)' }} role={toast.kind === 'error' ? 'alert' : 'status'}><span>{toast.msg}</span><button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">×</button></div>}
      </div>
    )
  }

  return (
    <div className="mc">
      <style>{css}</style>
      <a href="#main" className="skip">Skip to main content</a>

      {/* ------------------------------ Navigation ------------------------------ */}
      <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <a href="#home" className="brand" aria-label="MediCare home" onClick={go('home')}>
            <Logo />
          </a>
          <nav aria-label="Primary" className="nav-links">
            {navItems.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={go(n.id)}
                aria-current={active === n.id ? 'true' : undefined}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <span style={{ color: '#17324D', fontWeight: 700 }}>Welcome, {authenticatedUser.name}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setAuthenticatedUser(null); setModal(null); window.scrollTo(0, 0) }}>Sign out</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openBook(null)}>
              Book Appointment
            </button>
          </div>
          <button
            type="button"
            className="burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} size={24} />
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-menu" id="mobile-menu">
            <nav aria-label="Mobile">
              {navItems.map((n) => (
                <a key={n.id} href={`#${n.id}`} onClick={go(n.id)}>{n.label}</a>
              ))}
            </nav>
            <div className="mobile-actions">
              <button type="button" className="btn btn-ghost" onClick={() => openAuth('login')}>Sign In</button>
              <button type="button" className="btn btn-primary" onClick={() => openBook(null)}>Book Appointment</button>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        {/* -------------------------------- Hero --------------------------------- */}
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow eyebrow-pill"><Icon name="stethoscope" size={16} /> Appointments &amp; patient care, together</p>
              <h1 id="hero-title">
                Better care begins with the <span className="hl">right connection.</span>
              </h1>
              <p className="lead">
                Book appointments in a few calm steps, keep your records organized, and stay connected with the doctors
                who look after you, all in one thoughtfully designed place.
              </p>
              <div className="cta-row">
                <button type="button" className="btn btn-primary btn-lg" onClick={() => openBook(null)}>
                  Book Appointment <Icon name="arrow" size={18} />
                </button>
                <a href="#doctors" className="btn btn-ghost btn-lg" onClick={go('doctors')}>Find a Doctor</a>
              </div>
              <ul className="trust" aria-label="What MediCare is designed for">
                <li><Icon name="calendar" size={18} /> Simple scheduling</li>
                <li><Icon name="file" size={18} /> Organized records</li>
                <li><Icon name="pill" size={18} /> Clear prescriptions</li>
              </ul>
            </div>

            <div className="hv">
              <div className="hv-dots" aria-hidden="true" />
              <div className="hv-arch">
                <svg viewBox="0 0 400 440" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
                  <circle cx="200" cy="175" r="132" fill="#ffffff" opacity=".6" />
                  <circle cx="200" cy="175" r="168" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 9" />
                  <path d="M40 440c0-82 55-132 160-132s160 50 160 132z" fill="#ffffff" />
                  <path d="M166 312l-24 40 58 30z M234 312l24 40-58 30z" fill="#EEF4F8" stroke="#D5E1E8" strokeWidth="2" />
                  <path d="M166 312l34 56 34-56z" fill="#087F8C" />
                  <rect x="184" y="262" width="32" height="56" rx="14" fill="#e8b88f" />
                  <ellipse cx="200" cy="224" rx="47" ry="56" fill="#e8b88f" />
                  <path d="M152 218c0-40 22-64 50-64s48 24 48 64c-10-22-26-32-48-32s-40 10-50 32z" fill="#1d2b30" />
                  <circle cx="183" cy="230" r="3.4" fill="#1d2b30" />
                  <circle cx="217" cy="230" r="3.4" fill="#1d2b30" />
                  <path d="M186 251q14 10 28 0" stroke="#1d2b30" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M160 318c-14 44 10 78 42 76" stroke="#17324D" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <circle cx="203" cy="394" r="11" fill="#7FE0CF" stroke="#17324D" strokeWidth="4" />
                  <rect x="262" y="384" width="50" height="46" rx="8" fill="none" stroke="#D5E1E8" strokeWidth="3" />
                  <rect x="278" y="374" width="6" height="22" rx="3" fill="#087F8C" />
                  <path d="M70 92h14M77 85v14M330 150h12M336 144v12M96 250h10M101 245v10" stroke="#087F8C" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              <div className="float-card fc-rx">
                <span className="icon-tile sm"><Icon name="pill" size={20} /></span>
                <div>
                  <strong>Digital prescription</strong>
                  <span>Shared after your visit</span>
                </div>
              </div>

              <div className="float-card fc-appt" role="group" aria-label="Sample appointment summary">
                <div className="fc-head">
                  <span className="fc-label">Appointment summary</span>
                  <span className="pill pill-demo">Sample</span>
                </div>
                <div className="fc-doc">
                  <span className="avatar avatar-sm"><Avatar look={heroDoc.look} size={44} /></span>
                  <div>
                    <strong>{heroDoc.name}</strong>
                    <span>{heroDoc.department}</span>
                  </div>
                </div>
                <dl className="fc-meta">
                  <div>
                    <dt><Icon name="calendar" size={15} /> Date</dt>
                    <dd>{heroNext ? `${heroNext.day.dow}, ${heroNext.day.month} ${heroNext.day.day}` : 'TBD'}</dd>
                  </div>
                  <div>
                    <dt><Icon name="clock" size={15} /> Time</dt>
                    <dd>{heroNext ? heroNext.time : '—'}</dd>
                  </div>
                </dl>
                <p className="fc-status"><span className="dot" /> Slot held (demo)</p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------- Services ------------------------------- */}
        <section className="sec" id="services" aria-labelledby="svc-title">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">Healthcare services</p>
              <h2 id="svc-title">Everything care needs, gently organized.</h2>
              <p className="sub">Three connected tools that keep appointments, records and prescriptions clear for patients and clinicians alike.</p>
            </div>

            <div className="svc">
              <article className="svc-card svc-main">
                <span className="icon-tile on-dark"><Icon name="calendar" size={26} /></span>
                <h3>Appointment booking</h3>
                <p>A calm, guided flow from choosing a doctor to confirming a time that suits you.</p>
                <div className="mini-cal" aria-hidden="true">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                    <div key={d} className={`cal-day ${i === 2 ? 'on' : ''}`}>
                      <span>{d}</span>
                      <b>{12 + i}</b>
                    </div>
                  ))}
                </div>
                <div className="mini-slots" aria-hidden="true">
                  <span>09:30</span><span className="on">10:30</span><span>11:30</span><span>02:00</span>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => openBook(null)}>
                  Book an appointment <Icon name="arrow" size={18} />
                </button>
              </article>

              <article className="svc-card svc-records is-click">
                <span className="icon-tile"><Icon name="file" size={26} /></span>
                <h3>Patient records</h3>
                <p>Visit history, notes and care plans kept together in one tidy timeline.</p>
                <ul className="rec-list" aria-hidden="true">
                  <li><i /><span style={{ width: '72%' }} /><em /></li>
                  <li><i /><span style={{ width: '56%' }} /><em /></li>
                  <li><i /><span style={{ width: '64%' }} /><em /></li>
                </ul>
                <button type="button" className="btn btn-dark btn-sm svc-link" onClick={openRecords}>
                  Open patient records <Icon name="arrow" size={16} />
                </button>
              </article>

              <article className="svc-card svc-rx is-click">
                <span className="icon-tile"><Icon name="pill" size={26} /></span>
                <h3>Digital prescriptions</h3>
                <p>Legible prescriptions with clear dosage instructions, ready to review on any device.</p>
                <div className="rx-chip" aria-hidden="true">
                  <b>Rx</b>
                  <span>Sample medicine · twice daily</span>
                </div>
                <button type="button" className="btn btn-dark btn-sm svc-link" onClick={openRx}>
                  Write a prescription <Icon name="arrow" size={16} />
                </button>
              </article>
            </div>
          </div>
        </section>

       

        {/* ------------------------------ Appointments --------------------------------- */}

        {/* --------------------------- Hospital Locations --------------------------- */}
        <HospitalLocations />
    
<section className="sec" id="appointments" aria-labelledby="appointments-heading">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">Patient appointments</p>
              <h2 id="appointments-heading">Your appointments.</h2>
              <p className="sub">
                View appointments saved in the hospital database.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={loadAppointments}
              disabled={appointmentsLoading}
            >
              {appointmentsLoading ? 'Loading...' : 'Load appointments'}
            </button>

            {appointmentsError && (
              <p role="alert">{appointmentsError}</p>
            )}

            {!appointmentsLoading && !appointmentsError && appointments.length === 0 && (
              <p>No appointments loaded yet. Click "Load appointments".</p>
            )}

            {appointments.filter((appointment) => appointment.status !== 'Cancelled').length > 0 && (
              <div className="toolbar" style={{ marginTop: 24, display: 'grid', gap: 16 }}>
{appointments.filter((appointment) => appointment.status !== 'Cancelled').map((appointment) => (
                  <div
                    key={appointment.id}
                    className="card"
                    style={{ padding: 20 }}
                  >
                    <h3>{appointment.patientName}</h3>
                    <p><strong>Appointment ID:</strong> {appointment.id}</p>
                    <p><strong>Doctor:</strong> {appointment.doctorName}</p>
                    <p><strong>Department:</strong> {appointment.department}</p>
                    <p><strong>Date:</strong> {appointment.appointmentDate}</p>
                    <p><strong>Time:</strong> {appointment.appointmentTime}</p>
                    <p><strong>Status:</strong> {appointment.status}</p>
                    <p><strong>Phone:</strong> {appointment.phone || 'Not provided'}</p>
                    <p><strong>Email:</strong> {appointment.email || 'Not provided'}</p>
                    
                    <p><strong>Reason:</strong> {appointment.reason || 'Not provided'}</p>

                    <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                      {appointment.status !== 'Cancelled' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Cancel appointment
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleRescheduleAppointment(appointment)}
                          >
                            Reschedule
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                ))}
              </div>
            )}
          </div>
        </section>
 {/* ------------------------------ Doctors --------------------------------- */}
        <section className="sec sec-mint" id="doctors" aria-labelledby="doc-heading">
          <div className="wrap">
            <div className="sec-head sec-head-split">
              <div>
                <p className="eyebrow">Featured doctors</p>
                <h2 id="doc-heading">Find the right specialist.</h2>
              </div>
              <p className="sub">Search by name or specialty, or filter by department. Profiles and schedules are fictional samples.</p>
            </div>

            <div className="toolbar">
              <div className="search">
                <label htmlFor="doc-search" className="sr-only">Search doctors by name or specialty</label>
                <Icon name="search" size={20} />
                <input
                  id="doc-search"
                  type="search"
                  placeholder="Search by name or specialty"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="chips" role="group" aria-label="Filter by department">
                {['All', ...DEPARTMENTS].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className="chip"
                    aria-pressed={dept === d}
                    onClick={() => setDept(d)}
                  >
                    <Icon name={DEPT_ICON[d]} size={16} /> {d}
                  </button>
                ))}
              </div>
            </div>

            <p className="count" role="status" aria-live="polite">
              Showing {filtered.length} of {DOCTORS.length} doctors
            </p>

            {filtered.length === 0 ? (
              <div className="empty">
                <Icon name="search" size={30} />
                <h3>No doctors match your search</h3>
                <p>Try a different name or choose another department.</p>
                <button
                  type="button"
                  className="btn btn-dark btn-sm"
                  onClick={() => {
                    setQuery('')
                    setDept('All')
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <ul className="doc-grid">
                {filtered.map((d) => {
                  const info = avail[d.id]
                  const st = STATUS[info.status]
                  return (
                    <li key={d.id}>
                      <article className="doc-card">
                        <div className="doc-top">
                          <span className="avatar"><Avatar look={d.look} size={76} /></span>
                          <span className={`pill ${st.cls}`}><span className="dot" /> {st.label}</span>
                        </div>
                        <div className="doc-body">
                          <h3>{d.name}</h3>
                          <p className="doc-spec">{d.specialty}</p>
                          <p className="doc-meta"><Icon name={DEPT_ICON[d.department]} size={16} /> {d.department}</p>
                          <p className="doc-meta">🏥 {d.hospital}</p>
                          <p className="doc-meta">📍 {d.hospitalArea}</p>
                          <p className="doc-meta"><Icon name="clock" size={16} /> {info.nextLabel}</p>
                        </div>
                        <div className="doc-actions">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => setModal({ type: 'doctor', doctor: d })}
                            aria-label={`View profile of ${d.name}`}
                          >
                            View Profile
                          </button>
                          <button
                            type="button"
                            className="btn btn-dark btn-sm"
                            onClick={() => openBook(d)}
                            aria-label={`Book an appointment with ${d.name}`}
                          >
                            Book
                          </button>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        {/* ----------------------------- How it works ----------------------------- */}
        <section className="sec how" id="how" aria-labelledby="how-title">
          <div className="wrap">
            <div className="sec-head sec-head-light">
              <p className="eyebrow">How it works</p>
              <h2 id="how-title">Your care journey, in four clear steps.</h2>
            </div>
            <ol className="steps">
              {[
                { icon: 'search', title: 'Find a Doctor', text: 'Search by name, specialty or department and compare profiles.' },
                { icon: 'clock', title: 'Choose a Slot', text: 'Pick a date and a time that fits your day from the open slots.' },
                { icon: 'check', title: 'Confirm Appointment', text: 'Add your details and review everything before you confirm.' },
                { icon: 'heart', title: 'Receive Care', text: 'Meet your doctor and keep follow-ups and prescriptions in one place.' },
              ].map((s, i) => (
                <li key={s.title} className="step">
                  <span className="step-icon"><Icon name={s.icon} size={26} /></span>
                  <span className="step-num">0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------ About / Benefits ------------------------ */}
        <section className="sec" id="about" aria-labelledby="about-title">
          <div className="wrap about">
            <div className="about-copy">
              <p className="eyebrow">Why MediCare</p>
              <h2 id="about-title">Designed around the patient, not the paperwork.</h2>
              <p className="sub">
                MediCare is a student project that demonstrates the front end of a hospital appointment and patient
                management system. All doctors, schedules and bookings shown are fictional samples.
              </p>
              <button type="button" className="btn btn-dark" onClick={() => openAuth('register')}>
                Create a demo account
              </button>
            </div>
            <ul className="benefits">
              {[
                { icon: 'calendar', title: 'Booking in a few steps', text: 'A short guided flow with a clear confirmation at the end.' },
                { icon: 'layers', title: 'One organized place', text: 'Appointments, records and prescriptions presented together.' },
                { icon: 'file', title: 'Clear communication', text: 'Plain-language details so nothing is left to guess.' },
                { icon: 'shield', title: 'Accessible by design', text: 'Keyboard-friendly, readable on any screen and respectful of reduced motion.' },
              ].map((b) => (
                <li key={b.title}>
                  <span className="icon-tile"><Icon name={b.icon} size={24} /></span>
                  <div>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* --------------------------------- CTA ---------------------------------- */}
        <section className="wrap cta-wrap" aria-labelledby="cta-title">
          <div className="cta">
            <h2 id="cta-title">Ready to meet your next doctor?</h2>
            <p>Explore the demo booking flow and see how simple scheduling can feel.</p>
            <div className="cta-row cta-center">
              <button type="button" className="btn btn-primary btn-lg" onClick={() => openBook(null)}>
                Book Appointment <Icon name="arrow" size={18} />
              </button>
              <a href="#doctors" className="btn btn-light btn-lg" onClick={go('doctors')}>Browse doctors</a>
            </div>
          </div>
        </section>
      </main>

      {/* -------------------------------- Footer -------------------------------- */}
      <footer className="footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <Logo light />
            <p>Coordinated, patient-friendly care, presented as a college demonstration project.</p>
          </div>
          <nav aria-label="Footer navigation">
            <h3>Navigate</h3>
            <ul>
              {navItems.map((n) => (
                <li key={n.id}><a href={`#${n.id}`} onClick={go(n.id)}>{n.label}</a></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Departments">
            <h3>Departments</h3>
            <ul>
              {DEPARTMENTS.slice(0, 5).map((d) => (
                <li key={d}>
                  <a
                    href="#doctors"
                    onClick={(e) => {
                      e.preventDefault()
                      setDept(d)
                      scrollToId('doctors')
                    }}
                  >
                    {d}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3>Contact</h3>
            <ul className="contact">
              <li><Icon name="mail" size={17} /> contact@medicare.example</li>
              <li><Icon name="phone" size={17} /> +00 000 000 0000</li>
              <li><Icon name="pin" size={17} /> 123 Sample Street, Your City</li>
            </ul>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <p>© {new Date().getFullYear()} MediCare. Academic demonstration project, not a real medical service.</p>
          <p>For emergencies, contact your local emergency services.</p>
        </div>
      </footer>

      {/* -------------------------------- Modals -------------------------------- */}
      {modal && modal.type === 'doctor' && (
        <DoctorModal
          key={`doc-${modal.doctor.id}`}
          doctor={modal.doctor}
          info={avail[modal.doctor.id]}
          onBook={(d) => openBook(d)}
          onClose={closeModal}
        />
      )}
      {modal && modal.type === 'book' && (
        <BookingModal
          key={`book-${modal.doctor ? modal.doctor.id : 'any'}`}
          doctor={modal.doctor}
          onClose={closeModal}
          notify={notify}
        />
      )}
      {modal && modal.type === 'auth' && (
        <AuthModal key={`auth-${modal.mode}-${modal.role || 'PATIENT'}`} initialMode={modal.mode} role={modal.role || 'PATIENT'} onClose={closeModal} notify={notify} onLoginSuccess={setAuthenticatedUser} />
      )}
      {modal && modal.type === 'records' && (
        <PatientRecordsModal key="records" prescriptions={prescriptions} onClose={closeModal} />
      )}
      {modal && modal.type === 'patient-prescriptions' && authenticatedUser?.role === 'PATIENT' && (
        <PatientPrescriptionsModal onClose={closeModal} />
      )}
      {modal && modal.type === 'rx' && (
       <PrescriptionModal
  key={`rx-${modal.appointment?.id || 'new'}`}
  appointment={modal.appointment}
  onSave={handleSavePrescription}
  onClose={closeModal}
  notify={notify}
/> 
      )}

      {/* --------------------------------- Toast -------------------------------- */}
      {toast && (
        <div
          key={toast.id}
          className={`toast toast-${toast.kind}`}
          style={{ background: '#142235', color: '#F1F5F9', border: '1px solid #35536A', borderLeft: `5px solid ${toast.kind === 'error' ? '#FCA5A5' : '#5EEAD4'}`, boxShadow: '0 18px 42px rgba(0,0,0,.45)' }}
          role={toast.kind === 'error' ? 'alert' : 'status'}
        >
          <Icon name={toast.kind === 'error' ? 'alert' : toast.kind === 'success' ? 'check' : 'shield'} size={20} />
          <span>{toast.msg}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">
            <Icon name="x" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------ Styles ------------------------------ */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

html{scroll-behavior:smooth}
body{margin:0!important;display:block!important;background:#F7FAFC!important}
#root{width:100%!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;text-align:left!important;display:block!important;min-height:0!important}

.mc{
  --navy:#17324D;--navy-d:#0F2438;--teal:#087F8C;--teal-d:#066873;
  --mint:#E6F5F2;--mint-2:#CDEAE4;--page:#F7FAFC;--ink:#172B3A;--muted:#526575;
  --line:#D5E1E8;--field:#7B92A3;--ok:#18794E;--err:#B42318;--accent:#7FE0CF;
  font-family:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  color:var(--ink);background:var(--page);line-height:1.6;color-scheme:light;
  -webkit-font-smoothing:antialiased;overflow-x:hidden;text-align:left;
}
.mc *,.mc *::before,.mc *::after{box-sizing:border-box}
.mc h1,.mc h2,.mc h3,.mc h4,.mc p,.mc dl,.mc dd,.mc ul,.mc ol{margin:0;padding:0}
.mc h1,.mc h2,.mc h3{font-family:'Fraunces',Georgia,'Times New Roman',serif;font-weight:600;color:var(--navy);letter-spacing:-.015em;line-height:1.12}
.mc :where(a){color:inherit;text-decoration:none}
.mc :where(button,input,select,textarea){font:inherit;color:inherit}
.mc :where(button){cursor:pointer}
.mc ul,.mc ol{list-style:none}
.mc :focus-visible{outline:3px solid var(--teal);outline-offset:3px}
.mc ::selection{background:var(--accent);color:var(--navy)}
.wrap{width:min(1180px,100% - 2.5rem);margin-inline:auto}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.skip{position:absolute;left:1rem;top:-4rem;background:var(--navy);color:#fff;padding:.7rem 1rem;border-radius:12px;z-index:300;transition:top .2s}
.skip:focus{top:1rem}

/* Buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.55rem;padding:.8rem 1.4rem;border-radius:999px;border:2px solid transparent;font-weight:600;font-size:.97rem;line-height:1.2;text-align:center;transition:transform .2s,box-shadow .2s,background .2s,color .2s,border-color .2s}
.btn:hover{transform:translateY(-2px)}
.btn:active{transform:translateY(0)}
.btn:disabled{opacity:.65;cursor:not-allowed;transform:none}
.btn-sm{padding:.6rem 1.1rem;font-size:.9rem}
.btn-lg{padding:1rem 1.7rem;font-size:1rem}
.btn-primary{background:var(--teal);color:#fff;box-shadow:0 8px 18px -10px rgba(8,127,140,.9)}
.btn-primary:hover{background:var(--teal-d)}
.btn-dark{background:var(--navy);color:#fff}
.btn-dark:hover{background:var(--navy-d)}
.btn-ghost{background:#142235;color:#dce6f5;border-color:#34445b}
.btn-ghost:hover{background:#1c3048;color:#ffffff;border-color:#5eead4}
.btn-ghost:focus-visible{outline:2px solid #5eead4;outline-offset:2px}
.btn-light{background:transparent;color:#fff;border-color:#fff}
.btn-light:hover{background:rgba(255,255,255,.16)}
.link-btn{background:none;border:0;padding:.5rem .7rem;font-weight:600;color:var(--navy);border-radius:10px}
.link-btn:hover{color:var(--teal-d);text-decoration:underline;text-underline-offset:4px}

/* Logo */
.logo{display:inline-flex;align-items:center;gap:.6rem}
.logo-text{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:1.45rem;color:var(--navy);letter-spacing:-.02em}
.logo-text b{color:var(--teal-d);font-weight:600}
.logo-light .logo-text{color:#fff}
.logo-light .logo-text b{color:var(--accent)}

/* Nav */
.nav{position:sticky;top:0;z-index:60;background:rgba(247,250,252,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid transparent;transition:border-color .2s,box-shadow .2s}
.nav.scrolled{border-color:var(--line);box-shadow:0 8px 24px -20px rgba(23,50,77,.6)}
.nav-inner{display:flex;align-items:center;gap:1.5rem;height:74px}
.nav-links{display:flex;gap:.3rem;margin-left:auto}
.nav-links a{padding:.55rem .95rem;border-radius:999px;font-weight:600;color:var(--muted);transition:background .2s,color .2s}
.nav-links a:hover{background:var(--mint);color:var(--navy)}
.nav-links a[aria-current="true"]{background:var(--mint-2);color:var(--navy)}
.nav-actions{display:flex;align-items:center;gap:.6rem}
.burger{display:none;margin-left:auto;width:46px;height:46px;border-radius:14px;border:2px solid var(--navy);background:#fff;align-items:center;justify-content:center;color:var(--navy)}
.mobile-menu{border-top:1px solid var(--line);background:var(--page);padding:1rem 1.25rem 1.5rem;box-shadow:0 18px 30px -22px rgba(23,50,77,.6)}
.mobile-menu nav{display:grid;gap:.25rem}
.mobile-menu nav a{padding:.85rem 1rem;border-radius:14px;font-weight:600;color:var(--navy)}
.mobile-menu nav a:hover{background:var(--mint)}
.mobile-actions{display:grid;gap:.6rem;margin-top:1rem}

/* Hero */
.hero{position:relative;padding:3.5rem 0 5.5rem;background:linear-gradient(180deg,var(--mint) 0%,var(--page) 100%)}
.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:3rem;align-items:center}
.eyebrow{font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--teal-d);margin-bottom:.9rem}
.eyebrow-pill{display:inline-flex;align-items:center;gap:.5rem;background:#fff;border:1px solid var(--line);padding:.45rem .9rem;border-radius:999px;letter-spacing:.04em;text-transform:none;font-size:.85rem;margin-bottom:1.4rem;color:var(--navy)}
.hero h1{font-size:clamp(2.5rem,5.4vw,4.35rem);line-height:1.04;letter-spacing:-.025em}
.hl{white-space:nowrap;color:var(--teal-d);background:linear-gradient(transparent 62%,var(--mint-2) 62%,var(--mint-2) 92%,transparent 92%)}
.lead{margin-top:1.4rem;font-size:1.13rem;color:var(--muted);max-width:34rem}
.cta-row{display:flex;flex-wrap:wrap;gap:.9rem;margin-top:2rem}
.cta-center{justify-content:center}
.trust{display:flex;flex-wrap:wrap;gap:.6rem 1.6rem;margin-top:2.2rem;color:var(--navy);font-weight:600;font-size:.93rem}
.trust li{display:flex;align-items:center;gap:.5rem}
.trust svg{color:var(--teal-d)}

.hv{position:relative;width:100%;max-width:490px;margin-inline:auto;aspect-ratio:1/1.08}
.hv-arch{position:absolute;inset:0 7% 0 7%;border-radius:999px 999px 40px 40px;overflow:hidden;background:var(--mint-2);box-shadow:0 40px 70px -44px rgba(23,50,77,.6)}
.hv-arch svg{position:absolute;inset:0;width:100%;height:100%}
.hv-dots{position:absolute;top:6%;left:-2%;width:110px;height:110px;background-image:radial-gradient(var(--teal) 1.6px,transparent 1.8px);background-size:14px 14px;opacity:.35}
.float-card{position:absolute;background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:0 24px 50px -28px rgba(23,50,77,.55);animation:floaty 7s ease-in-out infinite}
.fc-appt{left:-3%;bottom:7%;width:min(275px,72%);padding:1rem 1.1rem}
.fc-rx{right:-2%;top:11%;display:flex;align-items:center;gap:.7rem;padding:.7rem .95rem .7rem .7rem;animation-delay:-3s}
.fc-rx strong{display:block;font-size:.88rem;color:var(--navy);line-height:1.25}
.fc-rx span:not(.icon-tile){font-size:.78rem;color:var(--muted)}
.fc-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem}
.fc-label{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.fc-doc{display:flex;align-items:center;gap:.7rem}
.fc-doc strong{display:block;font-size:.95rem;color:var(--navy);line-height:1.2}
.fc-doc span:not(.avatar){font-size:.8rem;color:var(--muted)}
.fc-meta{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin:.9rem 0;padding:.7rem;background:var(--mint);border-radius:14px}
.fc-meta dt{display:flex;align-items:center;gap:.3rem;font-size:.72rem;color:var(--muted);font-weight:600}
.fc-meta dd{font-weight:700;font-size:.9rem;color:var(--navy)}
.fc-status{display:flex;align-items:center;gap:.5rem;font-size:.8rem;font-weight:600;color:var(--ok)}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

.avatar{display:inline-block;flex:none;border-radius:50%;overflow:hidden;line-height:0;border:3px solid #fff;box-shadow:0 6px 16px -8px rgba(23,50,77,.6)}
.avatar-sm{border-width:2px}
.avatar-lg{border-radius:28px}
.icon-tile{display:inline-grid;place-items:center;width:54px;height:54px;border-radius:17px;background:var(--mint-2);color:var(--navy)}
.icon-tile.sm{width:42px;height:42px;border-radius:13px;flex:none}
.icon-tile.on-dark{background:rgba(127,224,207,.18);color:var(--accent)}
.dot{width:8px;height:8px;border-radius:50%;background:currentColor;display:inline-block}
.pill{display:inline-flex;align-items:center;gap:.4rem;padding:.28rem .7rem;border-radius:999px;font-size:.76rem;font-weight:700;white-space:nowrap}
.pill-demo{background:#FFF1CF;color:#6A4500}
.st-available{background:#E1F3EA;color:var(--ok)}
.st-limited{background:#FFF1CF;color:#6A4500}
.st-soon{background:#E3EEF8;color:var(--navy)}
.st-full{background:#FDE8E6;color:var(--err)}
.tag{display:inline-flex;align-items:center;gap:.4rem;padding:.28rem .7rem;border-radius:999px;background:var(--mint-2);color:var(--navy);font-size:.8rem;font-weight:600}

/* Sections */
.sec{padding:6rem 0}
.sec-mint{background:var(--mint)}
.sec-head{max-width:40rem;margin-bottom:2.8rem}
.sec-head h2,.about-copy h2{font-size:clamp(2rem,3.8vw,3rem)}
.sub{margin-top:1rem;color:var(--muted);font-size:1.06rem}
.sec-head-split{max-width:none;display:flex;justify-content:space-between;align-items:flex-end;gap:2rem;flex-wrap:wrap}
.sec-head-split .sub{max-width:28rem;margin-top:0}

/* Services bento */
.svc{display:grid;grid-template-columns:1.1fr 1fr;grid-template-rows:auto auto;gap:1.25rem}
.svc-card{position:relative;overflow:hidden;background:#fff;border:1px solid var(--line);border-radius:30px;padding:2rem;display:flex;flex-direction:column;gap:.8rem;transition:transform .25s,box-shadow .25s}
.svc-card:hover{transform:translateY(-4px);box-shadow:0 26px 44px -32px rgba(23,50,77,.55)}
.svc-card h3{font-size:1.55rem;margin-top:.6rem}
.svc-card p{color:var(--muted);max-width:30rem}
.svc-main{grid-row:span 2;background:var(--navy);border-color:var(--navy)}
.svc-main h3{color:#fff}
.svc-main p{color:rgba(255,255,255,.88)}
.svc-main .btn{align-self:flex-start;margin-top:auto}
.svc-main .btn-primary{background:var(--accent);color:var(--navy);box-shadow:none}
.svc-main .btn-primary:hover{background:#fff}
.mini-cal{display:grid;grid-template-columns:repeat(5,1fr);gap:.55rem;margin-top:1.4rem}
.cal-day{display:grid;justify-items:center;gap:.1rem;padding:.7rem .2rem;border-radius:16px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.88);font-size:.78rem}
.cal-day b{font-size:1.2rem;color:#fff;font-family:'Fraunces',Georgia,serif}
.cal-day.on{background:var(--accent);color:var(--navy)}
.cal-day.on b{color:var(--navy)}
.mini-slots{display:flex;flex-wrap:wrap;gap:.5rem;margin:.9rem 0 1.4rem}
.mini-slots span{padding:.4rem .85rem;border-radius:999px;border:1px solid rgba(255,255,255,.45);color:#fff;font-size:.82rem;font-weight:600}
.mini-slots span.on{background:#fff;color:var(--navy);border-color:#fff}
.svc-records{background:var(--mint);border-color:var(--mint-2)}
.svc-rx{background:#EAF1F7;border-color:#D3E1EE}
.svc-records .icon-tile,.svc-rx .icon-tile{background:#fff;border:1px solid var(--line);color:var(--navy)}
.rec-list{display:grid;gap:.6rem;margin:.6rem 0 0;padding:0;list-style:none}
.rec-list li{display:flex;align-items:center;gap:.7rem;padding:.7rem .9rem;background:#fff;border-radius:14px}
.rec-list i{width:12px;height:12px;border-radius:50%;background:var(--teal);flex:none}
.rec-list span{height:8px;border-radius:99px;background:#BFD3DC}
.rec-list em{margin-left:auto;width:34px;height:8px;border-radius:99px;background:#DCE7EC}
.rx-chip{display:flex;align-items:center;gap:.8rem;padding:.8rem 1rem;background:#fff;border-radius:16px;margin-top:.4rem}
.rx-chip b{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--navy);color:var(--accent);font-family:'Fraunces',Georgia,serif;font-size:1.1rem}
.rx-chip span{font-size:.9rem;font-weight:600;color:var(--navy)}
.svc-card.is-click{cursor:pointer}
.svc-card .svc-link{align-self:flex-start;margin-top:1rem}
.svc-link::after{content:'';position:absolute;inset:0;border-radius:30px}
.svc-card:has(.svc-link:focus-visible){outline:3px solid var(--teal);outline-offset:3px}
.svc-link:focus-visible{outline:none}

/* Doctors */
.toolbar{display:grid;gap:1rem;margin-bottom:1rem}
.search{position:relative;max-width:520px}
.search svg{position:absolute;left:1.1rem;top:50%;transform:translateY(-50%);color:var(--teal-d);pointer-events:none}
.search input{width:100%;height:54px;padding:0 1.2rem 0 3.1rem;border-radius:999px;border:2px solid var(--field);background:#fff;font-size:1rem;transition:border-color .2s,box-shadow .2s}
.mc input::placeholder,.mc textarea::placeholder{color:#5B6F7E;opacity:1}
.search input:focus{outline:none;border-color:var(--teal);box-shadow:0 0 0 4px rgba(8,127,140,.25)}
.chips{display:flex;flex-wrap:wrap;gap:.5rem}
.chip{display:inline-flex;align-items:center;gap:.45rem;padding:.55rem 1rem;border-radius:999px;border:2px solid var(--field);background:#fff;font-weight:600;font-size:.88rem;color:var(--navy);transition:background .2s,color .2s,border-color .2s,transform .2s}
.chip:hover{border-color:var(--navy);background:var(--mint-2)}
.chip[aria-pressed="true"]{background:var(--navy);border-color:var(--navy);color:#fff}
.count{margin:.6rem 0 1.4rem;font-size:.9rem;color:var(--muted);font-weight:600}
.doc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:1.25rem}
.doc-card{height:100%;display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:26px;overflow:hidden;transition:transform .25s,box-shadow .25s}
.doc-card:hover{transform:translateY(-5px);box-shadow:0 28px 44px -32px rgba(23,50,77,.55)}
.doc-top{display:flex;justify-content:space-between;align-items:flex-start;padding:1.1rem 1.1rem 3.6rem;background:var(--mint-2)}
.doc-top .avatar{margin-bottom:-3.4rem;align-self:flex-end}
.doc-body{padding:2.6rem 1.3rem .6rem;flex:1}
.doc-body h3{font-size:1.28rem}
.doc-spec{color:var(--muted);font-size:.93rem;margin:.2rem 0 .8rem}
.doc-meta{display:flex;align-items:center;gap:.5rem;font-size:.88rem;color:var(--ink);font-weight:500;margin-top:.35rem}
.doc-meta svg{color:var(--teal-d);flex:none}
.doc-actions{display:flex;gap:.6rem;padding:1rem 1.3rem 1.3rem}
.doc-actions .btn{flex:1}
.empty{display:grid;justify-items:center;gap:.6rem;text-align:center;padding:3rem 1rem;background:#fff;border:2px dashed var(--field);border-radius:26px;color:var(--navy)}
.empty h3{font-size:1.4rem}
.empty p{color:var(--muted);max-width:30rem}

/* How it works */
.how{background:var(--navy)}
.sec-head-light h2{color:#fff}
.sec-head-light .eyebrow{color:var(--accent)}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:1.6rem}
.step{position:relative;color:#fff}
.step:not(:last-child)::after{content:'';position:absolute;top:30px;left:calc(64px + .6rem);right:-.8rem;border-top:2px dashed rgba(127,224,207,.5)}
.step-icon{display:grid;place-items:center;width:62px;height:62px;border-radius:50%;background:rgba(127,224,207,.14);border:2px solid var(--accent);color:var(--accent)}
.step-num{display:block;margin-top:1.3rem;font-family:'Fraunces',Georgia,serif;font-size:.95rem;color:var(--accent);letter-spacing:.1em}
.step h3{color:#fff;font-size:1.4rem;margin:.3rem 0 .5rem}
.step p{color:rgba(255,255,255,.88);font-size:.97rem;max-width:16rem}

/* About */
.about{display:grid;grid-template-columns:.95fr 1.05fr;gap:4rem;align-items:start}
.about-copy .btn{margin-top:1.8rem}
.benefits{display:grid}
.benefits li{display:flex;gap:1.2rem;padding:1.4rem 0;border-bottom:1px solid var(--line)}
.benefits li:first-child{padding-top:0}
.benefits li:last-child{border-bottom:0}
.benefits .icon-tile{flex:none}
.benefits h3{font-size:1.3rem;margin-bottom:.25rem}
.benefits p{color:var(--muted)}

/* CTA */
.cta-wrap{padding-bottom:6rem}
.cta{position:relative;overflow:hidden;text-align:center;color:#fff;border-radius:38px;padding:4.5rem 1.5rem;background:var(--teal-d)}
.cta::before,.cta::after{content:'';position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.2)}
.cta::before{width:340px;height:340px;left:-110px;top:-140px}
.cta::after{width:420px;height:420px;right:-140px;bottom:-200px;background:rgba(255,255,255,.07)}
.cta h2{color:#fff;font-size:clamp(2rem,4vw,3.1rem);position:relative}
.cta p{position:relative;margin:1rem auto 0;max-width:34rem;color:#fff;font-size:1.08rem}
.cta .cta-row{position:relative}
.cta .btn-primary{background:#fff;color:var(--navy);box-shadow:none}
.cta .btn-primary:hover{background:var(--mint)}

/* Footer */
.footer{background:var(--navy);color:rgba(255,255,255,.88);padding-top:4rem}
.footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1.3fr;gap:2.5rem}
.footer h3{font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem;font-weight:700}
.footer-brand p{margin-top:1rem;max-width:20rem;font-size:.95rem}
.footer li{margin-bottom:.55rem}
.footer a{transition:color .2s}
.footer a:hover{color:var(--accent);text-decoration:underline;text-underline-offset:3px}
.contact li{display:flex;gap:.6rem;align-items:center}
.contact svg{color:var(--accent);flex:none}
.footer-bottom{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-top:3rem;padding:1.5rem 0 2rem;border-top:1px solid rgba(255,255,255,.22);font-size:.86rem}

/* Modals */
.overlay{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:1rem;overflow-y:auto;background:rgba(15,36,56,.66);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:fade .2s ease}
.modal{position:relative;width:100%;background:#111D2D;color:#EAF2FF;border:1px solid #2B4058;border-radius:28px;padding:2.2rem;max-height:calc(100vh - 2rem);overflow-y:auto;box-shadow:0 40px 80px -30px rgba(0,0,0,.6);animation:pop .28s cubic-bezier(.2,.8,.2,1)}
.modal:focus{outline:none}
.modal-md{max-width:560px}
.modal-lg{max-width:720px}
.modal-xl{max-width:960px}
.modal-close{position:absolute;top:1rem;right:1rem;width:42px;height:42px;display:grid;place-items:center;border-radius:50%;border:1px solid #38516B;background:#17263A;color:#D9E7F7;transition:background .2s}
.modal-close:hover{background:var(--mint)}
.modal-title{font-size:2rem;margin-bottom:1rem;padding-right:2.8rem}
/* Dark-theme modal overrides: keep labels readable and remove white panel. */
.modal .modal-title,.modal label,.modal .field-label,.modal .sub,.modal p{color:#D7E5F7}
.modal input,.modal select,.modal textarea{background:#0B1422!important;color:#F1F5F9!important;border-color:#354A64!important}
.modal input::placeholder,.modal textarea::placeholder{color:#91A5BF!important}
.modal .demo-note{background:#263247;border-color:#65758D;color:#F5D98B}
.modal .btn,.modal button{background:#17263A;color:#DCEBFA;border-color:#38516B}
.modal .btn-primary,.modal button[type="submit"]{background:#2DD4BF;color:#062522;border-color:#2DD4BF}
.modal .modal-close{background:#17263A;color:#DCEBFA;border-color:#38516B}

.modal-actions{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.5rem}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes pop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
.demo-note{display:flex;gap:.6rem;align-items:flex-start;margin:0 0 1.2rem;padding:.75rem .95rem;border-radius:14px;background:#FFF4D6;border:1px solid #E4C46A;color:#5C4100;font-size:.87rem;font-weight:500;line-height:1.45}
.demo-note svg{flex:none;margin-top:1px}
.ok-banner{display:flex;gap:.6rem;align-items:flex-start;margin:0 0 1.2rem;padding:.8rem 1rem;border-radius:14px;background:#E1F3EA;border:1px solid #9AD3B7;color:#0F5A39;font-weight:600;font-size:.92rem}
.ok-banner svg{flex:none;margin-top:2px}
.dm-head{display:flex;gap:1.2rem;align-items:center;margin-bottom:1.2rem;padding-right:2.5rem}
.dm-head h2{font-size:1.8rem}
.dm-spec{color:var(--muted);margin:.15rem 0 .7rem}
.dm-tags{display:flex;flex-wrap:wrap;gap:.5rem}
.dm-bio{color:var(--muted);margin-bottom:1.2rem}
.dm-list{display:grid;gap:.6rem;margin-bottom:1.3rem}
.dm-list div{display:grid;grid-template-columns:150px 1fr;gap:.8rem;padding:.75rem 1rem;background:var(--mint);border-radius:14px}
.dm-list dt{display:flex;align-items:center;gap:.5rem;font-weight:700;font-size:.88rem;color:var(--navy)}
.dm-list dd{font-size:.93rem}

/* Forms */
.form{display:grid;gap:1.1rem}
.row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.row-3{grid-template-columns:1fr 1fr 1fr}
.field label,.field .label{display:block;font-weight:700;font-size:.9rem;margin-bottom:.4rem;color:var(--navy)}
.field input,.field select,.field textarea{width:100%;padding:.8rem 1rem;border-radius:14px;border:2px solid var(--field);background:#fff;font-size:.98rem;color:var(--ink);transition:border-color .2s,box-shadow .2s}
.field textarea{resize:vertical;min-height:84px}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--teal);box-shadow:0 0 0 4px rgba(8,127,140,.25)}
.field .has-error{border-color:var(--err);background:#FFF8F7}
.err{display:flex;align-items:center;gap:.4rem;margin-top:.4rem;color:var(--err);font-size:.84rem;font-weight:600}
.hint{margin-top:.35rem;font-size:.84rem;color:var(--muted)}
.dates{display:flex;gap:.55rem;overflow-x:auto;padding:.2rem .1rem .5rem}
.dates:focus{outline:none}
.date-btn{flex:none;display:grid;justify-items:center;gap:0;width:70px;padding:.6rem .2rem;border-radius:16px;border:2px solid var(--field);background:#fff;font-size:.74rem;color:var(--muted);font-weight:600;transition:all .2s}
.date-btn b{font-family:'Fraunces',Georgia,serif;font-size:1.35rem;color:var(--navy);line-height:1.2}
.date-btn:hover{border-color:var(--navy);background:var(--mint)}
.date-btn[aria-pressed="true"]{background:var(--navy);border-color:var(--navy);color:#fff}
.date-btn[aria-pressed="true"] b{color:#fff}
.slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:.5rem}
.slots:focus{outline:none}
.slots .hint{grid-column:1/-1;margin:0}
.slot{padding:.65rem .4rem;border-radius:12px;border:2px solid var(--field);background:#fff;font-weight:600;font-size:.88rem;color:var(--navy);transition:all .2s}
.slot:hover:not(:disabled){border-color:var(--navy);background:var(--mint)}
.slot[aria-pressed="true"]{background:var(--teal);border-color:var(--teal);color:#fff}
.slot:disabled{cursor:not-allowed;background:#EEF2F5;color:#5F7280;text-decoration:line-through;border-color:#D5E1E8}
.tabs{display:flex;gap:.3rem;padding:.3rem;background:var(--mint);border-radius:999px;margin-bottom:1.2rem;border:1px solid var(--mint-2)}
.tab{flex:1;padding:.6rem 1rem;border-radius:999px;border:0;background:transparent;font-weight:700;color:var(--navy);transition:background .2s}
.tab:hover{background:var(--mint-2)}
.tab[aria-selected="true"]{background:var(--navy);color:#fff}

/* Success (booking) */
.success{text-align:center}
.success-icon{display:inline-grid;place-items:center;width:72px;height:72px;border-radius:50%;background:#E1F3EA;color:var(--ok);margin-bottom:1rem}
.success h2{font-size:1.9rem}
.success-sub{color:var(--muted);margin:.6rem auto 1.4rem;max-width:30rem}
.summary{display:grid;gap:.5rem;text-align:left;margin-bottom:1.2rem}
.summary div{display:flex;justify-content:space-between;gap:1rem;padding:.7rem 1rem;background:var(--mint);border-radius:12px;font-size:.93rem}
.summary dt{font-weight:700;color:var(--navy)}
.summary dd{text-align:right}
.success .demo-note{text-align:left}
.success .modal-actions{justify-content:center}

/* Patient records */
.pr-search{display:flex;gap:.8rem;flex-wrap:wrap;align-items:flex-start}
.pr-search-field{flex:1 1 260px}
.pr-search-actions{display:flex;gap:.6rem;flex-wrap:wrap;padding-top:1.72rem}
.pr-load-err{margin:.8rem 0 0}
.pr-grid{display:grid;grid-template-columns:260px 1fr;gap:1.2rem;align-items:start}
.pr-list{display:grid;gap:.5rem;align-content:start;max-height:520px;overflow-y:auto;padding:2px}
.pr-item{width:100%;display:grid;gap:.1rem;text-align:left;padding:.8rem 1rem;border-radius:14px;border:2px solid var(--line);background:#fff;transition:border-color .2s,background .2s}
.pr-item strong{color:var(--navy)}
.pr-item span{font-size:.85rem;color:var(--muted)}
.pr-item:hover{border-color:var(--navy);background:var(--mint)}
.pr-item[aria-pressed="true"]{border-color:var(--teal);background:var(--mint)}
.pr-detail{border:1px solid var(--line);border-radius:20px;padding:1.4rem;background:#fff}
.pr-detail-head{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap;margin-bottom:1rem}
.pr-detail-head h3{font-size:1.6rem}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.6rem;margin-bottom:1rem}
.fact{background:var(--mint);border-radius:12px;padding:.6rem .8rem}
.fact dt{font-size:.74rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.fact dd{font-weight:700;color:var(--navy)}
.pr-block{margin-top:1.1rem}
.pr-block h4,.rx-block h4{font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:var(--teal-d);margin-bottom:.35rem;font-weight:700}
.pr-block p{color:var(--ink)}
.table-wrap{overflow-x:auto}
.hist{width:100%;border-collapse:collapse;font-size:.9rem;min-width:480px}
.hist th{text-align:left;background:var(--mint);color:var(--navy);padding:.6rem .7rem;font-size:.8rem}
.hist td{padding:.65rem .7rem;border-bottom:1px solid var(--line)}
.rx-mini{display:grid;gap:.5rem}
.rx-mini li{display:flex;gap:.6rem;align-items:flex-start;padding:.6rem .8rem;background:var(--mint);border-radius:12px;font-size:.9rem}
.rx-mini svg{flex:none;color:var(--teal-d);margin-top:2px}
.rx-mini em{font-style:normal;color:var(--muted)}

/* Prescription sheet */
.rx-sheet{border:2px solid var(--navy);border-radius:18px;padding:1.5rem;background:#fff}
.rx-head{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;padding-bottom:1rem;border-bottom:2px solid var(--line);margin-bottom:1rem}
.rx-meta{display:grid;text-align:right;font-size:.85rem;color:var(--muted)}
.rx-meta strong{color:var(--navy);font-size:1rem}
.rx-people{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem;margin-bottom:1rem}
.rx-people div{background:var(--mint);border-radius:12px;padding:.6rem .8rem}
.rx-people dt{font-size:.74rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.rx-people dd{font-weight:700;color:var(--navy)}
.rx-block{margin:1rem 0}
.rx-table{width:100%;border-collapse:collapse;font-size:.93rem;min-width:420px;margin:.4rem 0}
.rx-table th{text-align:left;background:var(--navy);color:#fff;padding:.6rem .8rem;font-size:.82rem}
.rx-table td{padding:.7rem .8rem;border:1px solid var(--line);font-weight:600}
.rx-foot{margin-top:1rem;padding-top:.8rem;border-top:1px dashed var(--field);font-size:.82rem;color:var(--muted)}

/* Toast */
.toast{position:fixed;left:50%;bottom:1.4rem;transform:translateX(-50%);z-index:200;display:flex;align-items:center;gap:.7rem;max-width:min(520px,calc(100% - 2rem));padding:.9rem 1rem .9rem 1.1rem;border-radius:16px;background:var(--navy);color:#fff;font-weight:500;font-size:.93rem;box-shadow:0 20px 40px -16px rgba(0,0,0,.6);border-left:5px solid var(--accent);animation:toastin .3s ease}
.toast svg{flex:none;color:var(--accent)}
.toast-error{border-left-color:#FF9B92}
.toast-error svg{color:#FF9B92}
.toast button{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff}
.toast button:hover{background:rgba(255,255,255,.3)}
.toast button svg{color:#fff}
@keyframes toastin{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}

/* Responsive */
@media (max-width:1020px){
  .hero-grid{grid-template-columns:1fr;gap:3.5rem}
  .hero-copy{max-width:40rem}
  .steps{grid-template-columns:repeat(2,1fr);gap:2.4rem 1.6rem}
  .step:not(:last-child)::after{display:none}
  .about{grid-template-columns:1fr;gap:2.5rem}
  .footer-grid{grid-template-columns:1fr 1fr}
}
@media (max-width:900px){
  .nav-links,.nav-actions{display:none}
  .burger{display:inline-flex}
}
@media (max-width:820px){
  .pr-grid{grid-template-columns:1fr}
  .pr-list{max-height:220px}
}
@media (max-width:760px){
  .sec{padding:4.2rem 0}
  .hero{padding:2rem 0 4rem}
  .svc{grid-template-columns:1fr}
  .svc-main{grid-row:auto}
  .row,.row-3{grid-template-columns:1fr}
  .dm-list div{grid-template-columns:1fr;gap:.2rem}
  .dm-head{flex-direction:column;align-items:flex-start}
  .modal{padding:1.5rem 1.2rem;border-radius:24px}
  .cta{padding:3.4rem 1.2rem;border-radius:28px}
  .fc-appt{left:0}
  .fc-rx{right:0}
  .pr-search-actions{padding-top:0}
  .rx-meta{text-align:left}
}
@media (max-width:520px){
  .steps{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr}
  .cta-row .btn{width:100%}
  .hero .cta-row .btn{flex:1 1 100%}
  .hl{white-space:normal}
}

/* Reduced motion */
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .mc *,.mc *::before,.mc *::after{animation:none!important;transition:none!important}
  .btn:hover,.svc-card:hover,.doc-card:hover,.chip:hover{transform:none}
}

/* Premium dark dashboard redesign */
.mc-dashboard{--navy:#eef4ff;--navy-d:#e8eefb;--teal:#61e2ce;--teal-d:#38cdb9;--mint:#122235;--mint-2:#1b344b;--page:#0b1220;--ink:#e7edf7;--muted:#9eabc0;--line:#253247;--field:#71829b;--accent:#61e2ce;color:var(--ink);background:#0b1220!important;color-scheme:dark}
.mc-dashboard h1,.mc-dashboard h2,.mc-dashboard h3,.mc-dashboard h4{color:#f1f5fb}
.mc-dashboard .sub,.mc-dashboard .hint,.mc-dashboard .doc-meta{color:#9eabc0}
.mc-dashboard .dashboard-sidebar{position:fixed;z-index:50;inset:0 auto 0 0;width:250px;background:#101a2a;border-right:1px solid #253247;padding:24px 16px;display:flex;flex-direction:column;gap:8px}
.mc-dashboard .sidebar-brand{padding:4px 10px 24px;border-bottom:1px solid #253247;margin-bottom:12px}
.mc-dashboard .logo-text{color:#f1f5fb}.mc-dashboard .logo-light .logo-text{color:#f1f5fb}
.mc-dashboard .sidebar-label{font-size:.7rem;letter-spacing:.15em;color:#7f90aa;font-weight:800;padding:8px 12px}
.mc-dashboard .sidebar-link{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;color:#aab8cc;font-size:.9rem;font-weight:700;transition:background .15s,color .15s}
.mc-dashboard .sidebar-link span{width:24px;text-align:center;color:#61e2ce;font-size:1.15rem}
.mc-dashboard .sidebar-link:hover,.mc-dashboard .sidebar-link:focus{background:#1c2b40;color:#fff;outline:none}
.mc-dashboard .sidebar-bottom{margin-top:auto;border-top:1px solid #253247;padding:18px 6px 4px;display:flex;align-items:center;gap:10px;min-width:0}
.mc-dashboard .sidebar-user-dot{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#164e63;color:#99f6e4;font-weight:800;flex-shrink:0}
.mc-dashboard .sidebar-bottom strong,.mc-dashboard .sidebar-bottom small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:155px}.mc-dashboard .sidebar-bottom strong{font-size:.82rem;color:#edf4ff}.mc-dashboard .sidebar-bottom small{font-size:.72rem;color:#8797af}
.mc-dashboard .dashboard-topbar{position:fixed;z-index:40;top:0;left:250px;right:0;background:#0f1928!important;border-bottom:1px solid #253247!important;box-shadow:none!important;min-height:76px}
.mc-dashboard .dashboard-topbar .wrap{max-width:none;padding-left:28px;padding-right:28px}.mc-dashboard .dashboard-topbar .btn-ghost{color:#e7edf7;border-color:#34445b}
.mc-dashboard .dashboard-main{margin-left:250px;max-width:none;width:auto;padding:108px 32px 48px!important}
.mc-dashboard .dashboard-welcome{background:linear-gradient(135deg,#14283c,#102032 70%,#123447);padding:30px;border:1px solid #294258;border-radius:22px}
.mc-dashboard .dashboard-welcome .eyebrow,.mc-dashboard .eyebrow{color:#61e2ce}
.mc-dashboard .dashboard-panel{background:#111c2c;border:1px solid #26354a;border-radius:20px;padding:24px!important;margin:20px 0}
.mc-dashboard .sec-head{margin-bottom:20px}.mc-dashboard .doc-card,.mc-dashboard .pr-detail,.mc-dashboard .pr-item{background:#162337!important;border-color:#2a3a51!important;color:#e7edf7}
.mc-dashboard .doc-card h3,.mc-dashboard .pr-detail h3{color:#f1f5fb}.mc-dashboard .doc-card p,.mc-dashboard .doc-card strong{color:#c5d0e0}
.mc-dashboard .btn-ghost{background:#142235!important;color:#dce6f5!important;border-color:#34445b!important}.mc-dashboard .btn-ghost:hover{background:#1c3048!important;color:#ffffff!important;border-color:#5eead4!important}.mc-dashboard .btn-light{background:#142235!important;color:#dce6f5!important;border-color:#34445b!important}.mc-dashboard .btn-light:hover{background:#1c3048!important;border-color:#5eead4!important}.mc-dashboard input,.mc-dashboard select,.mc-dashboard textarea{background:#0b1422!important;border-color:#34445b!important;color:#f1f5fb!important}
.mc-dashboard .bmi-card{min-width:160px;padding:16px 20px;border-radius:16px;background:#0d2935;border:1px solid #245b65;display:flex;flex-direction:column;gap:4px}.mc-dashboard .bmi-card span,.mc-dashboard .bmi-card small{font-size:.76rem;color:#9acbc9}.mc-dashboard .bmi-card strong{font-size:1.8rem;color:#7ff2df}
.mc-dashboard .profile-form{display:grid;gap:16px}.mc-dashboard .profile-form h3{font:700 1rem 'Plus Jakarta Sans',sans-serif;padding-top:10px}.mc-dashboard .profile-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.mc-dashboard .profile-grid label{display:flex;flex-direction:column;gap:7px;color:#bdc9da;font-size:.84rem;font-weight:700}.mc-dashboard .profile-grid input,.mc-dashboard .profile-grid select,.mc-dashboard .profile-grid textarea{width:100%;border:1px solid #34445b;border-radius:10px;padding:11px 12px;min-width:0}.mc-dashboard .profile-grid textarea{resize:vertical}.mc-dashboard .profile-actions{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.mc-dashboard .profile-message{color:#8af0d9;font-size:.85rem}.mc-dashboard .profile-note{font-size:.78rem;color:#93a2b8;line-height:1.5}.mc-dashboard .profile-error{color:#fda4af;font-weight:600}
@media(max-width:900px){.mc-dashboard .dashboard-sidebar{width:210px}.mc-dashboard .dashboard-topbar{left:210px}.mc-dashboard .dashboard-main{margin-left:210px;padding-left:20px!important;padding-right:20px!important}}
@media(max-width:680px){.mc-dashboard .dashboard-sidebar{position:static;width:auto;min-height:auto;padding:12px;display:block}.mc-dashboard .sidebar-brand{padding:4px 6px 12px;margin-bottom:8px}.mc-dashboard .sidebar-label,.mc-dashboard .sidebar-bottom{display:none}.mc-dashboard .sidebar-link{display:inline-flex;padding:8px 10px;font-size:.78rem;margin:2px}.mc-dashboard .dashboard-topbar{position:static;left:auto}.mc-dashboard .dashboard-topbar .wrap{padding:12px 16px}.mc-dashboard .dashboard-main{margin-left:0;padding:24px 14px!important}.mc-dashboard .profile-grid{grid-template-columns:1fr}.mc-dashboard .dashboard-welcome{padding:20px}}

/* Print: only the prescription sheet is printed */
@media print{
  body{background:#fff!important}
  .mc .skip,.mc .nav,.mc main,.mc .footer,.mc .toast,.no-print{display:none!important}
  .overlay{position:static;display:block;padding:0;background:#fff;backdrop-filter:none;-webkit-backdrop-filter:none;overflow:visible;animation:none}
  .modal{box-shadow:none;border:0;max-height:none;max-width:none;overflow:visible;padding:0;border-radius:0;animation:none}
  .modal-close{display:none!important}
}
/* Final theme safeguards: prevent global styles from turning toasts white. */
.toast, .toast-success, .toast-error { background: #142235 !important; color: #F1F5F9 !important; }
.toast span { color: #F1F5F9 !important; }
.toast button { background: #20344B !important; color: #F1F5F9 !important; border: 1px solid #35536A !important; }
#dashboard-notifications .doc-card, #dashboard-notifications .doc-card h3, #dashboard-notifications .doc-card p { color: #E7EEF8 !important; }


/* Final dark-theme button overrides */
.mc-dashboard .btn,
.mc-dashboard button.btn,
.mc-dashboard .btn-primary,
.mc-dashboard .btn-dark,
.mc-dashboard .btn-light,
.mc-dashboard .btn-ghost,
.mc-dashboard button[class*="btn-"] {
  background: #142235 !important;
  background-image: none !important;
  color: #E7EEF8 !important;
  border: 1px solid #35536A !important;
  box-shadow: none !important;
}
.mc-dashboard .btn-primary,
.mc-dashboard .btn-dark {
  background: #123B42 !important;
  color: #72F0DC !important;
  border-color: #2A9D92 !important;
}
.mc-dashboard .btn:hover,
.mc-dashboard button[class*="btn-"]:hover {
  background: #1D344A !important;
  color: #FFFFFF !important;
  border-color: #5EEAD4 !important;
}
.mc-dashboard .toast,
.mc-dashboard .toast-success,
.mc-dashboard .toast-error {
  background: #142235 !important;
  color: #F1F5F9 !important;
  border: 1px solid #35536A !important;
}


/* Dashboard colour selector: themes are scoped to the authenticated dashboard. */
.mc-dashboard .dashboard-theme-control{display:flex;align-items:center;gap:7px;color:#cbd5e1;font-size:.8rem;font-weight:700;white-space:nowrap}
.mc-dashboard .dashboard-theme-control select{min-width:125px;padding:8px 10px;border:1px solid var(--theme-border,#cad7f0);border-radius:10px;background:var(--theme-card,#fff);color:var(--theme-text,#24324a);font:inherit;cursor:pointer}
.mc-dashboard.theme-blue{--theme-accent:#60a5fa;--theme-accent-dark:#1d4ed8;--theme-glow:#102d4a;--theme-border:#31557a}
.mc-dashboard.theme-teal{--theme-accent:#61e2ce;--theme-accent-dark:#0f766e;--theme-glow:#123447;--theme-border:#2a9d92}
.mc-dashboard.theme-purple{--theme-accent:#c4b5fd;--theme-accent-dark:#6d28d9;--theme-glow:#2b2146;--theme-border:#66519a}
.mc-dashboard.theme-green{--theme-accent:#86efac;--theme-accent-dark:#166534;--theme-glow:#183729;--theme-border:#347653}
.mc-dashboard.theme-rose{--theme-accent:#fda4af;--theme-accent-dark:#9f1239;--theme-glow:#3b202e;--theme-border:#8b4358}
.mc-dashboard.theme-amber{--theme-accent:#fcd34d;--theme-accent-dark:#92400e;--theme-glow:#3b3020;--theme-border:#8a6a35}
.mc-dashboard[class*="theme-"] .dashboard-welcome{background:linear-gradient(135deg,var(--theme-glow),#102032 72%,#142235)!important;border-color:var(--theme-border)!important}
.mc-dashboard[class*="theme-"] .dashboard-welcome .eyebrow,.mc-dashboard[class*="theme-"] .eyebrow,.mc-dashboard[class*="theme-"] .sidebar-link span{color:var(--theme-accent)!important}
.mc-dashboard[class*="theme-"] .sidebar-link:hover,.mc-dashboard[class*="theme-"] .sidebar-link:focus{background:var(--theme-glow)!important}
.mc-dashboard[class*="theme-"] .sidebar-user-dot{background:var(--theme-glow)!important;color:var(--theme-accent)!important}
.mc-dashboard[class*="theme-"] .bmi-card{background:var(--theme-glow)!important;border-color:var(--theme-border)!important}
.mc-dashboard[class*="theme-"] .bmi-card span,.mc-dashboard[class*="theme-"] .bmi-card small,.mc-dashboard[class*="theme-"] .bmi-card strong{color:var(--theme-accent)!important}
.mc-dashboard[class*="theme-"] .btn-primary,.mc-dashboard[class*="theme-"] .btn-dark{background:var(--theme-glow)!important;color:var(--theme-accent)!important;border-color:var(--theme-border)!important}
.mc-dashboard[class*="theme-"] .btn:hover,.mc-dashboard[class*="theme-"] button[class*="btn-"]:hover{border-color:var(--theme-accent)!important}
.mc-dashboard[class*="theme-"] input:focus,.mc-dashboard[class*="theme-"] select:focus,.mc-dashboard[class*="theme-"] textarea:focus{outline:2px solid var(--theme-accent)!important;outline-offset:1px}
@media(max-width:680px){.mc-dashboard .dashboard-theme-control{width:100%;justify-content:flex-start}.mc-dashboard .dashboard-theme-control select{flex:1}}


/* Full-dashboard themes: softer coordinated light palettes. */
.mc-dashboard.theme-blue{--theme-page:#f3f7ff;--theme-sidebar:#e5edff;--theme-topbar:#edf3ff;--theme-panel:#e4ecff;--theme-card:#ffffff;--theme-field:#f8faff;--theme-text:#24324a;--theme-muted:#65738b;--theme-accent:#4169e1;--theme-border:#cad7f0;--theme-glow:#dbe6ff}
.mc-dashboard.theme-teal{--theme-page:#effaf8;--theme-sidebar:#d8f3ef;--theme-topbar:#e6f8f5;--theme-panel:#d8f1ec;--theme-card:#ffffff;--theme-field:#f8fffd;--theme-text:#203c3a;--theme-muted:#607d79;--theme-accent:#168a83;--theme-border:#b7ded8;--theme-glow:#c9eee7}
.mc-dashboard.theme-purple{--theme-page:#f8f5ff;--theme-sidebar:#eee5ff;--theme-topbar:#f4eeff;--theme-panel:#ece3ff;--theme-card:#ffffff;--theme-field:#fdfbff;--theme-text:#34284a;--theme-muted:#786a8d;--theme-accent:#805ad5;--theme-border:#d8c9f2;--theme-glow:#e2d5ff}
.mc-dashboard.theme-green{--theme-page:#f3faf2;--theme-sidebar:#e2f1de;--theme-topbar:#edf7e9;--theme-panel:#e0efdc;--theme-card:#ffffff;--theme-field:#fbfffa;--theme-text:#2a3d2b;--theme-muted:#6a806b;--theme-accent:#4f8a45;--theme-border:#c8dfc2;--theme-glow:#d5ebcf}
.mc-dashboard.theme-rose{--theme-page:#fff5f7;--theme-sidebar:#ffe3eb;--theme-topbar:#fff0f4;--theme-panel:#ffe2ea;--theme-card:#ffffff;--theme-field:#fffafd;--theme-text:#4a2c38;--theme-muted:#896b78;--theme-accent:#c34f78;--theme-border:#f0c5d4;--theme-glow:#ffd5e2}
.mc-dashboard.theme-amber{--theme-page:#fff9ed;--theme-sidebar:#ffefcc;--theme-topbar:#fff5dc;--theme-panel:#ffedc5;--theme-card:#ffffff;--theme-field:#fffdf7;--theme-text:#4a3a20;--theme-muted:#887654;--theme-accent:#ad7416;--theme-border:#eed7a1;--theme-glow:#ffe4a8}
.mc-dashboard[class*="theme-"]{background:var(--theme-page)!important;color:var(--theme-text)!important;color-scheme:light}
.mc-dashboard[class*="theme-"] .dashboard-sidebar{background:var(--theme-sidebar)!important;border-color:var(--theme-border)!important}
.mc-dashboard[class*="theme-"] .dashboard-topbar{background:var(--theme-topbar)!important;border-color:var(--theme-border)!important;color:var(--theme-text)!important}
.mc-dashboard[class*="theme-"] .dashboard-main{background:var(--theme-page)!important}
.mc-dashboard[class*="theme-"] .dashboard-panel,.mc-dashboard[class*="theme-"] .doc-card,.mc-dashboard[class*="theme-"] .pr-detail,.mc-dashboard[class*="theme-"] .pr-item,.mc-dashboard[class*="theme-"] .dashboard-section,.mc-dashboard[class*="theme-"] .stat-card,.mc-dashboard[class*="theme-"] .overview-card,.mc-dashboard[class*="theme-"] .appointment-card,.mc-dashboard[class*="theme-"] .notification-card{background:var(--theme-card)!important;border-color:var(--theme-border)!important;color:var(--theme-text)!important}
.mc-dashboard[class*="theme-"] .dashboard-welcome{background:linear-gradient(135deg,var(--theme-glow),var(--theme-panel))!important;border-color:var(--theme-border)!important;color:var(--theme-text)!important}
.mc-dashboard[class*="theme-"] h1,.mc-dashboard[class*="theme-"] h2,.mc-dashboard[class*="theme-"] h3,.mc-dashboard[class*="theme-"] h4,.mc-dashboard[class*="theme-"] .doc-card h3,.mc-dashboard[class*="theme-"] .doc-card p,.mc-dashboard[class*="theme-"] .doc-card strong{color:var(--theme-text)!important}
.mc-dashboard[class*="theme-"] p,.mc-dashboard[class*="theme-"] small,.mc-dashboard[class*="theme-"] .sub,.mc-dashboard[class*="theme-"] .hint,.mc-dashboard[class*="theme-"] .doc-meta{color:var(--theme-muted)}
.mc-dashboard[class*="theme-"] .sidebar-link span,.mc-dashboard[class*="theme-"] .eyebrow,.mc-dashboard[class*="theme-"] .dashboard-welcome .eyebrow{color:var(--theme-accent)!important}
.mc-dashboard[class*="theme-"] .sidebar-link{color:var(--theme-text)!important}
.mc-dashboard[class*="theme-"] .sidebar-link:hover,.mc-dashboard[class*="theme-"] .sidebar-link:focus{background:var(--theme-glow)!important;color:var(--theme-text)!important}
.mc-dashboard[class*="theme-"] .sidebar-user-dot{background:var(--theme-glow)!important;color:var(--theme-accent)!important}
.mc-dashboard[class*="theme-"] input,.mc-dashboard[class*="theme-"] select,.mc-dashboard[class*="theme-"] textarea{background:var(--theme-field)!important;border-color:var(--theme-border)!important;color:var(--theme-text)!important}
/* Includes specialty filter pills and other plain buttons that were staying white. */
.mc-dashboard[class*="theme-"] button:not(.modal-close),
.mc-dashboard[class*="theme-"] .chip,
.mc-dashboard[class*="theme-"] .filter-chip,
.mc-dashboard[class*="theme-"] .dept-chip,
.mc-dashboard[class*="theme-"] .date-btn,
.mc-dashboard[class*="theme-"] .slot{background:var(--theme-panel)!important;color:var(--theme-text)!important;border-color:var(--theme-border)!important}
.mc-dashboard[class*="theme-"] button[aria-pressed="true"],
.mc-dashboard[class*="theme-"] .chip.active,
.mc-dashboard[class*="theme-"] .filter-chip.active,
.mc-dashboard[class*="theme-"] .dept-chip.active{background:var(--theme-glow)!important;color:var(--theme-accent)!important;border-color:var(--theme-accent)!important}
.mc-dashboard[class*="theme-"] .btn-primary,.mc-dashboard[class*="theme-"] .btn-dark{background:var(--theme-glow)!important;color:var(--theme-accent)!important;border-color:var(--theme-border)!important}
.mc-dashboard[class*="theme-"] button:hover{border-color:var(--theme-accent)!important}
.mc-dashboard[class*="theme-"] .dashboard-theme-control{color:var(--theme-muted)!important}
.mc-dashboard[class*="theme-"] .bmi-card{background:var(--theme-glow)!important;border-color:var(--theme-border)!important}
.mc-dashboard[class*="theme-"] .bmi-card span,.mc-dashboard[class*="theme-"] .bmi-card small,.mc-dashboard[class*="theme-"] .bmi-card strong{color:var(--theme-accent)!important}
`

export default App