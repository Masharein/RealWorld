import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { TagEntity } from "./tag/tag.entity";
import { UserEntity } from "./user/user.entity";
import { ArticleEntity } from "./article/article.entity";
import { FollowEntity } from "./profile/follow.entity";

const config: PostgresConnectionOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "mediumclone",
  password: "123",
  database: "mediumclone",
  entities: [TagEntity, UserEntity, ArticleEntity, FollowEntity],
  synchronize: false,
  migrations: [__dirname + '/migrations/**/*{.ts, .js}'],
};

export default config;
