
/**
 * URL Shortener Form Component
 * Allows users to create shortened URLs with optional custom aliases
 */

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Link as LinkIcon } from "lucide-react";
import { createShortUrl } from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Form schema validation
const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  alias: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * URL Shortener Form Component
 * Provides a form for users to create shortened URLs with custom aliases
 */
const URLShortenerForm = () => {
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      alias: "",
    },
  });

  /**
   * Handle form submission
   * Creates a shortened URL and displays the result
   */
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      // Create short URL using API
      const result = await createShortUrl(values.url, values.alias || undefined);
      
      // Generate full short URL with domain
      const baseUrl = window.location.origin;
      const fullShortUrl = `${baseUrl}/${result.shortCode}`;
      
      setShortUrl(fullShortUrl);
      
      // Reset form fields
      form.reset();
      
      toast.success("URL shortened successfully!");
      
      // If user is logged in, redirect to dashboard
      if (user) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy the shortened URL to clipboard
   */
  const copyToClipboard = async () => {
    if (!shortUrl) return;
    
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="bg-white dark:bg-petrol-blue rounded-lg shadow-sm border border-soft-gray dark:border-dark-blue-gray p-6">
      <div className="mb-6 flex items-center justify-center">
        <div className="h-12 w-12 bg-teal-deep/10 rounded-full flex items-center justify-center">
          <LinkIcon className="h-6 w-6 text-teal-deep" />
        </div>
      </div>

      {shortUrl ? (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium text-petrol-blue dark:text-fog-gray">URL Shortened!</h3>
          
          <div 
            onClick={copyToClipboard}
            className="bg-fog-gray dark:bg-night-blue text-teal-deep rounded-lg p-4 cursor-pointer hover:bg-soft-gray dark:hover:bg-dark-blue-gray transition-colors"
          >
            <p className="font-medium break-all">{shortUrl}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={copyToClipboard}
              className="bg-teal-deep hover:bg-mint-green text-white"
            >
              Copy to Clipboard
            </Button>
            
            <Button 
              onClick={() => setShortUrl(null)}
              variant="outline"
              className="border-teal-deep text-teal-deep hover:bg-mint-green/10 hover:text-mint-green hover:border-mint-green"
            >
              Shorten Another URL
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold text-center mb-6 text-petrol-blue dark:text-fog-gray">
            Shorten Your URL
          </h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-petrol-blue dark:text-fog-gray">URL to shorten</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/very/long/url"
                        {...field}
                        className="border-soft-gray dark:border-dark-blue-gray dark:bg-night-blue dark:text-fog-gray"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="alias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-petrol-blue dark:text-fog-gray">
                      Custom alias (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="my-custom-url"
                        {...field}
                        className="border-soft-gray dark:border-dark-blue-gray dark:bg-night-blue dark:text-fog-gray"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-teal-deep hover:bg-mint-green text-white" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                {loading ? "Processing..." : "Shorten URL"}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
};

export default URLShortenerForm;
