import AdminDashboard from '@/components/features/admin/AdminDashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_mainLayout/admin/')({
  component: AdminDashboard,
});
