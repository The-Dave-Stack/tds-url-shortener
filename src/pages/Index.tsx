
/**
 * Index/Home Page Component
 * Landing page with URL shortener and feature highlights
 */

import Layout from "@/components/Layout";
import URLShortenerForm from "@/components/URLShortenerForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, Link as LinkIcon, LineChart, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Index component - The landing page of the application
 * Features URL shortener form and highlights of key functionalities
 */
const Index = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-teal-deep/10 rounded-full flex items-center justify-center">
              <LinkIcon className="h-8 w-8 text-teal-deep" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-petrol-blue dark:text-fog-gray mb-4">
            URL <span className="text-teal-deep">Shortener</span>
          </h1>
          <p className="text-xl text-petrol-blue/80 dark:text-fog-gray/80 max-w-3xl mx-auto">
            Shorten your URLs and get detailed analytics on their performance.
            Discover who, when, and where people access your links.
          </p>
        </div>
        
        <div className="mb-16">
          <URLShortenerForm />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-petrol-blue p-6 rounded-lg shadow-sm border border-soft-gray dark:border-dark-blue-gray">
            <div className="h-12 w-12 bg-teal-deep/10 rounded-full flex items-center justify-center mb-4">
              <LinkIcon className="h-6 w-6 text-teal-deep" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-petrol-blue dark:text-fog-gray">Shortened Links</h3>
            <p className="text-petrol-blue/80 dark:text-fog-gray/80 mb-4">
              Convert long URLs into short, shareable links for any platform.
            </p>
          </div>
          
          <div className="bg-white dark:bg-petrol-blue p-6 rounded-lg shadow-sm border border-soft-gray dark:border-dark-blue-gray">
            <div className="h-12 w-12 bg-teal-deep/10 rounded-full flex items-center justify-center mb-4">
              <BarChart className="h-6 w-6 text-teal-deep" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-petrol-blue dark:text-fog-gray">Detailed Analytics</h3>
            <p className="text-petrol-blue/80 dark:text-fog-gray/80 mb-4">
              Access real-time statistics about who visits your links and from where.
            </p>
          </div>
          
          <div className="bg-white dark:bg-petrol-blue p-6 rounded-lg shadow-sm border border-soft-gray dark:border-dark-blue-gray">
            <div className="h-12 w-12 bg-teal-deep/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-teal-deep" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-petrol-blue dark:text-fog-gray">Custom URLs</h3>
            <p className="text-petrol-blue/80 dark:text-fog-gray/80 mb-4">
              Create personalized and memorable links for your brand or campaigns.
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-petrol-blue/80 dark:text-fog-gray/80 mb-4">
            {user 
              ? 'Ready to manage your shortened links?' 
              : 'Want to access all features?'}
          </p>
          <Button 
            asChild
            className="bg-teal-deep hover:bg-mint-green text-white"
            size="lg"
          >
            <Link to={user ? "/dashboard" : "/auth"}>
              {user ? (
                <>
                  <LineChart className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </>
              ) : (
                'Sign In or Register'
              )}
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
