import { apiGet } from "@/actions/api";
import GroupDialog from "@/components/dialogs/group-dialog";
import GroupsTable from "@/components/tables/groups-table";
import { IGroup } from "@/types/group";

export default async function Page() {
  const groups = await apiGet<IGroup[]>("groups");
  if (!groups.success) {
    return <div>{groups.message}</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <GroupDialog />
      </div>
      <div>
        <GroupsTable groups={groups.data} />
      </div>
    </>
  );
}
