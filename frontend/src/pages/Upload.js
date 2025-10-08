import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { PhotoCamera, CloudUpload, CheckCircle } from '@mui/icons-material';
import { uploadAPI } from '../services/api';

const Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const response = await uploadAPI.uploadImage(file);
      setUploadResult(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: uploading,
  });

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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Image for Detection
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Upload an image to detect trash and bins. You'll earn points based on what's detected:
        <br />
        • +1 point: Both trash and bin detected
        <br />
        • -1 point: Trash detected but no bin
        <br />
        • 0 points: Bin only or nothing detected
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Area
              </Typography>
              
              <Paper
                {...getRootProps()}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    backgroundColor: uploading ? 'background.paper' : 'action.hover',
                  },
                }}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <Box>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography>Processing image...</Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                    </Typography>
                    <Typography color="textSecondary">
                      or click to select a file
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                      Supports: JPEG, PNG, GIF, BMP, WebP
                    </Typography>
                  </Box>
                )}
              </Paper>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          {uploadResult && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detection Results
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="h5">
                    Score: 
                    <Chip
                      label={`${getScoreIcon(uploadResult.results.score)} ${uploadResult.results.score > 0 ? '+' : ''}${uploadResult.results.score}`}
                      color={getScoreColor(uploadResult.results.score)}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>

                <Typography variant="body1" gutterBottom>
                  {uploadResult.results.summary}
                </Typography>

                {uploadResult.results.detections.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="h6" gutterBottom>
                      Detected Items ({uploadResult.results.detections.length})
                    </Typography>
                    <List dense>
                      {uploadResult.results.detections.map((detection, index) => (
                        <ListItem key={index} divider>
                          <ListItemText
                            primary={detection.label}
                            secondary={`Confidence: ${(detection.confidence * 100).toFixed(1)}%`}
                          />
                          <Chip
                            label={`${(detection.confidence * 100).toFixed(1)}%`}
                            size="small"
                            color={detection.confidence > 0.8 ? 'success' : detection.confidence > 0.5 ? 'warning' : 'error'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Submission ID: {uploadResult.submission_id}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Upload;
