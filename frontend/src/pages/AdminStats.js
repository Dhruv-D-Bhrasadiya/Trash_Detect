import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import {
  Assessment,
  PhotoCamera,
  TrendingUp,
  Person,
} from '@mui/icons-material';
import { adminAPI } from '../services/api';

const AdminStats = () => {
  const [globalStats, setGlobalStats] = useState(null);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, submissionsResponse] = await Promise.all([
        adminAPI.getGlobalStats(),
        adminAPI.getAllSubmissions(0, 100),
      ]);
      
      setGlobalStats(statsResponse.data);
      setAllSubmissions(submissionsResponse.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setError('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score > 0) return 'success';
    if (score < 0) return 'error';
    return 'default';
  };

  const getScoreIcon = (score) => {
    if (score > 0) return '🟢';
    if (score < 0) return '🔴';
    return '⚪';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
        System Statistics
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Detailed analytics and system performance metrics.
      </Typography>

      <Grid container spacing={3}>
        {/* Global Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {globalStats?.total_users || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PhotoCamera sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Submissions
                  </Typography>
                  <Typography variant="h4">
                    {globalStats?.total_submissions || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Detections
                  </Typography>
                  <Typography variant="h4">
                    {globalStats?.total_detections || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg per User
                  </Typography>
                  <Typography variant="h4">
                    {globalStats?.total_users > 0 ? Math.round(globalStats.total_submissions / globalStats.total_users) : 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Submissions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Submissions (Last 100)
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Detections</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allSubmissions.slice(0, 20).map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>#{submission.id}</TableCell>
                        <TableCell>{submission.owner?.username || 'Unknown'}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${getScoreIcon(submission.score)} ${submission.score > 0 ? '+' : ''}${submission.score}`}
                            color={getScoreColor(submission.score)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{submission.detections?.length || 0}</TableCell>
                        <TableCell>
                          {new Date(submission.timestamp).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {allSubmissions.length === 0 && (
                <Typography color="textSecondary" textAlign="center" py={4}>
                  No submissions found.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminStats;
