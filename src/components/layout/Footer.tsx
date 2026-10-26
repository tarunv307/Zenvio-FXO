import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    Tools: [
      { label: 'All Tools', to: '/tools' },
      { label: 'Image Tools', to: '/category/imagekit' },
      { label: 'PDF Tools', to: '/category/pdfkit' },
      { label: 'Developer Tools', to: '/category/devkit' },
      { label: 'Student Tools', to: '/category/studentkit' },
    ],
    Categories: [
      { label: 'CareerKit', to: '/category/careerkit' },
      { label: 'MediaKit', to: '/category/mediakit' },
      { label: 'DocKit', to: '/category/dockit' },
      { label: 'PrivacyKit', to: '/category/privacykit' },
      { label: 'QRKit', to: '/category/qrkit' },
    ],
    Company: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Use', to: '/terms' },
    ],
  };

  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Top section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="15" fill="#10b981"/>
                <path d="M9 10h14l-10 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-base font-black text-gray-900">
                Zenvio <span className="text-brand-500">FXO</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              A free collection of browser-based tools for images, PDFs, documents, development, and productivity.
              Your files never leave your device.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">{section}</h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Privacy statement */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {currentYear} Zenvio FXO. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
            <svg className="size-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Files processed in your browser — never uploaded
          </div>
        </div>
      </div>
    </footer>
  );
}
