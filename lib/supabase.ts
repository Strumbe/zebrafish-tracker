import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvpwxmmnaqmzvkovsunt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cHd4bW1uYXFtenZrb3ZzdW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjMyMzgsImV4cCI6MjA1OTYzOTIzOH0.e8B48MG2VcsBqKsLoMi96eoJOw6gtiFOjX_1oZW8wCc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
