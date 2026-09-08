import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description:
        'How SearchCourse collects, uses, and protects your information when you browse course deals and use our tools.',
    alternates: {
        canonical: '/privacy',
    },
};

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Privacy Policy"
            updated="September 8, 2026"
            description="This policy explains what information SearchCourse collects when you use our site and how we handle it."
            sections={[
                {
                    heading: 'Information We Collect',
                    body: [
                        'SearchCourse is designed to be privacy-respecting. We do not require an account to browse courses, roadmaps, or deals.',
                        'When you visit the site, we may collect limited technical information such as your IP address (stored in hashed form), browser type, referring page, and pages visited. This data is used to protect the site from abuse and to understand aggregated traffic patterns.',
                        'We use local storage on your device to remember your theme preference and, if you choose to use them, your roadmap progress. This data never leaves your browser.',
                    ],
                },
                {
                    heading: 'Click Tracking & Analytics',
                    body: [
                        'Outbound links to course platforms are routed through our redirector so we can measure clicks and attribute affiliate referrals. When you click such a link, we may record the course, the source (e.g. web or Telegram), a hashed identifier for your IP address, and a country-level signal.',
                        'This information is used to pay for site maintenance through affiliate commissions and to understand which courses are popular. Raw IP addresses are not stored.',
                    ],
                },
                {
                    heading: 'Cookies',
                    body: [
                        'We may use strictly necessary cookies or equivalent storage to provide core functionality (such as remembering your theme). We do not use advertising cookies or cross-site tracking cookies.',
                        'You can control or delete stored site data through your browser settings at any time.',
                    ],
                },
                {
                    heading: 'Third-Party Links',
                    body: [
                        'SearchCourse links to third-party websites such as Udemy, Coursera, and other course platforms. Those sites have their own privacy policies, and we are not responsible for their practices. Please review their policies before providing personal information.',
                    ],
                },
                {
                    heading: 'Affiliate Disclosure',
                    body: [
                        'SearchCourse participates in affiliate programs, including Impact.com partnerships. We may earn a commission when you purchase a course through links on our site, at no additional cost to you.',
                        'Affiliate relationships do not influence which courses we feature. Our listings are determined by algorithmic quality scores and manual vetting.',
                    ],
                },
                {
                    heading: 'Data Retention & Security',
                    body: [
                        'Aggregated analytics and click records are retained only for as long as needed to operate and improve the site. Access to any stored data is restricted to the site operator.',
                        'We apply hashing to sensitive identifiers and use industry-standard transport security (HTTPS) to protect data in transit.',
                    ],
                },
                {
                    heading: 'Children',
                    body: [
                        'SearchCourse is a general-audience service and is not directed to children under the age of 13. We do not knowingly collect personal information from children.',
                    ],
                },
                {
                    heading: 'Contact',
                    body: [
                        'If you have questions about this Privacy Policy, you can reach us through the contact information published on this site.',
                    ],
                },
            ]}
        />
    );
}