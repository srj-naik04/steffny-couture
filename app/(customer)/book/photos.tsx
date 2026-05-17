import { router, useLocalSearchParams } from 'expo-router';

import { PhotoUploader } from '@/components/booking/photo-uploader';
import { WizardStep } from '@/components/booking/wizard-step';
import { Box, Button, Text } from '@/components/ui';

import { useBookingDraft } from '@/features/bookings';

/**
 * Step 2 — garment photos. Photos upload in the background as they are
 * picked; "Next" unlocks once at least one has finished uploading
 * (booking-wizard skill).
 */
export default function PhotosStep() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === '1';

  const photos = useBookingDraft((s) => s.draft.photos);
  const hasUploaded = photos.some((photo) => photo.status === 'uploaded');

  const onNext = () => {
    if (isEditing) router.navigate('/book/review');
    else router.push('/book/details');
  };

  return (
    <WizardStep
      step={2}
      footer={
        <Button
          label={isEditing ? 'Save changes' : 'Next'}
          onPress={onNext}
          disabled={!hasUploaded}
          size="lg"
        />
      }>
      <Box className="gap-1.5">
        <Text variant="hero">Add photos of the garment</Text>
        <Text variant="body" className="text-inkMuted">
          Front, back, and a close-up of the area to alter. Up to five photos.
        </Text>
      </Box>
      <Box className="mt-6">
        <PhotoUploader />
      </Box>
    </WizardStep>
  );
}
