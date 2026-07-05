import React from 'react';
import SEOHead from '../components/SEOHead';
import { legalUpdatedDate } from '../lib/site';

const Terms: React.FC = () => (
  <>
    <SEOHead
      title="Terms of Service - Capryos"
      description="Review the terms that apply when using Capryos content, accounts, newsletter subscriptions, and contact features."
      url="https://capryos.com/terms"
    />
    <div className="bg-gray-50 py-20 dark:bg-gray-950">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Last updated: {legalUpdatedDate}</p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
          <div className="mt-8 space-y-6 text-gray-700 dark:text-gray-300">
            <p>By using Capryos, you agree to these terms and any policies referenced here. If you do not agree, do not use the site or submit information through our forms.</p>
            <p>Capryos content is provided for educational and informational purposes only. It is not financial, investment, legal, tax, or professional advice.</p>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for activity that occurs through your account.</p>
            <p>You may not misuse the site, interfere with its operation, submit unlawful or harmful content, or attempt unauthorized access to any systems or data.</p>
            <p>All site content, branding, and materials are owned by Capryos or its licensors unless otherwise stated. You may link to our content, but you may not copy or republish substantial portions without permission.</p>
            <p>We may update, suspend, or discontinue parts of the site at any time. Questions about these terms can be sent to <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:hello@capryos.com">hello@capryos.com</a>.</p>
          </div>
        </div>
      </article>
    </div>
  </>
);

export default Terms;
