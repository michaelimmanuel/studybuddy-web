# 🧩 Bundles & Purchases Frontend Implementation Guide

This guide explains how to implement the Bundle & Purchase UI using the existing API documented in `studybuddy-server/docs/bundles-and-purchases-api.md`.

## 🔍 Overview
You now have:
- Bundle CRUD endpoints (admin)
- Package attach/detach to bundle (admin)
- Purchase endpoints (user)
- Access check endpoint (user)

Frontend tasks split into admin + user experiences.

---
## 📁 Folder Structure (Proposed Additions)
```
src/
  components/
    bundles/
      BundleList.tsx
      BundleCard.tsx
      BundleDetail.tsx
      PurchaseButton.tsx
    admin/
      BundleManagement.tsx        // already created
      modals/
        CreateBundleModal.tsx     // created (extend to include package selection)
        EditBundleModal.tsx        // to create
        DeleteBundleModal.tsx      // to create
        ManageBundlePackagesModal.tsx // to create
  app/
    bundles/
      page.tsx            // user-facing list
      [id]/
        page.tsx          // user-facing bundle detail
```

---
## 🧪 Types Recap
From `@/types` you already have:
- `Bundle`, `BundleStats`, `BundlePackageRef`
- `GetBundlesResponse`, `GetBundleByIdResponse`
- `PurchaseBundleResponse`, `PurchasePackageResponse`
- `CheckPackageAccessResponse`

Add (optional) helper types:
```ts
export interface BundleWithAccess extends Bundle { hasAccess?: boolean }
```

---
## 🔐 Auth Pattern
All requests must send session cookies. Your `api` helper already sets `credentials: 'include'`.

---
## ⚙️ API Helper Usage
```ts
import { api } from '@/lib/api';

// List bundles
const { data } = await api.get<GetBundlesResponse>('/api/bundles');

// Get bundle
const bundle = await api.get<GetBundleByIdResponse>(`/api/bundles/${id}`);

// Create bundle (admin)
await api.post('/api/bundles', { title, price });

// Attach packages
await api.post(`/api/bundles/${bundleId}/packages`, { packageIds });

// Purchase bundle
await api.post('/api/purchases/bundle', { bundleId });

// Check package access
await api.get<CheckPackageAccessResponse>(`/api/purchases/package/${packageId}/access`);
```

---
## 🛠 Admin: Bundle Management Features
| Feature | Component | Notes |
|---------|-----------|-------|
| Create bundle | `CreateBundleModal` | After success refetch bundles |
| Edit bundle | `EditBundleModal` | Fields: title, price, discount, availability, isActive |
| Delete bundle | `DeleteBundleModal` | Confirm irreversible |
| Attach packages | `ManageBundlePackagesModal` | Show list of active packages with checkboxes |
| Show savings | In table | Use `bundle.stats` |

### ManageBundlePackagesModal (Outline)
```tsx
// Pseudocode
function ManageBundlePackagesModal({ bundle, open, onClose, onUpdated }) {
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [selected, setSelected] = useState<string[]>(bundle.bundlePackages?.map(bp => bp.packageId) || []);
  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(p => p!==id) : [...prev, id]);

  useEffect(() => { api.get<GetPackagesResponse>('/api/packages').then(r => setAllPackages(r.data)); }, []);

  const save = async () => {
    // Determine diffs
    const existing = new Set(bundle.bundlePackages?.map(bp => bp.packageId));
    const toAdd = selected.filter(id => !existing.has(id));
    const toRemove = [...existing].filter(id => !selected.includes(id));
    if (toAdd.length) await api.post(`/api/bundles/${bundle.id}/packages`, { packageIds: toAdd });
    if (toRemove.length) await api.del(`/api/bundles/${bundle.id}/packages`, { packageIds: toRemove });
    onUpdated();
  };

  return <Modal /* render list with checkboxes + Save */ />;
}
```

---
## 🧾 User: Bundle List
`BundleList.tsx` responsibilities:
- Fetch `/api/bundles`
- Display title, description, price, savings badge
- Link to `/bundles/[id]`

```tsx
function BundleCard({ bundle }: { bundle: Bundle }) {
  const savingsPct = bundle.stats?.savingsPercentage;
  return (
    <div className="border rounded p-4 flex flex-col">
      <h3 className="font-semibold text-lg">{bundle.title}</h3>
      {bundle.description && <p className="text-sm text-gray-600 line-clamp-2">{bundle.description}</p>}
      <div className="mt-2 font-mono text-blue-600">{formatIDR(bundle.price)}</div>
      {savingsPct && savingsPct > 0 && (
        <span className="mt-1 inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
          Save {savingsPct}%
        </span>
      )}
      <a href={`/bundles/${bundle.id}`} className="mt-auto text-sm text-blue-600 hover:underline">View Details →</a>
    </div>
  );
}
```

---
## 🔍 User: Bundle Detail
`/bundles/[id]/page.tsx` logic:
1. Fetch bundle
2. Render included packages & aggregate stats
3. Show purchase button (disabled if owned)
4. Possibly show per-package access check later

Pseudo-hook:
```ts
function useBundle(id: string) {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ api.get<GetBundleByIdResponse>(`/api/bundles/${id}`).then(r=> setBundle(r.data)).finally(()=>setLoading(false)); }, [id]);
  return { bundle, loading };
}
```

---
## 🛒 Unified PurchaseButton
Supports package or bundle purchase.
```tsx
interface PurchaseButtonProps {
  kind: 'package' | 'bundle';
  id: string;
  onPurchased?: () => void;
}

export function PurchaseButton({ kind, id, onPurchased }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClick = async () => {
    setLoading(true); setError(null);
    try {
      if (kind === 'bundle') await api.post('/api/purchases/bundle', { bundleId: id });
      else await api.post('/api/purchases/package', { packageId: id });
      setSuccess(true);
      onPurchased?.();
    } catch (e: any) {
      setError(e?.data?.message || e.message || 'Purchase failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="mt-4">
      <button onClick={handleClick} disabled={loading || success} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
        {success ? 'Purchased ✔' : loading ? 'Processing...' : 'Purchase'}
      </button>
      {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
    </div>
  );
}
```

---
## 🛡 Access Guard (Optional)
Protect pages needing package access.
```tsx
export function withPackageAccess(Component: React.ComponentType<any>, packageIdProp: string) {
  return function Wrapped(props: any) {
    const packageId = props[packageIdProp];
    const [allowed, setAllowed] = useState<boolean | null>(null);
    useEffect(()=>{
      api.get<CheckPackageAccessResponse>(`/api/purchases/package/${packageId}/access`)
        .then(r=> setAllowed(r.data.hasAccess))
        .catch(()=> setAllowed(false));
    }, [packageId]);

    if (allowed === null) return <div>Checking access...</div>;
    if (!allowed) return <div>You need to purchase this package.</div>;
    return <Component {...props} />;
  };
}
```

---
## 🔄 State Refresh Strategy
| Action | Refresh Needed |
|--------|----------------|
| Create bundle | Refetch `/api/bundles` |
| Edit bundle | Refetch `/api/bundles` and specific `/api/bundles/:id` if open |
| Attach/detach packages | Refetch `/api/bundles/:id` |
| Purchase bundle | Refetch purchases + maybe cached bundle detail |
| Purchase package | Refetch purchases + package access check |

---
## 🧪 Minimal Test Checklist
| Scenario | Expectation |
|----------|-------------|
| Bundle list loads | Displays titles and prices |
| Create bundle | Appears in list with correct price |
| Attach package | Bundle stats update (packagesCount) |
| Purchase bundle | Button switches to Purchased ✔ |
| Access check after bundle purchase | All contained packages accessible |

---
## 🚀 Incremental Build Order
1. Finish admin: add edit & manage packages modal
2. Implement user bundle list & detail
3. Add purchase button
4. Add access guard for protected content
5. Polish: loading skeletons, error toasts, savings badges, filtering

---
## 🧭 Extensibility Hooks
| Future Feature | Where to Extend |
|----------------|-----------------|
| Expiring access | Add `expiresAt` display & countdown in PurchaseButton |
| Coupons | Add `couponCode` field to purchase calls |
| Analytics | Wrap calls with tracking (e.g. Segment) |
| Bundle recommendations | Add endpoint, render below bundle detail |

---
## ❗ Common Pitfalls
| Issue | Fix |
|-------|-----|
| Forgetting cookies | Ensure `api` keeps `credentials: 'include'` |
| Double-purchase error | Disable button after success |
| Stale stats after attach | Refetch bundle detail after modifying contents |
| SSR vs client | Place dynamic admin components inside client components |

---
## ✅ Done
You can now script AI prompts like: *"Generate a React component that lists bundles using GetBundlesResponse and renders BundleCard with purchase buttons."*

Let me know when you’d like the actual user-facing components scaffolded.
