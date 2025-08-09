import { NextResponse } from 'next/server';
import { performMaintenance } from '@/lib/cleanup-sessions';

export async function POST() {
  try {
    const result = await performMaintenance();
    
    return NextResponse.json({
      message: 'Maintenance completed successfully',
      result
    });
  } catch (error) {
    console.error('Maintenance API error:', error);
    return NextResponse.json(
      { error: 'Maintenance failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await performMaintenance();
    
    return NextResponse.json({
      message: 'Maintenance completed successfully',
      result
    });
  } catch (error) {
    console.error('Maintenance API error:', error);
    return NextResponse.json(
      { error: 'Maintenance failed' },
      { status: 500 }
    );
  }
} 