import { NextResponse } from 'next/server'
import { INDICATOR_LIST } from '@/lib/indicators'

export async function GET() {
  return NextResponse.json(INDICATOR_LIST)
}
