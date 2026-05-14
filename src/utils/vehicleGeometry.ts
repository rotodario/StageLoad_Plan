import type { Truck, VehicleGeometryModel, VehicleWeightModel } from "../types/loadplan";

export interface VisualBounds {
  frontXmm: number;
  rearXmm: number;
  centerXmm: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
}

export function getVehicleVisualBounds(model: VehicleWeightModel, truck: Truck): VisualBounds {
  const geometry = normalizeVehicleGeometry(model, truck);
  const frontXmm = Math.min(geometry.cabFrontXmm, geometry.trailerFrontXmm, geometry.trailerBoxFrontXmm);
  const rearXmm = Math.max(geometry.trailerRearXmm, geometry.trailerBoxRearXmm, geometry.tractorFrameRearXmm);
  return toBounds(frontXmm, rearXmm, Math.max(geometry.cabWidthMm, truck.widthMm), Math.max(geometry.cabHeightMm, truck.heightMm));
}

export function getCabBounds(model: VehicleWeightModel, truck: Truck): VisualBounds {
  const geometry = normalizeVehicleGeometry(model, truck);
  return toBounds(geometry.cabFrontXmm, geometry.cabRearXmm, geometry.cabWidthMm, geometry.cabHeightMm);
}

export function getTrailerBounds(model: VehicleWeightModel, truck: Truck): VisualBounds {
  const geometry = normalizeVehicleGeometry(model, truck);
  return toBounds(geometry.trailerBoxFrontXmm, geometry.trailerBoxRearXmm, truck.widthMm, truck.heightMm);
}

export function getChassisBounds(model: VehicleWeightModel, truck: Truck): VisualBounds {
  const geometry = normalizeVehicleGeometry(model, truck);
  const frontXmm = model.vehicleType === "semi_trailer" ? geometry.trailerFrontXmm : geometry.cabFrontXmm;
  return toBounds(frontXmm, geometry.trailerRearXmm, truck.widthMm, 220);
}

export function shouldShowKingpin(model: VehicleWeightModel): boolean {
  return model.vehicleType === "semi_trailer";
}

export function normalizeVehicleGeometry(model: VehicleWeightModel, truck: Truck): VehicleGeometryModel {
  const fallback = model.vehicleType === "rigid"
    ? {
      cabLengthMm: 2400,
      cabWidthMm: truck.widthMm,
      cabHeightMm: 3100,
      cabFrontXmm: 0,
      cabRearXmm: 2400,
      tractorFrameRearXmm: truck.lengthMm,
      trailerFrontXmm: 0,
      trailerRearXmm: truck.lengthMm,
      trailerBoxFrontXmm: 2400,
      trailerBoxRearXmm: truck.lengthMm,
    }
    : {
    cabLengthMm: 4300,
    cabWidthMm: truck.widthMm,
    cabHeightMm: 3200,
    cabFrontXmm: -5200,
    cabRearXmm: -900,
    tractorFrameRearXmm: model.kingpinXmm,
    fifthWheelXmm: model.kingpinXmm,
    trailerFrontXmm: model.kingpinXmm,
    trailerRearXmm: truck.lengthMm,
    trailerBoxFrontXmm: 0,
    trailerBoxRearXmm: truck.lengthMm,
  };

  return {
    ...fallback,
    ...model.visualGeometry,
    trailerBoxRearXmm: model.visualGeometry?.trailerBoxRearXmm || fallback.trailerBoxRearXmm,
    trailerRearXmm: model.visualGeometry?.trailerRearXmm || fallback.trailerRearXmm,
  };
}

function toBounds(frontXmm: number, rearXmm: number, widthMm: number, heightMm: number): VisualBounds {
  return {
    frontXmm,
    rearXmm,
    centerXmm: (frontXmm + rearXmm) / 2,
    lengthMm: rearXmm - frontXmm,
    widthMm,
    heightMm,
  };
}
