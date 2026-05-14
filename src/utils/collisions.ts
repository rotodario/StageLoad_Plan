import type { CollisionWarning, LoadItemInstance, LoadItemTemplate, LoadPlan, ValidationWarning } from "../types/loadplan";
import { boundsIntersect, calculateTotalWeight, getItemBoundingBox, isInsideTruck } from "./geometry";

export function checkCollision(a: LoadItemInstance, aTemplate: LoadItemTemplate, b: LoadItemInstance, bTemplate: LoadItemTemplate): boolean {
  if (a.hidden || b.hidden) return false;
  const boxA = getItemBoundingBox(a, aTemplate);
  const boxB = getItemBoundingBox(b, bTemplate);
  return boundsIntersect(boxA, boxB);
}

export function checkAllCollisions(items: LoadItemInstance[], templates: LoadItemTemplate[]): CollisionWarning[] {
  const warnings: CollisionWarning[] = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const itemA = items[i];
      const itemB = items[j];
      const templateA = templates.find((template) => template.id === itemA.templateId);
      const templateB = templates.find((template) => template.id === itemB.templateId);
      if (!templateA || !templateB) continue;
      if (checkCollision(itemA, templateA, itemB, templateB)) {
        warnings.push({
          id: `${itemA.id}-${itemB.id}`,
          itemAId: itemA.id,
          itemBId: itemB.id,
          message: `${itemA.label} colisiona con ${itemB.label}`,
          severity: "error",
        });
      }
    }
  }
  return warnings;
}

export function validateLoadPlan(plan: LoadPlan): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const totalWeight = calculateTotalWeight(plan.items, plan.templates);

  if (totalWeight > plan.truck.maxWeightKg) {
    warnings.push({
      id: "overweight",
      message: `Peso total ${totalWeight.toFixed(0)} kg supera el maximo del camion (${plan.truck.maxWeightKg} kg)`,
      severity: "error",
    });
  }

  plan.items.forEach((item) => {
    const template = plan.templates.find((entry) => entry.id === item.templateId);
    if (!template || item.hidden) return;
    const box = getItemBoundingBox(item, template);

    if (!isInsideTruck(item, template, plan.truck)) {
      warnings.push({
        id: `outside-${item.id}`,
        itemId: item.id,
        message: `${item.label} sale del volumen util del camion`,
        severity: "error",
      });
    }

    if (box.min.y > 0) {
      const supports = plan.items.filter((other) => {
        if (other.id === item.id || other.hidden) return false;
        const otherTemplate = plan.templates.find((entry) => entry.id === other.templateId);
        if (!otherTemplate) return false;
        const otherBox = getItemBoundingBox(other, otherTemplate);
        const verticalContact = Math.abs(otherBox.max.y - box.min.y) <= plan.snapMm;
        const xOverlap = box.min.x < otherBox.max.x && box.max.x > otherBox.min.x;
        const zOverlap = box.min.z < otherBox.max.z && box.max.z > otherBox.min.z;
        return verticalContact && xOverlap && zOverlap;
      });
      const supported = supports.length > 0;
      if (!supported) {
        warnings.push({
          id: `floating-${item.id}`,
          itemId: item.id,
          message: `${item.label} no esta apoyado en suelo u otro bulto`,
          severity: "warning",
        });
      }
      supports.forEach((support) => {
        const supportTemplate = plan.templates.find((entry) => entry.id === support.templateId);
        if (supportTemplate && !supportTemplate.stackable) {
          warnings.push({
            id: `non-stackable-support-${item.id}-${support.id}`,
            itemId: item.id,
            message: `${item.label} esta apilado sobre ${support.label}, que no es apilable`,
            severity: "error",
          });
        }
      });
    }

    if (item.blockedBy.length > 0) {
      warnings.push({
        id: `blocked-${item.id}`,
        itemId: item.id,
        message: `${item.label} necesita salir pronto pero tiene ${item.blockedBy.length} bulto(s) delante`,
        severity: "warning",
      });
    }
  });

  getStackColumns(plan).forEach((column) => {
    const baseTemplate = plan.templates.find((entry) => entry.id === column.base.templateId);
    if (!baseTemplate) return;
    if (column.items.length > baseTemplate.maxStack) {
      warnings.push({
        id: `max-stack-${column.base.id}`,
        itemId: column.base.id,
        message: `La columna de ${column.base.label} tiene ${column.items.length} alturas y supera el maximo (${baseTemplate.maxStack})`,
        severity: "error",
      });
    }
  });

  return warnings;
}

function getStackColumns(plan: LoadPlan): Array<{ base: LoadItemInstance; items: LoadItemInstance[] }> {
  const visibleItems = plan.items.filter((item) => !item.hidden);
  const columns: Array<{ base: LoadItemInstance; items: LoadItemInstance[] }> = [];
  const assigned = new Set<string>();

  visibleItems
    .slice()
    .sort((a, b) => a.position.y - b.position.y)
    .forEach((item) => {
      if (assigned.has(item.id)) return;
      const template = plan.templates.find((entry) => entry.id === item.templateId);
      if (!template) return;
      const box = getItemBoundingBox(item, template);
      const columnItems = visibleItems.filter((candidate) => {
        const candidateTemplate = plan.templates.find((entry) => entry.id === candidate.templateId);
        if (!candidateTemplate) return false;
        const candidateBox = getItemBoundingBox(candidate, candidateTemplate);
        const sameFootprint = Math.abs(candidateBox.min.x - box.min.x) <= plan.snapMm
          && Math.abs(candidateBox.max.x - box.max.x) <= plan.snapMm
          && Math.abs(candidateBox.min.z - box.min.z) <= plan.snapMm
          && Math.abs(candidateBox.max.z - box.max.z) <= plan.snapMm;
        return sameFootprint;
      }).sort((a, b) => a.position.y - b.position.y);

      columnItems.forEach((columnItem) => assigned.add(columnItem.id));
      columns.push({ base: columnItems[0], items: columnItems });
    });

  return columns;
}
