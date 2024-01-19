describe('Menubar test', () => {
    beforeEach(function () {
        // Visit the home page before each test


        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/user/assigned-seminars`, {
            statusCode: 200,
            fixture: 'homepageSeminars.json',
        }).as('getData');

        cy.fixture('menubarAuthStatus').then((authStatusList) => {
            this.authStatusList = authStatusList;
        });
    });

    it('should exist in homepage', function () {
        cy.mockAuthStatus();
        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);

        cy.getByData('main-layout-menubar').should('exist');
    });
    it('should contain visible logo, homepage-label and logout-button', function () {
        cy.mockAuthStatus();
        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);
        cy.getByData('main-layout-logo').should('be.visible');
        cy.contains('Startseite').should('be.visible');
        cy.getByData('main-layout-logout').should('be.visible');
    });

    it('administration-button should be visible and redirect to admin-page if user is system admin', function () {
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/authstatus`, {
            statusCode: 200,
            body: {
                "user": {
                    "firstname": "Max",
                    "lastname": "Mustermann",
                    "mail": "mustermann.max@fh-swf.de",
                    "isAdmin": true
                }
            },
        });
        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);
        cy.wait(1000)

        cy.contains('Administration').should('be.visible');
        cy.contains('Administration').click();
        cy.url().should('eq', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}/administration`);
    });

    it('administration-button should not exist if user is not system admin', function () {
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/authstatus`, {
            statusCode: 200,
            body: {
                "user": {
                    "firstname": "Max",
                    "lastname": "Mustermann",
                    "mail": "mustermann.max@fh-swf.de",
                    "isAdmin": false
                }
            },
        });
        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);

        cy.contains('Administration').should('not.exist');
    });

    it('should redirect to homepage if button is clicked', function () {
        cy.mockAuthStatus();
        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);
        cy.contains('Startseite').click();
        cy.url().should('eq', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);
    });

    it('should send GET on logout clicked and redirect to received URL', function () {
        cy.mockAuthStatus();
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/logout`, {
            statusCode: 200,
            body: {url: `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`},
        });

        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);
        cy.getByData('main-layout-logout').click();
        cy.url().should('eq', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);

    });

    it('user details should be displayed correctly', function () {
        for (let i = 0; i < this.authStatusList.length; i++) {
            cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/authstatus`, {
                statusCode: 200,
                body: {user: this.authStatusList[i]}
            });
            cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}`);

            cy.get('.p-splitbutton-menubutton').click();
            cy.get('.p-menu').should('be.visible');

            if (this.authStatusList[i].firstname) {
                cy.get('.p-menu').should('contain', this.authStatusList[i].firstname);
            }
            if (this.authStatusList[i].lastname) {
                cy.get('.p-menu').should('contain', this.authStatusList[i].lastname);
            }

            cy.get('.p-menu').should('contain', this.authStatusList[i].mail);

            if (this.authStatusList[i].isAdmin) {
                cy.get('.p-menu').should('contain', 'System-Admin');
            }
        }
    });
});
