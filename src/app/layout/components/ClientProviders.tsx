"use client";
import { useState } from "react";
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

    // Must survive re-renders — constructing it in the body would hand every
    // render a fresh client and throw away the cache.
    const [queryClient] = useState(() => new QueryClient());


    return (
        <LoggedUserProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </LoggedUserProvider>
    );
}
