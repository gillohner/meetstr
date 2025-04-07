// src/components/NostrEventCreation/LanguageSwitcher.tsx
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { RequireLogin } from '../NostrLogin';

function CreateCalendarForm() {
    const { i18n } = useTranslation();
    
    return (
        <RequireLogin>
            <Box                 
                sx={{
                my: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                }}
            >
                <Button variant="contained" color="primary" onClick={() => alert('Create Calendar')}>
                    {i18n.t('createCalendar.createCalendar')}
                </Button>
            </Box>
        </RequireLogin>
    )
}

export default CreateCalendarForm;