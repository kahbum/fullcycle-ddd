import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderModel from "./order.model";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderItemModel from "./order-item.model";

export default class OrderRepository implements OrderRepositoryInterface {
    async create(entity: Order): Promise<void> {
        await OrderModel.create(
            {
                id: entity.id,
                customer_id: entity.customerId,
                total: entity.total(),
                items: entity.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    product_id: item.productId,
                    quantity: item.quantity,
                })),
            },
            {
                include: [{model: OrderItemModel}],
            }
        );
    }

    async update(entity: Order): Promise<void> {
        entity.items.map(async (item) => await OrderItemModel.upsert({
            id: item.id,
            name: item.name,
            price: item.price,
            product_id: item.productId,
            quantity: item.quantity,
            order_id: entity.id
        }));
        await OrderModel.update(
            {
                customer_id: entity.customerId,
                total: entity.total(),
                items: entity.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    product_id: item.productId,
                    quantity: item.quantity,
                })),
            },
            {
                where: {
                    id: entity.id
                }
            }
        );
    }

    async find(id: string): Promise<Order> {
        let orderModel;
        try {
            orderModel = await OrderModel.findOne({
                where: {
                    id,
                },
                rejectOnEmpty: true,
                include: [{model: OrderItemModel}],
            });
        } catch (error) {
            throw new Error("Order not found");
        }

        const items = orderModel.items.map((item) => {
            return new OrderItem(
                item.id,
                item.name,
                item.price,
                item.product_id,
                item.quantity,
            )
        })
        const order = new Order(id, orderModel.customer_id, items);
        return order;
    }

    async findAll(): Promise<Order[]> {
        const orderModels = await OrderModel.findAll({
            include: [{model: OrderItemModel}],
        });
        const orders = orderModels.map((order) => {
            const items = order.items.map((item) => {
                return new OrderItem(
                    item.id,
                    item.name,
                    item.price,
                    item.product_id,
                    item.quantity,
                )
            });
            return new Order(
                order.id,
                order.customer_id,
                items,
            );
        });
        return orders;
    }
}