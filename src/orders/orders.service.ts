import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersPaginationDto } from './dto/orders-pagination.dto';
import { PaymentMethod, type User } from 'generated/prisma';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    // 1. Confirmar ids de las variantes de producto
    const productsVariantIds = createOrderDto.items.map(
      (item) => item.productVariantId,
    );

    const productVariants =
      await this.validatedProductVariantIds(productsVariantIds);

    // 2. Calcular los valores

    const { subTotal, totalAmount, totalTax } = createOrderDto.items.reduce(
      (totals, item) => {
        const product = productVariants.find(
          (variant) => variant.id === item.productVariantId,
        )!.Product;

        if (!product) {
          throw new BadRequestException(`${item.productVariantId} not found`);
        }

        const finalPrice = product.salePrice ?? product.price;

        const subTotal = finalPrice * item.quantity;

        totals.subTotal += subTotal;
        totals.totalTax += subTotal * 0.15;
        totals.totalAmount += subTotal * 1.15;

        return totals;
      },
      { subTotal: 0, totalAmount: 0, totalTax: 0 },
    );

    // const totalAmount = createOrderDto.items.reduce((acc, item) => {
    //   const product = productVariants.find(
    //     (variant) => variant.id === item.productVariantId,
    //   )!.Product;

    //   const finalPrice = product.salePrice ?? product.price;

    //   return finalPrice * item.quantity + acc;
    // }, 0);

    const totalItems = createOrderDto.items.reduce((acc, item) => {
      return acc + item.quantity;
    }, 0);

    try {
      // 3. Crear transaction de la base de datos
      const prismaTx = await this.prismaService.$transaction(async (tx) => {
        //1. Actualizar stock de las variantes de los productos
        const updateProductVariantPromise = productVariants.map((variant) => {
          // Actualizar valores
          const variantQuantity = createOrderDto.items
            .filter((item) => item.productVariantId === variant.id)
            .reduce((acc, item) => {
              return item.quantity + acc;
            }, 0);

          if (variantQuantity === 0) {
            throw new Error(
              `${variant.sku} they do not have a defined quantity`,
            );
          }

          return tx.productVariant.update({
            where: { id: variant.id },
            data: {
              stock: {
                decrement: variantQuantity,
              },
            },
          });
        });

        // Verificar valores negativos en las existencia = no hay stock
        const updateProductVariants = await Promise.all(
          updateProductVariantPromise,
        );

        updateProductVariants.forEach((variant) => {
          if (variant.stock < 0) {
            throw new Error(`${variant.sku} insufficient stock`);
          }
        });

        // 2. Crear la orden - Encabezado - Detalles
        const order = await tx.order.create({
          data: {
            userId: createOrderDto.userId,
            paymentMethod:
              createOrderDto.paymentMethod ?? PaymentMethod.LIBELULA,
            totalAmount: totalAmount,
            subTotal: subTotal,
            totalTax: totalTax,
            totalItems: totalItems,
            isOnlineSale: createOrderDto.isOnlineSale,
            OrderItem: {
              createMany: {
                data: createOrderDto.items.map((item) => {
                  const product = productVariants.find(
                    (variant) => variant.id === item.productVariantId,
                  )!.Product;

                  const finalPrice = product.salePrice ?? product.price;

                  return {
                    productVariantId: item.productVariantId,
                    price: finalPrice,
                    quantity: item.quantity,
                  };
                }),
              },
            },
          },
        });
        // Validar, si el price es cero, entonces, lanzar un error

        // 3. Crear la direccion de la orden
        // Address

        const orderAddress = await tx.orderAddress.create({
          data: {
            orderId: order.id,
            ...createOrderDto.address,
          },
        });

        return {
          updateProductVariants: updateProductVariants,
          order: order,
          orderAddress: orderAddress,
        };
      });

      return {
        ok: true,
        order: prismaTx.order,
        prismaTx: prismaTx,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(`Error creating order ${error}`);
    }
  }

  async findAll(ordersPaginationDto: OrdersPaginationDto) {
    const { page = 1, limit = 10 } = ordersPaginationDto;

    const [count, orders] = await Promise.all([
      this.prismaService.order.count(),
      this.prismaService.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          User: {
            select: {
              firstName: true,
              lastName: true,
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
      data: orders.map(({ User, ...rest }) => ({
        ...rest,
        user: { ...User },
      })),
    };
  }

  async findOne(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: id },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        OrderItem: {
          select: {
            id: true,
            quantity: true,
            price: true,
            ProductVariant: {
              select: {
                id: true,
                size: true,
                color: true,
                sku: true,
                Product: {
                  select: {
                    id: true,
                    title: true,
                    price: true,
                    salePrice: true,
                    images: {
                      select: {
                        url: true,
                      },
                    },
                    Category: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Coupon: {
          select: {
            id: true,
            code: true,
            discountType: true,
            value: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found with id: ${id}`);
    }

    // Transformar la respuesta para aplanar la estructura
    const { OrderItem, User, ...orderData } = order;

    const orderItems = OrderItem.map((item) => {
      const { ProductVariant, ...itemData } = item;
      const { Product, ...variantData } = ProductVariant;
      const { Category, images, ...productData } = Product;

      return {
        ...itemData,
        ...variantData,
        ...productData,

        category: Category.name,
        images: images.map(({ url }) => url),
      };
    });

    return {
      ...orderData,
      user: {
        ...User,
      },
      orderItems,
    };
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: string) {
    return `This action removes a #${id} order`;
  }

  async findOrdersByUser(userId: string) {
    const orders = await this.prismaService.order.findMany({
      where: {
        userId: userId,
      },
    });

    return orders;
  }

  private async validatedProductVariantIds(ids: string[]) {
    try {
      const productVariants = await this.prismaService.productVariant.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        include: {
          Product: true,
        },
      });

      return productVariants;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Not Found Product Variant');
    }
  }
}
