// STUB FILE - Supabase has been removed
// This file exists to prevent import errors from components that haven't been fully migrated
// TODO: Migrate remaining components to use server API

console.warn('⚠️ Supabase stub file loaded. Components using this should be migrated to use server API.');

// Mock Supabase client that returns empty data
const supabaseStub = {
    from: (table) => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase has been removed. Use server API instead.' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase has been removed. Use server API instead.' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase has been removed. Use server API instead.' } }),
        eq: () => supabaseStub.from(table),
        or: () => supabaseStub.from(table),
        match: () => supabaseStub.from(table),
        order: () => supabaseStub.from(table),
        single: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Use /api/auth/login instead' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Use /api/auth/register instead' } }),
        signOut: () => Promise.resolve({ error: null }),
    },
    storage: {
        from: () => ({
            upload: () => Promise.resolve({ data: null, error: { message: 'File upload needs migration' } }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
    },
    channel: () => ({
        on: () => supabaseStub.channel(),
        subscribe: () => { },
        unsubscribe: () => { },
    }),
};

export const supabaseUrl = '';
export default supabaseStub;
