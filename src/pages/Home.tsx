import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, BookOpen, FileText, Heart, PenLine } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import NewsletterSignup from '../components/NewsletterSignup';
import BlogCard from '../components/BlogCard';
import { supabase, type BlogPost } from '../lib/supabase';

const Home: React.FC = () => {
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  useEffect(() => {
    if (location.hash === '#declaration') {
      document.getElementById('declaration')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  const fetchLatestPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(7);

      if (error) throw error;
      setLatestPosts((data || []) as BlogPost[]);
    } catch (error) {
      console.error('Error fetching latest posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const [newestPost, ...recentPosts] = latestPosts;

  return (
    <div className="relative">
      <SEOHead
        title="Capryos - An Indie Blog on Crypto & Tech"
        description="Capryos is an independent hobby blog with personal notes, opinions, and news about cryptocurrency and other tech products. Not a crypto business or financial service."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-36 pb-24">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
            <PenLine className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">An Independent Hobby Blog</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight text-white">
            Notes on{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Crypto &amp; Tech
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            A personal blog about cryptocurrency, tech products, and the latest news,
            written for fun and curiosity. Not a crypto business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Link
              to="/blog"
              className="group bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Read the Blog</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a
              href="#declaration"
              className="px-8 py-4 rounded-xl font-bold text-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
            >
              About This Site
            </a>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-2">
                <BookOpen className="h-5 w-5" />
                <span>Latest Posts</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Fresh from the Blog</h2>
            </div>
            {latestPosts.length > 0 && (
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-3 transition-all duration-200"
              >
                <span>View all posts</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>

          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">Loading posts...</p>
          ) : latestPosts.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-600">
              <PenLine className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-300">The first posts are on their way. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-8">
              <BlogCard post={newestPost} variant="featured" />
              {recentPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Declaration Letter */}
      <section id="declaration" className="py-20 bg-amber-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="relative p-8 sm:p-12 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border-2 border-amber-200 dark:border-amber-500/30">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 mb-6">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-semibold">Declaration Letter</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              A Note on What Capryos Is (and Isn't)
            </h2>

            <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>To whom it may concern,</p>
              <p>
                I hereby declare that <strong>Capryos is an independent hobby website</strong>. It is run by
                one person who is personally interested in cryptocurrency, other tech products, and tech news,
                and who enjoys writing about them.
              </p>
              <p>Capryos is <strong>not</strong> a crypto-related business. Specifically, Capryos does not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>operate an exchange, wallet, token, coin, or any trading platform;</li>
                <li>buy, sell, hold, or manage cryptocurrency or any other assets on behalf of anyone;</li>
                <li>offer investment, financial, legal, or tax advice or services;</li>
                <li>raise funds, solicit investments, or sell any financial product.</li>
              </ul>
              <p>
                Everything published here is personal opinion, learning notes, and commentary for informational
                and entertainment purposes only. Please do your own research and consult a qualified professional
                before making any financial decisions.
              </p>
              <p>
                If you have any questions, feel free to reach out at{' '}
                <a href="mailto:hello@capryos.com" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                  hello@capryos.com
                </a>.
              </p>
              <p className="pt-4">
                Sincerely,
                <br />
                <span className="inline-flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  The Capryos Founder <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                </span>
                <br />
                <span className="text-sm text-gray-500 dark:text-gray-400">Independent hobbyist, crypto &amp; tech enthusiast</span>
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <NewsletterSignup variant="hero" />
        </div>
      </section>
    </div>
  );
};

export default Home;
