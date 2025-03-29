"use client";
import { LoggedUserProvider } from "../../state/LoggedUserContext";
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { ThemeProvider } from "./ThemeProvider";

export default function ClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const queryClient = new QueryClient();


    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <LoggedUserProvider>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </LoggedUserProvider>
        </ThemeProvider>
    );
}
