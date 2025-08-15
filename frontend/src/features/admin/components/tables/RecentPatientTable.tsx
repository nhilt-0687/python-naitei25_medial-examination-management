import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { patientService } from "../../services/patientService";
import { Patient } from "../../types/patient";
import { useEffect, useState } from "react";

export default function RecentPatientTable() {
  const [tableData, setTableData] = useState<Patient[]>([]);
  useEffect(() => {
    const fetchRecentPatients = async () => {
      try {
        const patients = await patientService.getAllPatients();
        const randomPatients = [...patients]
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
        setTableData(randomPatients);
      } catch (error) {
        console.error("Failed to fetch recent patients:", error);
      }
    };

    fetchRecentPatients();
  }, []);
  return (
    <div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
          Bệnh nhân sắp tới
        </h3>
      </div>
      <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b hidden border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Bệnh nhân
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Thời gian khám
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((patient) => (
                <TableRow key={patient.patientId}>
                  <TableCell className="px-2 py-2 sm:px-2 text-start">
                    <div className="flex items-center gap-1">
                      <div className="w-10 h-10 overflow-hidden rounded-full mr-4">
                        <img
                          width={30}
                          height={30}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          src={patient.avatar || "/images/avatar.png"}
                          alt={patient.fullName}
                        />
                      </div>
                      <div>
                        <span className="block font-outfit text-gray-800 text-[12px] dark:text-white/90">
                          {patient.fullName}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {patient.identityNumber}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
