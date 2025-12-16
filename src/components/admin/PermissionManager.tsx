"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

interface Permission { id: number; name: string }
interface UserPermission { id: number; userId: string; permissionId: number; grant: string; resourceType?: string | null; resourceId?: string | null; permission?: Permission }

export default function PermissionManager({ userId, userName, isOpen, onClose }: { userId: string; userName: string; isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [grants, setGrants] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const perms = await api.get<Permission[]>('/api/admin/permissions')
      const userPerms = await api.get<UserPermission[]>(`/api/admin/user-permissions?userId=${encodeURIComponent(userId)}`)
      // Only surface `*.manage` permissions in this UI. `manage` implies view/create/read/update/delete.
      const manageOnly = (perms || []).filter((p) => p.name.endsWith('.manage') || p.name === 'permissions.manage')
      setPermissions(manageOnly)
      setGrants(userPerms || [])
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Error', description: 'Failed to load permissions', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && userId) fetchData()
  }, [isOpen, userId])

  const findGrant = (permId: number) => grants.find((g) => g.permissionId === permId && !g.resourceType && !g.resourceId)
  const isGranted = (permId: number) => !!findGrant(permId) && findGrant(permId)!.grant === 'ALLOW'

  // Group permissions by category (prefix before first dot)
  const grouped = permissions.reduce((acc: Record<string, Permission[]>, p) => {
    const [cat] = p.name.split('.')
    const key = cat || 'general'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  const formatPermissionLabel = (name: string) => {
    // e.g. 'courses.create' -> 'Courses: Create'
    const parts = name.split('.')
    if (parts.length === 1) return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    const [res, action, ...rest] = parts
    const resource = res.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    const actionLabel = (action ? action : rest.join(' ')).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return `${resource}: ${actionLabel}`
  }

  const toggleGrant = async (perm: Permission) => {
    try {
      const existing = findGrant(perm.id)
      if (existing) {
        await api.del(`/api/admin/user-permissions/${existing.id}`)
        setGrants((s) => s.filter((g) => g.id !== existing.id))
        toast({ title: 'Revoked', description: `${perm.name} revoked for ${userName}` })
      } else {
        const created = await api.post<UserPermission>('/api/admin/user-permissions', { userId, permissionName: perm.name, grant: 'ALLOW' })
        setGrants((s) => [...s, created])
        toast({ title: 'Granted', description: `${perm.name} granted to ${userName}` })
      }
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Error', description: err?.data?.message || 'Failed to update grant', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permissions for {userName}</DialogTitle>
          <DialogDescription>Grant or revoke global permissions for this user.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3 max-h-[60vh] overflow-auto pr-2">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {Object.keys(grouped).length === 0 && (
                <div className="text-sm text-gray-500">No permissions defined.</div>
              )}
              {Object.entries(grouped).map(([category, perms]) => (
                <div key={category} className="p-3 border rounded">
                  <div className="mb-3 font-semibold text-sm text-gray-700">{category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perms.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-white border rounded">
                        <div>
                          <div className="font-medium">{formatPermissionLabel(p.name)}</div>
                          <div className="text-xs text-muted-foreground">{p.name}</div>
                        </div>
                        <div>
                          <Button size="sm" onClick={() => toggleGrant(p)}>{isGranted(p.id) ? 'Revoke' : 'Grant'}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
