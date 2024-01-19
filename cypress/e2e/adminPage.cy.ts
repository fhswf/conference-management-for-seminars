describe('AdminPage', () => {
    beforeEach(function () {
        cy.mockAuthStatus();
        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}/administration`);

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/all`, {
            statusCode: 200,
            fixture: 'adminSeminarList.json',
        }).as('getDataSeminarList');
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/*/addable-users`, {
            statusCode: 200,
            fixture: 'adminAddableUsers.json',
        }).as('getDataAddableUsers');


        cy.fixture('adminSeminarList').then((seminarList) => {
            this.seminarList = seminarList;
        });


        cy.fixture('adminAddableUsers').then((addableUsersList) => {
            this.addableUsersList = addableUsersList;
        });

    });

    it('Should contain the mainlayout', function () {
        cy.getByData('main-layout').should('exist');
    });

    it('Should contain the correct heading', function () {
        cy.getByData('heading-admin').should('have.text', 'Administration');
    });

    it('Should contain textfield, button and table', function () {
        cy.getByData('textfield-admin').should('exist');
        cy.getByData('button-admin').should('exist');
        cy.getByData('seminar-table').should('exist');
    });

    it('should display correct table header', function () {
        cy.getByData('seminar-table').should('exist');
        cy.wait(500);

        cy.get('table').find('thead tr').should('exist').within(() => {
            cy.get('th').eq(0).should('have.text', 'ID');
            cy.get('th').eq(1).should('have.text', 'Bezeichnung');
            cy.get('th').eq(2).should('have.text', 'Phase');
            cy.get('th').eq(3).should('have.text', 'Erstellt am');
            cy.get('th').eq(4).should('have.text', 'Einschreibeschlüssel');
            cy.get('th').eq(5).should('have.text', '');
        });
    });

    it('should display existing seminar correctly', function () {
        cy.getByData('seminar-table').should('exist');
        cy.wait(500);

        cy.get('table tbody tr').each((row, index) => {
            const seminarData = this.seminarList[index];
            if (seminarData) {
                cy.wrap(row).find('td').eq(0).should('contain.text', seminarData.seminarOID);
                cy.wrap(row).find('td').eq(1).should('contain.text', seminarData.description);
                cy.wrap(row).find('td').eq(2).should('contain.text', seminarData.phase);
                cy.wrap(row).find('td').eq(3).should('have.text', new Date(seminarData.createdAt).toLocaleString());
                cy.wrap(row).find('td').eq(4).find('input')
                    .should('have.value', seminarData.assignmentkey)
                    .should('have.attr', 'type', 'password');
                cy.wrap(row).find('td').eq(5).find('button')
                    .should('have.text', 'OIDC Nutzer hinzufügen')
                    .find('.p-button-icon')
                    .should('exist')
                    .should('have.class', 'p-button-icon p-c p-button-icon-left pi pi-plus');

            }
        });
    });

    describe('Create Seminar', () => {
        it('Should display an alert if seminar created successfully', function () {
            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar`, (req) => {
                expect(req.body).to.deep.equal({name: 'Test Seminar'});
                req.reply({
                    statusCode: 200,
                    body: {},
                });
            });

            cy.getByData('textfield-admin').type('Test Seminar');
            cy.getByData('button-admin').click();

            cy.on('window:alert', (alertText) => {
                expect(alertText).to.equal('Seminar erstellt');
            });
        });
        it('Should update seminar table if created successfully', function () {
            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar`, (req) => {
                expect(req.body).to.deep.equal({name: 'Test Seminar'});
                req.reply({
                    statusCode: 200,
                    fixture: 'adminCreatedSeminar.json',
                });
            });

            cy.getByData('textfield-admin').type('Test Seminar');
            cy.getByData('button-admin').click();

            //check last row in table
            cy.fixture('adminCreatedSeminar').then((seminar) => {
                cy.get('table tbody tr').last().find('td').eq(0).should('contain.text', seminar.seminarOID);
                cy.get('table tbody tr').last().find('td').eq(1).should('contain.text', seminar.description);
                cy.get('table tbody tr').last().find('td').eq(2).should('contain.text', seminar.phase);
                cy.get('table tbody tr').last().find('td').eq(3).should('contain.text', new Date(seminar.createdAt).toLocaleString());
                cy.get('table tbody tr').last().find('td').eq(4).find('input').should('have.value', seminar.assignmentkey)
            } );

        });
        it('input should be limited to 32 characters', function () {
            const test = 'Lorem ipsum dolor sit amet, consetetur sadipscing';
            cy.getByData('textfield-admin').type(test);
            cy.getByData('textfield-admin').should('have.value', test.slice(0, 32));
        });
    });

    describe('Assign User', () => {
        it('should show a modal if add-button clicked with correct content', function () {
            cy.getByData('seminar-table').should('exist');
            cy.wait(500);

            cy.get('table tbody tr').each((row, index) => {
                const seminarData = this.seminarList[index];
                if (seminarData) {
                    cy.wrap(row).find('td').eq(5).find('button')
                        .should('have.text', 'OIDC Nutzer hinzufügen')
                        .click();

                    //check seminar name
                    cy.getByData('seminar').should('contain.text', seminarData.description);

                    cy.getByData('close-modal').click();
                }
            });
        });
        it('should show all received user in dropdown list', function () {
            cy.getByData('seminar-table').should('exist');
            cy.wait(500);

            cy.get('table tbody tr').each((row, index) => {
                cy.wrap(row).find('td').eq(5).find('button')
                    .should('have.text', 'OIDC Nutzer hinzufügen')
                    .click();

                cy.getByData('users').click();

                cy.get('.p-dropdown-items li.p-dropdown-item').each((user, userIndex) => {
                    const userData = this.addableUsersList[userIndex];
                    if (userData) {
                        if (userData.firstname || userData.lastname) {
                            const name = `${userData.lastname || ''}${userData.lastname && userData.firstname ? ', ' : ''}${userData.firstname || ''}`;
                            cy.wrap(user).should(
                                'have.text',
                                `${name}`
                            );
                        } else if (userData.mail) {
                            cy.wrap(user).should(
                                'have.text',
                                `${userData.mail}`
                            );
                        }
                    }
                });

                cy.getByData('close-modal').click();
            });
        });
        it('should show three roles in dropdown list', function () {
            cy.getByData('seminar-table').should('exist');
            cy.wait(500);

            cy.get('table tbody tr').each((row, index) => {
                cy.wrap(row).find('td').eq(5).find('button')
                    .should('have.text', 'OIDC Nutzer hinzufügen')
                    .click();

                cy.getByData('roles').click();


                const roles = ['Kurs-Admin', 'Betreuer', 'Student'];
                cy.get('.p-dropdown-items li.p-dropdown-item').each((user, index) => {

                    cy.wrap(user).should(
                        'have.text',
                        `${roles[index]}`
                    );
                });

                cy.getByData('close-modal').click();
            });
        });

        it('should show alert if user could not be assigned', function () {
            cy.getByData('seminar-table').should('exist');
            cy.wait(500);

            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/user/assign-to-seminar`, (req) => {
                req.reply({
                    statusCode: 400,
                    body: {},
                });
            } );

            cy.get('table tbody tr').eq(0).find('td').eq(5).find('button')
                .should('have.text', 'OIDC Nutzer hinzufügen')
                .click();

            cy.getByData('users').click();
            cy.get('.p-dropdown-items li.p-dropdown-item').eq(0).click();

            cy.getByData('roles').click();
            cy.get('.p-dropdown-items li.p-dropdown-item').eq(0).click();

            cy.getByData('assign-user').click();

            cy.on('window:alert', (alertText) => {
                expect(alertText).to.equal('User konnte nicht eingetragen werden');
            });
        });

        it('should send selected user with role to backend, alert if successful, and close modal', function () {
            //for each user in fixture select a random row in table and assign a random user with a random role

            cy.fixture('adminAddableUsers').then((addableUsersList) => {
                addableUsersList.forEach(() => {
                    const randomRowIndex = Math.floor(Math.random() * this.seminarList.length);
                    cy.get('table tbody tr').eq(randomRowIndex).should('exist');
                    const seminarOID = this.seminarList[randomRowIndex].seminarOID;

                    const randomIndexUser = Math.floor(Math.random() * addableUsersList.length);
                    const randomIndexRole = Math.floor(Math.random() * 3);

                    const userOID = addableUsersList[randomIndexUser].userOID;
                    const roleOID = randomIndexRole + 1;

                    cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/user/assign-to-seminar`, (req) => {
                        expect(req.body).to.deep.equal({seminarOID, userOID, roleOID});
                        req.reply({
                            statusCode: 200,
                            body: {},
                        });
                    });

                    const row = cy.get('table tbody tr').eq(randomRowIndex);
                    row.find('td:eq(5) button').click();

                    cy.getByData('users').click();
                    cy.get('.p-dropdown-items li.p-dropdown-item').eq(randomIndexUser).click(); // Verwende userIndex, um den Benutzer zu wählen

                    cy.getByData('roles').click();
                    cy.get('.p-dropdown-items li.p-dropdown-item').eq(randomIndexRole).click();

                    cy.getByData('assign-user').click();

                    //test alert
                    cy.on('window:alert', (alertText) => {
                        expect(alertText).to.equal('User wurde eingetragen');
                    });

                    cy.getByData('modal').should('not.exist');
                });
            });
        });
    });
});
