import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description:
        'The terms governing your use of SearchCourse, our course deal listings, affiliate links, and content.',
    alternates: {
        canonical: '/terms',
    },
};

export default function TermsPage() {
    return (
        <LegalPage
            title="Terms of Service"
            updated="September 8, 2026"
            description="These terms govern your use of the SearchCourse website, including course listings, roadmaps, and outbound links."
            sections={[
                {
                    heading: 'Acceptance of Terms',
                    body: [
                        'By accessing or using SearchCourse, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the site.',
                    ],
                },
                {
                    heading: 'Nature of the Service',
                    body: [
                        'SearchCourse is a discovery platform that aggregates and curates information about online courses, including pricing and discount data.',
                        'Course listings, prices, coupons, and availability are provided by third-party platforms and are subject to change without notice. While we verify deals automatically and manually, we do not guarantee that any deal, price, or discount is accurate, current, or will remain valid.',
                    ],
                },
                {
                    heading: 'Affiliate Links & Purchases',
                    body: [
                        'Some links on SearchCourse are affiliate links through which we may earn a commission at no additional cost to you.',
                        'All purchases of courses are made directly with the third-party provider (such as Udemy or Coursera). The applicable provider\u2019s own terms govern those purchases. We are not a party to any transaction between you and the course provider and accept no liability for those transactions.',
                    ],
                },
                {
                    heading: 'Intellectual Property',
                    body: [
                        'The SearchCourse name, branding, and original site content are owned by SearchCourse. Course titles, descriptions, and syllabi displayed on the site belong to their respective instructors and platforms.',
                        'You may use the site for personal, non-commercial purposes. Reproduction of substantial portions of the site without permission is prohibited.',
                    ],
                },
                {
                    heading: 'Prohibited Conduct',
                    body: [
                        'You agree not to abuse the site, including by attempting to gain unauthorized access, scraping at volumes that degrade service, submitting automated click traffic, or otherwise interfering with the normal operation of SearchCourse.',
                    ],
                },
                {
                    heading: 'Disclaimers',
                    body: [
                        'SearchCourse is provided on an "as is" and "as available" basis without warranties of any kind, express or implied, including accuracy, completeness, or fitness for a particular purpose.',
                        'To the maximum extent permitted by law, SearchCourse shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site or reliance on any course information shown on it.',
                    ],
                },
                {
                    heading: 'Changes to These Terms',
                    body: [
                        'We may update these Terms of Service from time to time. The "Last updated" date at the top of this page reflects the most recent revision. Continued use of the site after changes means you accept the revised terms.',
                    ],
                },
                {
                    heading: 'Contact',
                    body: [
                        'For questions about these terms, please reach out through the contact information published on this site.',
                    ],
                },
            ]}
        />
    );
}