// src/app/calendar/[id]/page.tsx
"use client";
import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CalendarOverview from '@/features/calendar/components/CalendarOverview';
import { useParams } from 'next/navigation';

export default function Calendar() {
    const params = useParams();
    const id = params?.id; // Access the dynamic route parameter
  
    return (
        <Container maxWidth="lg">
            <Box
                sx={{
                    my: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <CalendarOverview calendarId={id} />
            </Box>
        </Container>
    );
}
