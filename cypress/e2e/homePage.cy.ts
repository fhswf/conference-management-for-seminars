import {mapPhaseToString, mapRoleToString} from "../../src/utils/helpers.ts";

describe('HomePage', () => {
    beforeEach(function () {
        // Visit the home page before each test
        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);

        cy.mockAuthStatus();

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/user/get-assigned-seminars`, {
            statusCode: 200,
            fixture: 'homepageSeminars.json',
        }).as('getData');

        //seminar-page
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/*`, {
            statusCode: 200,
            fixture: 'seminarPageSeminar.json',
        }).as('getDataSeminar');

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/paper/get-assigned-paper/*`, {
            statusCode: 200,
            fixture: 'seminarPageAssignedPaper.json',
        }).as('getDataAssignedPaper');

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/concepts/newest/*`, {
            statusCode: 200,
            fixture: 'seminarPageSeminar.json',
        }).as('getDataNewestConcept');

        //seminar-details
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/user/get-supervisor-list/*`, {
            statusCode: 200,
            fixture: 'seminarPageSeminar.json',
        }).as('getDataStudentList');
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/*/participants`, {
            statusCode: 200,
            fixture: 'seminarPageSeminar.json',
        }).as('getDataSupervisorList');


        cy.fixture('homepageSeminars').then((seminarList) => {
            this.seminarList = seminarList;
        });
    });

    it('should display the assigned seminars correctly', function () {
        cy.getByData('heading').should('contain', 'Sie sind in folgenden Seminaren eingeschrieben:');

        cy.getByData('table').should('exist');
        cy.wait(500);

        /*
        cy.wait('@getData').should(({request, response}) => {
            expect(request.method).to.equal('GET');
            expect(request.url).to.equal(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/get-assigned-seminars`);
            expect(response.statusCode).to.equal(200);
        });*/

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
        cy.getByData('table').should('exist');
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
    it.only('Should redirect to seminarPage on Administrate Click in first row', function () {
        cy.getByData('table').should('exist');
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

    it('should redirect if key is valid', function () {
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


    it('should display an alert if seminar key is invalid', function () {
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
