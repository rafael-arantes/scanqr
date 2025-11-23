import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { category, message } = body;

    // Validate inputs
    if (!category || !message) {
      return NextResponse.json({ error: 'Categoria e mensagem são obrigatórios' }, { status: 400 });
    }

    if (!['bug', 'suggestion', 'praise', 'other'].includes(category)) {
      return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: 'Mensagem deve ter pelo menos 10 caracteres' }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: 'Mensagem não pode exceder 1000 caracteres' }, { status: 400 });
    }

    // Insert feedback into database
    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        user_id: user.id,
        category,
        message: message.trim(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      return NextResponse.json({ error: 'Erro ao enviar feedback' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        feedback: data,
        message: 'Feedback enviado com sucesso!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
