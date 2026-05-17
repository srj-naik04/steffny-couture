import { Box, Button, type BookingStatus, Text } from '@/components/ui';

type Action = {
  label: string;
  status: BookingStatus;
  variant: 'primary' | 'destructive';
};

/** The status transitions offered from each status (CLAUDE.md §5.3). */
const NEXT: Record<BookingStatus, Action[]> = {
  new: [
    { label: 'Confirm booking', status: 'confirmed', variant: 'primary' },
    { label: 'Cancel booking', status: 'cancelled', variant: 'destructive' },
  ],
  confirmed: [
    { label: 'Start work', status: 'in_progress', variant: 'primary' },
    { label: 'Cancel booking', status: 'cancelled', variant: 'destructive' },
  ],
  in_progress: [
    { label: 'Mark ready', status: 'ready', variant: 'primary' },
    { label: 'Cancel booking', status: 'cancelled', variant: 'destructive' },
  ],
  ready: [
    { label: 'Mark collected', status: 'collected', variant: 'primary' },
  ],
  collected: [],
  cancelled: [],
};

type Props = {
  status: BookingStatus;
  pending: boolean;
  onChange: (status: BookingStatus) => void;
};

/**
 * The shop's status-update controls — only the transitions valid from the
 * current status. The caller confirms a cancel before applying it.
 */
export function StatusActions({ status, pending, onChange }: Props) {
  const actions = NEXT[status];

  if (actions.length === 0) {
    return (
      <Text variant="secondary" className="text-inkMuted">
        {status === 'collected'
          ? 'This booking is complete — collected by the customer.'
          : 'This booking was cancelled. No further action.'}
      </Text>
    );
  }

  return (
    <Box className="gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          label={action.label}
          variant={action.variant}
          loading={pending}
          onPress={() => onChange(action.status)}
        />
      ))}
    </Box>
  );
}
