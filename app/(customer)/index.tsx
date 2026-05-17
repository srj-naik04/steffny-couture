import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { ArrowRight, AtSign, MapPin, Phone } from 'lucide-react-native';
import { type ReactNode } from 'react';

import { WelcomeHero } from '@/components/booking/welcome-hero';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { Box, Button, Card, PressableScale, Screen, Text } from '@/components/ui';
import { ALTERATION_TYPES } from '@/constants/alteration-types';
import { colors } from '@/constants/brand';
import { DAY_LABELS, type DayKey, openingHours, shop } from '@/constants/shop';
import { nowInLondon } from '@/lib/date';
import { getPhoneLink } from '@/lib/whatsapp';

import { dayKeyOf, isDraftStarted, useBookingDraft } from '@/features/bookings';

const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** A compact, tappable shop-info pill — maps, phone, Instagram. */
function ContactPill({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      haptic="selection"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-2 py-2.5">
      {icon}
      <Text variant="caption" className="text-inkMuted">
        {label}
      </Text>
    </PressableScale>
  );
}

/**
 * Customer welcome screen (CLAUDE.md §3.1) — the app's front door. Leads to
 * the booking wizard and surfaces a resume card when a draft is in progress.
 */
export default function CustomerHome() {
  const hydrated = useBookingDraft((s) => s.hydrated);
  const draft = useBookingDraft((s) => s.draft);
  const reset = useBookingDraft((s) => s.reset);

  const hasDraft = hydrated && isDraftStarted(draft);
  const todayKey = dayKeyOf(nowInLondon());

  const startFresh = () => {
    reset();
    router.push('/book/type');
  };

  return (
    <Screen scroll className="pb-8 pt-2">
      <Box className="flex-row items-center justify-between">
        <Text variant="caption" className="uppercase text-gold">
          {shop.name}
        </Text>
        <NotificationCenter />
      </Box>

      {/* Hero — a photo of Steffi's couture work behind a rose scrim. */}
      <WelcomeHero>
        <Text variant="caption" className="uppercase text-gold">
          Crafted in London
        </Text>
        <Text variant="hero" className="text-ivory">
          Alterations, perfected.
        </Text>
        <Text variant="body" className="text-ivory/90">
          Book a fitting at our Hounslow studio — share a few photos, pick a
          time that suits you, and Steffi will reply with a quote within 24
          hours.
        </Text>
      </WelcomeHero>

      {hasDraft ? (
        <Card
          onPress={() => router.push('/book/type')}
          accessibilityLabel="Continue your booking"
          className="mt-4 flex-row items-center justify-between border-roseSoft bg-roseSoft">
          <Box className="flex-1 pr-3">
            <Text variant="bodyLg">Continue your booking</Text>
            <Text variant="secondary" className="text-inkMuted">
              Pick up where you left off.
            </Text>
          </Box>
          <ArrowRight size={20} color={colors.rose} strokeWidth={2} />
        </Card>
      ) : null}

      <Box className="mt-6 gap-2.5">
        <Button label="Book an alteration" size="lg" onPress={startFresh} />
        <Button
          label="My bookings"
          variant="secondary"
          onPress={() => router.push('/bookings')}
        />
      </Box>

      <Box className="mt-4 flex-row gap-2">
        <ContactPill
          icon={<MapPin size={15} color={colors.rose} strokeWidth={2} />}
          label="Hounslow"
          onPress={() =>
            void Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`,
            )
          }
        />
        <ContactPill
          icon={<Phone size={15} color={colors.rose} strokeWidth={2} />}
          label="Call"
          onPress={() => void Linking.openURL(getPhoneLink())}
        />
        <ContactPill
          icon={<AtSign size={15} color={colors.rose} strokeWidth={2} />}
          label="Instagram"
          onPress={() => void Linking.openURL(shop.instagramUrl)}
        />
      </Box>

      <Card className="mt-6 gap-1">
        <Text variant="title" className="mb-1">
          Opening hours
        </Text>
        {DAY_ORDER.map((day) => {
          const [open, close] = openingHours[day];
          const isToday = day === todayKey;
          return (
            <Box
              key={day}
              className={`flex-row items-center justify-between rounded-lg px-2 py-1.5 ${
                isToday ? 'bg-roseSoft' : ''
              }`}>
              <Text
                variant="body"
                className={isToday ? 'font-body-semibold text-rose' : 'text-ink'}>
                {DAY_LABELS[day]}
              </Text>
              <Text
                variant="body"
                className={isToday ? 'font-body-medium text-rose' : 'text-inkMuted'}>
                {open} – {close}
              </Text>
            </Box>
          );
        })}
      </Card>

      <Text variant="caption" className="mt-6 text-center text-inkSubtle">
        {ALTERATION_TYPES.length} alteration services · Bespoke, priced per job
      </Text>
    </Screen>
  );
}
