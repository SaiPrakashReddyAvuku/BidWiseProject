"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function AdminUsersPage() {
  const users = useBidWiseStore((state) => state.users);
  const blockUser = useBidWiseStore((state) => state.blockUser);
  const verifyVendor = useBidWiseStore((state) => state.verifyVendor);

  return (
    <RoleGuard role="admin">
      <Card>
        <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.blocked ? <Badge variant="danger">Blocked</Badge> : <Badge variant="success">Active</Badge>}
                    {user.role === "seller" ? <Badge className="ml-2" variant={user.verified ? "success" : "secondary"}>{user.verified ? "Verified" : "Unverified"}</Badge> : null}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => blockUser(user.id)}>Block</Button>
                    {user.role === "seller" ? <Button size="sm" onClick={() => verifyVendor(user.id)}>Verify vendor</Button> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </RoleGuard>
  );
}


