import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly prismaService: PrismaService) {}

  async runSeed() {
    await this.deleteTables();
    await this.insertNewCategories();
    await this.insertNewProduct();
    this.insertNewDepartments();
    return 'SEED EXECUTE';
  }

  private async insertNewCategories() {
    const { categories } = initialData;

    const categoriesData = categories.map((name) => ({
      name: name,
      slug: name.toLowerCase(),
    }));

    await this.prismaService.category.createMany({
      data: categoriesData,
    });
  }

  private async insertNewProduct() {
    const { products } = initialData;
    const categoriesDB = await this.prismaService.category.findMany();
    const categoriesMap = categoriesDB.reduce(
      (map, category) => {
        map[category.name.toLowerCase()] = category.id;
        return map;
      },
      {} as Record<string, string>,
    );

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    products.forEach(async (product) => {
      const { type, inStock, images, sizes, ...rest } = product;

      const dbProduct = await this.prismaService.product.create({
        data: {
          title: rest.title,
          price: rest.price,
          slug: rest.slug,
          costPrice: rest.price - rest.price * 0.3,
          gender: rest.gender,
          categoryId: categoriesMap[type],
          description: rest.description,
          tags: rest.tags,
          variants: {
            createMany: {
              data: sizes.map((size) => {
                const stockRandom =
                  Math.floor(Math.random() * (50 - 10 + 1)) + 10;

                return {
                  size: size,
                  stock: stockRandom,
                  stockAlert: 5,
                  sku: `${rest.slug.replaceAll('_', '-').toUpperCase()}-${size}`,
                };
              }),
            },
          },
        },
      });

      const imagesData = images.map((image) => ({
        url: image,
        productId: dbProduct.id,
      }));

      await this.prismaService.productImage.createMany({
        data: imagesData,
      });
    });
  }

  private insertNewDepartments() {
    const { departments } = initialData;

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    departments.forEach(async (department) => {
      const { name, provinces } = department;

      await this.prismaService.department.create({
        data: {
          name: name,
          provinces: {
            create: provinces.map((p) => ({
              name: p.name,
              cities: {
                createMany: {
                  data: p.cities.map((c) => ({
                    name: c.name,
                  })),
                },
              },
            })),
          },
        },
      });
    });
  }

  private async deleteTables() {
    // departamentos, provincias y ciudades
    await this.prismaService.city.deleteMany({});
    await this.prismaService.province.deleteMany({});
    await this.prismaService.department.deleteMany({});
    // categorias y productos
    await this.prismaService.productVariant.deleteMany();
    await this.prismaService.productImage.deleteMany();
    await this.prismaService.product.deleteMany();
    await this.prismaService.category.deleteMany();
  }
}
