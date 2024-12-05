import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const handleUrlRedirect = async (identifier) => {
  try {
    const { data: clauseData, error: clauseError } = await supabase
      .from('free_services')
      .select('original_url')
      .eq('clause', identifier)
      .single();

    if (clauseError && clauseError.code !== 'PGRST116') {
      throw clauseError;
    }

    if (clauseData) {
      return clauseData.original_url;
    }

    const { data: shortCodeData, error: shortCodeError } = await supabase
      .from('free_services')
      .select('original_url')
      .eq('short_code', identifier)
      .single();

    if (shortCodeError && shortCodeError.code !== 'PGRST116') {
      throw shortCodeError;
    }

    if (shortCodeData) {
      return shortCodeData.original_url;
    }

    // If no URL found
    return null;
  } catch (error) {
    console.error('Redirect Error:', error);
    return null;
  }
};