import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { CalendarPlus, MessageCircle } from 'lucide-react-native';

import { SuccessCheck } from '@/components/booking/success-check';
import { Box, Button, Card, Screen, Text } from '@/components/ui';
import { colors } from '@/constants/brand';
import { shop } from '@/constants/shop';
import { addAppointmentToCalendar } from '@/lib/calendar';
import { formatLong, formatTimeLabel } from '@/lib/date';
import { getWhatsAppLink } from '@/lib/whatsapp';

/**
 * The confirmed screen — terminal, not a wizard step (no progress bar). The
 * draft has already been reset; everything shown comes from the route params
 * the review step passed after a successful insert (booking-wizard skill).
 */
export default function ConfirmedScreen() {
  const { reference, date, time } = useLocalSearchParams<{
    reference: string;
    date: string;
    time: string;
  }>();

  const onWhatsApp = () => {
    void Linking.openURL(
      getWhatsAppLink(`Hi Steffi, re: booking ${reference}`),
    );
  };

  const onAddToCalendar = () => {
    if (!date || !time) return;
    const startsAt = new Date(`${date}T${time}`);
    void addAppointmentToCalendar({
      title: 'Steffny Couture — alteration fitting',
      startsAt,
      endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000),
      location: shop.address,
      notes: `Booking reference ${reference}`,
    });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Box className="flex-1 items-center justify-center">
        <SuccessCheck />
        <Text variant="caption" className="mt-6 uppercase text-gold">
          Crafted in London
        </Text>
        <Text variant="hero" className="mt-1 text-center">
          You’re booked
        </Text>
        <Text variant="body" className="mt-2 text-center text-inkMuted">
          Steffi will be in touch within 24 hours with a quote.
        </Text>

        <Card className="mt-7 w-full gap-3">
          <Box className="flex-row items-center justify-between">
            <Text variant="secondary" className="text-inkMuted">
              Reference
            </Text>
            <Text variant="bodyLg" className="tracking-wide">
              {reference}
            </Text>
          </Box>
          <Box className="h-px bg-border" />
          <Box className="gap-0.5">
            <Text variant="secondary" className="text-inkMuted">
              Appointment
            </Text>
            <Text variant="body" className="font-body-medium">
              {date ? formatLong(date) : ''}
            </Text>
            <Text variant="body" className="text-inkMuted">
              {time ? formatTimeLabel(time) : ''}
            </Text>
          </Box>
        </Card>
      </Box>

      <Box className="gap-2 pb-3">
        <Button
          label="Open in WhatsApp"
          onPress={onWhatsApp}
          leftIcon={
            <MessageCircle size={18} color={colors.ivory} strokeWidth={2} />
          }
        />
        <Button
          label="Add to calendar"
          variant="secondary"
          onPress={onAddToCalendar}
          leftIcon={
            <CalendarPlus size={18} color={colors.ink} strokeWidth={2} />
          }
        />
        <Button label="Done" variant="ghost" onPress={() => router.dismissAll()} />
      </Box>
    </Screen>
  );
}
