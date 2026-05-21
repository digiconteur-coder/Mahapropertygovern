import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { LanguageProvider } from "@/context/LanguageContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="transfer" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="apply-loan" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="raise-dispute" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="approvals" options={{ headerShown: false }} />
      <Stack.Screen name="doc-verify" options={{ headerShown: false }} />
      <Stack.Screen name="audit-log" options={{ headerShown: false }} />
      <Stack.Screen name="loan-approvals" options={{ headerShown: false }} />
      <Stack.Screen name="escrow" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="inventory" options={{ headerShown: false }} />
      <Stack.Screen name="co-owner" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="new-project" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="transaction/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="financial-sim" options={{ headerShown: false }} />
      <Stack.Screen name="conflict-resolution" options={{ headerShown: false }} />
      <Stack.Screen name="vle-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="lifecycle" options={{ headerShown: false }} />
      <Stack.Screen name="consent-engine" options={{ headerShown: false }} />
      <Stack.Screen name="ai-legal" options={{ headerShown: false }} />
      <Stack.Screen name="bank-verification" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <DataProvider>
              <LanguageProvider>
                <GestureHandlerRootView>
                  <KeyboardProvider>
                    <RootLayoutNav />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </LanguageProvider>
            </DataProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
