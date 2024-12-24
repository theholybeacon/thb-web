"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { hasLength, isEmail, matchesField, useForm } from '@mantine/form';
import { Button, Card, TextInput, Text, Group, Stack, Center } from '@mantine/core';
import { authLogInCS } from '@/app/_common/auth/service/client/authLogInCS';
import { pageWidth } from '@/app/_utils/theme/ThemeValues';


export default function LoginPage() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: 'andresfra92@gmail.com', password: '12341234' },
    validate: {
      email: (v) => isEmail(v) ? null : 'Invalid Email',
      password: (v) => v.length > 7 ? null : 'Must be at least 7 characters',
    },
  });
  const router = useRouter();
  const loginMutation = useMutation({
    mutationFn: async () => {
      const { email, password } = form.getValues();
      return await authLogInCS(email, password);
    },
    onSuccess: () => {
      router.push('/');
    },
  });

  return (
    <Center>
      <Card w={pageWidth} >

        <h1>Log in</h1>

        <form onSubmit={form.onSubmit(() => loginMutation.mutate())}>

          <TextInput
            {...form.getInputProps('email')}
            placeholder="Email"
            label="Email"
            key={form.key('email')}
          />
          <TextInput
            pb={10}
            {...form.getInputProps('password')}
            placeholder="Password"
            label="Password"
            type="password"
            key={form.key('password')}
          />
          <Stack>
            <Link href="/auth/sign-up" className="label-text-alt link link-hover">
              <Text td="none">
                Don&apos;t have an account? Sign Up here!
              </Text>
            </Link>
            <Button
              radius="xl"
              w="40%"
              color='green'
              loading={loginMutation.isLoading}
              type='submit'
            >
              Log in
            </Button>
          </Stack>
        </form>
      </Card >
    </Center>
  );
}

