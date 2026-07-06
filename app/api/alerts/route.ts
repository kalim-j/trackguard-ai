import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status'); // 'active' | 'resolved'
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('alerts')
      .select('*, animal_detections(*), train_positions(*)', { count: 'exact' });

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (status === 'resolved') {
      query = query.not('resolved_at', 'is', null);
    } else if (status === 'active') {
      query = query.is('resolved_at', null);
    }

    // Sort by fired_at descending
    query = query.order('fired_at', { ascending: false });
    
    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.warn('Supabase select alerts error:', error.message);
      return NextResponse.json({ alerts: [], count: 0 });
    }

    return NextResponse.json({
      alerts: data || [],
      count: count || 0
    });
  } catch (err: any) {
    console.error('Error in alerts API route (GET):', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, resolved_by, false_alarm, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    const updatePayload: any = {
      resolved_at: new Date().toISOString(),
      resolved_by: resolved_by || null,
      false_alarm: !!false_alarm,
      notes: notes || 'Resolved via dashboard.'
    };

    const { data, error } = await supabase
      .from('alerts')
      .update(updatePayload)
      .eq('id', id)
      .select('*, animal_detections(*), train_positions(*)')
      .single();

    if (error) {
      console.error('Supabase update alert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also update the corresponding animal_detection status to 'cleared' if it was resolved
    if (data && data.detection_id) {
      await supabase
        .from('animal_detections')
        .update({ 
          status: false_alarm ? 'false_alarm' : 'cleared',
          cleared_at: new Date().toISOString()
        })
        .eq('id', data.detection_id);
    }

    return NextResponse.json({ success: true, alert: data });
  } catch (err: any) {
    console.error('Error in alerts API route (PATCH):', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
