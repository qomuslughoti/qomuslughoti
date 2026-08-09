import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from('words').select('meaning_id, image_url, audio_url').limit(5);
  return NextResponse.json(data);
}
