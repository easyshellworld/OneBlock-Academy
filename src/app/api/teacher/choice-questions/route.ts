import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllChoiceQuestions, 
  addChoiceQuestion, 
  updateChoiceQuestion, 
  deleteChoiceQuestion,
  deleteChoiceQuestionsByTaskNumber,
  ChoiceQuestion
} from '@/lib/db/query/choiceQuestions';

// 设置为仅处理POST请求
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    // 根据action参数执行不同操作
    switch (action) {
      case 'get':
        // 获取所有选择题
        const questions =await getAllChoiceQuestions();
        return NextResponse.json({ success: true, data: questions });

      case 'add':
        // 添加选择题
        if (Array.isArray(data.questions)) {
          // 批量添加一组题目
          data.questions.forEach(async (question: ChoiceQuestion) => {
            await addChoiceQuestion(question);
          });
          return NextResponse.json({ 
            success: true, 
            message: `Successfully added ${data.questions.length} questions` 
          });
        } else {
          // 添加单个题目
          await addChoiceQuestion(data.question);
          return NextResponse.json({ 
            success: true, 
            message: 'Successfully added question' 
          });
        }

      case 'update':
        // 更新选择题
        if (!data.id) {
          return NextResponse.json(
            { success: false, error: 'Question ID is required' },
            { status: 400 }
          );
        }
        
        const updateResult =await updateChoiceQuestion(data.id, data.updates);
        
        if (updateResult.success) {
          return NextResponse.json({ 
            success: true, 
            message: 'Successfully updated question',
            changes: updateResult.changes
          });
        } else {
          return NextResponse.json(
            { success: false, error: updateResult.error },
            { status: 400 }
          );
        }

      case 'delete':
        // 删除选择题
        if (!data.id) {
          return NextResponse.json(
            { success: false, error: 'Question ID is required' },
            { status: 400 }
          );
        }
        
        const deleteResult =await deleteChoiceQuestion(Number(data.id));
        
        if (deleteResult.success) {
          return NextResponse.json({ 
            success: true, 
            message: 'Successfully deleted question',
            changes: deleteResult.changes
          });
        } else {
          return NextResponse.json(
            { success: false, error: deleteResult.error },
            { status: 400 }
          );
        }

        case 'deleteByTask':
          if (!data.taskNumber && data.taskNumber !== 0) {
            return NextResponse.json(
              { success: false, error: 'Task number is required' },
              { status: 400 }
            );
          }
  
          const deleteByTaskResult =await deleteChoiceQuestionsByTaskNumber(Number(data.taskNumber));
          
          if (deleteByTaskResult.success) {
            return NextResponse.json({ 
              success: true, 
              message: `Successfully deleted ${deleteByTaskResult.changes} questions for task ${data.taskNumber}`,
              changes: deleteByTaskResult.changes
            });
          } else {
            return NextResponse.json(
              { success: false, error: deleteByTaskResult.error },
              { status: 400 }
            );
          }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}