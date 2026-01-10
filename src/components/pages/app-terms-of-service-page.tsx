import React, { type ReactNode, type ComponentType } from 'react';

/**
 * Configuration for a section with paragraph content
 */
export interface TermsSectionWithContent {
  /** Section title */
  title: string;
  /** Paragraph content (can include HTML for links) */
  content: string;
  /** Whether content contains HTML that should be rendered */
  isHtml?: boolean;
}

/**
 * Configuration for a section with a list
 */
export interface TermsSectionWithList {
  /** Section title */
  title: string;
  /** Optional description before the list */
  description?: string;
  /** List items */
  items: string[];
  /** Optional additional content after the list */
  additionalContent?: string;
}

/**
 * Contact information configuration
 */
export interface TermsContactInfo {
  /** Email label (e.g., "Email:") */
  emailLabel: string;
  /** Email address */
  email: string;
  /** Website label (e.g., "Website:") */
  websiteLabel: string;
  /** Website URL */
  websiteUrl: string;
}

/**
 * All text content for the terms of service page
 */
export interface TermsOfServicePageText {
  /** Page title */
  title: string;
  /** Last updated text (with placeholder for date) */
  lastUpdated: string;
  /** All sections in order */
  sections: Array<TermsSectionWithContent | TermsSectionWithList>;
  /** Contact information */
  contact: {
    /** Section title */
    title: string;
    /** Section description */
    description: string;
    /** Whether description contains HTML */
    isHtml?: boolean;
    /** Contact details */
    info: TermsContactInfo;
  };
}

/**
 * Props for AppTermsOfServicePage component
 */
export interface AppTermsOfServicePageProps {
  /** All text content (must be provided by consumer) */
  text: TermsOfServicePageText;
  /** Current date for "last updated" display */
  lastUpdatedDate?: string;
  /** Optional wrapper component for the page layout */
  PageWrapper?: ComponentType<{ children: ReactNode }>;
  /** Optional className for the container */
  className?: string;
}

/**
 * Type guard to check if section has items (is a list section)
 */
function isSectionWithList(
  section: TermsSectionWithContent | TermsSectionWithList
): section is TermsSectionWithList {
  return 'items' in section && Array.isArray(section.items);
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
 * AppTermsOfServicePage - A reusable terms of service page component
 *
 * Displays a comprehensive terms of service document with:
 * - Flexible section structure (content or list-based)
 * - Contact information
 * - Support for HTML content in specific sections
 *
 * All text content must be provided by the consumer app.
 *
 * @example
 * ```tsx
 * <AppTermsOfServicePage
 *   text={{
 *     title: "Terms of Service",
 *     lastUpdated: "Last updated: {{date}}",
 *     sections: [
 *       { title: "Acceptance", content: "By using..." },
 *       { title: "User Responsibilities", items: ["Item 1", "Item 2"] }
 *     ],
 *     contact: {
 *       title: "Contact",
 *       description: "Questions?",
 *       info: { emailLabel: "Email:", email: "support@example.com", ... }
 *     }
 *   }}
 *   lastUpdatedDate="January 1, 2025"
 * />
 * ```
 */
export const AppTermsOfServicePage: React.FC<AppTermsOfServicePageProps> = ({
  text,
  lastUpdatedDate = new Date().toLocaleDateString(),
  PageWrapper,
  className,
}) => {
  const content = (
    <div className={`max-w-7xl mx-auto px-4 py-12 ${className || ''}`}>
      <h1 className='text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8'>
        {text.title}
      </h1>

      <div className='prose prose-lg dark:prose-invert max-w-none'>
        <Paragraph className='mb-6'>
          {text.lastUpdated.replace('{{date}}', lastUpdatedDate)}
        </Paragraph>

        {/* Render all sections */}
        {text.sections.map((section, index) => (
          <React.Fragment key={index}>
            <SectionHeading>{section.title}</SectionHeading>

            {isSectionWithList(section) ? (
              <>
                {section.description && (
                  <Paragraph className='mb-4'>{section.description}</Paragraph>
                )}
                <List items={section.items} />
                {section.additionalContent && (
                  <Paragraph>{section.additionalContent}</Paragraph>
                )}
              </>
            ) : section.isHtml ? (
              <Paragraph>
                <span dangerouslySetInnerHTML={{ __html: section.content }} />
              </Paragraph>
            ) : (
              <Paragraph>{section.content}</Paragraph>
            )}
          </React.Fragment>
        ))}

        {/* Contact Section */}
        <SectionHeading>{text.contact.title}</SectionHeading>
        {text.contact.isHtml ? (
          <Paragraph>
            <span
              dangerouslySetInnerHTML={{ __html: text.contact.description }}
            />
          </Paragraph>
        ) : (
          <Paragraph>{text.contact.description}</Paragraph>
        )}
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

export default AppTermsOfServicePage;
