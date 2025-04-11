
import { UrlAnalytics } from "@/utils/api-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import ClicksChart from "@/components/charts/ClicksChart";
import CountryDistribution from "@/components/charts/CountryDistribution";
import { format } from "date-fns";
import { Globe, Clock, Smartphone } from "lucide-react";

/**
 * Analytics Dashboard Component
 * Displays charts and statistics for a URL
 */
interface AnalyticsDashboardProps {
  data: UrlAnalytics;
}

const AnalyticsDashboard = ({ data }: AnalyticsDashboardProps) => {
  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  /**
   * Extract browser information from user agent
   */
  const getBrowserInfo = (userAgent: string | null): string => {
    if (!userAgent) return "Unknown";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
    return "Unknown";
  };

  /**
   * Extract device type from user agent
   */
  const getDeviceType = (userAgent: string | null): string => {
    if (!userAgent) return "Unknown";
    if (userAgent.includes("Mobile")) return "Mobile";
    if (userAgent.includes("Tablet")) return "Tablet";
    return "Desktop";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-petrol-blue dark:text-fog-gray">
            Analytics for: <span className="text-teal-deep">{data.shortCode}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-fog-gray/50 dark:bg-night-blue/50 p-4 rounded-lg">
              <div className="text-sm text-petrol-blue/70 dark:text-fog-gray/70">Total Clicks</div>
              <div className="text-2xl font-bold text-teal-deep">{data.clicks}</div>
            </div>
            
            <div className="bg-fog-gray/50 dark:bg-night-blue/50 p-4 rounded-lg">
              <div className="text-sm text-petrol-blue/70 dark:text-fog-gray/70">Countries</div>
              <div className="text-2xl font-bold text-teal-deep">{data.countries.length}</div>
            </div>
            
            <div className="bg-fog-gray/50 dark:bg-night-blue/50 p-4 rounded-lg">
              <div className="text-sm text-petrol-blue/70 dark:text-fog-gray/70">Created On</div>
              <div className="text-lg font-medium text-petrol-blue dark:text-fog-gray truncate">
                {formatDate(data.createdAt).split(" ")[0]}
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Clicks Chart Card */}
            <div className="flex flex-col h-[400px]">
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg text-petrol-blue dark:text-fog-gray">
                    Daily Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <ClicksChart data={data.dailyClicks} />
                </CardContent>
              </Card>
            </div>
            
            {/* Countries Distribution Chart Card */}
            <div className="flex flex-col h-[400px]">
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg text-petrol-blue dark:text-fog-gray">
                    Visitor Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <CountryDistribution data={data.countries} />
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Recent Visits - Con más espacio vertical */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-petrol-blue dark:text-fog-gray">
                  Recent Visits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  <div className="space-y-2 p-4">
                    {data.recentVisits.map((visit) => (
                      <div 
                        key={visit.id} 
                        className="p-3 bg-fog-gray/20 dark:bg-night-blue/20 rounded-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 text-teal-deep mr-2" />
                            <span className="font-medium text-petrol-blue dark:text-fog-gray">
                              {visit.country || 'Unknown'}
                            </span>
                            {visit.region && visit.city && (
                              <span className="ml-1 text-petrol-blue/70 dark:text-fog-gray/70 text-sm">
                                ({visit.city}, {visit.region})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-petrol-blue/70 dark:text-fog-gray/70">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(visit.timestamp)}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-petrol-blue/60 dark:text-fog-gray/60">
                          <Smartphone className="h-3 w-3 mr-1" />
                          {getDeviceType(visit.userAgent)} • {getBrowserInfo(visit.userAgent)}
                        </div>
                      </div>
                    ))}
                    
                    {data.recentVisits.length === 0 && (
                      <div className="text-center py-8 text-petrol-blue/60 dark:text-fog-gray/60">
                        No visit data available yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
