import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  EmojiEvents,
  Person,
  Star,
  TrendingUp,
} from '@mui/icons-material';
import { leaderboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, [tabValue]);

  const fetchLeaderboard = async () => {
    try {
      const limit = tabValue === 0 ? 10 : 50; // Top 10 or Top 50
      const response = await leaderboardAPI.getLeaderboard(limit);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <EmojiEvents sx={{ color: '#FFD700' }} />;
      case 2:
        return <EmojiEvents sx={{ color: '#C0C0C0' }} />;
      case 3:
        return <EmojiEvents sx={{ color: '#CD7F32' }} />;
      default:
        return <Typography variant="h6" color="textSecondary">#{rank}</Typography>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return 'default';
    }
  };

  const getPointsColor = (points) => {
    if (points >= 50) return 'success';
    if (points >= 20) return 'warning';
    if (points >= 10) return 'info';
    return 'default';
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
        🏆 Leaderboard
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        See how you rank against other users in the trash detection challenge!
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          centered
        >
          <Tab label="Top 10" />
          <Tab label="Top 50" />
        </Tabs>
      </Paper>

      <Card>
        <CardContent>
          {leaderboard.length === 0 ? (
            <Typography color="textSecondary" textAlign="center" py={4}>
              No users found. Be the first to upload an image!
            </Typography>
          ) : (
            <List>
              {leaderboard.map((user, index) => (
                <ListItem
                  key={user.username}
                  sx={{
                    backgroundColor: user.username === user?.username ? 'action.selected' : 'transparent',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    {getRankIcon(user.rank)}
                  </ListItemIcon>
                  
                  <Avatar
                    sx={{
                      mr: 2,
                      backgroundColor: user.username === user?.username ? 'primary.main' : 'grey.400',
                    }}
                  >
                    <Person />
                  </Avatar>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6">
                          {user.username}
                          {user.username === user?.username && (
                            <Chip
                              label="You"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        {user.rank <= 3 && (
                          <Star sx={{ color: getRankColor(user.rank), fontSize: 20 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <TrendingUp sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {user.points} points
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Chip
                    label={`${user.points} pts`}
                    color={getPointsColor(user.points)}
                    variant={user.username === user?.username ? 'filled' : 'outlined'}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Box mt={3}>
        <Typography variant="body2" color="textSecondary" textAlign="center">
          Keep uploading images to improve your rank! 🚀
        </Typography>
      </Box>
    </Box>
  );
};

export default Leaderboard;
