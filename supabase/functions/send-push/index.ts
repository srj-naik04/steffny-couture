// Edge Function: send-push  (CLAUDE.md §6.1)
// ---------------------------------------------------------------------------
// Sends an Expo push notification to every device token registered for a
// booking's customer (or to all staff devices for shop alerts).
//
// Deployment (post-demo — deferred):
//   supabase functions deploy send-push
//
// Invoke with the service-role key:
//   POST { "audience": "customer" | "shop", "booking_id": "<uuid>",
//          "title": "...", "body": "..." }
//
// Expo Push has no API key — the token itself is the credential.
// ---------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js';

const env = (key: string): string => Deno.env.get(key) ?? '';

const supabase = createClient(
  env('SUPABASE_URL'),
  env('SUPABASE_SERVICE_ROLE_KEY'),
);

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req) => {
  const auth = req.headers.get('Authorization') ?? '';
  if (!auth.includes(env('SUPABASE_SERVICE_ROLE_KEY'))) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { audience, booking_id, title, body } = (await req.json()) as {
      audience: 'customer' | 'shop';
      booking_id: string;
      title: string;
      body: string;
    };

    // Resolve which device tokens should receive this notification.
    let tokens: string[] = [];

    if (audience === 'shop') {
      const { data } = await supabase
        .from('push_tokens')
        .select('token, profiles!inner(role)')
        .in('profiles.role', ['tailor', 'manager', 'owner', 'admin']);
      tokens = (data ?? []).map((row: { token: string }) => row.token);
    } else {
      // The customer's tokens — matched through the booking's owner/email.
      const { data: booking } = await supabase
        .from('bookings')
        .select('customer_id, guest_email')
        .eq('id', booking_id)
        .single();
      if (booking?.customer_id) {
        const { data } = await supabase
          .from('push_tokens')
          .select('token')
          .eq('user_id', booking.customer_id);
        tokens = (data ?? []).map((row: { token: string }) => row.token);
      }
      // Guest bookings have no account, so no token can be matched to them —
      // the in-app notification centre and email cover that case.
    }

    if (tokens.length === 0) {
      return Response.json({ ok: true, sent: 0 });
    }

    const messages = tokens.map((token) => ({
      to: token,
      title,
      body,
      sound: 'default',
      data: { booking_id },
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
    const result = await response.json();

    return Response.json({ ok: true, sent: tokens.length, result });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
});
