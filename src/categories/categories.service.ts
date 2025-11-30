import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesPaginationDto } from './dto/categories-pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return await this.prismaService.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(categoriesPaginationDto: CategoriesPaginationDto) {
    const { page = 1, limit = 20, active } = categoriesPaginationDto;

    const [count, categories] = await Promise.all([
      this.prismaService.category.count({
        where: {
          isActive: active === '0' ? false : active === '1' ? true : undefined,
        },
      }),
      this.prismaService.category.findMany({
        where: {
          isActive: active === '0' ? false : active === '1' ? true : undefined,
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          parentCategory: {
            select: {
              id: true,
              name: true,
            },
          },
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
      data: categories.map(({ parentId, ...rest }) => ({ ...rest })),
    };
  }

  async findOne(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id: id },
    });

    if (!category) {
      throw new NotFoundException(`Not found category with ID: ${id}`);
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
    const category = await this.findOne(id);

    if (!category.isActive) {
      return category;
    }

    return await this.prismaService.category.update({
      where: { id: id },
      data: { isActive: false },
    });
  }
}
