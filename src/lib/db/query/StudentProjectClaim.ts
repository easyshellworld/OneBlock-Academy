// lib/db/query/StudentProjectClaim.ts
import prisma from '@/lib/db'

export interface Project {
  id: number;
  project_id: string;
  project_name: string | null;
  factory_address: string | null;
  whitelist_address: string | null;
  nft_address: string | null;
  claim_address: string | null;
  erc20_address: string | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface StudentProjectClaim {
  id: number;
  student_id: string;
  student_name: string | null;
  project_id: string;
  project_name: string | null;
  nft_address: string | null;
  claim_address: string | null;
  erc20_address: string | null;
  has_claimed: boolean;
  created_at: Date;
  updated_at: Date | null;
}

export interface DeleteResult {
  success: boolean;
  message: string;
  changes?: number;
  error?: Error;
}

export interface SaveProjectData {
  projectId: string;
  projectName: string;
  factoryAddress: string;
  whitelistAddress: string;
  nftAddress: string;
  claimAddress: string;
  erc20Address: string;
}

// 定义包含关联数据的类型
interface StudentProjectClaimWithRegistration {
  id: number;
  student_id: string;
  project_id: string;
  project_name: string | null;
  nft_address: string | null;
  claim_address: string | null;
  erc20_address: string | null;
  has_claimed: boolean;
  created_at: Date;
  updated_at: Date | null;
  registration: {
    student_name: string | null;
  };
}

// 保存或更新项目（upsert操作）
export async function saveProject(data: SaveProjectData): Promise<{ success: boolean; error?: string }> {
  try {
    const { projectId, projectName, factoryAddress, whitelistAddress, nftAddress, claimAddress, erc20Address } = data;

    // 使用 Prisma 的 upsert 操作
    await prisma.project.upsert({
      where: {
        project_id: projectId
      },
      update: {
        project_name: projectName,
        factory_address: factoryAddress,
        whitelist_address: whitelistAddress,
        nft_address: nftAddress,
        claim_address: claimAddress,
        erc20_address: erc20Address,
        updated_at: new Date()
      },
      create: {
        project_id: projectId,
        project_name: projectName,
        factory_address: factoryAddress,
        whitelist_address: whitelistAddress,
        nft_address: nftAddress,
        claim_address: claimAddress,
        erc20_address: erc20Address,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return { success: true };
  } catch (error) {
    console.error('保存项目失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
}

export async function insertStudentProjectClaim(data: {
  student_id: string;
  project_id: string;
  project_name: string;
  nft_address: string;
  claim_address: string;
  erc20_address: string;
  has_claimed?: boolean;
}) {
  return await prisma.studentProjectClaim.create({
    data: {
      ...data,
      has_claimed: data.has_claimed ?? true
    }
  })
}

export async function getProjectsByStudentId(student_id: string) {
  return await prisma.studentProjectClaim.findMany({
    where: { student_id },
    orderBy: { created_at: 'desc' }
  })
}

export async function getLatestProject(): Promise<Project | null> {
  const project = await prisma.project.findFirst({
    orderBy: { created_at: 'desc' }
  });
  
  return project as Project | null;
}

export async function getAllProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    orderBy: { created_at: 'desc' }
  });
  
  return projects as Project[];
}

export async function getAllStudentProjectClaims(): Promise<StudentProjectClaim[]> {
  const claims = await prisma.studentProjectClaim.findMany({
    include: {
      registration: {
        select: {
          student_name: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  }) as StudentProjectClaimWithRegistration[];

  return claims.map((claim: StudentProjectClaimWithRegistration) => ({
    id: claim.id,
    student_id: claim.student_id,
    student_name: claim.registration.student_name,
    project_id: claim.project_id,
    project_name: claim.project_name,
    nft_address: claim.nft_address,
    claim_address: claim.claim_address,
    erc20_address: claim.erc20_address,
    has_claimed: claim.has_claimed,
    created_at: claim.created_at,
    updated_at: claim.updated_at
  }))
}

export async function deleteProjectById(id: number): Promise<DeleteResult> {
  try {
    await prisma.project.delete({
      where: { id }
    })
    
    return {
      success: true,
      message: '项目删除成功',
      changes: 1
    }
  } catch (error) {
    return {
      success: false,
      message: `删除项目失败: ${(error as Error).message}`,
      error: error as Error
    }
  }
}

export async function deleteStudentProjectClaimById(id: number): Promise<DeleteResult> {
  try {
    await prisma.studentProjectClaim.delete({
      where: { id }
    })
    
    return {
      success: true,
      message: '申领记录删除成功',
      changes: 1
    }
  } catch (error) {
    return {
      success: false,
      message: `删除申领记录失败: ${(error as Error).message}`,
      error: error as Error
    }
  }
}

// 根据 project_id 获取项目
export async function getProjectByProjectId(projectId: string): Promise<Project | null> {
  const project = await prisma.project.findUnique({
    where: { project_id: projectId }
  });
  
  return project as Project | null;
}

// 根据 project_id 删除项目
export async function deleteProjectByProjectId(projectId: string): Promise<DeleteResult> {
  try {
    await prisma.project.delete({
      where: { project_id: projectId }
    })
    
    return {
      success: true,
      message: '项目删除成功',
      changes: 1
    }
  } catch (error) {
    return {
      success: false,
      message: `删除项目失败: ${(error as Error).message}`,
      error: error as Error
    }
  }
}