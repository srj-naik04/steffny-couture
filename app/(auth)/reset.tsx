import { zodResolver } from '@hookform/resolvers/zod';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { CircleAlert, CircleCheck, MailCheck } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Box, Button, Input, PressableScale, Screen, Text } from '@/components/ui';
import { colors } from '@/constants/brand';

import {
  completePasswordRecovery,
  newPasswordSchema,
  resetRequestSchema,
  sendPasswordReset,
  updatePassword,
  useAuth,
  type NewPasswordValues,
  type ResetRequestValues,
} from '@/features/auth';

/**
 * Password reset (CLAUDE.md Phase 2). One screen, two jobs:
 *
 *  • `request` — entered from the sign-in screen: send a recovery email.
 *  • `update`  — entered via the recovery deep link: choose a new password.
 *
 * Which job runs is decided by whether the URL that opened the app carries a
 * recovery payload. The recovery email itself is sent by Supabase's built-in
 * auth mailer — independent of the custom send-email Edge Function.
 */
type Phase = 'request' | 'sent' | 'update' | 'done';

/** Inline, non-blocking error banner — matches the field-error styling. */
function ErrorBanner({ message }: { message: string }) {
  return (
    <Box className="flex-row items-center gap-2 rounded-xl bg-danger/10 px-3 py-2.5">
      <CircleAlert size={16} color={colors.danger} strokeWidth={2} />
      <Text variant="secondary" className="flex-1 text-danger">
        {message}
      </Text>
    </Box>
  );
}

export default function ResetPassword() {
  const { isStaff } = useAuth();
  const [phase, setPhase] = useState<Phase>('request');
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState('');
  const [checkingLink, setCheckingLink] = useState(false);

  const url = Linking.useURL();
  const looksLikeRecovery =
    !!url && /type=recovery|access_token=|[?#&]code=|error_code=/.test(url);
  const linkHandled = useRef(false);

  const requestForm = useForm<ResetRequestValues>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const updateForm = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  // Process the recovery deep link once, the first time a URL is available.
  useEffect(() => {
    if (!url || linkHandled.current) return;
    linkHandled.current = true;

    let cancelled = false;
    setCheckingLink(true);
    completePasswordRecovery(url)
      .then((result) => {
        if (!cancelled && result === 'recovery') setPhase('update');
      })
      .catch((error) => {
        if (cancelled) return;
        setServerError(
          error instanceof Error
            ? error.message
            : 'That reset link could not be used.',
        );
      })
      .finally(() => {
        if (!cancelled) setCheckingLink(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const onRequest = async (values: ResetRequestValues) => {
    setServerError(null);
    try {
      await sendPasswordReset(values.email);
      setSentTo(values.email);
      setPhase('sent');
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Something went wrong. Try again.',
      );
    }
  };

  const onUpdate = async (values: NewPasswordValues) => {
    setServerError(null);
    try {
      await updatePassword(values.password);
      setPhase('done');
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Something went wrong. Try again.',
      );
    }
  };

  // --- Processing an incoming recovery link ---------------------------------
  if (checkingLink && looksLikeRecovery) {
    return (
      <Screen className="items-center justify-center">
        <Text variant="body" className="text-inkMuted">
          Opening your reset link…
        </Text>
      </Screen>
    );
  }

  // --- New password set — signed in -----------------------------------------
  if (phase === 'done') {
    return (
      <Screen className="items-center justify-center">
        <Box className="items-center gap-3">
          <CircleCheck size={48} color={colors.success} strokeWidth={1.5} />
          <Text variant="section" className="text-center">
            Password updated
          </Text>
          <Text variant="body" className="text-center text-inkMuted">
            You’re signed in with your new password.
          </Text>
        </Box>
        <Box className="mt-8 w-full max-w-sm">
          <Button
            label="Continue"
            size="lg"
            onPress={() => router.replace(isStaff ? '/(shop)' : '/(customer)')}
          />
        </Box>
      </Screen>
    );
  }

  // --- Choose a new password (recovery session active) ----------------------
  if (phase === 'update') {
    return (
      <Screen scroll keyboardAvoiding className="pt-16">
        <Box className="gap-2">
          <Text variant="caption" className="uppercase text-gold">
            Steffny Couture
          </Text>
          <Text variant="hero">Choose a new password</Text>
          <Text variant="body" className="text-inkMuted">
            Set a password you’ll use to sign in from now on.
          </Text>
        </Box>

        <Box className="mt-10 gap-4">
          <Controller
            control={updateForm.control}
            name="password"
            render={({ field }) => (
              <Input
                label="New password"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={updateForm.formState.errors.password?.message}
                helperText="At least 8 characters."
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={updateForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <Input
                label="Confirm password"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={updateForm.formState.errors.confirmPassword?.message}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={updateForm.handleSubmit(onUpdate)}
              />
            )}
          />

          {serverError ? <ErrorBanner message={serverError} /> : null}

          <Button
            label="Update password"
            size="lg"
            className="mt-2"
            loading={updateForm.formState.isSubmitting}
            onPress={updateForm.handleSubmit(onUpdate)}
          />
        </Box>
      </Screen>
    );
  }

  // --- Recovery email sent --------------------------------------------------
  if (phase === 'sent') {
    return (
      <Screen scroll keyboardAvoiding className="pt-16">
        <Box className="items-center gap-3">
          <MailCheck size={48} color={colors.rose} strokeWidth={1.5} />
          <Text variant="section" className="text-center">
            Check your email
          </Text>
          <Text variant="body" className="text-center text-inkMuted">
            We’ve sent a reset link to {sentTo}. Open it on this device to
            choose a new password.
          </Text>
        </Box>

        <Box className="mt-10 gap-3">
          <Button label="Back to sign in" size="lg" onPress={() => router.replace('/login')} />
          <Button
            label="Use a different email"
            variant="ghost"
            onPress={() => {
              setServerError(null);
              setPhase('request');
            }}
          />
        </Box>
      </Screen>
    );
  }

  // --- Request a reset link (default) ---------------------------------------
  return (
    <Screen scroll keyboardAvoiding className="pt-16">
      <Box className="gap-2">
        <Text variant="caption" className="uppercase text-gold">
          Steffny Couture
        </Text>
        <Text variant="hero">Reset your password</Text>
        <Text variant="body" className="text-inkMuted">
          Enter your email and we’ll send a link to set a new password.
        </Text>
      </Box>

      <Box className="mt-10 gap-4">
        <Controller
          control={requestForm.control}
          name="email"
          render={({ field }) => (
            <Input
              label="Email"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={requestForm.formState.errors.email?.message}
              placeholder="you@steffnycouture.co.uk"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="go"
              onSubmitEditing={requestForm.handleSubmit(onRequest)}
            />
          )}
        />

        {serverError ? <ErrorBanner message={serverError} /> : null}

        <Button
          label="Send reset link"
          size="lg"
          className="mt-2"
          loading={requestForm.formState.isSubmitting}
          onPress={requestForm.handleSubmit(onRequest)}
        />

        <PressableScale
          haptic="selection"
          accessibilityLabel="Back to sign in"
          onPress={() => router.replace('/login')}
          className="items-center py-1">
          <Text variant="secondary" className="font-body-medium text-rose">
            Back to sign in
          </Text>
        </PressableScale>
      </Box>
    </Screen>
  );
}
