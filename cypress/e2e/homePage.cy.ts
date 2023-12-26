import {mapPhaseToString, mapRoleToString} from "../../src/utils/helpers.ts";

describe('HomePage', () => {
    beforeEach(function () {
        // Visit the home page before each test
        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);

        cy.mockAuthStatus();

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/get-assigned-seminars`, {
            statusCode: 200,
            fixture: 'homepageSeminars.json',
        }).as('getData');

        cy.fixture('homepageSeminars').then((seminarList) => {
            this.seminarList = seminarList;
        });
    });

    it.only('should display the assigned seminars correctly', function ()  {
            cy.getByData('heading').should('contain', 'Sie sind in folgenden Seminaren eingeschrieben:');


            cy.getByData('table').should('exist');
            cy.wait(500);
            cy.get('table tbody tr').each((row, index) => {
                const seminarData = this.seminarList[index];
                const roleOID = seminarData.roleassignments[0].roleOID;

                cy.wrap(row).find('td').eq(0).should('contain.text', seminarData.description);
                cy.wrap(row).find('td').eq(1).should('contain.text', mapRoleToString(roleOID));
                cy.wrap(row).find('td').eq(2).should('contain.text', mapPhaseToString(seminarData.phase));
                // TODO
                //roleOID === 3 ? cy.wrap(row).getByData("administrate-btn").should('be.disabled') :
                //    cy.wrap(row).getByData("administrate-btn").should('be.enabled');
            });
    });

    it('should redirect if key is valid', function ()  {
        cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/enter-seminar/validSeminarKey`, {
            statusCode: 200,
            body: {seminarOID: "123"},
        });

        cy.getByData('key-input').type('validSeminarKey');
        cy.getByData('enter-seminar').click();

        //use homepageSeminars fixture

        // TODO Fehler seminar/[object%20Object] to include /seminar/123
        cy.url().should('include', '/seminar/123');
    });


    it('should display an alert if seminar key is invalid', function ()  {
        cy.getByData('key-input').type('invalidSeminarKey');
        cy.getByData('enter-seminar').click();

        cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/enter-seminar/`, {
            statusCode: 404,
        });
        cy.on('window:alert', (alertText) => {
            expect(alertText).to.equal('Seminar nicht gedqdqwdqdqfundens');
        });
    });

});
