import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerAddressChangedEvent from "../customer-address-changed.event";

export default class CustomerAddressChangedHandler implements EventHandlerInterface<CustomerAddressChangedEvent> {
    handle(event: CustomerAddressChangedEvent): void {
        const id = event.eventData.id
        const name = event.eventData.name
        const address = 
            event.eventData.address.street +
            ", " + event.eventData.address.number +
            ", " + event.eventData.address.zipcode +
            ", " + event.eventData.address.city
        console.log(`Endereço do cliente: ${id}, ${name} alterado para: ${address}`);
    }
}