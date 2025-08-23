"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info, Shield, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ComplianceIssue {
  type: 'error' | 'warning' | 'info'
  category: 'false_misleading' | 'unsubstantiated' | 'pricing' | 'disclosure' | 'general'
  message: string
  suggestion?: string
  field?: string
  severity: 'high' | 'medium' | 'low'
}

interface ComplianceResult {
  isCompliant: boolean
  issues: ComplianceIssue[]
  score: number
  summary: {
    errors: number
    warnings: number
    infos: number
  }
}

interface ComplianceResultsProps {
  result: {
    ai?: any
    compliance: ComplianceResult
    overall: {
      isValid: boolean
      canPublish: boolean
      combinedScore: number
    }
  }
  onClose: () => void
}

const getSeverityColor = (type: string, severity: string) => {
  if (type === 'error') return 'bg-red-50 border-red-200 text-red-800'
  if (type === 'warning') return 'bg-yellow-50 border-yellow-200 text-yellow-800'
  return 'bg-blue-50 border-blue-200 text-blue-800'
}

const getSeverityIcon = (type: string) => {
  if (type === 'error') return <AlertTriangle className="h-4 w-4" />
  if (type === 'warning') return <AlertTriangle className="h-4 w-4" />
  return <Info className="h-4 w-4" />
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'false_misleading': return 'False/Misleading'
    case 'unsubstantiated': return 'Unsubstantiated Claims'
    case 'pricing': return 'Pricing'
    case 'disclosure': return 'Disclosure'
    case 'general': return 'General'
    default: return category
  }
}

export function ComplianceResults({ result, onClose }: ComplianceResultsProps) {
  const { compliance, overall } = result

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Shield className={`h-6 w-6 ${compliance.isCompliant ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <h2 className="text-xl font-semibold">Fair Trading Act Compliance Check</h2>
              <p className="text-sm text-gray-600">
                Score: {compliance.score}/100 • {compliance.isCompliant ? 'Compliant' : 'Issues Found'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overall Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {overall.canPublish ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {overall.canPublish ? 'Ready to Publish' : 'Review Required'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Combined validation score: {overall.combinedScore}/100
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={compliance.summary.errors > 0 ? 'destructive' : 'secondary'}>
                    {compliance.summary.errors} Errors
                  </Badge>
                  <Badge variant={compliance.summary.warnings > 0 ? 'default' : 'secondary'}>
                    {compliance.summary.warnings} Warnings
                  </Badge>
                  <Badge variant="secondary">
                    {compliance.summary.infos} Info
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          {compliance.issues.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Compliance Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {compliance.issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getSeverityColor(issue.type, issue.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(issue.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm uppercase tracking-wide">
                            {issue.type}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(issue.category)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {issue.severity} priority
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{issue.message}</p>
                        {issue.suggestion && (
                          <div className="bg-white/50 p-2 rounded text-xs">
                            <strong>Suggestion:</strong> {issue.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Compliance Issues Found</h3>
                <p className="text-gray-600">
                  Your listing content appears to comply with NZ Fair Trading Act requirements.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Compliance Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">NZ Fair Trading Act Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">✅ Best Practices</h4>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li>• Use factual, descriptive language</li>
                    <li>• Support all claims with evidence</li>
                    <li>• Verify property information before publication</li>
                    <li>• Include required disclosures</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">❌ Avoid</h4>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li>• Unsubstantiated superlatives ("best", "perfect")</li>
                    <li>• False urgency ("won't last long")</li>
                    <li>• Investment guarantees</li>
                    <li>• Misleading comparisons</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Compliance validation helps ensure your listing meets NZ Fair Trading Act requirements
            </p>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}