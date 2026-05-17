import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, ChevronRight, Sun, Moon } from 'lucide-react';

const sections = [
  { id: 'changelog', title: 'Changelog', content: 'We continuously ship updates to make SmartHire the fastest recruitment tool on the market. Stay tuned for our weekly release notes outlining new features, performance improvements, and bug fixes.' },
  { id: 'roadmap', title: 'Roadmap', content: 'Our vision for Q3 and Q4 includes expanding our AI reasoning engine to support custom skill rubrics, deeper integrations with popular ATS platforms, and a fully functional mobile application for hiring managers on the go.' },
  { id: 'api-docs', title: 'API Docs', content: 'SmartHire provides a robust REST API for enterprise customers to programmatically access job postings, candidate scores, and pipeline analytics. Detailed documentation will be available upon requesting an API key from your account manager.' },
  { id: 'blog', title: 'Blog', content: 'Discover insights, trends, and best practices in modern recruitment. Our engineering and talent teams regularly share articles on how to leverage AI to build high-performing teams without bias.' },
  { id: 'careers', title: 'Careers', content: 'Want to help us build the future of hiring? We are a remote-first team looking for passionate engineers, designers, and growth marketers. Check out our open roles on our own SmartHire portal!' },
  { id: 'press-kit', title: 'Press Kit', content: 'Download our brand assets, high-resolution logos, and product screenshots. For media inquiries, please reach out to press@smarthire.ai.' },
  { id: 'contact', title: 'Contact', content: 'Have a question or need technical support? Our team is available 24/7. Reach out to support@smarthire.ai or use the live chat widget inside your dashboard.' },
  { id: 'privacy-policy', title: 'Privacy Policy', content: 'We take data privacy incredibly seriously. All candidate resumes and personal data are encrypted at rest and in transit. We do not sell your data, nor do we use your private candidate data to train our foundational models.' },
  { id: 'terms-of-service', title: 'Terms of Service', content: 'By using SmartHire, you agree to our standard terms of service. You retain full ownership of the data you upload. SmartHire is provided "as is" and we reserve the right to suspend accounts that violate our fair use policy.' },
  { id: 'cookie-policy', title: 'Cookie Policy', content: 'We use essential cookies to maintain your session and security. We also use minimal analytics cookies to understand how our platform is used so we can improve the user experience. You can opt out of non-essential cookies in your account settings.' },
  { id: 'gdpr', title: 'GDPR Compliance', content: 'SmartHire is fully compliant with the General Data Protection Regulation (GDPR). Candidates have the right to request access, correction, or deletion of their personal data. Employers can easily facilitate these requests through the dashboard.' },
  { id: 'security', title: 'Security', content: 'Our infrastructure is hosted on secure, SOC2-compliant cloud providers. We conduct regular penetration testing and enforce multi-factor authentication (MFA) for all team members. Vulnerability reports are handled swiftly.' }
];

const InfoPage = () => {
  const { hash } = useLocation();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const dark = document.documentElement.classList.contains('dark');
    if (dark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  useEffect(() => {
    let timeoutId;
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        timeoutId = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hash]);

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-accent-primary to-indigo-500 rounded-xl flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-text-primary tracking-tight">SmartHire</span>
              <span className="text-[9px] text-accent-primary font-black uppercase tracking-widest block leading-none">Information</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-text-muted hover:text-accent-primary rounded-lg transition-colors">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to="/" className="text-sm font-semibold text-text-secondary hover:text-text-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="md:w-64 shrink-0">
            <div className="sticky top-32 glass-card p-6 rounded-2xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">Jump to Section</h3>
              <ul className="space-y-3">
                {sections.map(s => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-2 group">
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4" />
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content Sections */}
          <main className="flex-1 space-y-24">
            {sections.map(s => (
              <section key={s.id} id={s.id} className="scroll-mt-32">
                <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-md mb-3">
                  Information
                </div>
                <h1 className="text-3xl font-black text-text-primary mb-6">{s.title}</h1>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg text-text-secondary leading-relaxed">
                    {s.content}
                  </p>
                  <p className="mt-6 text-text-muted leading-relaxed text-sm">
                    This section contains comprehensive details regarding our policies and procedures. We are committed to transparency and ensuring that our users have access to all necessary information. If you require further clarification on any of the points mentioned above, our support team is always available to assist you. Please review this information periodically as it may be updated to reflect changes in our services or legal requirements.
                  </p>
                  <p className="mt-4 text-text-muted leading-relaxed text-sm">
                    Our platform is built on trust and reliability. By continuing to use SmartHire, you acknowledge and agree to the terms outlined in this document. We prioritize your privacy, security, and overall experience above all else. For enterprise customers, specific Service Level Agreements (SLAs) and custom terms may apply, which supersede these standard conditions.
                  </p>
                </div>
              </section>
            ))}
          </main>

        </div>
      </div>
    </div>
  );
};

export default InfoPage;
