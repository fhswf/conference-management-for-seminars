declare namespace Cypress {
    interface Chainable {
        getByData(selector: string): Chainable<Element>;
        mockAuthStatus(): Chainable<void>;
    }
}
