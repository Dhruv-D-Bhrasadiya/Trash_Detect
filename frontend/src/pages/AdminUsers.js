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
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  AdminPanelSettings,
  Block,
  CheckCircle,
  Person,
} from '@mui/icons-material';
import { adminAPI } from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    userId: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      await adminAPI.toggleUserActive(userId);
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, is_active: !user.is_active }
          : user
      ));
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      setError('Failed to update user status');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleMakeAdmin = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      await adminAPI.makeUserAdmin(userId);
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, is_superuser: true }
          : user
      ));
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch (error) {
      console.error('Failed to make user admin:', error);
      setError('Failed to make user admin');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const openConfirmDialog = (userId, username, isAdmin) => {
    setConfirmDialog({
      open: true,
      title: isAdmin ? 'Make User Admin' : 'Toggle User Status',
      message: isAdmin 
        ? `Are you sure you want to make ${username} an admin?`
        : `Are you sure you want to change ${username}'s status?`,
      action: isAdmin ? handleMakeAdmin : () => handleToggleActive(userId, users.find(u => u.id === userId)?.is_active),
      userId,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
        User Management
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage users, their status, and admin privileges.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Person sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {user.username}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.points}
                        color={user.points > 10 ? 'success' : user.points > 0 ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        color={user.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_superuser ? 'Admin' : 'User'}
                        color={user.is_superuser ? 'primary' : 'default'}
                        size="small"
                        icon={user.is_superuser ? <AdminPanelSettings /> : <Person />}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title={user.is_active ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            size="small"
                            onClick={() => openConfirmDialog(user.id, user.username, false)}
                            disabled={actionLoading[user.id]}
                          >
                            {user.is_active ? <Block /> : <CheckCircle />}
                          </IconButton>
                        </Tooltip>
                        
                        {!user.is_superuser && (
                          <Tooltip title="Make Admin">
                            <IconButton
                              size="small"
                              onClick={() => openConfirmDialog(user.id, user.username, true)}
                              disabled={actionLoading[user.id]}
                            >
                              <AdminPanelSettings />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button
            onClick={() => confirmDialog.action(confirmDialog.userId)}
            variant="contained"
            color="primary"
            disabled={actionLoading[confirmDialog.userId]}
          >
            {actionLoading[confirmDialog.userId] ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
