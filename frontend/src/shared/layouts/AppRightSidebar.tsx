import { useSidebar } from "../context/SidebarContext";

const AppRightSidebar: React.FC = () => {
  const { isExpanded, isHovered } = useSidebar();

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-gray-800 text-white transition-all duration-300 ease-in-out ${
        isExpanded || isHovered ? "w-[250px]" : "w-[90px]"
      }`}
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold">Thông tin bổ sung</h2>
        <ul className="mt-4 space-y-2">
          <li>Lịch sử khám</li>
          <li>Thông báo</li>
          <li>Hỗ trợ</li>
        </ul>
      </div>
    </div>
  );
};

export default AppRightSidebar;