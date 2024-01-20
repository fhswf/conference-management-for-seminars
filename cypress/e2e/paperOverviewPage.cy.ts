describe('PaperOverviewPage', () => {
    const seminarOID = 123;
    beforeEach(function () {
        cy.visit(`${Cypress.env('VITE_FRONTEND_URL')}/paper-overview/${seminarOID}`);
        cy.mockAuthStatus();

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/paper/get-uploaded-paper/${seminarOID}`, {
            statusCode: 200,
            fixture: 'paperOverviewPagePapers.json'
        });

        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/seminar/${seminarOID}`, {
            statusCode: 200,
            fixture: 'paperOverviewPageSeminar.json'
        });

        cy.fixture('paperOverviewPagePapers').then((uploadedPapers) => {
            this.uploadedPapers = uploadedPapers;
        });

        cy.fixture('paperOverviewPageSeminar').then((seminar) => {
            this.seminar = seminar;
        });
    });

    it('Should contain the mainlayout', function () {
        cy.getByData('main-layout').should('exist');
    });

    it('should display uploaded paper correctly', function () {
        cy.getByData('uploaded-papers-div')
            .should('exist')
            .findByData('uploaded-paper-row')
            .should('have.length', this.uploadedPapers.length)
            .each((paperRow, index) => {
                cy.wrap(paperRow)
                    .findByData('uploaded-paper-file')
                    .should('exist')
                    .should('have.text', this.uploadedPapers[index].attachmentO.filename)
                    .should(($a) => {
                        const href = $a.attr('href');
                        expect(href).to.include(`/attachment/${this.uploadedPapers[index].attachmentO.attachmentOID}`);
                    })

                const phase3Setted = this.uploadedPapers[index].paperOID === this.seminar.roleassignments[0].phase3paperOID;
                const phase7Setted = this.uploadedPapers[index].paperOID === this.seminar.roleassignments[0].phase7paperOID;
                if (phase3Setted) {
                    cy.wrap(paperRow)
                        .findByData('uploaded-paper-phase')
                        .should('exist')
                        .should('have.text', 'Phase 3')

                    cy.wrap(paperRow)
                        .findByData('uploaded-paper-comments')
                        .should('exist')
                        .should('have.text', 'Kommentare')

                    if (this.seminar.phase < 6) {
                        cy.wrap(paperRow)
                            .findByData('uploaded-paper-comments')
                            .should('exist')
                            .should('be.disabled')
                    }

                } else if (phase7Setted) {
                    cy.wrap(paperRow)
                        .findByData('uploaded-paper-phase')
                        .should('exist')
                        .should('have.text', 'Phase 7')
                } else {
                    cy.wrap(paperRow)
                        .findByData('uploaded-paper-phase')
                        .should('exist')
                        .should('have.text', '-')
                }
            });
    });

    it('check if upload button should be disabled if phase is not 3 or 7, or already uploaded a final paper', function () {
        if (this.seminar.phase !== 3 && (this.seminar.phase !== 7 || !!this.seminar.roleassignments[0].phase7paperOID)) {
            cy.getByData('upload-paper-button')
                .should('exist')
                .should('be.disabled')
        } else {
            cy.getByData('upload-paper-button')
                .should('exist')
                .should('not.be.disabled')
        }
    });

    it('test paper upload', function () {
        const attachmentOID = 321;
        cy.intercept('POST', `${Cypress.env('VITE_BACKEND_URL')}/paper`, (req) => {
            req.reply({
                statusCode: 200,
                body: {
                    paperOID: 25,
                    seminarOID: seminarOID,
                    attachmentO: {
                        attachmentOID: attachmentOID,
                        filename: "conceptTest.pdf",
                    }
                },
            });
        }).as('postPaper');

        if (!(this.seminar.phase !== 3 && (this.seminar.phase !== 7 || !!this.seminar.roleassignments[0].phase7paperOID))) {
            cy.getByData('upload-paper-button')
                .should('exist')
                .should('not.be.disabled')
                .click()

            cy.getByData('modal')
                .should('exist')

            //select file
            cy.getByData('fileupload-component')
                .should('exist')
                .find('input[type="file"]')
                .selectFile('cypress/fixtures/conceptTest.pdf', {force: true});

            if (this.seminar.phase === 3) {
                cy.getByData('upload-paper-submit')
                    .should('have.text', 'Paper anonym einreichen')
            } else if (this.seminar.phase === 7) {
                cy.getByData('upload-paper-submit')
                    .should('have.text', 'Finales Paper zur Bewertung einreichen')
            }

            cy.getByData('upload-paper-submit')
                .should('exist')
                .click()

            cy.wait('@postPaper').interceptFormData((formData) => {
                expect(formData['seminarOID']).to.eq(String(seminarOID));
                expect(formData["file"]).to.eq('conceptTest.pdf');
            });

            cy.getByData('modal')
                .should('not.exist')

            cy.wait(500);

            //check if uploaded paper is displayed
            cy.getByData('uploaded-paper-row')
                .should('exist')
                .last()
                .findByData('uploaded-paper-file')
                .should('exist')
                .should('contain.text', 'conceptTest.pdf')
                .should(($a) => {
                    const href = $a.attr('href');
                    expect(href).to.include(`/attachment/${attachmentOID}`);
                })
        }
    });

    describe('chat', () => {
        beforeEach(function () {
            cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/seminar/${seminarOID}`, {
                statusCode: 200,
                fixture: 'paperOverviewPageSeminarP7.json'
            });
            cy.reload();

            cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/review/get-reviewoids-from-paper/*`, {
                statusCode: 200,
                fixture: 'chatReviewOIDS.json'
            }).as('getReviewOIDsFromPaper');
            cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/chat/*`, {
                statusCode: 200,
                fixture: 'chatMessages.json',
            }).as('getChatMessages');

            cy.fixture('chatReviewOIDS').then((reviewOIDS) => {
                this.reviewOIDS = reviewOIDS;
            });
            cy.fixture('chatMessages').then((chatmessagesList) => {
                this.chatmessagesList = chatmessagesList;
            });
            cy.fixture('chatCreatedMessage').then((createdMessage) => {
                this.createdMessage = createdMessage;
            });
        });

        it('should open chat modal', function () {
            cy.getByData('uploaded-paper-comments')
                .should('exist')
                .should('not.be.disabled')
                .click()
        });

        it('should display chat messages correctly', function () {
            cy.getByData('uploaded-paper-comments')
                .should('exist')
                .should('not.be.disabled')
                .click()

            cy.wait('@getReviewOIDsFromPaper').should('exist');

            cy.getByData('messages-div').should('exist')
                .findByData('ChatMessage-div')
                .should('exist')
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
        });
        it('should display as many buttons as the number of reviewOIDs', function () {
            cy.getByData('uploaded-paper-comments')
                .should('exist')
                .should('not.be.disabled')
                .click()

            cy.getByData('reviewer-selection')
                .findByData('reviewer-button')
                .should('exist')
                .should('have.length', this.reviewOIDS.length)
        });
        it('click on reviewer selection should request messages of selected review', function () {
            const randomButtonIndex = Math.floor(Math.random() * this.reviewOIDS.length);

            cy.getByData('uploaded-paper-comments')
                .should('exist')
                .should('not.be.disabled')
                .click()

            cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/chat/${this.reviewOIDS[randomButtonIndex].reviewOID}`, {
                statusCode: 200,
                fixture: 'chatMessages.json',
            }).as('getChatMessagesSelectedReview');

            //click on random button
            cy.getByData('reviewer-selection')
                .findByData('reviewer-button')
                .should('exist')
                .should('have.length', this.reviewOIDS.length)
                .eq(randomButtonIndex)
                .click()

            //if selected review changed: expect /api/chat/:reviewOID to be called
            if (this.reviewOIDS[randomButtonIndex].reviewOID !== this.reviewOIDS[0].reviewOID) {
                cy.wait('@getChatMessagesSelectedReview').should('exist').then((interception) => {
                    const expectedURL = `${Cypress.env('VITE_BACKEND_URL')}/chat/${String(this.reviewOIDS[randomButtonIndex].reviewOID)}`;
                    expect(interception.request.url).to.equal(expectedURL);
                });
            }
        });

        it('write and send message', function () {
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
            cy.intercept('POST', `${Cypress.env('VITE_BACKEND_URL')}/chat`, {
                statusCode: 200,
                fixture: 'chatCreatedMessage.json',
            }).as('createChatMessage');
            cy.getByData('uploaded-paper-comments')
                .should('exist')
                .should('not.be.disabled')
                .click()

            cy.getByData('review-textfield')
                .should('exist')
                .type('test123');

            cy.getByData('fileupload-component')
                .should('exist')
                .find('input[type="file"]')
                .selectFile('cypress/fixtures/conceptTest.pdf', {force: true});

            cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/chat/${this.reviewOIDS[0].reviewOID}`, {
                statusCode: 200,
                body: messagesWithCreatedMessage
            }).as('getChatMessagesNew');

            cy.getByData('review-send')
                .should('exist')
                .click();

            //check if last message is the created message
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
        } );
    });
});
