import { redirect } from 'next/navigation'

export default function DashboardIndex() {
  // default to summary
  redirect('/dashboard/summary')
}
