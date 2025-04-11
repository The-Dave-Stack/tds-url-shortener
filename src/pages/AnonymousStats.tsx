
import { useState, useEffect } from "react";
import { getUserUrls, deleteUrl, UrlData, getUrlAnalytics } from "@/utils/api";
import Layout from "@/components/Layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, ExternalLink, Trash2, BarChart } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

/**
 * AnonymousStats Component
 * Shows statistics for URLs created by anonymous users
 */
const AnonymousStats = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrlId, setSelectedUrlId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Fetch URLs for anonymous user
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setLoading(true);
        const data = await getUserUrls();
        setUrls(data);
      } catch (error) {
        console.error("Error fetching URLs:", error);
        toast.error("Error loading your URLs");
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, []);

  // Fetch analytics when a URL is selected
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedUrlId) {
        setAnalytics(null);
        return;
      }
      
      try {
        setAnalyticsLoading(true);
        const data = await getUrlAnalytics(selectedUrlId);
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error("Error loading analytics data");
        setAnalytics(null);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [selectedUrlId]);

  // Handle URL deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteUrl(id);
      setUrls(urls.filter(url => url.id !== id));
      toast.success("URL deleted successfully");
      
      // If we're viewing analytics for the deleted URL, clear it
      if (selectedUrlId === id) {
        setSelectedUrlId(null);
      }
    } catch (error) {
      console.error("Error deleting URL:", error);
      toast.error("Error deleting URL");
    }
  };

  // Format the created date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Get base URL
  const baseUrl = window.location.origin;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-petrol-blue dark:text-fog-gray">My Anonymous URLs</h1>
            <p className="text-petrol-blue/70 dark:text-fog-gray/70 mt-1">
              Manage and track your shortened URLs
            </p>
          </div>
          
          <Button asChild className="mt-4 md:mt-0 bg-teal-deep hover:bg-mint-green text-white">
            <Link to="/">
              Create New URL
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your URLs</CardTitle>
            <CardDescription>
              These URLs will be stored on this device only. Creating an account will allow you to access them from anywhere.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-deep" />
              </div>
            ) : urls.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-petrol-blue/80 dark:text-fog-gray/80 mb-4">
                  You haven't created any shortened URLs yet
                </p>
                <Button asChild className="bg-teal-deep hover:bg-mint-green text-white">
                  <Link to="/">Create Your First URL</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Short URL</TableHead>
                      <TableHead className="hidden md:table-cell">Original URL</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead className="text-center">Clicks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {urls.map((url) => (
                      <TableRow key={url.id}>
                        <TableCell className="font-medium">
                          <a
                            href={`${baseUrl}/${url.shortCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-deep hover:underline flex items-center"
                          >
                            {url.shortCode}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </TableCell>
                        <TableCell className="hidden md:table-cell truncate max-w-[200px]">
                          <span title={url.originalUrl}>{url.originalUrl}</span>
                        </TableCell>
                        <TableCell>{formatDate(url.createdAt)}</TableCell>
                        <TableCell className="text-center">{url.clicks}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUrlId(selectedUrlId === url.id ? null : url.id)}
                              className="text-petrol-blue dark:text-fog-gray"
                            >
                              <BarChart className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(url.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {selectedUrlId && analytics && (
          <div className="mt-6">
            {analyticsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-deep" />
              </div>
            ) : (
              <AnalyticsDashboard 
                data={analytics}
              />
            )}
          </div>
        )}
        
        <div className="mt-8 bg-fog-gray/50 dark:bg-night-blue/50 p-4 rounded-lg">
          <h3 className="font-medium text-lg text-petrol-blue dark:text-fog-gray mb-2">Anonymous User Limits</h3>
          <p className="text-petrol-blue/80 dark:text-fog-gray/80 mb-3">
            Anonymous users are limited to creating 50 shortened URLs per day. These URLs are stored locally on your device.
          </p>
          <div className="flex justify-center">
            <Button asChild className="bg-teal-deep hover:bg-mint-green text-white">
              <Link to="/auth">Create an Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnonymousStats;
