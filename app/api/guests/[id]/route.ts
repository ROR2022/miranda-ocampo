import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/models/Guest';
import mongoose from 'mongoose';

// GET - Obtener invitado específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de invitado inválido' 
        },
        { status: 400 }
      );
    }
    
    const guest = await Guest.findById(id);
    
    if (!guest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invitado no encontrado' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: guest
    });
    
  } catch (error) {
    console.error('❌ Error getting guest:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener el invitado' 
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar invitado
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    
    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de invitado inválido' 
        },
        { status: 400 }
      );
    }
    
    // Verificar que el invitado existe
    const existingGuest = await Guest.findById(id);
    if (!existingGuest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invitado no encontrado' 
        },
        { status: 404 }
      );
    }
    
    // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
    if (body.name && body.name.trim() !== existingGuest.name) {
      const duplicateGuest = await Guest.findOne({ 
        name: { $regex: `^${body.name.trim()}$`, $options: 'i' },
        _id: { $ne: id }
      });
      
      if (duplicateGuest) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Ya existe otro invitado con ese nombre' 
          },
          { status: 400 }
        );
      }
    }
    
    // Actualizar el invitado
    const updatedGuest = await Guest.findByIdAndUpdate(
      id,
      { 
        ...body,
        updatedAt: new Date()
      },
      { 
        new: true, // Retornar el documento actualizado
        runValidators: true // Ejecutar validaciones del esquema
      }
    );
    
    console.log('✅ Guest updated successfully:', updatedGuest?.name);
    
    return NextResponse.json({
      success: true,
      data: updatedGuest,
      message: 'Invitado actualizado exitosamente'
    });
    
  } catch (error: unknown) {
    console.error('❌ Error updating guest:', error);
    
    // Manejar errores de validación de Mongoose
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const mongooseError = error as unknown as { errors: Record<string, { message: string }> };
      const validationErrors = Object.values(mongooseError.errors).map((err) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Errores de validación',
          details: validationErrors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar el invitado' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar invitado
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de invitado inválido' 
        },
        { status: 400 }
      );
    }
    
    // Verificar que el invitado existe y eliminarlo
    const deletedGuest = await Guest.findByIdAndDelete(id);
    
    if (!deletedGuest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invitado no encontrado' 
        },
        { status: 404 }
      );
    }
    
    console.log('✅ Guest deleted successfully:', deletedGuest.name);
    
    return NextResponse.json({
      success: true,
      data: deletedGuest,
      message: 'Invitado eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error deleting guest:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al eliminar el invitado' 
      },
      { status: 500 }
    );
  }
}
