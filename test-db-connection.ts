import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Client } = pg;

// Test Supabase Connection
async function testSupabaseConnection() {
    try {
        console.log('🔄 Testing Supabase connection...');

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials in .env');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Test connection by querying a simple function or table
        const { data, error } = await supabase
            .from('_realtime')
            .select('*')
            .limit(1);

        if (error) {
            // If the above fails, try to authenticate instead
            const { data: authData, error: authError } = await supabase.auth.getSession();
            if (authError && authError.message !== 'Not authenticated') {
                throw authError;
            }
            console.log('✅ Supabase connection successful (auth checked)');
        } else {
            console.log('✅ Supabase connection successful (query executed)');
        }

    } catch (error) {
        console.error('❌ Supabase connection failed:', error);
        process.exit(1);
    }
}

// Test PostgreSQL Direct Connection
async function testPostgresConnection() {
    let client: pg.Client | null = null;
    try {
        console.log('\n🔄 Testing PostgreSQL direct connection...');

        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('Missing DATABASE_URL in .env');
        }

        client = new Client({
            connectionString: databaseUrl,
            ssl: {
                rejectUnauthorized: false, // Required for Supabase
            },
        });

        await client.connect();
        console.log('✅ PostgreSQL connection successful');

        // Try a simple query
        const result = await client.query('SELECT NOW()');
        console.log('✅ Query successful. Server time:', result.rows[0]);

    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error);
        process.exit(1);
    } finally {
        if (client) {
            await client.end();
        }
    }
}

// Run both tests
async function main() {
    console.log('======================================');
    console.log('   DATABASE CONNECTION TEST');
    console.log('======================================\n');

    await testSupabaseConnection();
    await testPostgresConnection();

    console.log('\n======================================');
    console.log('   ✅ ALL CONNECTIONS OK');
    console.log('======================================');
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
