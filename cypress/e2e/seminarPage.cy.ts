import {
    formatUserName,
    isJsonEmpty,
    mapConceptStatusToString,
    mapPhaseToString, mapRatingToString,
    mapRoleToString
} from "../../src/utils/helpers.ts";

describe('SeminarPage', () => {
    //user has id 1 in fixtures
    const userOID = 1;
    // seminar has id 1 in fixtures
    const seminarOID = 1;
    beforeEach(function () {
        cy.visit(`${Cypress.env('VITE_FRONTEND_URL')}/seminar/${seminarOID}`);
        cy.mockAuthStatus();

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/seminar/${seminarOID}`, {
            statusCode: 200,
            fixture: 'seminarPageSeminarStudent.json',
        }).as('getDataSeminar');

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/concepts/newest/${seminarOID}`, {
            statusCode: 200,
            fixture: 'seminarPageConcept.json',
        }).as('getDataConcept');

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/paper/get-assigned-paper/${seminarOID}`, {
            statusCode: 200,
            fixture: 'seminarPageAssignedPaper.json',
        }).as('getDataConcept');

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/seminar/*/supervisor-list`, {
            statusCode: 200,
            fixture: 'supervisorList.json',
        }).as('getDataSupervisorList');

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/chat/*`, {
            statusCode: 200,
            fixture: 'chatMessages.json',
        }).as('getDataChatMessages');

        cy.fixture('seminarPageSeminarStudent').then((seminar) => {
            this.seminar = seminar;
        });

        cy.fixture('seminarPageConcept').then((concept) => {
            this.concept = concept;
        });

        cy.fixture('seminarPageAssignedPaper').then((assignedPaper) => {
            this.assignedPaper = assignedPaper;
        });

        cy.fixture('supervisorList').then((supervisorList) => {
            this.supervisorList = supervisorList;
        });

        cy.fixture('chatMessages').then((chatmessagesList) => {
            this.chatmessagesList = chatmessagesList;
        });

        cy.fixture('chatCreatedMessage').then((createdMessage) => {
            this.createdMessage = createdMessage;
        });
    });

    it('should show seminar details', function () {
        //h1 should exist
        cy.getByData('header').should('exist').should('contain.text', 'Seminar Übersicht');
        cy.getByData('seminar-name').should('exist').should('have.text', `Seminarname: ${this.seminar.description}`);

        //seminar name
        //phase
        cy.getByData('seminar-phase').should('exist').should('have.text', `Phase: ${mapPhaseToString(this.seminar.phase)}`);
        //rolle
        const role = this.seminar.roleassignments[0]?.roleOID;
        cy.getByData('seminar-role').should('exist').should('have.text', `Rolle: ${role ? mapRoleToString(this.seminar.roleassignments[0]?.roleOID) : ''}`);
    });

    it('concept and paper part should not exist if user is not student', function () {
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/seminar/${seminarOID}`, {
            statusCode: 200,
            fixture: 'seminarPageSeminarSupervisor.json',
        }).as('getDataSeminarSupervisor');
        cy.visit(`${Cypress.env('VITE_FRONTEND_URL')}/seminar/${seminarOID}`);

        if (this.seminar.roleassignments[0]?.roleOID !== 3) {
            cy.getByData('concept-paper-div').should('not.exist');
        }
    });

    describe('concept part for student', function () {
        const createConceptAnwer = {
            conceptOID: 123,
            text: "conceptText",
            userOIDSupervisor: "this.supervisorList[randomSupervisorIndex].userOID",
            userOIDStudent: userOID,
            feedback: null,
            seminarOID: seminarOID,
            accepted: null,
            attachmentOID: 321
        };

        it('concept should be displayed correctly', function () {
            cy.getByData('concept-text').should('exist').should('have.text', this.concept.text);
            //attachment is url
            cy.getByData('concept-attachment').should('exist')
                .find('a')
                .should(($a) => {
                    const href = $a.attr('href');
                    expect(href).to.include(`/attachment/${this.concept.attachmentOID}`);
                })
                .should('have.text', `${this.concept.attachmentO.filename}`);
            const supervisor = this.concept.userOIDSupervisor_user;
            cy.getByData('concept-supervisor').should('exist').should('have.text', `${supervisor ? formatUserName(supervisor) : '-'}`);
            cy.getByData('concept-feedback').should('exist').should('have.text', this.concept.feedback);
            cy.getByData('concept-status').should('exist').should('have.text', mapConceptStatusToString(this.concept.accepted));
            cy.getByData('concept-upload-btn').find('button').should('exist')

        });
        it('check if concept upload button enabled', function () {
            cy.getByData('concept-upload-btn').find('button').should('exist')
            if (!isJsonEmpty(this.concept) && (this.concept.accepted === null || this.concept.accepted || this.seminar.phase !== 2) && this.concept.accepted !== false) {
                cy.getByData('concept-upload-btn').find('button').should('be.disabled')
            } else {
                cy.getByData('concept-upload-btn').find('button').should('be.enabled')
            }
        });
        it('test concept upload process if button enabled', function () {
            if (!isJsonEmpty(this.concept) && (this.concept.accepted === null || this.concept.accepted || this.seminar.phase !== 2) && this.concept.accepted !== false) {
                cy.getByData('concept-upload-btn').find('button').should('be.disabled')
            } else {
                const conceptText = 'test 123';
                const randomSupervisorIndex = Math.floor(Math.random() * this.supervisorList.length);

                createConceptAnwer.text = conceptText;
                createConceptAnwer.userOIDSupervisor = this.supervisorList[randomSupervisorIndex].userOID;

                cy.intercept('POST', `${Cypress.env('VITE_BACKEND_URL')}/concepts`, (req) => {
                    req.reply({
                        statusCode: 200,
                        body: createConceptAnwer
                    });
                }).as('postConcept');

                cy.getByData('concept-upload-btn')
                    .find('button')
                    .should('be.enabled')
                    .click()

                //modal should exist
                cy.getByData('modal').should('exist')

                //insert data
                cy.getByData('concept-upload-text')
                    .should('exist')
                    .type(conceptText);
                cy.getByData('concept-upload-fileupload').should('exist')
                cy.getByData('concept-upload-supervisor').should('exist').click()
                cy.get('.p-dropdown-items li.p-dropdown-item').eq(randomSupervisorIndex).click();
                cy.getByData('concept-upload-fileupload').find('input[type="file"]').selectFile('cypress/fixtures/conceptTest.pdf', {force: true});

                cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/concepts/newest/${seminarOID}`, {
                    statusCode: 200,
                    body: {
                        conceptOID: 69,
                        text: conceptText,
                        userOIDSupervisor: this.supervisorList[randomSupervisorIndex].userOID,
                        userOIDStudent: userOID,
                        feedback: null,
                        seminarOID: seminarOID,
                        accepted: null,
                        attachmentOID: 123,
                        createdAt: "2024-01-18T21:34:24.000Z",
                        updatedAt: "2024-01-18T21:34:24.000Z",
                        attachmentO: {
                            "filename": "conceptTest.pdf"
                        },
                        userOIDSupervisor_user: {
                            "userOID": this.supervisorList[randomSupervisorIndex].userOID,
                            "firstname": this.supervisorList[randomSupervisorIndex].firstname,
                            "lastname": this.supervisorList[randomSupervisorIndex].lastname,
                        }
                    }
                }).as('getDataConceptCreated');

                //click upload
                cy.getByData('concept-upload-submit').should('exist').click()
                //should show confirm alert if sure to upload
                cy.on('window:confirm', (confirmText) => {
                    expect(confirmText).to.equal(`Sind Sie sicher, dass Sie das Konzept einreichen möchten?`);
                    return true;
                });

                //check backend call, with formdata
                cy.wait('@postConcept').interceptFormData((formData) => {
                    expect(formData["text"]).to.eq(conceptText);
                    expect(formData["seminarOID"]).to.eq(String(seminarOID));
                    expect(formData['supervisorOID']).to.eq(String(this.supervisorList[randomSupervisorIndex].userOID));
                    expect(formData["file"]).to.eq('conceptTest.pdf');
                });

                //modal should be closed
                cy.getByData('modal').should('not.exist');

                cy.wait(500)

                //state should be updated, check if uploaded concept is displayed
                cy.getByData('concept-text').should('exist').should('have.text', conceptText);
                //attachment is url
                cy.getByData('concept-attachment').should('exist')
                    .find('a')
                    .should(($a) => {
                        const href = $a.attr('href');
                        expect(href).to.include(`/attachment/123`);
                    })
                    .should('have.text', `conceptTest.pdf`);
                const supervisor = this.supervisorList[randomSupervisorIndex];
                cy.getByData('concept-supervisor').should('exist').should('have.text', `${supervisor ? formatUserName(supervisor) : '-'}`);
                cy.getByData('concept-feedback').should('exist').should('have.text', '-');
                cy.getByData('concept-status').should('exist').should('have.text', mapConceptStatusToString(null));
            }
        });

    });
    describe('paper part', function () {
        it('paper upload button should be disabled if phase < 3', function () {
            //checks only current phase
            if (this.seminar.phase < 3) {
                cy.getByData('paper-upload-btn').should('be.disabled')
            } else {
                cy.getByData('paper-upload-btn').should('be.enabled')
            }
        });
        it('button should redirect to paperOverviewPage if paper button enabled', function () {
            cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/paper/get-uploaded-paper/${seminarOID}`, {
                statusCode: 200,
                body: []
            }).as('getDataPaperOverviewPage');
            cy.getByData('paper-upload-btn')
                .should('be.enabled')
                .click({force: true})
        });
    });
    describe('assigned paper part', function () {
        it('should show correct amount of assigned papers', function () {
            cy.reload();
            cy.wait(500)
            cy.getByData('amount-assigned-papers').should('exist').should('contain.text', this.assignedPaper.length);
        });
        it('assigned paper should be displayed correctly', function () {
            cy.reload();
            cy.wait(500)
            cy.getByData('assigned-papers-div')
                .should('exist')
                .findByData('assigned-paper-row')
                .should('have.length', this.assignedPaper.length)
                .each((paperRow, index) => {
                    cy.wrap(paperRow)
                        .find('a')
                        .should(($a) => {
                            const href = $a.attr('href');
                            expect(href).to.include(`/attachment/${this.assignedPaper[index].attachmentO.attachmentOID}`);
                        })
                        .should('have.text', `${this.assignedPaper[index].attachmentO.filename}`);

                    cy.wrap(paperRow)
                        .findByData('assigned-paper-rate-btn')
                        .should('exist')
                        .should('have.text', mapRatingToString(this.assignedPaper[index].reviews[0].rating))
                    cy.wrap(paperRow)
                        .findByData('assigned-paper-chat-btn')
                        .should('exist')
                        .should('have.text', 'Kommentieren')
                })
        });
        it('test rating process of a paper', function () {
            cy.reload();
            cy.wait(500)
            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_URL')}/review/rate`, {
                statusCode: 200,
                body: {}
            })

            cy.getByData('assigned-papers-div')
                .should('exist')
                .findByData('assigned-paper-row')
                .should('have.length', this.assignedPaper.length)
                .each((paperRow, index) => {
                    //random rating between 1 and 5
                    const randomRating = Math.floor(Math.random() * 5) + 1;
                    cy.wrap(paperRow)
                        .findByData('assigned-paper-rate-btn')
                        .should('exist')
                        .should('have.text', mapRatingToString(this.assignedPaper[index].reviews[0].rating))
                        .click();

                    cy.getByData('modal').should('exist')

                    // click random rating
                    cy.getByData(`rate-${randomRating}`).click();

                    //click submit, modal should be closed after successful response from backend
                    cy.getByData('rate-submit').should('exist').click();

                    cy.getByData('modal').should('not.exist');

                    //state should be updated, check new rating
                    cy.wrap(paperRow)
                        .findByData('assigned-paper-rate-btn')
                        .should('exist')
                        .should('have.text', mapRatingToString(randomRating))
                })
        });

        describe('chat', function () {
            it('click on comment button should open chat modal, and should display messages correctly', function () {
                cy.reload();
                cy.wait(500)
                cy.getByData('assigned-papers-div')
                    .should('exist')
                    .findByData('assigned-paper-row')
                    .should('have.length', this.assignedPaper.length)
                    .each((paperRow, index) => {
                        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/review/get-reviewoids-from-paper/${this.assignedPaper[index].paperOID}`, {
                            statusCode: 200,
                            //body: [this.assignedPaper[index].reviews[0].reviewOID]
                            body: [
                                {
                                    reviewOID: this.assignedPaper[index].reviews[0].reviewOID,
                                    paperOID: this.assignedPaper[index].reviews[0].paperOID,
                                    reviewerOID: null,//not needed
                                }
                            ]
                        }).as('getReviewOIDsFromPaper');
                        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/chat/${this.assignedPaper[index].reviews[0].reviewOID}`, {
                            statusCode: 200,
                            fixture: 'chatMessages.json',
                        }).as('getChatMessages');

                        cy.wrap(paperRow)
                            .findByData('assigned-paper-chat-btn')
                            .should('exist')
                            .should('have.text', 'Kommentieren')
                            .click();

                        //backend should be called
                        cy.wait('@getReviewOIDsFromPaper').should('exist');

                        //should open messages modal
                        cy.getByData('reviewer-selection')
                            .should('exist')
                            .findByData('reviewer-button')
                            .should('have.length', 1);
                        cy.getByData('messages-div').should('exist')
                            .findByData('ChatMessage-div')
                            .should('have.length', this.chatmessagesList.length)
                            .each((messageRow, index) => {
                                cy.wrap(messageRow)
                                    .findByData('chat-message-item')
                                    .should('exist')
                                    .findByData('message-text')
                                    .should('exist')
                                    .should('have.text', this.chatmessagesList[index].message || '');

                                cy.wrap(messageRow)
                                    .findByData('chat-message-item')
                                    .should('exist')
                                    .findByData('message-date')
                                    .should('exist')
                                    .should('have.text', new Date(this.chatmessagesList[index].createdAt).toLocaleString());

                                if (this.chatmessagesList[index].attachmentO) {
                                    cy.wrap(messageRow)
                                        .findByData('chat-message-item')
                                        .should('exist')
                                        .findByData('message-attachment')
                                        .should('exist')
                                        .should('have.text', this.chatmessagesList[index].attachmentO.filename)
                                        .should(($a) => {
                                            const href = $a.attr('href');
                                            expect(href).to.include(`/attachment/${this.chatmessagesList[index].attachmentO.attachmentOID}`);
                                        })
                                }
                            })

                        cy.getByData('modal').should('exist');

                        cy.getByData('close-modal').click();
                    })
            });
            it('test to write review of a assigned paper', function () {
                cy.reload();
                cy.wait(500)
                //add created message to chatmessagesList because messages of polling
                const messagesWithCreatedMessage = this.chatmessagesList;
                messagesWithCreatedMessage.push({
                    "message": this.createdMessage.createdMessage.message,
                    "createdAt": this.createdMessage.createdMessage.createdAt,
                    "sender": this.createdMessage.createdMessage.sender,
                    "attachmentO": {
                        "attachmentOID": this.createdMessage.createdAttachment.attachmentOID,
                        "filename": this.createdMessage.createdAttachment.filename
                    }
                });

                cy.getByData('assigned-papers-div')
                    .should('exist')
                    .findByData('assigned-paper-row')
                    .should('have.length', this.assignedPaper.length)
                    .each((paperRow, index) => {
                        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/review/get-reviewoids-from-paper/${this.assignedPaper[index].paperOID}`, {
                            statusCode: 200,
                            body: [
                                {
                                    reviewOID: this.assignedPaper[index].reviews[0].reviewOID,
                                    paperOID: this.assignedPaper[index].reviews[0].paperOID,
                                    reviewerOID: null,//not needed
                                }
                            ]
                        }).as('getReviewOIDsFromPaper');
                        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/chat/${this.assignedPaper[index].reviews[0].reviewOID}`, {
                            statusCode: 200,
                            fixture: 'chatMessages.json',
                        }).as('getChatMessages');
                        cy.intercept('POST', `${Cypress.env('VITE_BACKEND_URL')}/chat`, {
                            statusCode: 200,
                            fixture: 'chatCreatedMessage.json',
                        }).as('createChatMessage');

                        cy.wrap(paperRow)
                            .findByData('assigned-paper-chat-btn')
                            .should('exist')
                            .should('have.text', 'Kommentieren')
                            .click();

                        //backend should be called
                        cy.wait('@getReviewOIDsFromPaper').should('exist');

                        cy.getByData('review-textfield')
                            .should('exist')
                            .type('test123');

                        cy.getByData('fileupload-component')
                            .should('exist')
                            .find('input[type="file"]')
                            .selectFile('cypress/fixtures/conceptTest.pdf', {force: true});


                        cy.getByData('review-send')
                            .should('exist')
                            .click();

                        //check if new message is displayed
                        cy.getByData('messages-div').should('exist')
                            .findByData('ChatMessage-div')
                            .last()
                            .findByData('message-text')
                            .should('exist')
                            .should('contain.text', 'test123')


                        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/chat/${this.assignedPaper[index].reviews[0].reviewOID}`, {
                            statusCode: 200,
                            body: messagesWithCreatedMessage
                        }).as('getChatMessagesNew');

                        cy.getByData('messages-div').should('exist')
                            .findByData('ChatMessage-div')
                            .last()
                            .findByData('message-attachment')
                            .should('exist')
                            .should('have.text', this.createdMessage.createdAttachment.filename)
                            .should(($a) => {
                                const href = $a.attr('href');
                                expect(href).to.include(`/attachment/${this.createdMessage.createdAttachment.attachmentOID}`);
                            })

                        cy.getByData('messages-div').should('exist')
                            .findByData('ChatMessage-div')
                            .last()
                            .findByData('message-text')
                            .should('exist')
                            .should('have.text', this.createdMessage.createdMessage.message || '');

                        cy.getByData('messages-div').should('exist')
                            .findByData('ChatMessage-div')
                            .last()
                            .findByData('message-date')
                            .should('exist')
                            .should('have.text', new Date(this.createdMessage.createdMessage.createdAt).toLocaleString());

                        cy.getByData('close-modal').click();
                        cy.getByData('modal').should('not.exist');
                    })
            });
        });
    });
});
