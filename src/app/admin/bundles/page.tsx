"use client";
import dynamic from "next/dynamic";

const BundleManagement = dynamic(() => import("@/components/admin/BundleManagement"), { ssr: false });

export default function AdminBundlesPage() {
  return <BundleManagement />;
}
