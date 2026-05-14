import { PackagePlus } from "lucide-react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { ItemTemplateCard } from "./ItemTemplateCard";
import { CreateItemTemplateDialog } from "./CreateItemTemplateDialog";

export function ItemLibrary() {
  const templates = useLoadPlanStore((state) => state.plan.templates);
  return (
    <section className="border-b border-cad-border p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title"><PackagePlus size={15} />Biblioteca</h2>
        <CreateItemTemplateDialog />
      </div>
      <div className="space-y-2">
        {templates.map((template) => <ItemTemplateCard key={template.id} template={template} />)}
      </div>
    </section>
  );
}
