// app/api/admin/projects/route.ts
import { NextResponse } from 'next/server';
import { saveProject, SaveProjectData } from '@/lib/db/query/StudentProjectClaim';

export async function POST(request: Request) {
  try {
    const { 
      projectId, 
      projectName, 
      factoryAddress, 
      whitelistAddr, 
      nftAddr, 
      claimAddr, 
      erc20Addr 
    } = await request.json();

    // 验证必要字段
    if (!projectId || !projectName || !factoryAddress || !whitelistAddr || !nftAddr || !claimAddr) {
      return NextResponse.json(
        { success: false, error: '缺少必要的项目信息' },
        { status: 400 }
      );
    }

    const projectData: SaveProjectData = {
      projectId,
      projectName,
      factoryAddress,
      whitelistAddress: whitelistAddr,
      nftAddress: nftAddr,
      claimAddress: claimAddr,
      erc20Address: erc20Addr
    };

    const result = await saveProject(projectData);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || '保存项目失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('保存项目失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '服务器内部错误' 
      },
      { status: 500 }
    );
  }
}

// 可选：添加 GET 请求处理，获取所有项目
export async function GET() {
  try {
    const { getAllProjects } = await import('@/lib/db/query/StudentProjectClaim');
    const projects = await getAllProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error('获取项目列表失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '服务器内部错误' 
      },
      { status: 500 }
    );
  }
}