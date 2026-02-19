import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { user: { select: { email: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <p className="text-sm text-muted-foreground mb-4">Last 200 admin actions</p>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/50">
            <tr>
              <th className="text-left py-2 px-3">Time</th>
              <th className="text-left py-2 px-3">User</th>
              <th className="text-left py-2 px-3">Action</th>
              <th className="text-left py-2 px-3">Entity</th>
              <th className="text-left py-2 px-3 hidden lg:table-cell">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id} className="border-t hover:bg-accent/30">
                <td className="py-2 px-3 text-xs whitespace-nowrap">
                  {log.createdAt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-2 px-3 text-xs">{log.user.email}</td>
                <td className="py-2 px-3">
                  <Badge variant={
                    log.action === 'CREATE' ? 'default' :
                    log.action === 'UPDATE' ? 'secondary' :
                    log.action === 'DELETE' ? 'destructive' : 'outline'
                  }>
                    {log.action}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-xs">
                  {log.entityType}
                  {log.entityId && <span className="text-muted-foreground ml-1">({log.entityId.slice(0, 8)}...)</span>}
                </td>
                <td className="py-2 px-3 text-xs hidden lg:table-cell max-w-xs truncate">
                  {log.details || '—'}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No audit logs</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
