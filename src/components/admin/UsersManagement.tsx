import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { 
  getAllUsers, 
  updateUserRole, 
  updateUserActiveStatus, 
  sendNotification,
  UserWithStats 
} from "@/utils/admin";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, ShieldAlert, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UsersManagement = () => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messagingOpen, setMessagingOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [action, setAction] = useState<string>("");
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();

  // Load users when component mounts
  useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log("Loading users...");
        setLoading(true);
        const allUsers = await getAllUsers();
        console.log("Users loaded:", allUsers.length);
        setUsers(allUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [t]);

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    if (!isAdmin || !user) return;

    try {
      await updateUserRole(userId, newRole);
      
      // Update the local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
      
      toast.success(t("admin.settingsUpdated"));
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(t("common.error"));
    } finally {
      setActionDialogOpen(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (userId: string, isActive: boolean) => {
    if (!isAdmin || !user) return;

    try {
      await updateUserActiveStatus(userId, isActive);
      
      // Update the local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, is_active: isActive } : u
        )
      );
      
      toast.success(t("admin.settingsUpdated"));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t("common.error"));
    } finally {
      setActionDialogOpen(false);
    }
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!isAdmin || !user || !selectedUser) return;

    if (!messageTitle.trim() || !messageContent.trim()) {
      toast.error(t("common.error"));
      return;
    }

    try {
      await sendNotification(selectedUser.id, messageTitle, messageContent);
      toast.success(t("admin.messageSent"));
      setMessageTitle("");
      setMessageContent("");
      setMessagingOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(t("common.error"));
    }
  };

  const confirmAction = (user: UserWithStats, actionType: string) => {
    setSelectedUser(user);
    setAction(actionType);
    setActionDialogOpen(true);
  };

  const openMessageDialog = (user: UserWithStats) => {
    setSelectedUser(user);
    setMessagingOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-deep" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User List</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            User List
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User Stats</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No Users
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.role === 'ADMIN' ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            Role: Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Role: User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Total URLs: {user.urls_count}</div>
                          <div>Total Clicks: {user.total_clicks}</div>
                          <div>Last Activity: {user.last_activity ? format(new Date(user.last_activity), 'PP') : '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {user.role === 'USER' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => confirmAction(user, 'setAdmin')}
                              className="text-xs"
                            >
                              <ShieldAlert className="h-3 w-3 mr-1" />
                              Set Admin
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => confirmAction(user, 'setUser')}
                              className="text-xs"
                            >
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Set User
                            </Button>
                          )}
                          
                          {user.is_active ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => confirmAction(user, 'disable')}
                              className="text-xs border-alert-red text-alert-red hover:bg-alert-red/10"
                            >
                              <UserX className="h-3 w-3 mr-1" />
                              Disable User
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => confirmAction(user, 'enable')}
                              className="text-xs"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Enable User
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openMessageDialog(user)}
                            className="text-xs"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Send Message
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action confirmation dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'setAdmin' && "Set Admin"}
              {action === 'setUser' && "Set User"}
              {action === 'disable' && "Disable User"}
              {action === 'enable' && "Enable User"}
            </DialogTitle>
            <DialogDescription>
              {action === 'disable' && "Are you sure you want to disable this user?"}
              {action === 'enable' && "Are you sure you want to enable this user?"}
              {(action === 'setAdmin' || action === 'setUser') && 
                `Edit User: ${selectedUser?.email}`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedUser) {
                  if (action === 'setAdmin') {
                    handleRoleChange(selectedUser.id, 'ADMIN');
                  } else if (action === 'setUser') {
                    handleRoleChange(selectedUser.id, 'USER');
                  } else if (action === 'disable') {
                    handleStatusChange(selectedUser.id, false);
                  } else if (action === 'enable') {
                    handleStatusChange(selectedUser.id, true);
                  }
                }
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message dialog */}
      <Dialog open={messagingOpen} onOpenChange={setMessagingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send Message: {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title">Message Title</label>
              <Input 
                id="title" 
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="Message Title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message">Message Content</label>
              <Textarea 
                id="message" 
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Message Content"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessagingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
