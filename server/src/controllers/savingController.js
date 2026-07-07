import prisma from '../config/prisma.js';

/**
 * Create a new saving goal
 * POST /api/savings
 */
export const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline, category } = req.body;
    const userId = req.user.id;

    if (!title || !targetAmount || !deadline || !category) {
      return res.status(400).json({
        success: false,
        message: 'Semua field (title, targetAmount, deadline, category) wajib diisi.'
      });
    }

    const goal = await prisma.savingGoal.create({
      data: {
        userId,
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0.00,
        category,
        deadline: new Date(deadline)
      }
    });

    return res.status(201).json({
      success: true,
      savingGoal: {
        id: goal.id,
        title: goal.title,
        targetAmount: Number(goal.targetAmount),
        currentAmount: Number(goal.currentAmount),
        deadline: goal.deadline.toISOString().split('T')[0],
        category: goal.category
      }
    });
  } catch (error) {
    console.error('Create goal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat membuat target menabung.'
    });
  }
};

/**
 * Get all saving goals for current user
 * GET /api/savings
 */
export const getAllGoals = async (req, res) => {
  try {
    const userId = req.user.id;

    const goals = await prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const data = goals.map(goal => {
      const target = Number(goal.targetAmount);
      const current = Number(goal.currentAmount);
      const progress = target > 0 ? Math.round((current / target) * 100) : 0;

      return {
        savingGoal: {
          id: goal.id,
          title: goal.title,
          targetAmount: target,
          currentAmount: current,
          deadline: goal.deadline.toISOString().split('T')[0]
        },
        progress
      };
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get all goals error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat mengambil daftar target menabung.'
    });
  }
};

/**
 * Get detail of a saving goal
 * GET /api/savings/:id
 */
export const getGoalDetail = async (req, res) => {
  try {
    const goalId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(goalId)) {
      return res.status(400).json({
        success: false,
        message: 'ID target menabung tidak valid.'
      });
    }

    const goal = await prisma.savingGoal.findUnique({
      where: { id: goalId }
    });

    if (!goal || goal.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Target menabung tidak ditemukan.'
      });
    }

    const target = Number(goal.targetAmount);
    const current = Number(goal.currentAmount);
    const progress = target > 0 ? Math.round((current / target) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        savingGoal: {
          id: goal.id,
          title: goal.title,
          targetAmount: target,
          currentAmount: current,
          deadline: goal.deadline.toISOString().split('T')[0]
        },
        progress
      }
    });
  } catch (error) {
    console.error('Get goal detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat mengambil detail target menabung.'
    });
  }
};

/**
 * Update a saving goal
 * PUT /api/savings/:id
 */
export const updateGoal = async (req, res) => {
  try {
    const goalId = parseInt(req.params.id, 10);
    const userId = req.user.id;
        const { title, targetAmount, currentAmount, deadline, category } = req.body;

    if (isNaN(goalId)) {
      return res.status(400).json({
        success: false,
        message: 'ID target menabung tidak valid.'
      });
    }

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.savingGoal.findUnique({
      where: { id: goalId }
    });

    if (!existingGoal || existingGoal.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Target menabung tidak ditemukan.'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (targetAmount !== undefined) updateData.targetAmount = parseFloat(targetAmount);
    if (currentAmount !== undefined) updateData.currentAmount = parseFloat(currentAmount);
    if (deadline) updateData.deadline = new Date(deadline);
    if (category) updateData.category = category;

    const updatedGoal = await prisma.savingGoal.update({
      where: { id: goalId },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      savingGoal: {
        id: updatedGoal.id,
        title: updatedGoal.title,
        targetAmount: Number(updatedGoal.targetAmount),
        currentAmount: Number(updatedGoal.currentAmount),
        deadline: updatedGoal.deadline.toISOString().split('T')[0],
        category: updatedGoal.category
      }
    });
  } catch (error) {
    console.error('Update goal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat memperbarui target menabung.'
    });
  }
};

/**
 * Delete a saving goal
 * DELETE /api/savings/:id
 */
export const deleteGoal = async (req, res) => {
  try {
    const goalId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(goalId)) {
      return res.status(400).json({
        success: false,
        message: 'ID target menabung tidak valid.'
      });
    }

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.savingGoal.findUnique({
      where: { id: goalId }
    });

    if (!existingGoal || existingGoal.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Target menabung tidak ditemukan.'
      });
    }

    await prisma.savingGoal.delete({
      where: { id: goalId }
    });

    return res.status(200).json({
      success: true,
      message: 'deleted'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat menghapus target menabung.'
    });
  }
};
