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

    const noteLines: string[] = []
    if (hasPlusOne) {
      noteLines.push(`Plus-one: ${String(plusOneName).trim()}`)
    } else {
      noteLines.push('Plus-one: No (guest only)')
    }
    if (receivingNotes && String(receivingNotes).trim() !== '') {
      noteLines.push(`Receiving / seating / meals: ${String(receivingNotes).trim()}`)
    }
    const notes = noteLines.length > 0 ? noteLines.join('\n') : null

    // Requires a nullable `notes` text column on `attendees` in Supabase.
    const { data, error } = await supabase
      .from('attendees')
      .insert([
        { 
          full_name: fullName, 
          phone: phone || null, 
          relation: relation,
          status: 'attending',
          notes,
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
