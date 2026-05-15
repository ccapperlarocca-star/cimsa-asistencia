import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://upoaikjedvebihkgxumk.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwb2Fpa2plZHZlYmloa2d4dW1rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc3MDQ3NywiZXhwIjoyMDk0MzQ2NDc3fQ.Xqmr_8gPJ_ztEDmUkIe6HnREqNxUHmHFE9DXKBLtwRU";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);