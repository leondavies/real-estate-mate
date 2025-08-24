"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, Calendar, TrendingUp, Clock, DollarSign, Zap, Star, Settings, Target, Activity } from "lucide-react"

interface Listing {
  id: string
  address: string
  suburb: string
  city: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  status: string
  createdAt: string
  updatedAt: string
  images?: Array<{
    id: string
    url: string
    order: number
  }>
}

export default function Dashboard() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings')
      if (!response.ok) throw new Error('Failed to fetch listings')
      const data = await response.json()
      setListings(data)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft_ready': return 'bg-blue-100 text-blue-800'
      case 'created': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: listings.length,
    created: listings.filter(l => l.status === 'created').length,
    draftReady: listings.filter(l => l.status === 'draft_ready').length,
    published: listings.filter(l => l.status === 'published').length,
  }

  // Calculate agent-focused metrics
  const timeSaved = stats.total * 2.5 // Assume 2.5 hours saved per listing
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const thisMonthListings = listings.filter(l => {
    const listingDate = new Date(l.createdAt)
    return listingDate.getMonth() === thisMonth && listingDate.getFullYear() === thisYear
  }).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header with Welcome Message */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back, Agent!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">Let's get more properties SOLD today 🚀</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/settings">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Link href="/listings/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                <Plus className="mr-2 h-4 w-4" />
                List New Property
              </Button>
            </Link>
          </div>
        </div>

        {/* Agent Success Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Time Saved This Month</p>
                  <p className="text-3xl font-bold">{Math.round(timeSaved)}hrs</p>
                  <p className="text-green-100 text-xs mt-1">
                    Worth $2,500+ in billable time
                  </p>
                </div>
                <Clock className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Listings This Month</p>
                  <p className="text-3xl font-bold">{thisMonthListings}</p>
                  <p className="text-blue-100 text-xs mt-1">
                    {thisMonthListings > 5 ? "Outstanding pace!" : "Keep it up!"}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Marketing Ready</p>
                  <p className="text-3xl font-bold">{stats.draftReady}</p>
                  <p className="text-purple-100 text-xs mt-1">
                    Ready for Trade Me & socials
                  </p>
                </div>
                <Zap className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Live Properties</p>
                  <p className="text-3xl font-bold">{stats.published}</p>
                  <p className="text-orange-100 text-xs mt-1">
                    Generating leads right now
                  </p>
                </div>
                <Target className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/listings/new">
                <Button variant="outline" className="h-20 flex flex-col gap-2 w-full">
                  <Plus className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">New Listing</span>
                </Button>
              </Link>
              
              {stats.created > 0 && (
                <Button variant="outline" className="h-20 flex flex-col gap-2 w-full" onClick={() => {
                  const firstDraft = listings.find(l => l.status === 'created')
                  if (firstDraft) window.location.href = `/listings/${firstDraft.id}`
                }}>
                  <Zap className="h-6 w-6 text-purple-600" />
                  <span className="text-sm">Generate Copy</span>
                </Button>
              )}
              
              {stats.draftReady > 0 && (
                <Button variant="outline" className="h-20 flex flex-col gap-2 w-full" onClick={() => {
                  const firstReady = listings.find(l => l.status === 'draft_ready')
                  if (firstReady) window.location.href = `/listings/${firstReady.id}`
                }}>
                  <Star className="h-6 w-6 text-orange-600" />
                  <span className="text-sm">Export & Publish</span>
                </Button>
              )}
              
              <Link href="/settings">
                <Button variant="outline" className="h-20 flex flex-col gap-2 w-full">
                  <Settings className="h-6 w-6 text-gray-600" />
                  <span className="text-sm">Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Your Properties - Professional View */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Your Property Portfolio</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and track all your listings in one place</p>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {stats.total} Properties
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading your portfolio...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to List Your First Property?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Get professional marketing content in under 2 minutes</p>
                <Link href="/listings/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Listing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {listings.map((listing, index) => {
                  const primaryImage = listing.images?.find(img => img.order === 0) || listing.images?.[0]
                  const statusInfo = {
                    'created': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', action: 'Generate Copy', urgent: true },
                    'draft_ready': { color: 'bg-blue-100 text-blue-800 border-blue-200', action: 'Ready to Export', urgent: false },
                    'published': { color: 'bg-green-100 text-green-800 border-green-200', action: 'Live & Active', urgent: false },
                  }[listing.status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', action: 'Unknown', urgent: false }
                  
                  return (
                    <div key={listing.id} className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${index === 0 ? '' : ''}`}>
                      <div className="flex items-center gap-6">
                        {/* Property Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 shadow-md">
                          {primaryImage ? (
                            <img
                              src={primaryImage.url}
                              alt={`${listing.address} property photo`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Property Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{listing.address}</h3>
                            {statusInfo.urgent && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full animate-pulse">
                                ACTION NEEDED
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">{listing.suburb}, {listing.city}</p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <span className="font-medium capitalize">{listing.propertyType}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{listing.bedrooms} bed • {listing.bathrooms} bath</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                            </div>
                            {listing.images && listing.images.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-blue-600 dark:text-blue-400 font-medium">{listing.images.length} photos</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Status & Actions */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge className={`${statusInfo.color} border font-medium px-3 py-1`}>
                              {statusInfo.action}
                            </Badge>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {listing.status === 'created' && 'Ready for AI generation'}
                              {listing.status === 'draft_ready' && 'Export to Trade Me/socials'}
                              {listing.status === 'published' && 'Generating leads'}
                            </p>
                          </div>
                          
                          <Link href={`/listings/${listing.id}`}>
                            <Button 
                              className={statusInfo.urgent ? 
                                "bg-blue-600 hover:bg-blue-700 text-white px-6" : 
                                "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 px-6"
                              }
                            >
                              {statusInfo.urgent ? (
                                <>
                                  <Zap className="h-4 w-4 mr-2" />
                                  Generate Now
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Manage
                                </>
                              )}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}