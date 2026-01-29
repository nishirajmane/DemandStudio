"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Copy, Check } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ApiKey {
  id: string
  name: string
  key: string
  lastUsed: string | null
  createdAt: string
  expiresAt: string | null
  active: boolean
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyExpires, setNewKeyExpires] = useState("")
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys")
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          expiresInDays: newKeyExpires ? parseInt(newKeyExpires) : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCreatedKey(data.data.key)
        setNewKeyName("")
        setNewKeyExpires("")
        setShowCreateDialog(false)
        fetchApiKeys()
      } else {
        alert("Failed to create API key")
      }
    } catch (error) {
      console.error("Error creating API key:", error)
      alert("An error occurred")
    }
  }

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchApiKeys()
      } else {
        alert("Failed to delete API key")
      }
    } catch (error) {
      console.error("Error deleting API key:", error)
      alert("An error occurred")
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      })

      if (response.ok) {
        fetchApiKeys()
      } else {
        alert("Failed to update API key")
      }
    } catch (error) {
      console.error("Error updating API key:", error)
      alert("An error occurred")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-gray-600 mt-2">
            Manage your API keys for accessing the CMS API
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      {createdKey && (
        <Card className="mb-6 border-green-500">
          <CardHeader>
            <CardTitle className="text-green-700">API Key Created!</CardTitle>
            <CardDescription>
              Save this key securely - it won't be shown again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
                {createdKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(createdKey)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              className="mt-4"
              onClick={() => setCreatedKey(null)}
            >
              I've saved the key
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Use these keys to authenticate API requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : apiKeys.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No API keys found. Create your first API key to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="text-xs">{key.key}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={key.active ? "default" : "secondary"}>
                        {key.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {key.lastUsed
                        ? format(new Date(key.lastUsed), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(key.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {key.expiresAt
                        ? format(new Date(key.expiresAt), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(key.id, key.active)}
                        >
                          {key.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key to access the CMS API
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Key Name</Label>
              <Input
                id="name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API Key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires">Expires In (days, optional)</Label>
              <Input
                id="expires"
                type="number"
                value={newKeyExpires}
                onChange={(e) => setNewKeyExpires(e.target.value)}
                placeholder="Leave empty for no expiration"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey} disabled={!newKeyName}>
                Create Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

