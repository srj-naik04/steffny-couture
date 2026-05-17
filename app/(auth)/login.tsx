import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Box, Button, Input, PressableScale, Screen, Text } from '@/components/ui';
import { colors } from '@/constants/brand';

import { signIn, signInSchema, useAuth, type SignInValues } from '@/features/auth';

/**
 * Shop staff sign-in (CLAUDE.md Phase 2). Email + password via React Hook
 * Form + Zod. Customers never need this — their flow is guest-by-default.
 */
export default function Login() {
  const { session, isStaff, isLoading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  // Already signed in — route to the right home. Waits for the profile fetch
  // so a staff user goes straight to the shop group without bouncing.
  if (session && !isLoading) {
    return <Redirect href={isStaff ? '/(shop)' : '/(customer)'} />;
  }

  const onSubmit = async (values: SignInValues) => {
    setServerError(null);
    try {
      await signIn(values);
      // On success the auth state changes and the <Redirect> above takes over.
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Something went wrong. Try again.',
      );
    }
  };

  // Keep the button busy through the post-sign-in profile fetch, right up to
  // the moment the redirect fires.
  const busy = isSubmitting || (!!session && isLoading);

  return (
    <Screen scroll keyboardAvoiding className="pt-16">
      <Box className="gap-2">
        <Text variant="caption" className="uppercase text-gold">
          Steffny Couture
        </Text>
        <Text variant="hero">Welcome back</Text>
        <Text variant="body" className="text-inkMuted">
          Sign in to manage bookings, quotes and customers.
        </Text>
      </Box>

      <Box className="mt-10 gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              label="Email"
              required
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.email?.message}
              placeholder="Enter email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input
              label="Password"
              required
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
              placeholder="Enter password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          )}
        />

        <PressableScale
          haptic="selection"
          accessibilityLabel="Forgot password"
          onPress={() => router.push('/reset')}
          className="self-end py-1">
          <Text variant="secondary" className="font-body-medium text-rose">
            Forgot password?
          </Text>
        </PressableScale>

        {serverError ? (
          <Box className="flex-row items-center gap-2 rounded-xl bg-danger/10 px-3 py-2.5">
            <CircleAlert size={16} color={colors.danger} strokeWidth={2} />
            <Text variant="secondary" className="flex-1 text-danger">
              {serverError}
            </Text>
          </Box>
        ) : null}

        <Button
          label="Sign in"
          onPress={handleSubmit(onSubmit)}
          loading={busy}
          size="lg"
          className="mt-2"
        />
      </Box>
    </Screen>
  );
}
