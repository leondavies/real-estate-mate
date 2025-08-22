"use client"

import { useState, Suspense } from "react"
import { signIn, getProviders } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chrome, Loader2 } from "lucide-react"

function SignInContent() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")

  const handleSignIn = async (providerId: string) => {
    setIsLoading(providerId)
    try {
      await signIn(providerId, { callbackUrl })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to RealEstateMate
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AI-powered real estate listing generator for New Zealand
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error === "OAuthSignin" && "Error occurred during sign in"}
                {error === "OAuthCallback" && "Error occurred during callback"}
                {error === "OAuthCreateAccount" && "Could not create account"}
                {error === "EmailCreateAccount" && "Could not create account"}
                {error === "Callback" && "Error occurred during callback"}
                {error === "OAuthAccountNotLinked" && "Account is already linked to another provider"}
                {error === "EmailSignin" && "Check your email for sign in link"}
                {error === "CredentialsSignin" && "Invalid credentials"}
                {error === "SessionRequired" && "Please sign in to access this page"}
                {!["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "EmailCreateAccount", "Callback", "OAuthAccountNotLinked", "EmailSignin", "CredentialsSignin", "SessionRequired"].includes(error) && "An error occurred during sign in"}
              </div>
            )}

            <Button
              onClick={() => handleSignIn("google")}
              disabled={isLoading !== null}
              className="w-full"
              size="lg"
            >
              {isLoading === "google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Chrome className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-600">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}