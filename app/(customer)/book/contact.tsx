import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';

import { WizardStep } from '@/components/booking/wizard-step';
import { Box, Button, Input, Text, Toggle } from '@/components/ui';

import { useAuth } from '@/features/auth';
import {
  contactSchema,
  useBookingDraft,
  type ContactValues,
} from '@/features/bookings';

/**
 * Step 5 — contact details. Pre-filled from the signed-in profile when there
 * is one; guests may opt to save their details for a faster booking next time
 * (booking-wizard skill).
 */
export default function ContactStep() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === '1';

  const { session, profile } = useAuth();
  const draft = useBookingDraft((s) => s.draft);
  const patch = useBookingDraft((s) => s.patch);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: draft.name || profile?.full_name || '',
      phone: draft.phone || profile?.phone || '',
      email: draft.email || session?.user.email || '',
      saveDetails: draft.saveDetails,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = (values: ContactValues) => {
    patch({
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim().toLowerCase(),
      saveDetails: values.saveDetails,
    });
    if (isEditing) router.navigate('/book/review');
    else router.push('/book/review');
  };

  return (
    <WizardStep
      step={5}
      footer={
        <Button
          label={isEditing ? 'Save changes' : 'Review booking'}
          size="lg"
          onPress={handleSubmit(onSubmit)}
        />
      }>
      <Box className="gap-1.5">
        <Text variant="hero">Your details</Text>
        <Text variant="body" className="text-inkMuted">
          So Steffi can confirm your appointment and send your quote.
        </Text>
      </Box>

      <Box className="mt-6 gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Full name"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.name?.message}
              placeholder="Emily Carter"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input
              label="Phone"
              value={field.value}
              // Keep only digits and a leading "+"; the schema validates a UK mobile.
              onChangeText={(text) => field.onChange(text.replace(/[^\d+]/g, ''))}
              onBlur={field.onBlur}
              error={errors.phone?.message}
              placeholder="07834 877992"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              label="Email"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.email?.message}
              placeholder="emily@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
          )}
        />

        {!session ? (
          <Controller
            control={control}
            name="saveDetails"
            render={({ field }) => (
              <Box className="mt-1 flex-row items-center justify-between rounded-xl bg-surfaceAlt px-4 py-3.5">
                <Box className="flex-1 pr-4">
                  <Text variant="body" className="font-body-medium">
                    Save my details for next time
                  </Text>
                  <Text variant="secondary" className="text-inkMuted">
                    We’ll email you a link to set up a quick account.
                  </Text>
                </Box>
                <Toggle
                  value={field.value}
                  onValueChange={field.onChange}
                  accessibilityLabel="Save my details for next time"
                />
              </Box>
            )}
          />
        ) : null}
      </Box>
    </WizardStep>
  );
}
