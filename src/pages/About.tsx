import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, PenLine, Coins, Cpu, Newspaper, ShieldAlert } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const topics = [
  {
    icon: <Coins className="h-6 w-6 text-white" />,
    title: 'Cryptocurrency',
    description: 'Personal notes and thoughts on coins, blockchains, and what is happening in the crypto space.',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: <Cpu className="h-6 w-6 text-white" />,
    title: 'Tech Products',
    description: 'Impressions of gadgets, apps, and tools that caught my attention.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Newspaper className="h-6 w-6 text-white" />,
    title: 'Tech News',
    description: 'Commentary on tech news and trends that I find interesting.',
    color: 'from-green-500 to-emerald-500',
  },
];

const About: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="About - Capryos"
        description="Capryos is an independent hobby blog run by one person who enjoys writing about cryptocurrency, tech products, and tech news. Not a crypto business."
        url="https://capryos.com/about"
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white pt-36 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <PenLine className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">An Independent Hobby Blog</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            About <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Capryos</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            A personal blog where I write about things I am curious about: cryptocurrency, tech products, and tech news.
          </p>
        </div>
      </section>

      {/* The Blogger */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Hi, I'm Kane</h2>
          <p>
            Capryos is my hobby. I run it on my own in my spare time because I enjoy following crypto and tech,
            and writing helps me make sense of what I learn. There is no company, team, or investors behind it,
            just one person and a blog.
          </p>
          <p>
            Posts here are my own opinions and learning notes. I'm not a financial professional, and nothing on
            this site is investment, financial, legal, or tax advice.
          </p>
        </div>
      </section>

      {/* Topics */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">What I Write About</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topics.map((topic) => (
              <div
                key={topic.title}
                className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${topic.color} flex items-center justify-center mb-5`}>
                  {topic.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{topic.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Not a Business */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-2xl bg-amber-50 dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-500/30">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Not a Crypto Business</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Capryos does not run an exchange, wallet, token, or trading platform. It does not buy, sell, or manage
              crypto or other assets for anyone, offer financial services, or raise funds. It is only a blog.
              Read the full <Link to="/#declaration" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">declaration letter</Link> on the home page.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-12 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white shadow-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Thanks for Stopping By</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Have a look at the latest posts, or say hello if you have a question or a topic idea.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/blog"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-600 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <BookOpen className="h-5 w-5" />
              Read the Blog
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold hover:bg-white/20 transition-all duration-300"
            >
              <Mail className="h-5 w-5" />
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
