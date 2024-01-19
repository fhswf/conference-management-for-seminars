import {formatUserName, mapConceptStatusToString, mapPhaseToString, mapRoleToString} from "../../src/utils/helpers.ts";
import Concept from "../../src/entities/database/Concept.ts";

describe('SeminarDetailsPage', () => {
    beforeEach(function () {
        //seminarOID is 1 in fixture
        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}/seminar-details/1`);

        // user 23 is course admin
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/authstatus`, {
            statusCode: 200,
            body: {"user": {"userOID": 23}}
        }).as('authStatus23');

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/*/participants`, {
            statusCode: 200,
            fixture: 'seminarDetailsPageParticipantsList.json',
        }).as('getDataParticipantsList');

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/*/supervisor-list`, {
            statusCode: 200,
            fixture: 'supervisorList.json',
        }).as('getDataSupervisorList');

        cy.fixture('seminarDetailsPageParticipantsList').then((participantsList) => {
            this.participantsList = participantsList;
        });
        cy.fixture('seminarDetailsPageParticipantsListP7').then((participantsListP7) => {
            this.participantsListP7 = participantsListP7;
        });
        cy.fixture('supervisorList').then((supervisorList) => {
            this.supervisorList = supervisorList;
        });
    });

    describe('Should display correct seminar data', function () {
        it('should display correct name', function () {
            cy.getByData('seminar-name')
                .should('exist')
                .should('contain.text', `"${this.participantsList.description}"`);
        });
        it('should display correct assignmentkey', function () {
            cy.getByData('password')
                .should('exist')
                .should('have.value', this.participantsList.assignmentkey);
        });
        it('should display correct amount of submitted concepts', function () {
            const conceptCount = this.participantsList?.roleassignments.filter((user: any) => user.userO.userOIDStudent_concepts[0]?.accepted === true).length;
            const studentCount = this.participantsList?.roleassignments.filter((user: any) => user.roleOID === 3).length;
            cy.getByData('submitted-concepts')
                .should('exist')
                .should('contain.text', `${conceptCount}/${studentCount}`);
        });
        it('should display correct amount of submitted phase 3 paper', function () {
            const p3paperCount = this.participantsList?.roleassignments.filter((user: any) => user.phase3paperOID !== null).length;
            const studentCount = this.participantsList?.roleassignments.filter((user: any) => user.roleOID === 3).length;
            cy.getByData('submitted-p3-paper')
                .should('exist')
                .should('contain.text', `${p3paperCount}/${studentCount}`);
        });
        it('should display correct amount of submitted phase 7 paper', function () {
            const p7paperCount = this.participantsList?.roleassignments.filter((user: any) => user.phase7paperOID !== null).length;
            const studentCount = this.participantsList?.roleassignments.filter((user: any) => user.roleOID === 3).length;
            cy.getByData('submitted-p3-paper')
                .should('exist')
                .should('contain.text', `${p7paperCount}/${studentCount}`);
        });
        it('should display correct phase', function () {
            cy.getByData('phase')
                .should('exist')
                .should('contain.text', `${mapPhaseToString(this.participantsList.phase)}`);
        });
    });

    describe('Next Phase', function () {
        it('should be visible if user is course admin', function () {
            cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}/seminar-details/2`);
            cy.wait(500);

            cy.getByData('phase')
                .should('exist')
        });
        it('should be not visible if user is not course admin', function () {
            // user 25 is supervisor
            cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/authstatus`, {
                statusCode: 200,
                body: {"user": {"userOID": 25}}
            }).as('authStatus25');
            cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}/seminar-details/${this.participantsList.seminarOID}`);
            cy.wait(500);

            cy.getByData('phase')
                .should('not.exist')
        });
        it('should not show an alert if phase is in 7 and onclick', function () {
            cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/*/participants`, {
                statusCode: 200,
                fixture: 'seminarDetailsPageParticipantsListP7.json',
            }).as('getDataParticipantsListP7');
            cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}/seminar-details/2`);

            cy.getByData('phase')
                .should('exist')
                .should('contain.text', `${mapPhaseToString(this.participantsListP7.phase)}`)
                .click();

            cy.on('window:alert', (alertText) => {
                expect(alertText).to.be.undefined;
            });
        });
        it('should show confirm alert if onclick and alert if successfully changed phase', function () {
            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/${this.participantsList.seminarOID}/go-to-next-phase`, {
                statusCode: 200,
                body: {},
            }).as('getDataParticipantsList');

            cy.getByData('phase')
                .should('exist')
                .click();

            cy.on('window:confirm', (confirmText) => {
                expect(confirmText).to.equal(`Möchten Sie von "${mapPhaseToString(this.participantsList.phase)}" übergehen zu "${mapPhaseToString(this.participantsList.phase + 1)}"?`);
                return true;
            });

            cy.on('window:alert', (alertText) => {
                expect(alertText).to.equal(`Erfolgreich`);
            });

            //check if displayed new phase
            cy.getByData('phase')
                .should('exist')
                .should('contain.text', `${mapPhaseToString(this.participantsList.phase + 1)}`);

            cy.getByData('phase')
                .should('exist')
                .should('contain.text', `${mapPhaseToString(this.participantsList.phase + 1)}`);
        });
        it('should show confirm alert if onclick and alert if successfully changed phase', function () {
            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/${this.participantsList.seminarOID}/go-to-next-phase`, {
                statusCode: 400,
                body: {},
            }).as('getDataParticipantsList');

            cy.getByData('phase')
                .should('exist')
                .click();

            cy.on('window:confirm', (confirmText) => {
                expect(confirmText).to.equal(`Möchten Sie von "${mapPhaseToString(this.participantsList.phase)}" übergehen zu "${mapPhaseToString(this.participantsList.phase + 1)}"?`);
                return true;
            });

            cy.on('window:alert', (alertText) => {
                expect(alertText).to.equal(`Fehler`);
            });
        });
    });

    describe('Table', function () {
        it('should display correct table header', function () {
            cy.getByData('table-participants').should('exist');
            cy.wait(500);

            cy.getByData('table-participants').find('thead tr').should('exist').within(() => {
                cy.get('th').eq(0).should('have.text', 'Nachname');
                cy.get('th').eq(1).should('have.text', 'Vorname');
                cy.get('th').eq(2).should('have.text', 'Mail');
                cy.get('th').eq(3).should('have.text', 'Rolle');
                cy.get('th').eq(4).should('have.text', 'Betreuer');
                cy.get('th').eq(5).should('have.text', 'Konzept');
                cy.get('th').eq(6).should('have.text', '');
                cy.get('th').eq(7).should('have.text', '');
                cy.get('th').eq(8).should('have.text', '');
            });
        });

        it('should display table content correctly', function () {
            cy.getByData('table-participants').should('exist');
            cy.wait(500);

            cy.get('table tbody tr').should('have.length', this.participantsList.roleassignments.length);
            cy.get('table tbody tr').each((row, index) => {
                const user = this.participantsList.roleassignments[index];
                if (user) {
                    user.userO.lastname ?
                        cy.wrap(row).find('td').eq(0).should('have.text', user.userO.lastname) :
                        cy.wrap(row).find('td').eq(0).should('have.text', '-');
                    user.userO.firstname ?
                        cy.wrap(row).find('td').eq(1).should('have.text', user.userO.firstname) :
                        cy.wrap(row).find('td').eq(1).should('have.text', '-');
                    cy.wrap(row).find('td').eq(2).should('have.text', user.userO.mail);
                    cy.wrap(row).find('td').eq(3).should('have.text', mapRoleToString(user.roleOID));

                    if (user.userO.userOIDStudent_concepts && user.userO.userOIDStudent_concepts.length > 0) {
                        const concept = user.userO.userOIDStudent_concepts[0];
                        const supervisor = concept.userOIDSupervisor_user;
                        console.log(supervisor)
                        supervisor ?
                            cy.wrap(row).find('td').eq(4).should('have.text', formatUserName(supervisor)) :
                            cy.wrap(row).find('td').eq(4).should('have.text', `-`);
                        cy.wrap(row).find('td').eq(5).should('have.text', `${concept.accepted === null ? 'Bewertung ausstehend' : concept.accepted === false ? 'Abgelehnt' : 'Angenommen'}`);
                    } else {
                        cy.wrap(row).find('td').eq(4).should('have.text', '-');
                        cy.wrap(row).find('td').eq(5).should('have.text', '-');
                    }

                    cy.wrap(row).find('td').eq(6).find('button').should('have.text', 'Edit');
                    if (user.roleOID === 3 && user.userO.userOIDStudent_concepts.length > 0) {
                        cy.wrap(row).find('td').eq(7).find('button')
                            .should('have.text', 'Bewerten')
                            .should('be.enabled');
                    } else {
                        cy.wrap(row).find('td').eq(7).find('button')
                            .should('have.text', 'Bewerten')
                            .should('be.disabled');
                    }
                    cy.wrap(row).find('td').eq(8).find('button').should('have.text', 'Details');
                }
            })
        });

        it('details button should redirect to correct page', function () {
            const randomRowIndex = Math.floor(Math.random() * this.participantsList.roleassignments.length);
            const randomUserId = this.participantsList.roleassignments[randomRowIndex].userO.userOID;
            const url = `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/${this.participantsList.seminarOID}/get-student/${randomUserId}`;

            cy.intercept('GET', url, {
                statusCode: 200,
                body: {},
            }).as('getUser');

            cy.getByData('table-participants').should('exist');
            cy.wait(500);

            cy.get('table tbody tr').eq(randomRowIndex).find('td').eq(8).find('button').click();

            cy.wait('@getUser').should('exist');

            cy.location('pathname').should('contain', `/seminar-details/${this.participantsList.seminarOID}/user/${randomUserId}`);
        });

        describe('Edit Participant', function () {
            it('should display correct table header', function () {
                cy.getByData('table-participants').should('exist');
                cy.wait(500);

                //click on edit of first row
                cy.getByData('table-participants').should('exist')
                    .get('table tbody tr').eq(0)
                    .find('td').eq(6).find('button').click();


                cy.getByData('table-participants-edit').find('thead tr').should('exist').within(() => {
                    cy.get('th').eq(0).should('have.text', 'Nachname');
                    cy.get('th').eq(1).should('have.text', 'Vorname');
                    cy.get('th').eq(2).should('have.text', 'Mail');
                    cy.get('th').eq(3).should('have.text', 'Rolle');
                    cy.get('th').eq(4).should('have.text', 'Betreuer');
                    cy.get('th').eq(5).should('have.text', 'Konzept');
                });
            });
            it('show show correct table content if clicked on edit-button of a participant', function () {
                cy.getByData('table-participants').should('exist');
                cy.wait(500);

                const randRowIndex = Math.floor(Math.random() * this.participantsList.roleassignments.length);

                //click on edit button of random row
                cy.get('table tbody tr').eq(randRowIndex).find('td').eq(6).find('button').click();

                // loop over every row
                cy.get('table tbody tr').each((row, rowIndex) => {
                    const user = this.participantsList.roleassignments[rowIndex];
                    const concept = user.userO.userOIDStudent_concepts[0];
                    const supervisor = concept ? concept.userOIDSupervisor_user : null;
                    if (user) {
                        cy.wrap(row).find('td').eq(0).should('have.text', user.userO.lastname || '-');
                        cy.wrap(row).find('td').eq(1).should('have.text', user.userO.firstname || '-');
                        cy.wrap(row).find('td').eq(2).should('have.text', user.userO.mail);

                        //Dropdown list should only exist in selected row
                        if (rowIndex !== randRowIndex) {
                            cy.wrap(row).find('td').eq(3).should('have.text', mapRoleToString(user.roleOID));
                        } else {
                            cy.wrap(row).find('td').eq(3).getByData('role-edit')
                                .should('exist')
                        }

                        cy.wrap(row).find('td').eq(4).should('have.text', supervisor ? formatUserName(supervisor) : '-');
                        cy.wrap(row).find('td').eq(5).should('have.text', concept ? mapConceptStatusToString(concept?.accepted) : '-');

                    }
                });
                cy.getByData('save-edit').should('exist');
                cy.getByData('abort-edit').should('exist');
            });

            it('test functionality of changing role', function () {
                const randRowIndex = Math.floor(Math.random() * this.participantsList.roleassignments.length);
                const randomRoleIndex = Math.floor(Math.random() * 3);
                const userOID = this.participantsList.roleassignments[randRowIndex].userO.userOID;
                const roleOID = randomRoleIndex + 1;
                const seminarOID = this.participantsList.seminarOID;

                cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/update-user`, (req) => {

                    expect(req.body).to.deep.equal({userOID, roleOID, seminarOID});
                    req.reply({
                        statusCode: 200,
                        body: {},
                    });
                }).as('updateUser');

                //click random edit button of random row
                cy.get('table tbody tr').eq(randRowIndex).find('td')
                    .eq(6).find('button')
                    .click();

                //because table is rerendered after click
                let row = cy.get('table tbody tr').eq(randRowIndex);
                row.find('td').eq(3).getByData('role-edit')
                    .should('exist')
                    .click();
                //select new random role
                cy.get('.p-dropdown-item').eq(randomRoleIndex).click();

                //check if role is changed
                row = cy.get('table tbody tr').eq(randRowIndex);
                row.find('td').eq(3).getByData('role-edit')
                    .should('contain.text', mapRoleToString(randomRoleIndex + 1));

                cy.getByData('table-participants-edit').should('exist');

                //click save button
                cy.getByData('save-edit').click();

                //check if table is rerendered
                cy.getByData('table-participants-edit').should('not.exist');
                cy.getByData('table-participants').should('exist');

                //check if role is changed in backend
                cy.wait('@updateUser').should('exist');

                //should show alert
                cy.on('window:alert', (alertText) => {
                    expect(alertText).to.equal(`Rolle erfolgreich geändert`);
                });
            });
            it('test role change on abort click', function () {
                const randRowIndex = Math.floor(Math.random() * this.participantsList.roleassignments.length);
                const randomRoleIndex = Math.floor(Math.random() * 3);
                const userOID = this.participantsList.roleassignments[randRowIndex].userO.userOID;
                const roleOID = randomRoleIndex + 1;
                const seminarOID = this.participantsList.seminarOID;

                cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/update-user`, (req) => {
                    expect(req.body).to.deep.equal({userOID, roleOID, seminarOID});
                    req.reply({
                        statusCode: 200,
                        body: {},
                    });
                }).as('updateUser');

                //click random edit button of random row
                cy.get('table tbody tr').eq(randRowIndex).find('td')
                    .eq(6).find('button')
                    .click();

                //because table is rerendered after click
                let row = cy.get('table tbody tr').eq(randRowIndex);
                row.find('td').eq(3).getByData('role-edit')
                    .should('exist')
                    .click();
                //select new random role
                cy.get('.p-dropdown-item').eq(randomRoleIndex).click();

                //check if role is changed
                row = cy.get('table tbody tr').eq(randRowIndex);
                row.find('td').eq(3).getByData('role-edit')
                    .should('contain.text', mapRoleToString(randomRoleIndex + 1));

                cy.getByData('table-participants-edit').should('exist');
                cy.getByData('table-participants').should('not.exist');

                //click abort button
                cy.getByData('abort-edit').click();

                //check if table is rerendered
                cy.getByData('table-participants-edit').should('not.exist');
                cy.getByData('table-participants').should('exist');

                //check if role is not changed in backend
                cy.get('@updateUser').should('not.exist');
            });
            it('should show alert if user is supervisor of student and role is changed', function () {
                cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/update-user`, {
                    statusCode: 409,
                    body: {},
                }).as('updateUser');

                //search supervisor of student concept
                const supervisorOID = this.participantsList.roleassignments.find((user: any) => user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user);
                const rowIndexOfSupervisor = this.participantsList.roleassignments.findIndex((user: any) => user.userO.userOID === supervisorOID.userO.userOID);

                //click edit button of supervisor
                cy.get('table tbody tr').eq(rowIndexOfSupervisor).find('td')
                    .eq(6).find('button')
                    .click();

                //click on role dropdown
                cy.get('table tbody tr').eq(rowIndexOfSupervisor).find('td').eq(3).getByData('role-edit')
                    .should('exist')
                    .click();

                //select new role
                cy.get('.p-dropdown-item').eq(1).click();

                //click save button
                cy.getByData('save-edit').click();

                //should show alert
                cy.on('window:alert', (alertText) => {
                    expect(alertText).to.equal(`Fehler: Dieser Benutzer ist bereits Betreuer eines anderen Studenten`);
                });
            } );

        });

    });
    describe('Evaluate Concept', function () {
        it('should show correct concept data in evaluation popup with available supervisor', function () {
            cy.getByData('table-participants').should('exist');
            cy.wait(500);

            // Iteriere über jede Zeile
            cy.get('table tbody tr').each((row, rowIndex) => {
                const user = this.participantsList.roleassignments[rowIndex];
                if (user) {
                    cy.wrap(row).find('td').eq(7).findByData('evaluate-concept')
                        .should('exist')
                        .then(($evaluateButton) => {
                            if (!$evaluateButton.prop('disabled')) {
                                // click on evaluate button
                                cy.wrap($evaluateButton).click();

                                // compare concept data
                                const concept = user.userO.userOIDStudent_concepts[0];
                                cy.getByData('name-evaluate').should('exist')
                                    .should('contain.text', `${user.userO.firstname || ""} ${user.userO.lastname || ""}`);
                                cy.getByData('mail-evaluate').should('exist')
                                    .should('contain.text', `${user.userO.mail}`);
                                cy.getByData('text-evaluate').should('exist')
                                    .should('contain.text', `${concept.text}`);
                                if (concept.attachmentO) {
                                    cy.getByData('attachment-evaluate').should('exist')
                                        .find('a')
                                        .should(($a) => {
                                            const href = $a.attr('href');
                                            expect(href).to.include(`/attachment/${concept.attachmentO?.attachmentOID}`);
                                        })
                                        .should('have.text', `${concept.attachmentO.filename}`);
                                } else {
                                    cy.getByData('attachment-evaluate').should('exist')
                                        .should('contain.text', `${concept.attachmentO?.filename || "-"}`);
                                }

                                cy.getByData('status-evaluate')
                                    .should('exist')
                                    .should('contain.text', `${mapConceptStatusToString(concept.accepted)}`);
                                cy.getByData('feedback-evaluate').should('exist')
                                    .should('contain.text', `${concept.feedback || "-"}`);

                                if (concept.accepted === null || concept.accepted === false) {
                                    //should exist Supervisor Dropdown, textfield and accept/reject button
                                    //check content of dropdown
                                    cy.getByData('supervisors-evaluate').should('exist');
                                    cy.getByData('supervisors-evaluate').click();
                                    //check content of dropdown
                                    cy.get('.p-dropdown-items li.p-dropdown-item').each((user, index) => {
                                        const supervisor = this.supervisorList[index];
                                        cy.wrap(user).should(
                                            'have.text',
                                            `${formatUserName(supervisor)}`
                                        );
                                    });

                                    //check right supervisor is selected in dropdown
                                    concept.userOIDSupervisor_user ?
                                        cy.getByData('supervisors-evaluate').should('contain.text', `${formatUserName(concept.userOIDSupervisor_user)}`) :
                                        cy.getByData('supervisors-evaluate').should('contain.text', 'Betreuer wählen');

                                    cy.getByData('textfield-evaluate').should('exist');
                                    cy.getByData('accept-evaluate').should('exist');
                                    cy.getByData('reject-evaluate').should('exist');

                                    if (concept.accepted === false) {
                                        //reject button should be disabled
                                        cy.getByData('reject-evaluate').should('be.disabled');
                                        cy.getByData('accept-evaluate').should('not.be.disabled');
                                    }
                                } else {
                                    cy.getByData('textfield-evaluate').should('not.exist');
                                    cy.getByData('accept-evaluate').should('not.exist');
                                    cy.getByData('reject-evaluate').should('not.exist');
                                }

                                // close modal
                                cy.getByData('close-modal').should('exist').click();
                            }
                        });
                }
            });
        });
        it('should show alert if tried to accept concept without selected supervisor', function () {
            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/evaluate-concept`, {
                statusCode: 200,
                body: {},
            }).as('evaluateConcept');

            cy.getByData('table-participants').should('exist');
            cy.wait(500);

            // Iteriere über jede Zeile
            cy.get('table tbody tr').each((row, rowIndex) => {
                const user = this.participantsList.roleassignments[rowIndex];
                if (user) {
                    cy.wrap(row).find('td').eq(7).findByData('evaluate-concept')
                        .should('exist')
                        .then(($evaluateButton) => {
                            const concept = user.userO.userOIDStudent_concepts[0];
                            // check concepts which are not accepted and have no supervisor; no supervisor should be pre selected
                            if (!$evaluateButton.prop('disabled') && !concept.accepted && concept.userOIDSupervisor_user === null) {
                                // click on evaluate button
                                cy.wrap($evaluateButton).click();


                                // click on accept button
                                cy.getByData('accept-evaluate').should('exist').click();

                                // check if alert is shown if no supervisor is selected
                                if (user.userO.userOIDStudent_concepts[0].userOIDSupervisor_user === null) {
                                    cy.on('window:alert', (alertText) => {
                                        expect(alertText).to.equal(`Bitte wählen Sie einen Betreuer aus.`);
                                    });
                                }

                                // close modal
                                cy.getByData('close-modal').should('exist').click();
                            }
                        });
                }
            });
        });

        it('should send correct data to backend if evaluated', function () {
            // user 41 has no accepted concept and no supervisor
            const accept = Math.floor(Math.random() * 2);
            const randomSupervisorIndex = Math.floor(Math.random() * this.supervisorList.length);
            const userId = 41;
            const rowIndexOfUser = this.participantsList.roleassignments.findIndex((user: any) => user.userO.userOID === userId);

            //create concept json as answer from backend
            const concept: Concept = {
                conceptOID: null, //not important
                text: '...', //not important
                attachmentOID: null, //not important
                createdAt: null, //not important
                userOIDSupervisor: this.supervisorList[randomSupervisorIndex].userOID,
                userOIDStudent: userId,
                feedback: 'test feedback',
                seminarOID: this.participantsList.seminarOID,
                accepted: accept === 1,
            };

            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/evaluate-concept`, (req) => {
                expect(req.body).to.deep.equal({
                    conceptOID: this.participantsList.roleassignments[rowIndexOfUser].userO.userOIDStudent_concepts[0].conceptOID,
                    accepted: accept === 1,
                    feedback: 'test feedback',
                    userOIDSupervisor: this.supervisorList[randomSupervisorIndex].userOID,
                    seminarOID: this.participantsList.seminarOID,
                });
                req.reply({
                    statusCode: 200,
                    body: concept,
                });
            }).as('evaluateConcept');

            cy.getByData('table-participants').should('exist');
            cy.wait(500);

            // click on evaluate button
            cy.get('table tbody tr').eq(rowIndexOfUser).find('td').eq(7).findByData('evaluate-concept').click();


            cy.getByData('supervisors-evaluate').should('exist');
            cy.getByData('supervisors-evaluate').click();
            cy.get('.p-dropdown-items li.p-dropdown-item').eq(randomSupervisorIndex).click();

            cy.getByData('textfield-evaluate').should('exist').type('test feedback');

            accept ?
                cy.getByData('accept-evaluate').should('exist').click() :
                cy.getByData('reject-evaluate').should('exist').click();

            //test call to backend
            cy.wait('@evaluateConcept').should('exist');

            //should alert if successfully evaluated
            cy.on('window:alert', (alertText) => {
                expect(alertText).to.equal(`Erfolgreich`);
            });

            //should close modal if successfully evaluated
            cy.getByData('modal').should('not.exist');

            //should update table
            cy.getByData('table-participants').should('exist');
            cy.wait(500);

            //check if status is updated
            cy.get('table tbody tr').eq(rowIndexOfUser).find('td').eq(5).should('contain.text', `${mapConceptStatusToString(accept === 1)}`);

            //check if supervisor is updated
            cy.get('table tbody tr').eq(rowIndexOfUser).find('td').eq(4).should('contain.text', `${formatUserName(this.supervisorList[randomSupervisorIndex])}`);
        });
    });
});
