import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SyncHistoryEntry } from '@/types/municipality';
import { format } from 'date-fns';

interface SyncHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: SyncHistoryEntry[];
  integrationName: string;
}

export function SyncHistoryDialog({ open, onOpenChange, history, integrationName }: SyncHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Sync History - {integrationName}</DialogTitle>
        </DialogHeader>
        
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No sync history available</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sync Time</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(new Date(entry.syncTime), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell className="font-medium text-status-approved">
                    +{entry.permitsCreated}
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {entry.permitsUpdated}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={entry.status === 'success' ? 'default' : entry.status === 'partial' ? 'secondary' : 'destructive'}
                    >
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.errors?.join(', ') || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
