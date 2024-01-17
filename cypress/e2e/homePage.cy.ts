import {mapPhaseToString, mapRoleToString} from "../../src/utils/helpers.ts";

describe('HomePage', () => {
    beforeEach(function () {
        // Visit the home page before each test
        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);

        cy.mockAuthStatus();

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/user/assigned-seminars`, {
            statusCode: 200,
            fixture: 'homepageSeminars.json',
        }).as('getData');

        //seminar-page
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/*`, {
            statusCode: 200,
            body: {},
        }).as('getDataSeminar');

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/paper/get-assigned-paper/*`, {
            statusCode: 200,
            body: {},
        }).as('getDataAssignedPaper');

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/concepts/newest/*`, {
            statusCode: 200,
            body: {},
        }).as('getDataNewestConcept');

        //seminar-details
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/*/supervisor-list`, {
            statusCode: 200,
            body: {},
        }).as('getDataSupervisorList');

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/*/participants`, {
            statusCode: 200,
            body: {},
        }).as('getDataParticipantsList');


        cy.fixture('homepageSeminars').then((seminarList) => {
            this.seminarList = seminarList;
        });
    });

    it('should display correct table header', function () {
        cy.getByData('seminars-table').should('exist');
        cy.wait(500);

        cy.get('table').find('thead tr').should('exist').within(() => {
            cy.get('th').eq(0).should('have.text', 'Bezeichnung');
            cy.get('th').eq(1).should('have.text', 'Ihre Rolle');
            cy.get('th').eq(2).should('have.text', 'Phase');
            cy.get('th').eq(3).should('have.text', '');
            cy.get('th').eq(4).should('have.text', '');
        });
    });

    it('should display the assigned seminars correctly', function () {
        cy.getByData('heading').should('contain', 'Sie sind in folgenden Seminaren eingeschrieben:');

        cy.getByData('seminars-table').should('exist');
        cy.wait(500);

        cy.get('table tbody tr').each((row, index) => {
            const seminarData = this.seminarList[index];
            if (seminarData) {
                const roleOID = seminarData.roleassignments[0].roleOID;

                cy.wrap(row).find('td').eq(0).should('contain.text', seminarData.description);
                cy.wrap(row).find('td').eq(1).should('contain.text', mapRoleToString(roleOID));
                cy.wrap(row).find('td').eq(2).should('contain.text', mapPhaseToString(seminarData.phase));
                cy.wrap(row).find('td').eq(3).find('button').should('have.text', '➡');
                cy.wrap(row).find('td').eq(4).find('button').should('have.text', 'Verwalten');

                // Button should be disabled if roleOID is 1 (course-admin)
                if (roleOID === 1){
                    cy.wrap(row).find('td').eq(3).find('button').should('be.disabled');
                }else{
                    cy.wrap(row).find('td').eq(3).find('button').should('be.enabled');
                }

                // Button should be disabled if roleOID is 3 (student)
                if (roleOID === 3) {
                    cy.wrap(row).find('td').eq(4).find('button').should('be.disabled');
                } else {
                    cy.wrap(row).find('td').eq(4).find('button').should('be.enabled');
                }
            }
        });
    });

    it('Should redirect to seminarPage on Arrow Click in first row', function () {
        cy.getByData('seminars-table').should('exist');
        cy.wait(500);

        const rowIndex = 1;
        const row = cy.get('table tbody tr').eq(1);
        row.should('exist');
        const seminarOID = this.seminarList[rowIndex].seminarOID;

        row.find('td:eq(3) button')
            .click()
            .then(() => {
                cy.url().should('contain', `/seminar/${seminarOID}`);
            });
    });

    it('Should redirect to seminarDetailsPage on Administrate Click in first row', function () {
        cy.getByData('seminars-table').should('exist');
        cy.wait(500);

        const rowIndex = 1;
        const row = cy.get('table tbody tr').eq(1);
        row.should('exist');
        const seminarOID = this.seminarList[rowIndex].seminarOID;

        row.find('td:eq(4) button')
            .click()
            .then(() => {
                cy.url().should('contain', `/seminar-details/${seminarOID}`);
            });
    });

    describe('Enter Seminar', () => {
        // Enter Seminar
        it('should redirect if key is valid', function () {
            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/enter-seminar/validSeminarKey`, {
                statusCode: 200,
                body: {seminarOID: "123"},
            });

            cy.getByData('key-input').type('validSeminarKey');
            cy.getByData('enter-seminar').click();

            cy.wait(2000);
            cy.url().should('include', '/seminar/123');
        });


        it('should display an alert if seminar key is invalid', function () {
            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/enter-seminar/invalidSeminarKey`, {
                statusCode: 404,
                body: { "error": "Seminar not found" },
            });

            cy.getByData('key-input').type('invalidSeminarKey');
            cy.getByData('enter-seminar').click();

            cy.on('window:alert', (alertText) => {
                expect(alertText).to.equal('Seminar nicht gefunden');
            });
        });

        it('should display an alert if already entered the seminar', function () {
            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/enter-seminar/alreadyEnteredSeminarKey`, {
                statusCode: 400,
                body: { "error": "User already in seminar" },
            });

            cy.getByData('key-input').type('alreadyEnteredSeminarKey');
            cy.getByData('enter-seminar').click();

            cy.on('window:alert', (alertText) => {
                expect(alertText).to.equal('Sie sind bereits in diesem Seminar eingeschrieben');
            });
        });
    });
});
