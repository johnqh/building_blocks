import React, { type ReactNode, type ComponentType } from 'react';

/**
 * Configuration for a content section with a list
 */
export interface PrivacySectionWithList {
  /** Section title */
  title: string;
  /** Optional description before the list */
  description?: string;
  /** List items */
  items: string[];
}

/**
 * Configuration for a content section with paragraph text
 */
export interface PrivacySectionWithContent {
  /** Section title */
  title: string;
  /** Paragraph content */
  content: string;
}

/**
 * Configuration for a subsection (h3 level)
 */
export interface PrivacySubsection {
  /** Subsection title */
  title: string;
  /** List items */
  items: string[];
}

/**
 * Contact information configuration
 */
export interface PrivacyContactInfo {
  /** Email label (e.g., "Email:") */
  emailLabel: string;
  /** Email address */
  email: string;
  /** Website label (e.g., "Website:") */
  websiteLabel: string;
  /** Website URL */
  websiteUrl: string;
  /** Data Protection Officer label */
  dpoLabel: string;
  /** DPO email */
  dpoEmail: string;
  /** GDPR section title */
  gdprTitle: string;
  /** GDPR section content */
  gdprContent: string;
}

/**
 * All text content for the privacy policy page
 */
export interface PrivacyPolicyPageText {
  /** Page heading */
  heading: string;
  /** Last updated label */
  lastUpdatedLabel: string;
  /** Introduction section */
  introduction: PrivacySectionWithContent;
  /** Information We Collect section */
  informationWeCollect: {
    title: string;
    youProvide: PrivacySubsection;
    automatic: PrivacySubsection;
  };
  /** How We Use Your Information section */
  howWeUse: PrivacySectionWithList;
  /** Information Sharing section */
  informationSharing: PrivacySectionWithList;
  /** Data Security section */
  dataSecurity: PrivacySectionWithList;
  /** Data Retention section */
  dataRetention: PrivacySectionWithContent;
  /** Your Privacy Rights section */
  privacyRights: PrivacySectionWithList;
  /** Web3 Considerations section (optional) */
  web3Considerations?: PrivacySectionWithList;
  /** International Transfers section */
  internationalTransfers: PrivacySectionWithContent;
  /** Children's Privacy section */
  childrensPrivacy: PrivacySectionWithContent;
  /** Cookies section */
  cookies: PrivacySectionWithContent;
  /** Changes to Policy section */
  changes: PrivacySectionWithContent;
  /** Contact section */
  contact: {
    title: string;
    description: string;
    info: PrivacyContactInfo;
  };
}

/**
 * Props for AppPrivacyPolicyPage component
 */
export interface AppPrivacyPolicyPageProps {
  /** All text content (must be provided by consumer) */
  text: PrivacyPolicyPageText;
  /** Current date for "last updated" display */
  lastUpdatedDate?: string;
  /** Optional wrapper component for the page layout */
  PageWrapper?: ComponentType<{ children: ReactNode }>;
  /** Optional className for the container */
  className?: string;
}

/**
 * Heading component for h2 sections
 */
const SectionHeading: React.FC<{ children: ReactNode }> = ({ children }) => (
  <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4'>
    {children}
  </h2>
);

/**
 * Heading component for h3 subsections
 */
const SubsectionHeading: React.FC<{ children: ReactNode }> = ({ children }) => (
  <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3'>
    {children}
  </h3>
);

/**
 * Paragraph component
 */
const Paragraph: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <p className={`text-gray-600 dark:text-gray-300 mb-6 ${className}`}>
    {children}
  </p>
);

/**
 * List component
 */
const List: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className='list-disc list-inside text-gray-600 dark:text-gray-300 mb-6'>
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

/**
 * AppPrivacyPolicyPage - A reusable privacy policy page component
 *
 * Displays a comprehensive privacy policy with:
 * - Standard legal sections
 * - Optional Web3-specific considerations
 * - Contact information with GDPR notice
 *
 * All text content must be provided by the consumer app.
 *
 * @example
 * ```tsx
 * <AppPrivacyPolicyPage
 *   text={{
 *     heading: "Privacy Policy",
 *     lastUpdatedLabel: "Last updated",
 *     introduction: {
 *       title: "Introduction",
 *       content: "We respect your privacy..."
 *     },
 *     // ... other sections
 *   }}
 *   lastUpdatedDate="January 1, 2025"
 * />
 * ```
 */
export const AppPrivacyPolicyPage: React.FC<AppPrivacyPolicyPageProps> = ({
  text,
  lastUpdatedDate = new Date().toLocaleDateString(),
  PageWrapper,
  className,
}) => {
  const content = (
    <div className={`max-w-7xl mx-auto px-4 py-12 ${className || ''}`}>
      <h1 className='text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8'>
        {text.heading}
      </h1>

      <div className='prose prose-lg max-w-none'>
        <Paragraph className='mb-6'>
          {text.lastUpdatedLabel} {lastUpdatedDate}
        </Paragraph>

        {/* Introduction */}
        <SectionHeading>{text.introduction.title}</SectionHeading>
        <Paragraph>{text.introduction.content}</Paragraph>

        {/* Information We Collect */}
        <SectionHeading>{text.informationWeCollect.title}</SectionHeading>
        <SubsectionHeading>
          {text.informationWeCollect.youProvide.title}
        </SubsectionHeading>
        <List items={text.informationWeCollect.youProvide.items} />
        <SubsectionHeading>
          {text.informationWeCollect.automatic.title}
        </SubsectionHeading>
        <List items={text.informationWeCollect.automatic.items} />

        {/* How We Use */}
        <SectionHeading>{text.howWeUse.title}</SectionHeading>
        {text.howWeUse.description && (
          <Paragraph className='mb-4'>{text.howWeUse.description}</Paragraph>
        )}
        <List items={text.howWeUse.items} />

        {/* Information Sharing */}
        <SectionHeading>{text.informationSharing.title}</SectionHeading>
        {text.informationSharing.description && (
          <Paragraph className='mb-4'>
            {text.informationSharing.description}
          </Paragraph>
        )}
        <List items={text.informationSharing.items} />

        {/* Data Security */}
        <SectionHeading>{text.dataSecurity.title}</SectionHeading>
        {text.dataSecurity.description && (
          <Paragraph className='mb-4'>
            {text.dataSecurity.description}
          </Paragraph>
        )}
        <List items={text.dataSecurity.items} />

        {/* Data Retention */}
        <SectionHeading>{text.dataRetention.title}</SectionHeading>
        <Paragraph>{text.dataRetention.content}</Paragraph>

        {/* Privacy Rights */}
        <SectionHeading>{text.privacyRights.title}</SectionHeading>
        {text.privacyRights.description && (
          <Paragraph className='mb-4'>
            {text.privacyRights.description}
          </Paragraph>
        )}
        <List items={text.privacyRights.items} />

        {/* Web3 Considerations (optional) */}
        {text.web3Considerations && (
          <>
            <SectionHeading>{text.web3Considerations.title}</SectionHeading>
            {text.web3Considerations.description && (
              <Paragraph className='mb-4'>
                {text.web3Considerations.description}
              </Paragraph>
            )}
            <List items={text.web3Considerations.items} />
          </>
        )}

        {/* International Transfers */}
        <SectionHeading>{text.internationalTransfers.title}</SectionHeading>
        <Paragraph>{text.internationalTransfers.content}</Paragraph>

        {/* Children's Privacy */}
        <SectionHeading>{text.childrensPrivacy.title}</SectionHeading>
        <Paragraph>{text.childrensPrivacy.content}</Paragraph>

        {/* Cookies */}
        <SectionHeading>{text.cookies.title}</SectionHeading>
        <Paragraph>
          <span dangerouslySetInnerHTML={{ __html: text.cookies.content }} />
        </Paragraph>

        {/* Changes */}
        <SectionHeading>{text.changes.title}</SectionHeading>
        <Paragraph>{text.changes.content}</Paragraph>

        {/* Contact */}
        <SectionHeading>{text.contact.title}</SectionHeading>
        <Paragraph>{text.contact.description}</Paragraph>
        <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
          <p className='text-gray-700 dark:text-gray-300'>
            {text.contact.info.emailLabel}{' '}
            <a
              href={`mailto:${text.contact.info.email}`}
              className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
            >
              {text.contact.info.email}
            </a>
            <br />
            {text.contact.info.websiteLabel}{' '}
            <a
              href={text.contact.info.websiteUrl}
              className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
            >
              {text.contact.info.websiteUrl}
            </a>
            <br />
            {text.contact.info.dpoLabel}{' '}
            <a
              href={`mailto:${text.contact.info.dpoEmail}`}
              className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
            >
              {text.contact.info.dpoEmail}
            </a>
          </p>
        </div>

        {/* GDPR Notice */}
        <div className='mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
          <h3 className='text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2'>
            {text.contact.info.gdprTitle}
          </h3>
          <p className='text-blue-800 dark:text-blue-300'>
            {text.contact.info.gdprContent}{' '}
            <a
              href={`mailto:${text.contact.info.dpoEmail}`}
              className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
            >
              {text.contact.info.dpoEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  if (PageWrapper) {
    return <PageWrapper>{content}</PageWrapper>;
  }

  return content;
};

export default AppPrivacyPolicyPage;
