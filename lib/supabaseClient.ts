import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cvmuijvepicdvvikaaqz.supabase.co';
const supabaseKey = 'sb_publishable_O7QduuC6uRUITdygBU2N0w_RBIn0j0e';

export const supabase = createClient(supabaseUrl, supabaseKey);