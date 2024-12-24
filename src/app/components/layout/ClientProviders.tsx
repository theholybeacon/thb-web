"use client";
import { theme } from "@/app/_utils/theme/Theme";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
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
        <>
            <ColorSchemeScript defaultColorScheme="dark" />
            <MantineProvider theme={theme} defaultColorScheme="dark">
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </MantineProvider>

        </>
    );
}
