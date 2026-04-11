import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, phone, relation, plusOne, plusOneName, receivingNotes } = body

    if (!fullName || !relation) {
      return NextResponse.json(
        { error: 'Full Name and Relation to Couple are required fields.' },
        { status: 400 }
      )
    }

    const hasPlusOne = plusOne === true || plusOne === 'yes'
    if (hasPlusOne && (!plusOneName || String(plusOneName).trim() === '')) {
      return NextResponse.json(
        { error: 'Please enter your plus-one\'s name so we can plan seats and meals.' },
        { status: 400 }
      )
    }

    const receiving = receivingNotes && String(receivingNotes).trim() !== ''
      ? String(receivingNotes).trim()
      : null

    // Columns: plus_one, plus_one_name, receiving_notes, party_leader_id — see supabase/migrations/
    const { data, error } = await supabase
      .from('attendees')
      .insert([
        {
          full_name: fullName,
          phone: phone || null,
          relation: relation,
          status: 'attending',
          plus_one: hasPlusOne,
          plus_one_name: hasPlusOne ? String(plusOneName).trim() : null,
          receiving_notes: receiving,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (hasPlusOne) {
      const guestName = String(plusOneName).trim()
      const { data: plusRow, error: plusErr } = await supabase
        .from('attendees')
        .insert([
          {
            full_name: guestName,
            phone: phone || null,
            relation: `Plus-one (with ${fullName})`,
            status: 'attending',
            plus_one: false,
            plus_one_name: null,
            receiving_notes: null,
            party_leader_id: data.id,
          },
        ])
        .select()
        .single()

      if (plusErr) {
        console.error('Supabase plus-one error:', plusErr)
        await supabase.from('attendees').delete().eq('id', data.id)
        return NextResponse.json({ error: plusErr.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        attendee: data,
        plusOneAttendee: plusRow,
      })
    }

    return NextResponse.json({ success: true, attendee: data })
  } catch (err: any) {
    console.error('RSVP API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
