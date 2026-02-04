import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Missing Supabase credentials in environment variables',
                    connected: false
                },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Try to get the session to verify connection
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        // Also try a simple database query
        const { data: testData, error: queryError } = await supabase
            .from('_realtime')
            .select('*')
            .limit(1)
            .maybeSingle();

        if (queryError && queryError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" which is fine
            throw queryError;
        }

        return NextResponse.json(
            {
                status: 'success',
                connected: true,
                message: 'Database connection is active',
                timestamp: new Date().toISOString(),
                supabase: {
                    url: supabaseUrl,
                    connected: true,
                },
            },
            { status: 200 }
        );

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            {
                status: 'error',
                connected: false,
                message: 'Failed to connect to database',
                error: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
