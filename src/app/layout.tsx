import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Location Tracker - Generate Trackable Links',
  description: 'Create trackable links and monitor visitor locations with interactive maps and detailed analytics.',
  keywords: 'location tracking, link analytics, geolocation, visitor tracking, maps',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white`}>
        <div className="min-h-screen relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          {/* Navigation */}
          <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      LocationTracker
                    </h1>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <a
                    href="/"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    Create Link
                  </a>
                  <a
                    href="/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    Dashboard
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="relative z-10">
            {children}
          </main>

          {/* Footer */}
          <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-sm text-gray-400">
                <p>&copy; 2024 LocationTracker. Built with Next.js and modern web technologies.</p>
                <p className="mt-2 text-xs">
                  Privacy Notice: Location data is collected with user consent and used only for tracking purposes.
                </p>
              </div>
            </div>
          </footer>
        </div>
        
        {/* Toast Notifications */}
        <Toaster 
          position="top-right" 
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
            }
          }}
        />
      </body>
    </html>
  );
}