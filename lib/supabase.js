import { createClient } from '@supabase/supabase-js'

// Supabase bağlantı bilgileri
const supabaseUrl = process.https:wsqlbgodprcmaiplgqtn.supabase.co
const supabaseAnonKey = process.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcWxiZ29kcHJjbWFpcGxncXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTU1NTUsImV4cCI6MjA5Nzg3MTU1NX0.btkdtGQRsvYUZ6Dw8FNCoOopyEHoab44Ns2nUcSczAg

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
