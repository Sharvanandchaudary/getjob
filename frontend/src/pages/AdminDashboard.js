import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import api from '../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRecruiter, setSelectedRecruiter] = useState('');
  const [recruiters, setRecruiters] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, appsData, analyticsData, recruitersData] = await Promise.all([
        api.adminAPI.getUsers(),
        api.adminAPI.getApplications(),
        api.adminAPI.getAnalytics(),
        api.adminAPI.getRecruiters()
      ]);
      setUsers(usersData);
      setApplications(appsData);
      setAnalytics(analyticsData);
      setRecruiters(recruitersData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleAssignCandidate = async () => {
    try {
      await api.adminAPI.assignCandidate({
        userId: selectedUser._id,
        recruiterId: selectedRecruiter
      });
      setOpenAssignDialog(false);
      alert('Candidate assigned successfully!');
      fetchData();
    } catch (err) {
      setError('Failed to assign candidate');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.adminAPI.deleteUser(userId);
        fetchData();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleSyncSheets = async () => {
    try {
      await api.adminAPI.syncSheets();
      alert('Data synced to Google Sheets successfully!');
    } catch (err) {
      setError('Failed to sync to Google Sheets');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = { admin: 'error', recruiter: 'primary', user: 'default' };
    return colors[role] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'info',
      screening: 'warning',
      interview: 'primary',
      offer: 'success',
      accepted: 'success',
      rejected: 'error'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            System overview and management
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<SyncIcon />}
          onClick={handleSyncSheets}
        >
          Sync to Sheets
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4">{users.length}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {users.filter(u => u.role === 'user').length} job seekers
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Applications
                  </Typography>
                  <Typography variant="h4">{applications.length}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {applications.filter(a => a.status === 'interview').length} interviews
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Success Rate
                  </Typography>
                  <Typography variant="h4">
                    {analytics.successRate ? `${analytics.successRate}%` : '0%'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {applications.filter(a => a.status === 'accepted').length} accepted
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Users" />
          <Tab label="Applications" />
          <Tab label="Recruiters" />
        </Tabs>
      </Paper>

      {/* Users Table */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleBadgeColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.role === 'user' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenAssignDialog(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        Assign
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Applications Table */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recruiter</TableCell>
                <TableCell>Applied Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell>{app.user?.name || 'N/A'}</TableCell>
                  <TableCell>{app.company}</TableCell>
                  <TableCell>{app.position}</TableCell>
                  <TableCell>
                    <Chip
                      label={app.status}
                      color={getStatusColor(app.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{app.assignedRecruiter?.name || 'Unassigned'}</TableCell>
                  <TableCell>
                    {new Date(app.appliedDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Recruiters Table */}
      {tabValue === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Assigned Candidates</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recruiters.map((recruiter) => (
                <TableRow key={recruiter._id}>
                  <TableCell>{recruiter.name}</TableCell>
                  <TableCell>{recruiter.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={recruiter.assignedCandidates?.length || 0}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(recruiter.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Assign Candidate Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Candidate to Recruiter</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <>
              <Typography variant="body2" gutterBottom>
                <strong>Candidate:</strong> {selectedUser.name} ({selectedUser.email})
              </Typography>
              
              <TextField
                fullWidth
                select
                label="Select Recruiter"
                value={selectedRecruiter}
                onChange={(e) => setSelectedRecruiter(e.target.value)}
                margin="normal"
              >
                {recruiters.map((recruiter) => (
                  <MenuItem key={recruiter._id} value={recruiter._id}>
                    {recruiter.name} - {recruiter.assignedCandidates?.length || 0} candidates
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignCandidate} variant="contained" disabled={!selectedRecruiter}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
