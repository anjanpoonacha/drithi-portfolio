import * as React from "react";

interface AdminSettingsLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper for admin settings pages
 */
export default function AdminSettingsLayout({ children }: AdminSettingsLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-8">
        <div className="mb-6 rounded-lg border border-purple-200 bg-white/80 p-4 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-purple-900">Admin Settings</h1>
          <p className="mt-1 text-sm text-purple-700">
            Changes apply to all visitors globally. Preview before applying.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
