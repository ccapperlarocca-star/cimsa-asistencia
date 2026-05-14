import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://upoaikjedvebihkgxumk.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwb2Fpa2plZHZlYmloa2d4dW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzA0NzcsImV4cCI6MjA5NDM0NjQ3N30.7fgjVU4pQ-tyifUIK7kvhRHnfy3qyUlAeHUle1INQBU";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);