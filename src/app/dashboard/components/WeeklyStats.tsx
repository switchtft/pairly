// components/WeeklyStats.tsx
interface WeeklyStatsProps {
  totalPayment: number;
  orders: number;
  winRate: number;
  leaderboardPosition: number;
}

const WeeklyStats = ({ totalPayment, orders, winRate, leaderboardPosition }: WeeklyStatsProps) => (
  <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
    <h2 className="text-xl font-bold text-white mb-4">Weekly Stats</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-green-400">${totalPayment.toFixed(2)}</p>
        <p className="text-gray-400 text-sm">Total Payment</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-white">{orders}</p>
        <p className="text-gray-400 text-sm">Orders</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-[#e6915b]">{winRate}%</p>
        <p className="text-gray-400 text-sm">Win Rate</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-yellow-400">#{leaderboardPosition}</p>
        <p className="text-gray-400 text-sm">Leaderboard</p>
      </div>
    </div>
  </div>
);

export default WeeklyStats;
