import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, phone, relation } = body

    if (!fullName || !relation) {
      return NextResponse.json(
        { error: 'Full Name and Relation to Couple are required fields.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('attendees')
      .insert([
        { 
          full_name: fullName, 
          phone: phone || null, 
          relation: relation,
          status: 'attending' 
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, attendee: data })
  } catch (err: any) {
    console.error('RSVP API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
