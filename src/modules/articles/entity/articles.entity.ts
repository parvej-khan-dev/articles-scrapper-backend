import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Articles extends Model<Articles> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.STRING })
  link: string;

  @Column({})
  summary: string;

  // Timestamps
}
