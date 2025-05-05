// src/components/NostrEventCreation/CreateCalendarForm.tsx
import { useState, useCallback } from 'react';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { useNdk } from 'nostr-hooks';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import { RequireLogin } from '@/components/NostrLogin';
import { useTranslation } from 'react-i18next';

export default function CreateCalendarForm() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [calendarRefs, setCalendarRefs] = useState([]);
  const [currentRef, setCurrentRef] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // New state for error messages

  const { ndk } = useNdk();

  // Add a calendar reference when pressing Enter
  const handleRefKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const value = currentRef.trim();
        if (!value) return;

        setCalendarRefs((prev) => [...prev, value]);
        setCurrentRef('');
      }
    },
    [currentRef]
  );

  // Remove a calendar reference
  const handleDeleteRef = useCallback((index) => {
    setCalendarRefs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handle publishing the event
  const handlePublish = useCallback(() => {
    if (!title.trim() || !description.trim()) {
      setErrorMessage(t('createCalendar.error.requiredFields')); // Show error for missing fields
      return;
    }

    const event = new NDKEvent(ndk);

    // Set content to description (as per NIP-52)
    event.content = description;

    // Set kind to NIP-52 calendar kind (31924)
    event.kind = 31924;

    // Populate tags according to NIP-52
    event.tags = [
      ['title', title], // Title tag
      ['summary', description], // Description as summary tag
    ];

    // Add image URL if provided
    if (imageUrl.trim()) {
      event.tags.push(['image', imageUrl]);
    }

    // Add calendar references as "a" tags
    calendarRefs.forEach((ref) => {
      event.tags.push(['a', ref]);
    });
    
    try {
      event.publish();
    } catch (error) {
      console.error('Error publishing event:', error);
      setErrorMessage(t('createCalendar.error.publishFailed')); // Show error for publishing failure
      return;
    }
        
    // Reset form fields
    setTitle('');
    setDescription('');
    setImageUrl('');
    setCalendarRefs([]);
  }, [title, description, imageUrl, calendarRefs, ndk]);

  return (
    <RequireLogin>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 900, minWidth: 600, mt: 4 }}>
        <Box component="form" noValidate sx={{ mt: 3, mb: 2 }}>
          {/* Error Message */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Title Input */}
          <Grid item sx={{ mb: 2 }}>
            <TextField
              required
              fullWidth
              label={t('createCalendar.titleInput.label')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Grid>

          {/* Description Input */}
          <Grid item sx={{ mb: 2 }}>
            <TextField
              required
              fullWidth
              label={t('createCalendar.descriptionInput.label')}
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>

          {/* Image URL Input */}
          <Grid item sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={t('createCalendar.imgUrlInput.label')}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Grid>

          {/* Calendar References Input */}
          <Grid item sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={t('createCalendar.calendarReferencesInput.label')}
              value={currentRef}
              onChange={(e) => setCurrentRef(e.target.value)}
              onKeyDown={handleRefKeyDown}
              placeholder={t('createCalendar.calendarReferencesInput.placeholder')}
              helperText={t('createCalendar.calendarReferencesInput.helperText')}
              sx={{ mb: 2 }}
            />

            {/* Display Reference Chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {calendarRefs.map((ref, index) => (
                <Chip
                  key={index}
                  label={ref}
                  onDelete={() => handleDeleteRef(index)}
                  color="primary"
                  sx={{ my: 0.5 }}
                />
              ))}
            </Box>
          </Grid>

          {/* Publish Button */}
          <Grid item sx={{ mb: 2 }}>
            <Button variant="contained" color="primary" size="large" onClick={handlePublish}>
              {t('createCalendar.publish')}
            </Button>
          </Grid>
        </Box>
      </Paper>
    </RequireLogin>
  );
}
