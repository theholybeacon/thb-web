"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { logger } from '@/app/utils/logger';


export default function SignUpPage() {
  const router = useRouter();

  // const signUpMutation = useMutation({
  //   mutationFn: async () => {
  //     // await authSignUpCS(email, password, username, name);
  //   },
  //   onSuccess: () => {
  //     // notifications.show({
  //     //   title: "Success",
  //     //   message: 'Account created succesfully, please verify email to use the app.',
  //     //   color: "green"
  //     // });
  //     router.push('/');
  //   },
  //   onError: (error: unknown) => {
  //     console.error(error);
  //   },
  // })

  return (
    <div>Signup todo</div>
  );
}

