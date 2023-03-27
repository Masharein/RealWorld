import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDb1679562573606 implements MigrationInterface {
  name = "SeedDb1679562573606";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`
    );

    //password is 123
    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES ('foo', 'foo@gmail.com', '$2b$10$ZtSe6zTVDf3a9m0Ucv2/f.kyYI6T2gcwNKkpTA25vX/rtrAPzho3u')`
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'first article', 'first article description', 'first article body', 'coffee,dragons', 1)`
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('second-article', 'second article', 'second article description', 'second article body', 'coffee,dragons', 1)`
    );
  }
  public async down(): Promise<void> {}
}
