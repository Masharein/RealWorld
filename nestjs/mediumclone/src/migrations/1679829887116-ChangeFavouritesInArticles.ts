import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeFavouritesInArticles1679829887116 implements MigrationInterface {
    name = 'ChangeFavouritesInArticles1679829887116'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" RENAME COLUMN "favoutitesCount" TO "favouritesCount"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" RENAME COLUMN "favouritesCount" TO "favoutitesCount"`);
    }

}
