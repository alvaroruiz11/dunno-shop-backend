import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsPaginationDto } from './dto/products-pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

import type { Product } from 'generated/prisma';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { images = [], variants, ...data } = createProductDto;

    try {
      const product = await this.prismaService.product.create({
        data: {
          title: data.title,
          slug: data.slug,
          gender: data.gender,
          costPrice: data.costPrice,
          price: data.price,
          salePrice: data.salePrice,
          categoryId: data.categoryId,
          variants: {
            createMany: {
              data: variants.map(({ id, ...item }) => ({
                size: item.size,
                sku: item.sku,
                stock: item.stock,
                stockAlert: item.stockAlert,
                color: item.color,
              })),
            },
          },
          images: {
            createMany: { data: images.map((url) => ({ url })) },
          },
        },
      });

      return product;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(`Error server: ${error}`);
    }
  }

  async findAll(productsPaginationDto: ProductsPaginationDto) {
    const {
      page = 1,
      limit = 10,
      category = '',
      gender,
      active,
    } = productsPaginationDto;

    const categoriesIds = await this.getCategoryIdsBySlug(category);

    const [count, products] = await Promise.all([
      this.prismaService.product.count({
        where: {
          categoryId: {
            in: categoriesIds,
          },
          isActive: active === '0' ? false : active === '1' ? true : undefined,
          gender: gender ? gender : undefined,
        },
      }),
      this.prismaService.product.findMany({
        where: {
          categoryId: {
            in: categoriesIds,
          },
          isActive: active === '0' ? false : active === '1' ? true : undefined,
          gender: gender ? gender : undefined,
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          variants: true,
          Category: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            select: {
              url: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(count / limit);

    return {
      meta: {
        count: count,
        page: page,
        totalPages: totalPages,
      },
      data: products.map(
        ({ images, categoryId, Category, createdAt, ...rest }) => ({
          ...rest,
          category: { ...Category },
          images: images.map(({ url }) => url),
        }),
      ),
    };
  }

  async findOne(term: string): Promise<any> {
    let product: any;

    if (isUUID(term)) {
      product = await this.prismaService.product.findFirst({
        where: { id: term },
        include: {
          Category: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            select: {
              url: true,
            },
          },
          variants: {
            select: {
              id: true,
              size: true,
              stock: true,
              sku: true,
              color: true,
            },
          },
        },
      });
    } else {
      product = await this.prismaService.product.findFirst({
        where: { slug: term },
        include: {
          Category: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            select: {
              url: true,
            },
          },
          variants: {
            select: {
              id: true,
              size: true,
              stock: true,
              sku: true,
              color: true,
            },
          },
        },
      });
    }

    if (!product) {
      throw new NotFoundException(`Product not found with id: ${term}`);
    }

    const { images, Category, categoryId, ...rest } = product;

    return {
      ...rest,
      category: Category,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    console.log(
      '🚀 ~ ProductsService ~ update ~ updateProductDto:',
      updateProductDto,
    );
    await this.findOne(id);

    const { id: _, images, variants, ...updateData } = updateProductDto;

    try {
      const updateProduct = await this.prismaService.product.update({
        where: { id },
        data: {
          ...updateData,
          ...(images &&
            images.length > 0 && {
              images: {
                deleteMany: {},
                create: images.map((url) => ({ url })),
              },
            }),
          ...(variants &&
            variants.length > 0 && {
              variants: {
                upsert: variants.map((variant) => ({
                  where: {
                    id: variant.id,
                  },
                  create: {
                    size: variant.size,
                    sku: variant.sku,
                    stock: variant.stock,
                    stockAlert: variant.stockAlert,
                    color: variant.color,
                  },
                  update: {
                    size: variant.size,
                    sku: variant.sku,
                    stock: variant.stock,
                    stockAlert: variant.stockAlert,
                    color: variant.color,
                  },
                })),
              },
            }),
        },
        include: {
          Category: {
            select: {
              id: true,
              name: true,
            },
          },
          variants: true,
        },
      });

      return { ...updateProduct, images };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error updating product');
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    if (!product.isActive) {
      return product as Product;
    }

    return this.prismaService.product.update({
      where: { id: id },
      data: { isActive: false },
    });
  }

  private async getCategoryIdsBySlug(
    categorySlug: string,
  ): Promise<string[] | undefined> {
    if (!categorySlug) return undefined;

    const mainCategory = await this.prismaService.category.findFirst({
      where: {
        slug: categorySlug,
      },
    });

    if (!mainCategory) {
      throw new NotFoundException(`Category not found`);
    }

    const categoryId = mainCategory.id;

    const categories = await this.prismaService.category.findMany({
      where: {
        OR: [{ id: categoryId }, { parentId: categoryId }],
      },
      select: {
        id: true,
      },
    });

    return categories.length > 0 ? categories.map((c) => c.id) : undefined;
  }
}
