export default {
  async fetch(request) {
    const backendBaseURL = "https://your-backend-domain.com"; // Use your real backend URL

    const url = new URL(request.url);
    const apiPath = url.pathname.startsWith("/api") ? url.pathname : "/";

    // Forward request to backend
    const backendResponse = await fetch(`${backendBaseURL}${apiPath}`, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": request.headers.get("Authorization") || "", // Forward token
      },
      body: request.method !== "GET" ? request.body : null,
    });

    // Handle CORS headers
    const response = new Response(await backendResponse.text(), {
      status: backendResponse.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });

    return response;
  },
};
