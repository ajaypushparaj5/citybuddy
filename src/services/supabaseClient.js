import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a single supabase client for interacting with your database
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// Helper to save city data into Supabase (Phase 1 Database Persistence)
export async function saveCityToDatabase(cityName, data) {
    if (!supabase) {
        console.warn("Supabase not configured. Skipping database save.");
        return null;
    }

    try {
        // 1. Create City Entry
        const { data: cityRecord, error: cityError } = await supabase
            .from('cities')
            .insert({
                name: cityName,
                center_lat: data.center[1],
                center_lon: data.center[0]
            })
            .select()
            .single();

        if (cityError) throw cityError;

        // We would normally bulk insert Nodes and Edges here, 
        // but for vast networks we'd use Edge functions or batched chunk inserts.
        // Console log for now to confirm successful connection.
        console.log("Successfully created city record in Supabase:", cityRecord.id);
        return cityRecord.id;

    } catch (error) {
        console.error("Error saving to Supabase:", error);
        return null;
    }
}
