import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
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
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const RecruiterDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    interviewDate: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesData, applicationsData, statsData] = await Promise.all([
        api.recruiterAPI.getCandidates(),
        api.recruiterAPI.getApplications(),
        api.recruiterAPI.getStats()
      ]);
      setCandidates(candidatesData);
      setApplications(applicationsData);
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleUpdateApplication = (app) => {
    setSelectedApp(app);
    setUpdateData({
      status: app.status,
      interviewDate: app.interviewDate || '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleSubmitUpdate = async () => {
    try {
      await api.recruiterAPI.updateApplication(selectedApp._id, updateData);
      setOpenDialog(false);
      fetchData();
    } catch (err) {
      setError('Failed to update application');
    }
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
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Recruiter Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage candidates and applications
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Candidates
                  </Typography>
                  <Typography variant="h4">{stats.totalCandidates || 0}</Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Applications
                  </Typography>
                  <Typography variant="h4">{applications.length}</Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Interviews
                  </Typography>
                  <Typography variant="h4">{stats.interviews || 0}</Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Offers
                  </Typography>
                  <Typography variant="h4">{stats.offers || 0}</Typography>
                </Box>
                <CheckIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Applications" />
          <Tab label="Candidates" />
        </Tabs>
      </Paper>

      {/* Applications Table */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No applications assigned</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
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
                    <TableCell>
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleUpdateApplication(app)}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Candidates List */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          {candidates.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                No candidates assigned yet
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {candidates.map((candidate) => (
                <Grid item xs={12} md={6} key={candidate._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{candidate.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {candidate.email}
                      </Typography>
                      {candidate.resume && (
                        <Box mt={2}>
                          <Typography variant="caption" color="text.secondary">
                            Skills: {candidate.resume.skills?.join(', ') || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Update Application Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          {selectedApp && (
            <>
              <Typography variant="body2" gutterBottom>
                <strong>Candidate:</strong> {selectedApp.user?.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Position:</strong> {selectedApp.position} at {selectedApp.company}
              </Typography>
              
              <TextField
                fullWidth
                select
                label="Status"
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                margin="normal"
              >
                <MenuItem value="applied">Applied</MenuItem>
                <MenuItem value="screening">Screening</MenuItem>
                <MenuItem value="interview">Interview</MenuItem>
                <MenuItem value="offer">Offer</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>

              {updateData.status === 'interview' && (
                <TextField
                  fullWidth
                  label="Interview Date"
                  type="datetime-local"
                  value={updateData.interviewDate}
                  onChange={(e) => setUpdateData({ ...updateData, interviewDate: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              )}

              <TextField
                fullWidth
                label="Notes"
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                margin="normal"
                multiline
                rows={3}
                placeholder="Add notes about this update..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RecruiterDashboard;
