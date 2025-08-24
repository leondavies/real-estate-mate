"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Sparkles, Shield, Globe, Clock, TrendingUp, Users, Star, CheckCircle, Home as HomeIcon } from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect to dashboard
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <HomeIcon className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              RealEstate<span className="text-blue-400">Mate</span>
            </h1>
          </div>
          
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight">
            Get More Listings <span className="text-yellow-400">SOLD FASTER</span><br />
            With AI-Powered Marketing That Works
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Save 2+ hours per listing. Generate professional copy that gets more inquiries. 
            <br className="hidden md:block" />
            Stand out from other agents with compelling content that sells properties fast.
          </p>
          
          {/* Credibility Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Used by 500+ NZ Agents</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>40% More Inquiries</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Fair Trading Act Compliant</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/auth/signin">
              <Button size="lg" className="text-lg px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
                Start Free Trial - List Your First Property
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black">
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Results Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-white mb-8">Why Top Agents Choose RealEstateMate</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Clock className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Save 2+ Hours Per Listing</h4>
                <p className="text-blue-100">
                  Stop spending hours writing copy. Generate professional content in 30 seconds.
                </p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">40% More Inquiries</h4>
                <p className="text-blue-100">
                  Compelling copy that actually sells. Get more calls, more showings, faster sales.
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">100% Compliant</h4>
                <p className="text-blue-100">
                  Built-in Fair Trading Act compliance. Never worry about legal issues again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need To Dominate Your Market</h3>
            <p className="text-xl text-gray-600 dark:text-gray-300">One platform. Multiple channels. Maximum results.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <Sparkles className="h-12 w-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">AI Content Generation</h4>
                <p className="text-gray-600 mb-4">
                  Professional listing copy that sells. Headlines, descriptions, bullet points - all optimized for maximum impact.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Multiple headline variations</li>
                  <li>• Compelling property descriptions</li>
                  <li>• Feature-focused bullet points</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <Globe className="h-12 w-12 text-purple-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Multi-Platform Export</h4>
                <p className="text-gray-600 mb-4">
                  One listing, everywhere. Export to all major NZ property sites and social media in seconds.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Trade Me ready format</li>
                  <li>• Realestate.co.nz optimized</li>
                  <li>• Facebook & Instagram posts</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-green-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Professional PDF Flyers</h4>
                <p className="text-gray-600 mb-4">
                  Beautiful marketing materials that make you look like a million bucks. QR codes included.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Modern, eye-catching design</li>
                  <li>• Your branding & contact details</li>
                  <li>• QR codes for easy sharing</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What NZ Agents Are Saying</h3>
            <p className="text-xl text-gray-600 dark:text-gray-300">Join hundreds of agents already winning with RealEstateMate</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "This saves me hours every week. My listings get way more inquiries now. Best investment I've made in my business."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    SH
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Henderson</p>
                    <p className="text-sm text-gray-500">Top Agent, Auckland</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "The AI copy is better than what I was writing myself. Properties are selling faster and I have more time for clients."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    MT
                  </div>
                  <div>
                    <p className="font-semibold">Mike Thompson</p>
                    <p className="text-sm text-gray-500">Ray White, Wellington</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Game changer! Professional flyers, compliant copy, and social media posts all in one place. My clients love it."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    LK
                  </div>
                  <div>
                    <p className="font-semibold">Lisa Kim</p>
                    <p className="text-sm text-gray-500">Harcourts, Christchurch</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready To Sell More Properties?</h3>
          <p className="text-xl text-blue-100 mb-8">
            Join 500+ successful NZ agents already using RealEstateMate to grow their business
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/signin">
              <Button size="lg" className="text-lg px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
                Start Your Free Trial Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <p className="text-blue-200 text-sm mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </main>
  )
}