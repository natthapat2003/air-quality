import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vcexcnuspetktmrvnngj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZXhjbnVzcGV0a3RtcnZubmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTQ3OTUsImV4cCI6MjA4NzQzMDc5NX0.gr1TRGtvLDCrW-EuJ3vIXqnlKtJzUMH74UVHbq7NKDY'

export const supabase = createClient(supabaseUrl, supabaseKey)