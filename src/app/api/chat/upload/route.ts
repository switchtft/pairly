import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!file || !sessionId) {
      return NextResponse.json(
        { error: 'File and session ID are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Only image and video files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Verify user has access to this session
    const session = await prisma.session.findFirst({
      where: {
        id: parseInt(sessionId),
        OR: [
          { clientId: decoded.userId },
          { proTeammateId: decoded.userId },
        ],
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    // In a real application, you would upload the file to a cloud storage service
    // For now, we'll just generate a placeholder URL
    const fileUrl = `/api/files/${decoded.userId}-${Date.now()}-${file.name}`;

    // Create chat file record
    const chatFile = await prisma.chatFile.create({
      data: {
        sessionId: parseInt(sessionId),
        uploadedBy: decoded.userId,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        fileType: file.type,
      },
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      data: {
        id: chatFile.id,
        fileName: chatFile.fileName,
        fileUrl: chatFile.fileUrl,
        fileSize: chatFile.fileSize,
        fileType: chatFile.fileType,
        uploadedAt: chatFile.createdAt,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 