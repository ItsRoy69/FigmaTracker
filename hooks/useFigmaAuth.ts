import { useEffect, useState } from "react";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

WebBrowser.maybeCompleteAuthSession();

const FIGMA_CLIENT_ID = "wMMLeds6lcVJ9tZddeREt9";
const FIGMA_CLIENT_SECRET = "Qfmbye19yBu0eiVpCOOjmZf2ltC3Rr";
const useFigmaAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await SecureStore.getItemAsync("figma_token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  };

  const login = async () => {
    try {
      const redirectUri = makeRedirectUri({
        scheme: "figmatracker",
      });

      const authUrl =
        `https://www.figma.com/oauth?` +
        `client_id=${FIGMA_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=files_read` +
        `&state=random` +
        `&response_type=code`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      if (result.type === "success") {
        const params = new URLSearchParams(new URL(result.url).search);
        const code = params.get("code");

        // Exchange code for token
        const tokenResponse = await fetch(
          "https://www.figma.com/api/oauth/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: FIGMA_CLIENT_ID,
              client_secret: FIGMA_CLIENT_SECRET, // You'll need to add this constant
              redirect_uri: redirectUri,
              code: code,
              grant_type: "authorization_code",
            }),
          }
        );

        const tokenData = await tokenResponse.json();

        // Save the token
        await SecureStore.setItemAsync("figma_token", tokenData.access_token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("figma_token");
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, login, logout };
};

export default useFigmaAuth;
