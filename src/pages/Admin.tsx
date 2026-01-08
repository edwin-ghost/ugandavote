import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  CreditCard,
  LogOut,
  Phone,
  Wallet,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import {
  getAdminUsers,
  reconcileMpesa,
} from '@/lib/api';

/* ---------------------------------- */
/* HELPERS */
/* ---------------------------------- */
const formatCurrency = (amount: number) =>
  `UGX ${amount.toLocaleString()}`;

/* ---------------------------------- */
/* COMPONENT */
/* ---------------------------------- */
export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [reconciling, setReconciling] = useState(false);

  /* ---------------------------------- */
  /* LOGIN */
  /* ---------------------------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (username === 'Museveni' && password === 'Museveni2026') {
        setIsAuthenticated(true);
        toast.success('Welcome to Admin Center');
        loadUsers();
      } else {
        toast.error('Invalid credentials');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setUsers([]);
    toast.success('Logged out successfully');
  };

  /* ---------------------------------- */
  /* LOAD USERS */
  /* ---------------------------------- */
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await getAdminUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  /* ---------------------------------- */
  /* MPESA RECONCILE */
  /* ---------------------------------- */
  const handleReconcile = async () => {
    try {
      setReconciling(true);
      await reconcileMpesa();
      toast.success('MPESA pending transactions reconciled');
    } catch (err) {
      toast.error('Failed to reconcile MPESA');
    } finally {
      setReconciling(false);
    }
  };

  /* ---------------------------------- */
  /* LOGIN SCREEN */
  /* ---------------------------------- */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-uganda-yellow to-uganda-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-2xl font-bold">Admin Center</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-uganda-yellow to-uganda-red text-black font-bold py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  'Login to Admin'
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------------------------------- */
  /* DASHBOARD */
  /* ---------------------------------- */
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-uganda-yellow to-uganda-red rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Admin Center</h1>
              <p className="text-xs text-muted-foreground">
                Uganda Elections 2026
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="mpesa">
              <CreditCard className="w-4 h-4 mr-2" />
              MPESA
            </TabsTrigger>
          </TabsList>

          {/* USERS TAB */}
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="p-4 border-b border-border flex justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-uganda-yellow" />
                  Registered Users
                </h2>
                <span className="text-sm text-muted-foreground">
                  {users.length} users
                </span>
              </div>

              {loadingUsers ? (
                <p className="p-4 text-muted-foreground">Loading users…</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Phone className="inline w-4 h-4 mr-2" />
                        Phone
                      </TableHead>
                      <TableHead>
                        <Wallet className="inline w-4 h-4 mr-2" />
                        Balance
                      </TableHead>
                      <TableHead>
                        <Calendar className="inline w-4 h-4 mr-2" />
                        Created
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono">
                          {u.phone}
                        </TableCell>
                        <TableCell className="font-semibold text-uganda-yellow">
                          {formatCurrency(u.balance)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </motion.div>
          </TabsContent>

          {/* MPESA TAB */}
          <TabsContent value="mpesa">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-uganda-yellow" />
                MPESA Maintenance
              </h2>

              <Button
                variant="outline"
                onClick={handleReconcile}
                disabled={reconciling}
                className="gap-2"
              >
                {reconciling ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Reconcile Pending Transactions
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
