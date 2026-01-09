import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  CreditCard,
  LogOut,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
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
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  getAdminUsers,
  adminAddBalance,
  reconcileMpesa,
  getElections,
  addElection,
  updateElection,
  deleteElection,
  addCandidate,
  updateCandidate,
  deleteCandidate,
} from '@/lib/api';

const formatCurrency = (amount: number) => `UGX ${amount.toLocaleString()}`;

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // USERS
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [addingBalance, setAddingBalance] = useState(false);

  // MPESA
  const [reconciling, setReconciling] = useState(false);

  // ELECTIONS
  const [elections, setElections] = useState<any[]>([]);
  const [loadingElections, setLoadingElections] = useState(false);
  const [electionDialog, setElectionDialog] = useState<any | null>(null);
  const [electionData, setElectionData] = useState({
    id: '',
    title: '',
    constituency: '',
    type: 'presidential',
  });

  // CANDIDATES
  const [candidateDialog, setCandidateDialog] = useState<any | null>(null);
  const [candidateData, setCandidateData] = useState<{
    id?: number;
    name: string;
    party: string;
    odds: number;
    image: string;
    election_id: string;
  }>({
    id: undefined,
    name: '',
    party: '',
    odds: 1.5,
    image: '',
    election_id: '',
  });

  // LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (username === 'Museveni' && password === 'Museveni2026') {
        setIsAuthenticated(true);
        toast.success('Welcome to Admin Center');
        loadUsers();
        loadElections();
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
    setElections([]);
    toast.success('Logged out successfully');
  };

  // LOAD USERS
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await getAdminUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // ADD BALANCE
  const handleAddBalance = async () => {
    if (!selectedUser || !amountToAdd) return;
    try {
      setAddingBalance(true);
      await adminAddBalance(selectedUser.id, Number(amountToAdd));
      toast.success('Balance added successfully');
      setSelectedUser(null);
      setAmountToAdd('');
      loadUsers();
    } catch (err) {
      toast.error('Failed to add balance');
      console.error(err);
    } finally {
      setAddingBalance(false);
    }
  };

  // MPESA RECONCILE
  const handleReconcile = async () => {
    try {
      setReconciling(true);
      await reconcileMpesa();
      toast.success('MPESA pending transactions reconciled');
    } catch (err) {
      toast.error('Failed to reconcile MPESA');
      console.error(err);
    } finally {
      setReconciling(false);
    }
  };

  // LOAD ELECTIONS
  const loadElections = async () => {
    try {
      setLoadingElections(true);
      const res = await getElections();
      const electionsWithCandidates = res.data.map((e: any) => ({
        ...e,
        candidates: e.candidates || [],
      }));
      setElections(electionsWithCandidates);
    } catch (err) {
      toast.error('Failed to load elections');
      console.error(err);
    } finally {
      setLoadingElections(false);
    }
  };

  // ELECTION CRUD
  const openAddElection = () => {
    setElectionDialog({ type: 'add' });
    setElectionData({
      id: '',
      title: '',
      constituency: '',
      type: 'presidential',
    });
  };

  const openEditElection = (election: any) => {
    setElectionDialog({ type: 'edit', election });
    setElectionData({
      id: election.id,
      title: election.title,
      constituency: election.constituency,
      type: election.type,
    });
  };

  const handleSaveElection = async () => {
    try {
      if (electionDialog?.type === 'add') {
        await addElection(electionData);
        toast.success('Election added successfully');
      } else if (electionDialog?.type === 'edit') {
        await updateElection(electionData.id, electionData);
        toast.success('Election updated successfully');
      }
      setElectionDialog(null);
      loadElections();
    } catch (err) {
      toast.error('Failed to save election');
      console.error(err);
    }
  };

  const handleDeleteElection = async (id: string) => {
    if (!confirm('Are you sure? This will delete all candidates too.')) return;
    try {
      await deleteElection(id);
      toast.success('Election deleted successfully');
      loadElections();
    } catch (err) {
      toast.error('Failed to delete election');
      console.error(err);
    }
  };

  // CANDIDATE CRUD
  const openAddCandidate = (election_id: string) => {
    setCandidateDialog({ type: 'add', election_id });
    setCandidateData({
      id: undefined,
      name: '',
      party: '',
      odds: 1.5,
      image: '',
      election_id,
    });
  };

  const openEditCandidate = (candidate: any, election_id: string) => {
    setCandidateDialog({ type: 'edit', candidate });
    setCandidateData({ ...candidate, election_id });
  };

  const handleSaveCandidate = async () => {
    try {
      if (candidateDialog?.type === 'add') {
        await addCandidate(candidateData);
        toast.success('Candidate added successfully');
      } else if (candidateDialog?.type === 'edit' && candidateData.id) {
        await updateCandidate(candidateData.id, candidateData);
        toast.success('Candidate updated successfully');
      }
      setCandidateDialog(null);
      loadElections();
    } catch (err) {
      toast.error('Failed to save candidate');
      console.error(err);
    }
  };

  const handleDeleteCandidate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await deleteCandidate(id);
      toast.success('Candidate deleted successfully');
      loadElections();
    } catch (err) {
      toast.error('Failed to delete candidate');
      console.error(err);
    }
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-uganda-yellow" />
              <h1 className="text-2xl font-bold">Admin Center</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Uganda Elections 2026
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full bg-uganda-yellow hover:bg-uganda-yellow/90">
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Shield className="w-8 h-8 text-uganda-yellow" />
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
        <Tabs defaultValue="elections">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="elections">
              <Shield className="w-4 h-4 mr-2" />
              Elections
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="mpesa">
              <CreditCard className="w-4 h-4 mr-2" />
              MPESA
            </TabsTrigger>
          </TabsList>

          {/* ELECTIONS TAB */}
          <TabsContent value="elections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Elections</h2>
              <Button onClick={openAddElection}>
                <Plus className="w-4 h-4 mr-2" />
                Add Election
              </Button>
            </div>

            {loadingElections ? (
              <div className="text-center py-8">Loading elections...</div>
            ) : elections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No elections found. Create your first election.
              </div>
            ) : (
              elections.map((election) => (
                <div key={election.id} className="bg-card border rounded-xl overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                    <div>
                      <h3 className="font-semibold text-lg">{election.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {election.constituency} • {election.type}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditElection(election)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAddCandidate(election.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Candidate
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteElection(election.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {(election.candidates || []).length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No candidates yet. Add candidates to this election.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Party</TableHead>
                          <TableHead>Odds</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {election.candidates.map((c: any) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell>{c.party}</TableCell>
                            <TableCell className="text-uganda-yellow font-semibold">
                              {c.odds.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {c.image ? (
                                <img
                                  src={c.image}
                                  alt={c.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs">
                                  No img
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditCandidate(c, election.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCandidate(c.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-lg">Registered Users</h2>
                <Button size="sm" variant="outline" onClick={loadUsers}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              {loadingUsers ? (
                <div className="p-8 text-center">Loading users...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono">{u.phone}</TableCell>
                        <TableCell className="text-uganda-yellow font-semibold">
                          {formatCurrency(u.balance)}
                        </TableCell>
                        <TableCell>
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(u)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Balance
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* MPESA TAB */}
          <TabsContent value="mpesa">
            <div className="bg-card border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">MPESA Management</h2>
              <Button
                variant="outline"
                onClick={handleReconcile}
                disabled={reconciling}
                className="gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${reconciling ? 'animate-spin' : ''}`}
                />
                Reconcile Pending Transactions
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ADD BALANCE MODAL */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Balance to {selectedUser?.phone}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Amount (UGX)"
              value={amountToAdd}
              onChange={(e) => setAmountToAdd(e.target.value)}
            />
            <Button onClick={handleAddBalance} disabled={addingBalance} className="w-full">
              {addingBalance ? 'Processing...' : 'Add Balance'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD/EDIT ELECTION MODAL */}
      <Dialog
        open={!!electionDialog}
        onOpenChange={() => setElectionDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {electionDialog?.type === 'add' ? 'Add Election' : 'Edit Election'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Election ID (e.g., presidential-2026)"
              value={electionData.id}
              onChange={(e) =>
                setElectionData({ ...electionData, id: e.target.value })
              }
              disabled={electionDialog?.type === 'edit'}
            />
            <Input
              placeholder="Title (e.g., Presidential Election 2026)"
              value={electionData.title}
              onChange={(e) =>
                setElectionData({ ...electionData, title: e.target.value })
              }
            />
            <Input
              placeholder="Constituency (e.g., National)"
              value={electionData.constituency}
              onChange={(e) =>
                setElectionData({ ...electionData, constituency: e.target.value })
              }
            />
            <Select
              value={electionData.type}
              onValueChange={(value) =>
                setElectionData({ ...electionData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presidential">Presidential</SelectItem>
                <SelectItem value="parliamentary">Parliamentary</SelectItem>
                <SelectItem value="gubernatorial">Gubernatorial</SelectItem>
                <SelectItem value="special">Special Seats</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSaveElection} className="w-full">
              {electionDialog?.type === 'add' ? 'Add Election' : 'Update Election'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD/EDIT CANDIDATE MODAL */}
      <Dialog
        open={!!candidateDialog}
        onOpenChange={() => setCandidateDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {candidateDialog?.type === 'add' ? 'Add Candidate' : 'Edit Candidate'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Full Name"
              value={candidateData.name}
              onChange={(e) =>
                setCandidateData({ ...candidateData, name: e.target.value })
              }
            />
            <Input
              placeholder="Party (e.g., NRM, NUP, FDC)"
              value={candidateData.party}
              onChange={(e) =>
                setCandidateData({ ...candidateData, party: e.target.value })
              }
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Odds (e.g., 1.45)"
              value={candidateData.odds}
              onChange={(e) =>
                setCandidateData({ ...candidateData, odds: Number(e.target.value) })
              }
            />
            <Input
              placeholder="Image URL"
              value={candidateData.image}
              onChange={(e) =>
                setCandidateData({ ...candidateData, image: e.target.value })
              }
            />
            <Button onClick={handleSaveCandidate} className="w-full">
              {candidateDialog?.type === 'add' ? 'Add Candidate' : 'Update Candidate'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}