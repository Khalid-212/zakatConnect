import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    const amount = formData.get('amount') as string;

    if (!id || !status || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Update beneficiary status
    const { error: beneficiaryError } = await supabase
      .from('beneficiaries')
      .update({ status })
      .eq('id', id);

    if (beneficiaryError) {
      console.error('Error updating beneficiary status:', beneficiaryError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update beneficiary status',
        },
        { status: 500 }
      );
    }

    // Create distribution record
    const { error: distributionError } = await supabase.from('distributions').insert([
      {
        beneficiary_id: id,
        amount: parseFloat(amount),
        status: 'completed',
      },
    ]);

    if (distributionError) {
      console.error('Error creating distribution:', distributionError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create distribution record',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Beneficiary status and distribution updated successfully',
    });
  } catch (error) {
    console.error('Error in update-status route:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
