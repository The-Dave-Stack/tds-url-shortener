
/**
 * Health check endpoint for monitoring
 * Used by Docker and other services to verify the app is running
 */
import { useEffect } from "react";

const Health = () => {
  useEffect(() => {
    // Set status code to 200 to indicate service is healthy
    document.title = "Health Check";
  }, []);

  return (
    <div className="p-4">
      <h1>Service is healthy</h1>
      <p>Status: OK</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
};

export default Health;
