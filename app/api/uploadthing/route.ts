import { createNextRouteHandler } from "uploadthing/next";
 
import { ourFileRouter } from "./core";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Export routes for Next App Router
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});