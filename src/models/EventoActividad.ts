import { Table, Column, Model, ForeignKey } from "sequelize-typescript";
import { PlanificacionEvento } from "./PlanificacionEvento";
import { Actividad } from "./Actividad";

@Table({ tableName: "eventoactividad", timestamps:true })
export class EventoActividad extends Model {
  @ForeignKey(() => PlanificacionEvento)
  @Column
  declare IdPlanificarE: number;

  @ForeignKey(() => Actividad)
  @Column
  declare IdActividad: number;
}
