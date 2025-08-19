"use client";
import { LoggedUserProvider } from "@/app/state/LoggedUserContext";
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

export default function ClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const queryClient = new QueryClient();


    return (
        <LoggedUserProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </LoggedUserProvider>
    );
}
