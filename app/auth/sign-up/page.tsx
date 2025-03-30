"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { isEmail, matchesField, useForm } from '@mantine/form';
import { Button, Card, TextInput, Text, Stack, Center, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { authSignUpCS } from '../../common/auth/service/client/authSignUpCS';
import { logger } from '../../utils/logger';
import { pageWidth } from '../../utils/theme/ThemeValues';


export default function SignUpPage() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', name: '', username: '', password: '', confirmPassword: '' },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      name: (v) => v.length > 3 ? null : 'Must be at least 7 characters',
      username: (v) => v.length > 3 ? null : 'Must be at least 7 characters',
      password: (v) => v.length > 7 ? null : 'Must be at least 7 characters',
      confirmPassword: (v, values) => (
        v === values.password ? null : 'Passwords are not the same'
      )
    },
  });
  const router = useRouter();

  const signUpMutation = useMutation({
    mutationFn: async () => {
      logger.trace("inside");
      const { email, password, username, name } = form.getValues();
      await authSignUpCS(email, password, username, name);
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: 'Account created succesfully, please verify email to use the app.',
        color: "green"
      });
      router.push('/');
    },
    onError: (error: unknown) => {
      console.error(error);
    },
  })

  return (
    <Center>
      <Card w={pageWidth} >

        <Title order={1}>Sign Up</Title>

        <form onSubmit={form.onSubmit(() => signUpMutation.mutate())}>

          <TextInput
            {...form.getInputProps('email')}
            placeholder="Email"
            label="Email"
            key={form.key('email')}
          />
          <TextInput
            {...form.getInputProps('name')}
            placeholder="Name"
            label="Name"
            key={form.key('name')}
          />
          <TextInput
            {...form.getInputProps('username')}
            placeholder="Username"
            label="Username"
            key={form.key('username')}
          />
          <TextInput
            {...form.getInputProps('password')}
            placeholder="Password"
            label="Password"
            type="password"
            key={form.key('password')}
          />
          <TextInput
            pb={10}
            {...form.getInputProps('confirmPassword')}
            placeholder="Confirm Password"
            label="Confirm Password"
            type="password"
            key={form.key('confirmPassword')}
          />
          <Stack>
            <Link href="/auth/login" className="label-text-alt link link-hover">
              <Text >
                Already have an account? Log in here!
              </Text>
            </Link>
            <Button
              color='green'
              radius="xl"
              w="40%"
              loading={signUpMutation.isLoading}
              type='submit'
            >
              Sign Up
            </Button>
          </Stack>
        </form>
      </Card >
    </Center>
  );
}

