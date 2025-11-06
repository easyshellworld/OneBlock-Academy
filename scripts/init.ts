import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // 从环境变量中读取 ADMIN_ADDRESS
  const adminAddr = process.env.ADMIN_ADDRESS;
  if (!adminAddr) {
    console.error('请在 .env.local 中设置 ADMIN_ADDRESS');
    process.exit(1);
  }

  try {
    // 1. 查询是否已存在管理员
    const existingAdmin = await prisma.staff.findFirst({
      where: {
        role: 'admin'
      }
    });

    if (existingAdmin) {
      // 2. 如果已存在管理员，更新钱包地址
      const updatedAdmin = await prisma.staff.update({
        where: {
          id: existingAdmin.id
        },
        data: {
          wallet_address: adminAddr
        }
      });
      console.log(`✅ 已更新管理员钱包地址：${updatedAdmin.wallet_address}`);
    } else {
      // 3. 如果不存在管理员，插入新记录
      const newAdmin = await prisma.staff.create({
        data: {
          name: 'oneblock',
          wechat_id: 'oneblack',
          phone: '1356895689',
          role: 'admin',
          wallet_address: adminAddr,
        }
      });
      console.log(`✅ 已创建管理员：${newAdmin.wallet_address}`);
    }

    console.log('🎉 项目初始化完成');
    
  } catch (error) {
    console.error('❌ 初始化过程中发生错误：', error);
    throw error;
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });