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
      const supported = plan.items.some((other) => {
        if (other.id === item.id || other.hidden) return false;
        const otherTemplate = plan.templates.find((entry) => entry.id === other.templateId);
        if (!otherTemplate) return false;
        const otherBox = getItemBoundingBox(other, otherTemplate);
        const verticalContact = Math.abs(otherBox.max.y - box.min.y) <= plan.snapMm;
        const xOverlap = box.min.x < otherBox.max.x && box.max.x > otherBox.min.x;
        const zOverlap = box.min.z < otherBox.max.z && box.max.z > otherBox.min.z;
        return verticalContact && xOverlap && zOverlap;
      });
      if (!supported) {
        warnings.push({
          id: `floating-${item.id}`,
          itemId: item.id,
          message: `${item.label} no esta apoyado en suelo u otro bulto`,
          severity: "warning",
        });
      }
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

  return warnings;
}
