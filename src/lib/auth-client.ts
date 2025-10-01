import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    // Ensure cookies are sent with authentication requests
    fetchOptions: {
        credentials: "include",
    },
});