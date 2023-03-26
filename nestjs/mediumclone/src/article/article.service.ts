import { UserEntity } from "@app/user/user.entity";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleEntity } from "./article.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DeleteResult, DataSource } from "typeorm";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";
import slugify from "slugify";
import { getRepository } from "typeorm";

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findAll(
    currentUserId: number,
    query: any
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder("articles")
      .leftJoinAndSelect("articles.author", "author");

    queryBuilder.orderBy("articles.createdAt", "DESC");

    const articlesCount = await queryBuilder.getCount();

    if (query.tag) {
      queryBuilder.andWhere("articles.taglist LIKE :tag", {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: {
          username: query.author,
        },
      });
      queryBuilder.andWhere("articles.authorId = :id", {
        id: author.id,
      });
    }

    if (query.favourited) {
      const author = await this.userRepository.findOne({
        where: {
          username: query.favourited,
        },
        relations: ["favourites"],
      });
      const ids = author.favourites.map((el) => el.id);
      if (ids.length > 0) {
        queryBuilder.andWhere("articles.id IN (:...ids)", { ids });
      } else {
        queryBuilder.andWhere("1=0");
      }
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favouriteIds: number[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ["favourites"],
      });
      favouriteIds = currentUser.favourites.map((favourite) => favourite.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavourites = articles.map((article) => {
      const favourited = favouriteIds.includes(article.id);
      return { ...article, favourited };
    });

    return { articles: articlesWithFavourites, articlesCount };
  }

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto
  ): Promise<ArticleEntity> {
    const article = this.articleRepository.create(createArticleDto);

    if (!article.taglist) {
      article.taglist = [];
    }

    article.slug = this.getSlug(createArticleDto.title);

    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  async updateArticle(
    slug: string,
    updateArticleDto: CreateArticleDto,
    currentUserId: number
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException("Article does not exist", HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException(
        "You are not the author of this article",
        HttpStatus.FORBIDDEN
      );
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  async addArticleToFavourites(
    slug: string,
    currentUserId: number
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ["favourites"],
    });

    const isNotFavourited =
      user.favourites.findIndex(
        (articleInFavourites) => articleInFavourites.id === article.id
      ) === -1;

    if (isNotFavourited) {
      user.favourites.push(article);
      article.favouritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavourites(
    slug: string,
    currentUserId: number
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ["favourites"],
    });

    const articleIndex = user.favourites.findIndex(
      (articleInFavourites) => articleInFavourites.id === article.id
    );

    if (articleIndex >= 0) {
      user.favourites.splice(articleIndex, 1);
      article.favouritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ where: { slug } });
  }

  async deleteArticle(
    slug: string,
    currentUserId: number
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException("Article does not exist", HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException(
        "You are not the author of this article",
        HttpStatus.FORBIDDEN
      );
    }

    return await this.articleRepository.delete({ slug });
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      "-" +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
