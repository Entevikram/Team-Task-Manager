import "./globals.css";

export const metadata = {
  title: "Team Task Manager",
  description: "Full-stack assignment app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
