import { getAllUsers, toggleUserRole } from '@/lib/admin';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const users = await getAllUsers(user.id);

    if (users === null) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PATCH /api/admin/users - Toggle user role (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    try {
      const updatedUser = await toggleUserRole(user.id, userId);

      if (updatedUser === null) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }

      return NextResponse.json(
        {
          success: true,
          user: updatedUser,
          message: 'Permissões atualizadas com sucesso',
        },
        { status: 200 }
      );
    } catch (error: any) {
      if (error.message === 'Cannot modify your own role') {
        return NextResponse.json({ error: 'Você não pode modificar suas próprias permissões' }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in PATCH /api/admin/users:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
