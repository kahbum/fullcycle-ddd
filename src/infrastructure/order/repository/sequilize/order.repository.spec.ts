import { Sequelize } from "sequelize-typescript"
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import Address from "../../../../domain/customer/value-object/address";
import OrderModel from "./order.model";
import ProductModel from "../../../product/repository/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import Product from "../../../../domain/product/entity/product";
import OrderRepository from "./order.repository";
import { v4 as uuid } from "uuid";
import Customer from "../../../../domain/customer/entity/customer";
import OrderItemModel from "./order-item.model";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Order from "../../../../domain/checkout/entity/order";

describe("Order repository test", () => {
    let sequelize: Sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: ':memory:',
            logging: false,
            sync: {force: true},
        });

        await sequelize.addModels([CustomerModel, OrderModel, OrderItemModel, ProductModel]);
        await sequelize.sync();
    });

    afterEach(async () => {
        await sequelize.close();
    });

    const createOrderItem = async(name: string = "Product 1", price: number = 10, quantity: number = 2): Promise<OrderItem> => {
        const productRepository = new ProductRepository();
        const product = new Product(uuid(), name, price);
        await productRepository.create(product);

        return new OrderItem(uuid(), product.name, product.price, product.id, quantity);
    }

    const createOrder = async(orderId: string = "123", customerId: string = "123"): Promise<Order> => {
        const customerRepository = new CustomerRepository();
        const customer = new Customer(customerId, "Customer " + customerId);
        const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
        customer.changeAddress(address);
        await customerRepository.create(customer);

        const orderItem = await createOrderItem();

        const order = new Order(orderId, customerId, [orderItem]);

        return order;
    }

    it("should create a new order", async() => {
        const order = await createOrder();
        const orderItem = order.items.at(0);

        const orderRepository = new OrderRepository();
        await orderRepository.create(order);

        const orderModel = await OrderModel.findOne({
            where: {id: order.id},
            include: ["items"],
        });

        expect(orderModel.toJSON()).toStrictEqual({
            id: order.id,
            customer_id: order.customerId,
            total: order.total(),
            items: [
                {
                    id: orderItem.id,
                    name: orderItem.name,
                    price: orderItem.price,
                    quantity: orderItem.quantity,
                    order_id: order.id,
                    product_id: orderItem.productId,
                }
            ]
        });
    });

    it("should update an order", async() => {
        const order = await createOrder();
        const orderItem = order.items.at(0);
        
        const orderRepository = new OrderRepository();
        await orderRepository.create(order);

        const orderItem2 = await createOrderItem("Product 2", 20, 1);
        order.addItem(orderItem2);
        await orderRepository.update(order);

        const orderModel = await OrderModel.findOne({
            where: {id: order.id},
            include: ["items"],
        });

        expect(orderModel.toJSON()).toStrictEqual({
            id: order.id,
            customer_id: order.customerId,
            total: order.total(),
            items: [
                {
                    id: orderItem.id,
                    name: orderItem.name,
                    price: orderItem.price,
                    quantity: orderItem.quantity,
                    order_id: order.id,
                    product_id: orderItem.productId,
                },
                {
                    id: orderItem2.id,
                    name: orderItem2.name,
                    price: orderItem2.price,
                    quantity: orderItem2.quantity,
                    order_id: order.id,
                    product_id: orderItem2.productId,
                }
            ]
        });
    });

    it("should find an order", async() => {
        const order = await createOrder();
        
        const orderRepository = new OrderRepository();
        await orderRepository.create(order);

        const orderResult = await orderRepository.find(order.id);

        expect(order).toStrictEqual(orderResult);
    });

    it("should throw an error when order is not found", async () => {
        const orderRepository = new OrderRepository();

        expect(async () => {
            await orderRepository.find("456ABC");
        }).rejects.toThrow("Order not found");
    });

    it("should find all orders", async() => {
        const orderRepository = new OrderRepository();

        const order1 = await createOrder("123", "123");
        await orderRepository.create(order1);

        const order2 = await createOrder("456", "456");
        await orderRepository.create(order2);

        const orders = await orderRepository.findAll();

        expect(orders).toHaveLength(2);
        expect(orders).toContainEqual(order1);
        expect(orders).toContainEqual(order2);
    });
});