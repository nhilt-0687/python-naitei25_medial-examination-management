import RecentPatientTable from "../../tables/RecentPatientTable";


export default function RecentPatients() {
  return (
    <div className="">
      <div className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-5">
         <RecentPatientTable/>
      </div>
    </div>
  );
}
