
import { useState } from "react";
import Layout from "@/components/Layout";
import URLShortenerForm from "@/components/URLShortenerForm";
import URLList from "@/components/URLList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { useQuery } from "@tanstack/react-query";
import { getUrlAnalytics } from "@/utils/api";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"shorten" | "links">("links");
  const { id } = useParams<{ id: string }>();
  
  // If there's an ID in the URL, show the analytics dashboard for that URL
  const {
    data: analyticsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['urlAnalytics', id],
    queryFn: () => getUrlAnalytics(id as string),
    enabled: !!id,
  });
  
  if (id) {
    return (
      <Layout>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-teal-deep" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-8">
            Error loading analytics data. Please try again.
          </div>
        ) : analyticsData ? (
          <AnalyticsDashboard data={analyticsData} />
        ) : null}
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={(value) => setActiveTab(value as "shorten" | "links")}
          className="space-y-8"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="links">Mis URLs</TabsTrigger>
            <TabsTrigger value="shorten">Acortar URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="links" className="space-y-8">
            <URLList />
          </TabsContent>
          
          <TabsContent value="shorten">
            <URLShortenerForm />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
