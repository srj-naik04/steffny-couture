/**
 * Demo seed — wipes the bookings table and inserts a realistic shop's worth of
 * data, including real garment photos, so a demo build looks lived-in
 * (CLAUDE.md §8). Re-run between demos to reset.
 *
 * Connects directly to Postgres (bypassing RLS) to insert bookings and walk
 * them through their status history, and uses the Supabase client (anon key)
 * to upload booking photos to Storage.
 *
 * Environment:
 *   SEED_DATABASE_URL  postgres://postgres.<ref>:<pw>@<pooler-host>:5432/postgres
 *   EXPO_PUBLIC_SUPABASE_URL       the project URL  (from .env.local)
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY  the anon key     (from .env.local)
 *
 * Run:  SEED_DATABASE_URL=... node --env-file=.env.local scripts/seed.mjs
 *
 * Photos come from scripts/seed-photos/ (prepare-seed-photos.mjs). Deleting a
 * booking cascades to its status history and notifications; the insert +
 * status-walk re-fire the triggers, so history and notifications are rebuilt.
 */
import { readFileSync } from 'node:fs';

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const connectionString = process.env.SEED_DATABASE_URL;
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const anonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

if (!connectionString || !supabaseUrl || !anonKey) {
  console.error(
    'Missing env: SEED_DATABASE_URL, EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY are required.',
  );
  process.exit(1);
}

/** Demo "today" — matches the build's reference date. */
const TODAY = new Date('2026-05-17T00:00:00Z');

function dateId(offsetDays) {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function createdAt(offsetDays) {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  d.setUTCHours(10, 30, 0, 0);
  return d.toISOString();
}

// The path each booking walks from `new` to its target status — every step
// fires the history + notification triggers.
const STATUS_PATH = {
  new: [],
  confirmed: ['confirmed'],
  in_progress: ['confirmed', 'in_progress'],
  ready: ['confirmed', 'in_progress', 'ready'],
  collected: ['confirmed', 'in_progress', 'ready', 'collected'],
  cancelled: ['cancelled'],
};

// Curated garment photos (prepare-seed-photos.mjs), loaded once and reused.
const PHOTO_FILES = ['g1.jpg', 'g2.jpg', 'g3.jpg', 'g4.jpg', 'g5.jpg'];
const PHOTOS = PHOTO_FILES.map((file) =>
  readFileSync(new URL(`./seed-photos/${file}`, import.meta.url)),
);

// 15 bookings — realistic British names, the studio's services, a spread of
// statuses, dates and prices. Phone numbers use Ofcom's reserved fictitious
// range (07700 900xxx). `photos` is how many garment photos to attach.
const BOOKINGS = [
  { name: 'Emily Carter', phone: '+44 7700 900118', email: 'emily.carter@example.com', type: 'hem', dress: 'wedding', description: 'Shorten the hem of the gown to just brush the floor in flat shoes.', appt: 0, time: '11:00', status: 'ready', quote: 45, final: null, notes: 'Bring flats to the fitting. Lace edge — hand-finish.', photos: 2 },
  { name: 'Aisha Khan', phone: '+44 7700 900231', email: 'aisha.khan@example.com', type: 'take_in', dress: 'evening', description: 'Take in the waist by about an inch for a closer fit.', appt: 0, time: '13:30', status: 'in_progress', quote: 60, final: null, notes: null, photos: 1 },
  { name: 'Priya Sharma', phone: '+44 7700 900344', email: 'priya.sharma@example.com', type: 'sleeves', dress: 'bridesmaid', description: 'Shorten the sleeves and reshape the cuff.', appt: 1, time: '10:30', status: 'new', quote: null, final: null, notes: null, photos: 2 },
  { name: 'Chloe Bennett', phone: '+44 7700 900457', email: 'chloe.bennett@example.com', type: 'bodice', dress: 'prom', description: 'Restructure the bodice for support and a cleaner neckline.', appt: 2, time: '15:00', status: 'confirmed', quote: 95, final: null, notes: 'Discussed boning at consultation.', photos: 3 },
  { name: 'Riya Patel', phone: '+44 7700 900560', email: 'riya.patel@example.com', type: 'zipper', dress: 'casual', description: 'Replace a broken invisible zip.', appt: -1, time: '12:00', status: 'ready', quote: 30, final: null, notes: null, photos: 1 },
  { name: 'Hannah Wright', phone: '+44 7700 900673', email: 'hannah.wright@example.com', type: 'embellishment', dress: 'wedding', description: 'Repair loose beading along the bodice and add a few to fill a gap.', appt: 1, time: '14:00', status: 'in_progress', quote: 110, final: null, notes: 'Beads sourced — colour matched.', photos: 2 },
  { name: 'Sophie Turner', phone: '+44 7700 900786', email: 'sophie.turner@example.com', type: 'hem', dress: 'prom', description: 'Take the hem up by two inches all round.', appt: 3, time: '16:30', status: 'new', quote: null, final: null, notes: null, photos: 1 },
  { name: 'Grace Adeyemi', phone: '+44 7700 900899', email: 'grace.adeyemi@example.com', type: 'take_out', dress: 'evening', description: 'Let the side seams out a little through the hip.', appt: 2, time: '11:30', status: 'confirmed', quote: 55, final: null, notes: null, photos: 2 },
  { name: 'Olivia Hughes', phone: '+44 7700 900902', email: 'olivia.hughes@example.com', type: 'hem', dress: 'casual', description: 'Shorten a pair of tailored trousers.', appt: -5, time: '10:00', status: 'collected', quote: 25, final: 25, notes: null, photos: 1 },
  { name: 'Maya Clarke', phone: '+44 7700 900145', email: 'maya.clarke@example.com', type: 'take_in', dress: 'birthday', description: 'Take in the back for a 21st birthday dress.', appt: 4, time: '13:00', status: 'new', quote: null, final: null, notes: null, photos: 2 },
  { name: 'Isabella Rossi', phone: '+44 7700 900258', email: 'isabella.rossi@example.com', type: 'bodice', dress: 'wedding', description: 'Reshape the bodice and add a modesty panel.', appt: 0, time: '16:00', status: 'ready', quote: 120, final: null, notes: 'Final fitting went well — pressed and bagged.', photos: 3 },
  { name: 'Funke Bello', phone: '+44 7700 900361', email: 'funke.bello@example.com', type: 'sleeves', dress: 'evening', description: 'Lengthen the sleeves with a matching cuff.', appt: 5, time: '12:30', status: 'confirmed', quote: 40, final: null, notes: null, photos: 1 },
  { name: 'Charlotte Reid', phone: '+44 7700 900474', email: 'charlotte.reid@example.com', type: 'hem', dress: 'bridesmaid', description: 'Hem a bridesmaid dress and ease the waist.', appt: -8, time: '14:30', status: 'collected', quote: 35, final: 40, notes: 'Added a small waist adjustment on the day.', photos: 2 },
  { name: 'Amara Okafor', phone: '+44 7700 900587', email: 'amara.okafor@example.com', type: 'other', dress: 'wedding', description: 'Not sure — would like advice on restyling an heirloom gown.', appt: -2, time: '15:30', status: 'cancelled', quote: null, final: null, notes: 'Customer rebooking for a later date.', photos: 1 },
  { name: 'Leah Morgan', phone: '+44 7700 900690', email: 'leah.morgan@example.com', type: 'take_in', dress: 'prom', description: 'Take in the bodice and shorten the straps.', appt: 0, time: '17:30', status: 'new', quote: null, final: null, notes: null, photos: 2 },
];

// Spread created_at so the "new this week" KPI is realistic, not all 15.
const CREATED_OFFSET = [-2, -1, -1, -3, -6, -2, 0, -4, -9, 0, -1, -2, -12, -5, 0];

const client = new pg.Client({ connectionString });
const supabase = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});

/** Upload `count` garment photos for a booking; returns the storage paths. */
async function uploadPhotos(bookingId, count, startIndex) {
  const paths = [];
  for (let j = 0; j < count; j += 1) {
    const photo = PHOTOS[(startIndex + j) % PHOTOS.length];
    const path = `bookings/${bookingId}/${j}.jpg`;
    const { error } = await supabase.storage
      .from('booking-photos')
      .upload(path, photo, { contentType: 'image/jpeg', upsert: true });
    if (error) {
      console.warn(`  photo upload failed (${path}): ${error.message}`);
    } else {
      paths.push(path);
    }
  }
  return paths;
}

try {
  await client.connect();
  await client.query('delete from public.bookings');

  let n = 0;
  let photoTotal = 0;
  for (const b of BOOKINGS) {
    const { rows } = await client.query(
      `insert into public.bookings
         (guest_name, guest_phone, guest_email, alteration_type_id, dress_type,
          description, appointment_date, appointment_time, status,
          price_quote, final_price, internal_notes, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,'new',$9,$10,$11,$12)
       returning id`,
      [
        b.name,
        b.phone,
        b.email,
        b.type,
        b.dress,
        b.description,
        dateId(b.appt),
        b.time,
        b.quote,
        b.final,
        b.notes,
        createdAt(CREATED_OFFSET[n] ?? -1),
      ],
    );
    const id = rows[0].id;

    const paths = await uploadPhotos(id, b.photos, n);
    if (paths.length > 0) {
      await client.query(
        'update public.bookings set photo_urls = $1 where id = $2',
        [paths, id],
      );
      photoTotal += paths.length;
    }

    for (const status of STATUS_PATH[b.status]) {
      await client.query(
        'update public.bookings set status = $1 where id = $2',
        [status, id],
      );
    }
    n += 1;
  }

  console.log(
    `Seeded ${n} bookings with ${photoTotal} photos (table wiped and rebuilt).`,
  );
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
