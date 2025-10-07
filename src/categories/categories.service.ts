import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return await this.prismaService.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;

    const [count, categories] = await Promise.all([
      this.prismaService.category.count(),
      this.prismaService.category.findMany({
        where: {
          parentId: null,
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          subCategories: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(count / limit);

    return {
      mata: {
        count: count,
        page: page,
        totalPages: totalPages,
      },
      data: categories,
    };
  }

  async findOne(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id: id },
    });

    if (!category) {
      throw new NotFoundException(``);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    const { id: _, ...data } = updateCategoryDto;

    const updateCategory = await this.prismaService.category.update({
      where: { id: id },
      data: data,
    });

    return updateCategory;
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prismaService.category.delete({ where: { id: id } });
  }
}
