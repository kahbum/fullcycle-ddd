import CustomerAddressChangedEvent from "../../customer/event/customer-address-changed.event";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import CustomerAddressChangedHandler from "../../customer/event/handler/customer-address-changed.handler";
import CustomerCreatedHandler1 from "../../customer/event/handler/customer-created-1.handler";
import CustomerCreatedHandler2 from "../../customer/event/handler/customer-created-2.handler";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain event tests", () => {

    it("should register an event handler", () => {

        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendEmailWhenProductIsCreatedHandler();

        eventDispatcher.register("ProductCreatedEvent", eventHandler);

        expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"]).toBeDefined();
        expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(1);
        expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]).toMatchObject(eventHandler);
    });

    it("should unregister an event handler", () => {

        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendEmailWhenProductIsCreatedHandler();

        eventDispatcher.register("ProductCreatedEvent", eventHandler);

        expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]).toMatchObject(eventHandler);

        eventDispatcher.unregister("ProductCreatedEvent", eventHandler);

        expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"]).toBeDefined();
        expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(0);
    });

    it("should unregister all event handlers", () => {

        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendEmailWhenProductIsCreatedHandler();

        eventDispatcher.register("ProductCreatedEvent", eventHandler);

        expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]).toMatchObject(eventHandler);

        eventDispatcher.unregisterAll();

        expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"]).toBeUndefined();
    });

    it("should notify all event handlers", () => {

        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendEmailWhenProductIsCreatedHandler();
        const spyEventHandler = jest.spyOn(eventHandler, "handle");

        eventDispatcher.register("ProductCreatedEvent", eventHandler);

        expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]).toMatchObject(eventHandler);

        const productCreatedEvent = new ProductCreatedEvent({
            name: "Product 1",
            description: "Product 1 description",
            price: 10.0,
        });

        eventDispatcher.notify(productCreatedEvent);

        expect(spyEventHandler).toHaveBeenCalled();
    });

    it("should notify all event handlers for multiple handlers", () => {

        const eventDispatcher = new EventDispatcher();

        const customerCreatedEventHandler1 = new CustomerCreatedHandler1();
        const spyCustomerCreatedEventHandler1 = jest.spyOn(customerCreatedEventHandler1, "handle");
        eventDispatcher.register("CustomerCreatedEvent", customerCreatedEventHandler1);

        const customerCreatedEventHandler2 = new CustomerCreatedHandler2();
        const spyCustomerCreatedEventHandler2 = jest.spyOn(customerCreatedEventHandler2, "handle");
        eventDispatcher.register("CustomerCreatedEvent", customerCreatedEventHandler2);

        expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"]).toHaveLength(2);
        expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"]).toContainEqual(customerCreatedEventHandler1);
        expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"]).toContainEqual(customerCreatedEventHandler2);

        const customerCreatedEvent = new CustomerCreatedEvent({
            id: "123",
            name: "Customer 1",
        });

        eventDispatcher.notify(customerCreatedEvent);

        expect(spyCustomerCreatedEventHandler1).toHaveBeenCalled();
        expect(spyCustomerCreatedEventHandler2).toHaveBeenCalled();
    });

    it("should notify customer address changed event", () => {
        const eventDispatcher = new EventDispatcher();

        const customerAddressChangedHandler = new CustomerAddressChangedHandler();
        const spyCustomerAddressChangedHandler = jest.spyOn(customerAddressChangedHandler, "handle");
        eventDispatcher.register("CustomerAddressChangedEvent", customerAddressChangedHandler);

        expect(eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"][0]).toMatchObject(customerAddressChangedHandler);

        const customerAddressChangedEvent = new CustomerAddressChangedEvent({
            id: "123",
            name: "Customer 1",
            address: {
                street: "Street 1",
                number: 1,
                zipcode: "Zipcode 1",
                city: "City 1",
            },
        });

        eventDispatcher.notify(customerAddressChangedEvent);

        expect(spyCustomerAddressChangedHandler).toHaveBeenCalled();
    });
});