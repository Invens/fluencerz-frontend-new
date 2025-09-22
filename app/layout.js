import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import AuthWrapper from "@/components/AuthWrapper";
import { ThemeProvider } from "next-themes";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap", // ensures smooth loading
});

export const metadata = {
  title: "FluencerZ",
  description: "The Modern Solution for the brand & Influencer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthWrapper>{children}</AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
