import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "follows" })
export class FollowEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  followerdId: number;

  @Column()
  followingId: number;
}
