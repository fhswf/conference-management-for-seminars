import {formatUserName, mapConceptStatusToString} from "../../src/utils/helpers.ts";

describe('memberDetailPage', () => {
    const seminarOID = 1;
    const userOID = 5;

    beforeEach(function () {
        cy.fixture('memberDetailPageMember').then((member) => {
            this.member = member;
        });
        cy.fixture('memberDetailPageReviewerOfPaper').then((reviewer) => {
            this.reviewer = reviewer;
        });
        // TODO ändern auf member
        cy.visit(`${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_FRONTEND_URL')}/seminar-details/${seminarOID}/user/${userOID}`);
        cy.mockAuthStatus();


        // TODO ändern auf member
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/seminar/${seminarOID}/get-student/${userOID}`, {
            statusCode: 200,
            fixture: 'memberDetailPageMember.json'
        }).as('getMemberDetailPage');

        // TODO ändern auf member bzw dessen paperOD
        cy.intercept('GET', `${Cypress.env('VITE_BACKEND_PROTOCOL')}://${Cypress.env('VITE_BACKEND_URL')}/review/get-reviewer-of-paper/9`, {
            statusCode: 200,
            fixture: 'memberDetailPageReviewerOfPaper.json'
        }).as('getMemberDetailPageReviewerOfPaper');
    });

    it('should have title, seminar-id and name', function () {
        cy.getByData('header').should('exist').should('contain.text', 'Teilnehmer Details');
        cy.getByData('seminar-id').should('contain.text', seminarOID);
        cy.getByData('student-name').should('contain.text', formatUserName(this.member));
    });

    it('Should contain the mainlayout', function () {
        cy.getByData('main-layout').should('exist');
    });

    describe('concept table', function () {
        it('table should have correct headers', function () {
            cy.getByData('table-concepts').find('thead tr').should('exist').within(() => {
                cy.get('th').eq(0).should('have.text', 'Text');
                cy.get('th').eq(1).should('have.text', 'PDF');
                cy.get('th').eq(2).should('have.text', 'Betreuer');
                cy.get('th').eq(3).should('have.text', 'Feedback');
                cy.get('th').eq(4).should('have.text', 'Status');
                cy.get('th').eq(5).should('have.text', 'Eingereicht am');
            });
        });

        it('should display concepts correctly in table', function () {
            cy.getByData('table-concepts').should('exist')
                .find('tbody tr').should('have.length', this.member.userOIDStudent_concepts.length);

            //iterate over table
            cy.getByData('table-concepts').get('table tbody tr').each((row, rowIndex) => {
                const concept = this.member.userOIDStudent_concepts[rowIndex];
                const supervisor = this.member.userOIDStudent_concepts[rowIndex].userOIDSupervisor_user;

                //should have correct values
                cy.wrap(row).find('td').eq(0).should('have.text', concept.text);
                if (concept.attachmentO) {
                    cy.wrap(row).find('td').eq(1)
                        .find('a')
                        .should(($a) => {
                            const href = $a.attr('href');
                            expect(href).to.include(`/attachment/${concept.attachmentO?.attachmentOID}`);
                        })
                        .should('have.text', `${concept.attachmentO.filename}`);
                } else {
                    cy.wrap(row).find('td').eq(1).should('have.text', '-');
                }
                if (supervisor === null) {
                    cy.wrap(row).find('td').eq(2).should('have.text', '-');
                } else {
                    cy.wrap(row).find('td').eq(2).should('have.text', formatUserName(supervisor));
                }
                cy.wrap(row).find('td').eq(3).should('have.text', concept.feedback || '-');
                cy.wrap(row).find('td').eq(4).should('have.text', mapConceptStatusToString(concept.accepted));
                cy.wrap(row).find('td').eq(5).should('have.text', concept.createdAt ? new Date(concept.createdAt).toLocaleString() : '-');
            });
        });
    });

    it.only('should display paper correctly', function () {
        //TODO div is not found
        const roleassignment = this.member.roleassignments[0];
        cy.getByData('header-papers').should('exist').should('contain.text', 'Hochgeladene Paper');

        //iterate over over every fragment in div
        cy.getByData('papers').should('exist').find('div').each((paper, paperIndex) => {
            const currentPaper = this.member.papers[paperIndex];
            //find href in div
            cy.wrap(paper).findByData('attachment-href').should(($a) => {
                const href = $a.attr('href');
                expect(href).to.include(`/attachment/${currentPaper.attachmentO?.attachmentOID}`);
            }).should('have.text', `${currentPaper.attachmentO?.filename}`);

            cy.wrap(paper).findByData('date-paper')
                .should('have.text', currentPaper.createdAt ? new Date(currentPaper.createdAt).toLocaleString() : '-');

            if (currentPaper.paperOID === roleassignment.phase3paperOID) {
                cy.wrap(paper).findByData('phase-paper').should('have.text', 'Phase 3');
            } else if (currentPaper.paperOID === roleassignment.phase7paperOID) {
                cy.wrap(paper).findByData('phase-paper').should('have.text', 'Phase 7');
            } else {
                cy.wrap(paper).findByData('phase-paper').should('have.text', '-');
            }

        });
    });

    it('should display reviewer if some are assigned', function () {
        if (this.reviewer.length > 0) {
            cy.getByData('header-reviewer').should('exist').should('have.text', 'Reviewer:');
            cy.getByData('reviewer-list').should('exist').find('li').should('have.length', this.reviewer.length);

            //check every reviewer li
            cy.getByData('reviewer-list').find('li').each((reviewer, reviewerIndex) => {
                const reviewerOfPaper = this.reviewer[reviewerIndex];
                cy.wrap(reviewer).should('have.text', formatUserName(reviewerOfPaper));
            });
        }
    });

});
