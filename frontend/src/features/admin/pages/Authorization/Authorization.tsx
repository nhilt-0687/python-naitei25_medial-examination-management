import PageMeta from "../../components/common/PageMeta.tsx";
import UserRoleTable from "./UserRoleTable.tsx";
import RolePermissionTable from "./RolePermissionTable.tsx";
import { useState, useEffect } from "react";
import {
  Users,
  Shield,
  UserPlus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  statisticsService,
  UserStatistics,
} from "../../services/authorizationService";

export default function Authorization() {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  // Load statistics data
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setStatsLoading(true);
        const stats = await statisticsService.getUserStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error("Error loading statistics:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStatistics();
  }, []);

  return (
    <>
      <PageMeta
        title="Phân quyền | Bệnh viện Đa khoa Wecare"
        description="This is Authorization Dashboard"
      />
      <div className="">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                Quản lý phân quyền
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Quản lý người dùng, vai trò và quyền hạn trong hệ thống
              </p>
            </div>
          </div>
        </div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Tổng người dùng
                </p>
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {statistics?.totalUsers || 0}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      {statistics?.userGrowthPercent &&
                      statistics.userGrowthPercent > 0 ? (
                        <TrendingUp size={14} className="text-green-600" />
                      ) : statistics?.userGrowthPercent &&
                        statistics.userGrowthPercent < 0 ? (
                        <TrendingDown size={14} className="text-red-600" />
                      ) : null}
                      <p
                        className={`text-sm ${
                          statistics?.userGrowthPercent &&
                          statistics.userGrowthPercent > 0
                            ? "text-green-600"
                            : statistics?.userGrowthPercent &&
                              statistics.userGrowthPercent < 0
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {statistics?.userGrowthPercent
                          ? `${statistics.userGrowthPercent > 0 ? "+" : ""}${
                              statistics.userGrowthPercent
                            }%`
                          : "0%"}{" "}
                        so với tháng trước
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Đăng nhập hôm nay
                </p>
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {statistics?.todayLogins || 0}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      {statistics?.loginGrowthPercent &&
                      statistics.loginGrowthPercent > 0 ? (
                        <TrendingUp size={14} className="text-green-600" />
                      ) : statistics?.loginGrowthPercent &&
                        statistics.loginGrowthPercent < 0 ? (
                        <TrendingDown size={14} className="text-red-600" />
                      ) : null}
                      <p
                        className={`text-sm ${
                          statistics?.loginGrowthPercent &&
                          statistics.loginGrowthPercent > 0
                            ? "text-green-600"
                            : statistics?.loginGrowthPercent &&
                              statistics.loginGrowthPercent < 0
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {statistics?.loginGrowthPercent
                          ? `${statistics.loginGrowthPercent > 0 ? "+" : ""}${
                              statistics.loginGrowthPercent
                            }%`
                          : "0%"}{" "}
                        so với hôm qua
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <UserPlus
                  className="text-green-600 dark:text-green-400"
                  size={24}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("users")}
                className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === "users"
                    ? "border-base-500 text-base-600 dark:text-base-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Users size={18} />
                Quản lý người dùng
              </button>
              <button
                onClick={() => setActiveTab("roles")}
                className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === "roles"
                    ? "border-base-500 text-base-600 dark:text-base-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Shield size={18} />
                Vai trò & Quyền hạn
              </button>
            </nav>
          </div>
        </div>{" "}
        {/* Tab Content */}
        <div className="grid grid-cols-1 gap-6">
          <div className="col-span-12">
            {activeTab === "users" && <UserRoleTable />}
            {activeTab === "roles" && <RolePermissionTable />}
          </div>
        </div>
      </div>
    </>
  );
}
