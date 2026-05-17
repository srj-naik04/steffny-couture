/**
 * Seeds the shop owner account (Steffi) as a `manager` role user.
 *
 * Idempotent — safe to re-run. Credentials are read from the environment,
 * never hardcoded:
 *
 *   SUPABASE_URL               project URL
 *   SUPABASE_SERVICE_ROLE_KEY  service-role key (admin API; never in the app)
 *   SHOP_USER_EMAIL            optional, defaults to steffi@steffnycouture.co.uk
 *   SHOP_USER_PASSWORD         temporary password to set
 *
 * Run:  node scripts/seed-shop-user.mjs
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SHOP_USER_EMAIL ?? 'steffi@steffnycouture.co.uk';
const password = process.env.SHOP_USER_PASSWORD;

if (!url || !serviceKey || !password) {
  console.error(
    'Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SHOP_USER_PASSWORD are required.',
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
if (listErr) {
  console.error('listUsers failed:', listErr.message);
  process.exit(1);
}

let user = list.users.find((u) => u.email === email);

if (user) {
  console.log('Shop user already exists:', email);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Steffi Da Cruz', phone: '+447834877992' },
  });
  if (error) {
    console.error('createUser failed:', error.message);
    process.exit(1);
  }
  user = data.user;
  console.log('Created shop user:', email);
}

// handle_new_user() creates the profile as 'customer' — promote to manager.
const { error: updErr } = await supabase
  .from('profiles')
  .update({ role: 'manager', full_name: 'Steffi Da Cruz', phone: '+447834877992' })
  .eq('id', user.id);
if (updErr) {
  console.error('profile update failed:', updErr.message);
  process.exit(1);
}

console.log(`Shop user ready — id ${user.id}, role manager.`);
