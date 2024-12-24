import '@mantine/core/styles.css';

import './styles/themes.css';
import './styles/global.css';
import LayoutContent from './components/layout/LayoutContent';
import ClientProvider from './components/layout/ClientProviders';

export const metadata = {
  title: 'The Holy Beacon | Interactive Bible Study App',
  description: 'Discover The Holy Beacon, your digital playground for immersive Bible study. Engage with interactive lessons, multimedia content, personalized learning, and a supportive faith community to deepen your spiritual journey.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning >
      <body>
        <ClientProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </ClientProvider>
      </body>
    </html >
  );
}
