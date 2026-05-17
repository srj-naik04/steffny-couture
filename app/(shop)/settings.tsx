import { Check, Plus } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';

import { MonthCalendar } from '@/components/booking/month-calendar';
import { TimeChips } from '@/components/shop/time-chips';
import {
  Box,
  Button,
  Card,
  Chip,
  Input,
  PressableScale,
  Screen,
  Sheet,
  Text,
  Toggle,
} from '@/components/ui';
import { DAY_LABELS, type DayKey, shop } from '@/constants/shop';
import { colors } from '@/constants/brand';
import { formatPriceRange } from '@/lib/format';
import { formatShort, formatTimeLabel } from '@/lib/date';
import { type Json } from '@/types/database';

import { signOut } from '@/features/auth';
import {
  type AlterationTypeRow,
  maxBookableDateId,
  type ShopHours,
  todayId,
  useShopHours,
} from '@/features/bookings';
import {
  useAllAlterationTypes,
  useSetAlterationTypeActive,
  useUpdateShopSettings,
  useUpsertAlterationType,
} from '@/features/settings';

const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const SLOT_OPTIONS = [15, 30, 45, 60];

/** Slugify an alteration-type label into a stable text id. */
function slugify(label: string): string {
  return (
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'type'
  );
}

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="mt-4 gap-3">
      <Text variant="caption" className="uppercase text-inkSubtle">
        {title}
      </Text>
      {children}
    </Card>
  );
}

/**
 * Shop settings (CLAUDE.md §5.5) — opening hours, blocked dates, slot
 * duration, the alteration-type catalogue, and sign out.
 */
export default function ShopSettings() {
  const { hours, slotMinutes, blockedDates } = useShopHours();
  const updateSettings = useUpdateShopSettings();
  const allTypes = useAllAlterationTypes();
  const upsertType = useUpsertAlterationType();
  const setTypeActive = useSetAlterationTypeActive();

  const [editingDay, setEditingDay] = useState<DayKey | null>(null);
  const [dayOpen, setDayOpen] = useState('09:30');
  const [dayClose, setDayClose] = useState('19:00');
  const [addDateOpen, setAddDateOpen] = useState(false);

  // Alteration-type editor state.
  const [editingType, setEditingType] = useState<AlterationTypeRow | 'new' | null>(
    null,
  );
  const [typeLabel, setTypeLabel] = useState('');
  const [typeMin, setTypeMin] = useState('');
  const [typeMax, setTypeMax] = useState('');
  const [typeDays, setTypeDays] = useState('');

  const saveHours = (next: ShopHours) =>
    updateSettings.mutate({ hours: next as unknown as Json });

  const openDayEditor = (day: DayKey) => {
    const [open, close] = hours[day];
    setDayOpen(open);
    setDayClose(close);
    setEditingDay(day);
  };

  const saveDay = () => {
    if (!editingDay) return;
    saveHours({ ...hours, [editingDay]: [dayOpen, dayClose] });
    setEditingDay(null);
  };

  const addBlockedDate = (dateId: string) => {
    if (!blockedDates.includes(dateId)) {
      updateSettings.mutate({ blocked_dates: [...blockedDates, dateId].sort() });
    }
    setAddDateOpen(false);
  };

  const removeBlockedDate = (dateId: string) => {
    updateSettings.mutate({
      blocked_dates: blockedDates.filter((d) => d !== dateId),
    });
  };

  const openTypeEditor = (type: AlterationTypeRow | 'new') => {
    if (type === 'new') {
      setTypeLabel('');
      setTypeMin('');
      setTypeMax('');
      setTypeDays('7');
    } else {
      setTypeLabel(type.label);
      setTypeMin(type.estimated_min_price?.toString() ?? '');
      setTypeMax(type.estimated_max_price?.toString() ?? '');
      setTypeDays(type.estimated_days.toString());
    }
    setEditingType(type);
  };

  const saveType = () => {
    if (!editingType || typeLabel.trim().length === 0) return;
    const isNew = editingType === 'new';
    const existing = isNew ? null : editingType;
    const nextOrder =
      (allTypes.data ?? []).reduce((max, t) => Math.max(max, t.sort_order), 0) +
      1;
    upsertType.mutate(
      {
        id: existing?.id ?? slugify(typeLabel),
        label: typeLabel.trim(),
        estimated_min_price: typeMin.trim() ? Number(typeMin) : null,
        estimated_max_price: typeMax.trim() ? Number(typeMax) : null,
        estimated_days: typeDays.trim() ? Number(typeDays) : 7,
        icon: existing?.icon ?? 'CircleHelp',
        sort_order: existing?.sort_order ?? nextOrder,
        active: existing?.active ?? true,
      },
      { onSuccess: () => setEditingType(null) },
    );
  };

  const onSignOut = () => {
    void signOut();
    // The (shop) route guard redirects to sign-in once the session clears.
  };

  return (
    <Screen scroll className="pb-10">
      <Box className="pb-2 pt-2">
        <Text variant="section">Settings</Text>
      </Box>

      <SettingsCard title="Studio">
        <Box className="gap-0.5">
          <Text variant="bodyLg">{shop.name}</Text>
          <Text variant="secondary" className="text-inkMuted">
            {shop.address}
          </Text>
          <Text variant="secondary" className="text-inkMuted">
            {shop.phoneDisplay}
          </Text>
        </Box>
      </SettingsCard>

      <SettingsCard title="Opening hours">
        {DAY_ORDER.map((day) => {
          const [open, close] = hours[day];
          return (
            <PressableScale
              key={day}
              haptic="selection"
              onPress={() => openDayEditor(day)}
              accessibilityLabel={`Edit ${DAY_LABELS[day]} hours`}
              className="flex-row items-center justify-between rounded-xl bg-surfaceAlt px-3 py-2.5">
              <Text variant="body" className="font-body-medium">
                {DAY_LABELS[day]}
              </Text>
              <Text variant="body" className="text-inkMuted">
                {formatTimeLabel(open)} – {formatTimeLabel(close)}
              </Text>
            </PressableScale>
          );
        })}
      </SettingsCard>

      <SettingsCard title="Blocked dates">
        <Text variant="secondary" className="text-inkMuted">
          Days the studio is closed for bookings.
        </Text>
        {blockedDates.length > 0 ? (
          <Box className="flex-row flex-wrap gap-2">
            {blockedDates.map((dateId) => (
              <Chip
                key={dateId}
                label={formatShort(dateId)}
                selected
                onPress={() => removeBlockedDate(dateId)}
                accessibilityLabel={`Remove ${formatShort(dateId)}`}
              />
            ))}
          </Box>
        ) : (
          <Text variant="secondary" className="text-inkSubtle">
            No blocked dates.
          </Text>
        )}
        <Button
          label="Add a blocked date"
          variant="secondary"
          size="sm"
          onPress={() => setAddDateOpen(true)}
        />
      </SettingsCard>

      <SettingsCard title="Appointment slot length">
        <Box className="flex-row flex-wrap gap-2">
          {SLOT_OPTIONS.map((minutes) => (
            <Chip
              key={minutes}
              label={`${minutes} min`}
              selected={minutes === slotMinutes}
              onPress={() =>
                updateSettings.mutate({ slot_duration_minutes: minutes })
              }
            />
          ))}
        </Box>
      </SettingsCard>

      <SettingsCard title="Alteration services">
        {(allTypes.data ?? []).map((type) => (
          <Box
            key={type.id}
            className="flex-row items-center gap-3 rounded-xl bg-surfaceAlt px-3 py-2.5">
            <PressableScale
              haptic="selection"
              onPress={() => openTypeEditor(type)}
              accessibilityLabel={`Edit ${type.label}`}
              className="flex-1">
              <Text variant="body" className="font-body-medium">
                {type.label}
              </Text>
              <Text variant="caption" className="text-inkMuted">
                {type.estimated_min_price !== null &&
                type.estimated_max_price !== null
                  ? formatPriceRange(
                      type.estimated_min_price,
                      type.estimated_max_price,
                    )
                  : 'No price set'}{' '}
                · {type.estimated_days} days
              </Text>
            </PressableScale>
            <Toggle
              value={type.active}
              onValueChange={(active) =>
                setTypeActive.mutate({ id: type.id, active })
              }
              accessibilityLabel={`${type.label} visible to customers`}
            />
          </Box>
        ))}
        <Button
          label="Add a service"
          variant="secondary"
          size="sm"
          leftIcon={<Plus size={16} color={colors.ink} strokeWidth={2} />}
          onPress={() => openTypeEditor('new')}
        />
      </SettingsCard>

      <Box className="mt-6">
        <Button label="Sign out" variant="destructive" onPress={onSignOut} />
      </Box>

      {/* Hours editor */}
      <Sheet
        visible={editingDay !== null}
        onClose={() => setEditingDay(null)}
        title={editingDay ? `${DAY_LABELS[editingDay]} hours` : ''}>
        <Box className="gap-4 pb-1">
          <Box className="gap-2">
            <Text variant="caption" className="uppercase text-inkMuted">
              Opens
            </Text>
            <TimeChips value={dayOpen} onChange={setDayOpen} />
          </Box>
          <Box className="gap-2">
            <Text variant="caption" className="uppercase text-inkMuted">
              Closes
            </Text>
            <TimeChips value={dayClose} onChange={setDayClose} />
          </Box>
          <Button label="Save hours" onPress={saveDay} />
        </Box>
      </Sheet>

      {/* Blocked-date picker */}
      <Sheet
        visible={addDateOpen}
        onClose={() => setAddDateOpen(false)}
        title="Block a date">
        <Box className="pb-1">
          <MonthCalendar
            selected={null}
            minDateId={todayId()}
            maxDateId={maxBookableDateId()}
            blockedDateIds={blockedDates}
            onSelect={addBlockedDate}
          />
        </Box>
      </Sheet>

      {/* Alteration-type editor */}
      <Sheet
        visible={editingType !== null}
        onClose={() => setEditingType(null)}
        title={editingType === 'new' ? 'New service' : 'Edit service'}>
        <Box className="gap-3 pb-1">
          <Input
            label="Name"
            placeholder="e.g. Hem"
            value={typeLabel}
            onChangeText={setTypeLabel}
          />
          <Box className="flex-row gap-3">
            <Input
              label="Min price (£)"
              className="flex-1"
              keyboardType="decimal-pad"
              value={typeMin}
              onChangeText={setTypeMin}
            />
            <Input
              label="Max price (£)"
              className="flex-1"
              keyboardType="decimal-pad"
              value={typeMax}
              onChangeText={setTypeMax}
            />
          </Box>
          <Input
            label="Typical days"
            keyboardType="number-pad"
            value={typeDays}
            onChangeText={setTypeDays}
          />
          <Button
            label="Save service"
            leftIcon={<Check size={18} color={colors.ivory} strokeWidth={2.5} />}
            loading={upsertType.isPending}
            disabled={typeLabel.trim().length === 0}
            onPress={saveType}
          />
        </Box>
      </Sheet>
    </Screen>
  );
}
