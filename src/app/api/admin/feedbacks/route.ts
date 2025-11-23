import { isAdmin } from '@/lib/admin';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/feedbacks - List all feedbacks (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verify admin
    const userIsAdmin = await isAdmin(user.id);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let query = supabase.from('feedbacks').select('*').order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: feedbacks, error } = await query;

    if (error) {
      console.error('Error fetching feedbacks:', error);
      return NextResponse.json({ error: 'Erro ao carregar feedbacks' }, { status: 500 });
    }

    // Get user data from auth.users for each feedback
    const feedbacksWithUsers = await Promise.all(
      (feedbacks || []).map(async (feedback) => {
        const { data: authUser } = await supabase.auth.admin.getUserById(feedback.user_id);
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('display_name, avatar_url')
          .eq('id', feedback.user_id)
          .single();

        return {
          ...feedback,
          users: {
            email: authUser?.user?.email || '',
            display_name: profile?.display_name || null,
            avatar_url: profile?.avatar_url || null,
          },
        };
      })
    );

    return NextResponse.json({ feedbacks: feedbacksWithUsers }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/admin/feedbacks:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PATCH /api/admin/feedbacks - Update feedback status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verify admin
    const userIsAdmin = await isAdmin(user.id);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { feedbackId, status } = body;

    if (!feedbackId || !status) {
      return NextResponse.json({ error: 'feedbackId e status são obrigatórios' }, { status: 400 });
    }

    if (!['pending', 'in_review', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const { data, error } = await supabase.from('feedbacks').update({ status }).eq('id', feedbackId).select().single();

    if (error) {
      console.error('Error updating feedback:', error);
      return NextResponse.json({ error: 'Erro ao atualizar feedback' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        feedback: data,
        message: 'Feedback atualizado com sucesso',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/admin/feedbacks:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
