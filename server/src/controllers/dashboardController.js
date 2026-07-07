import prisma from '../config/prisma.js';

/**
 * Get dashboard statistics and data for the logged-in user.
 * GET /api/savings/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all goals for the authenticated user
    const goals = await prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // If user has no goals, return empty data structure as per requirements
    if (goals.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          cards: {
            totalSavings: 0,
            averageProgress: 0,
            activeGoals: 0,
            completedGoals: 0
          },
          monthlySavings: [],
          categoryActivity: [],
          latestGoals: [],
          myGoals: []
        }
      });
    }

    // 1. Total Savings & Card Stats
    let totalSavings = 0;
    let totalProgressSum = 0;
    let activeGoalsCount = 0;
    let completedGoalsCount = 0;

    const formattedGoals = goals.map(goal => {
      const target = Number(goal.targetAmount);
      const current = Number(goal.currentAmount);
      const progress = target > 0 ? Math.round((current / target) * 100) : 0;

      totalSavings += current;
      totalProgressSum += progress;

      if (progress >= 100) {
        completedGoalsCount++;
      } else {
        activeGoalsCount++;
      }

      return {
        id: goal.id,
        title: goal.title,
        category: goal.category,
        targetAmount: target,
        currentAmount: current,
        progress,
        deadline: goal.deadline.toISOString().split('T')[0],
        createdAt: goal.createdAt.toISOString().split('T')[0]
      };
    });

    const averageProgress = goals.length > 0 
      ? Math.round((totalProgressSum / goals.length) * 10) / 10 
      : 0;

    // 2. Monthly Savings Chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals = {};

    goals.forEach(goal => {
      const monthName = monthNames[goal.createdAt.getMonth()];
      const currentAmount = Number(goal.currentAmount);
      monthlyTotals[monthName] = (monthlyTotals[monthName] || 0) + currentAmount;
    });

    // Build ordered monthly data based on calendar months, filtering out months with 0 total
    const monthlySavings = monthNames
      .map((month, index) => ({
        month,
        total: monthlyTotals[month] || 0,
        index
      }))
      .filter(item => item.total > 0)
      .map(({ month, total }) => ({ month, total }));

    // 3. Category Activity
    const categoryCounts = {};
    goals.forEach(goal => {
      const cat = goal.category || 'Lainnya';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryActivity = Object.keys(categoryCounts).map(cat => ({
      category: cat,
      count: categoryCounts[cat]
    }));

    // 4. Latest Goals (Max 5, ordered by createdAt desc)
    // We already queried all goals ordered by createdAt desc. We just slice the first 5.
    const latestGoals = formattedGoals.slice(0, 5);

    // 5. My Goals (all goals without the extra 'createdAt' field, matching contract precisely)
    const myGoals = formattedGoals.map(({ id, title, category, targetAmount, currentAmount, progress, deadline }) => ({
      id,
      title,
      category,
      targetAmount,
      currentAmount,
      progress,
      deadline
    }));

    return res.status(200).json({
      success: true,
      data: {
        cards: {
          totalSavings: Number(totalSavings),
          averageProgress,
          activeGoals: activeGoalsCount,
          completedGoals: completedGoalsCount
        },
        monthlySavings,
        categoryActivity,
        latestGoals,
        myGoals
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat memproses data dashboard.'
    });
  }
};
