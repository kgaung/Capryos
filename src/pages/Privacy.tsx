import React from 'react';
import SEOHead from '../components/SEOHead';
import { legalUpdatedDate } from '../lib/site';

const Privacy: React.FC = () => (
  <>
    <SEOHead
      title="Privacy Policy - Capryos"
      description="Learn how Capryos collects, uses, protects, and manages personal information submitted through accounts, newsletter subscriptions, and contact forms."
      url="https://capryos.com/privacy"
    />
    <div className="bg-gray-50 py-20 dark:bg-gray-950">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Last updated: {legalUpdatedDate}</p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          <div className="mt-8 space-y-6 text-gray-700 dark:text-gray-300">
            <p>Capryos collects the information you provide when you create an account, subscribe to the newsletter, or contact us, including your name, email address, and message content.</p>
            <p>We use this information to operate the site, send requested updates, respond to inquiries, protect the service from abuse, and improve our content and user experience.</p>
            <p>We do not sell personal information. We may share limited information with service providers that help us host, secure, analyze, or deliver the site and communications.</p>
            <p>You can unsubscribe from marketing emails at any time. You may also contact us to request access, correction, or deletion of your personal information where applicable.</p>
            <p>We use reasonable administrative and technical safeguards, but no online service can guarantee absolute security. We retain information only as long as needed for the purposes described above or as required by law.</p>
            <p>Questions about this policy can be sent to <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:hello@capryos.com">hello@capryos.com</a>.</p>
          </div>
        </div>
      </article>
    </div>
  </>
);

export default Privacy;
