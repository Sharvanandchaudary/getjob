import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const UserDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, interview: 0, offer: 0 });
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openResumeDialog, setOpenResumeDialog] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'applied',
    appliedDate: new Date().toISOString().split('T')[0],
    jobUrl: '',
    notes: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await api.applicationsAPI.getAll();
      setApplications(data);
      calculateStats(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load applications');
      setLoading(false);
    }
  };

  const calculateStats = (apps) => {
    setStats({
      total: apps.length,
      pending: apps.filter(a => a.status === 'applied' || a.status === 'screening').length,
      interview: apps.filter(a => a.status === 'interview').length,
      offer: apps.filter(a => a.status === 'offer' || a.status === 'accepted').length
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await api.applicationsAPI.create(formData);
      setOpenDialog(false);
      setFormData({
        company: '',
        position: '',
        status: 'applied',
        appliedDate: new Date().toISOString().split('T')[0],
        jobUrl: '',
        notes: ''
      });
      fetchApplications();
    } catch (err) {
      setError('Failed to create application');
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      await api.aiAPI.analyzeResume(formData);
      setOpenResumeDialog(false);
      setResumeFile(null);
      alert('Resume uploaded and analyzed successfully!');
    } catch (err) {
      setError('Failed to upload resume');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.applicationsAPI.delete(id);
        fetchApplications();
      } catch (err) {
        setError('Failed to delete application');
      }
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
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and manage your job applications
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
                    Total Applications
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
                <WorkIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Pending
                  </Typography>
                  <Typography variant="h4">{stats.pending}</Typography>
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
                    Interviews
                  </Typography>
                  <Typography variant="h4">{stats.interview}</Typography>
                </Box>
                <BusinessIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
                  <Typography variant="h4">{stats.offer}</Typography>
                </Box>
                <CheckIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Application
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => setOpenResumeDialog(true)}
        >
          Upload Resume
        </Button>
      </Box>

      {/* Applications List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          My Applications
        </Typography>
        
        {applications.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No applications yet. Click "Add Application" to get started!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {applications.map((app) => (
              <Grid item xs={12} key={app._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="h6">{app.position}</Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          {app.company}
                        </Typography>
                        <Box display="flex" gap={1} alignItems="center" mt={1}>
                          <Chip
                            label={app.status}
                            color={getStatusColor(app.status)}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Applied: {new Date(app.appliedDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {app.notes && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {app.notes}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <IconButton size="small" color="error" onClick={() => handleDelete(app._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Add Application Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Application</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            margin="normal"
          >
            <MenuItem value="applied">Applied</MenuItem>
            <MenuItem value="screening">Screening</MenuItem>
            <MenuItem value="interview">Interview</MenuItem>
            <MenuItem value="offer">Offer</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Applied Date"
            name="appliedDate"
            type="date"
            value={formData.appliedDate}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Job URL (optional)"
            name="jobUrl"
            value={formData.jobUrl}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes (optional)"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add Application</Button>
        </DialogActions>
      </Dialog>

      {/* Resume Upload Dialog */}
      <Dialog open={openResumeDialog} onClose={() => setOpenResumeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Resume</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Upload your resume (PDF only) for AI-powered job matching
          </Typography>
          <Box mt={2}>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              style={{ display: 'block', margin: '10px 0' }}
            />
            {resumeFile && (
              <Typography variant="caption" color="success.main">
                Selected: {resumeFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResumeDialog(false)}>Cancel</Button>
          <Button onClick={handleResumeUpload} variant="contained" disabled={!resumeFile}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDashboard;
