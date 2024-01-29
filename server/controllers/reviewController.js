const db = require("../models");
const {mixArray} = require("../utils/ArrayUtils");

const Review = db.review;
const User = db.user;
const RoleAssignment = db.roleassignment;
const Paper = db.paper;
const Concept = db.concept;

/**
 * Returns an array user which review a paper.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getReviewerUserOfPaper(req, res) {
    try {
        const paperOID = req.params.paperOID;

        if (!paperOID) {
            return res.status(400).json({error: 'Bad Request'});
        }

        const reviewer = await User.findAll({
            include: [{
                model: Review,
                as: "reviews",
                where: {
                    paperOID: paperOID,
                },
                attributes: [],
                required: true,
            }],
            attributes: ['userOID', 'firstname', 'lastname', 'mail'],
        });

        return res.status(200).json(reviewer);
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

/**
 * Assigns reviewers to papers according to the given rules
 * Uses phase3paperOID of roleassignment to determine which paper is the newest.
 * @param seminarOID
 * @param t
 * @returns {Promise<void>}
 */
async function assignReviewer(seminarOID, t) {
    // Jeder User (Student) eines Seminars soll 2 Reviewe Eintrag mit sich als Reviewer bekommen
    let assignments = [];

    // all students in seminar who have a concept and a paper
    const studentsInSeminar = await User.findAll({
        include: [{
            model: RoleAssignment,
            as: "roleassignments",
            where: {
                seminarOID: seminarOID,
                roleOID: 3,
            },
            include: [{
                model: Paper,
                as: "phase3paperO",
                required: true,
            }],
        }, {
            model: Concept,
            as: "userOIDStudent_concepts",
            //Studenten könnten nur ein Konzept im Seminar haben, welches akzeptiert ist, sollte einen Betreuer haben, alternativ require: true
            where: {
                seminarOID: seminarOID,
                accepted: true,
            },
        }
        ],
        transaction: t
    });

    // for randomness, possible to mix studentsInSeminar-array here
    //mixArray(studentsInSeminar)

    // users do not review themselves: at least 3 students in the seminar
    // users do not review each other: at least 4 students in the seminar
    let studentIndex = 0;
    for (const student of studentsInSeminar) {
        // alternative: newest paper of student

        const reviewer1Index = (studentIndex + 1) % studentsInSeminar.length;
        const reviewer2Index = (studentIndex + 2) % studentsInSeminar.length;

        const reviewer1 = studentsInSeminar[reviewer1Index];
        const reviewer2 = studentsInSeminar[reviewer2Index];

        studentIndex = (studentIndex + 1) % studentsInSeminar.length;

        assignments.push({
            paper: student.roleassignments[0].phase3paperOID,
            author: student.userOID,
            reviewer1: reviewer1.userOID,
            reviewer2: reviewer2.userOID,
            supervisor: student.userOIDStudent_concepts[0].userOIDSupervisor
        });

        console.log(studentsInSeminar);
    }

    // for every assignment create three review entries
    for (const assignment of assignments) {
        await Review.create({
            paperOID: assignment.paper,
            reviewerOID: assignment.reviewer1,
        }, {transaction: t});
        await Review.create({
            paperOID: assignment.paper,
            reviewerOID: assignment.reviewer2,
        }, {transaction: t});
        await Review.create({
            paperOID: assignment.paper,
            reviewerOID: assignment.supervisor,
        }, {transaction: t});
    }

    console.log("ende");
}

/**
 * Returns all reviewOIDs of a paper with the given paperOID.
 * If user is author of paper, all reviewOIDs of a paper are returned.
 * If user is reviewer of paper, only reviewOID where user is reviewer are returned.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getReviewOIDsOfPaper(req, res) {
    const paperOID = req.params.paperOID;

    try {
        //check if user is author of paper
        const paper = await Paper.findOne({
            where: {
                paperOID: paperOID,
            },
            attributes: ['authorOID'],
        });

        const reviews = await Review.findAll({
            where: {
                paperOID: paperOID,
            },
            attributes: ['reviewOID', 'paperOID', 'reviewerOID'],
        });

        if (paper.authorOID === req.user.userOID) {
            //return all reviewOIDs of paper
            return res.status(200).json(reviews);
        } else {
            //return return reviewOID where current user is reviewer
            //filter
            const filteredReviews = reviews.filter(review => review.reviewerOID === req.user.userOID);

            return res.status(200).json(filteredReviews);
        }

    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

/**
 * Checks if a user is the reviewer of a paper, with the given userOID and paperOID.
 * Returns false if userOID or paperOID is null.
 * @param userOID
 * @param paperOID
 * @returns {Promise<boolean>}
 */
async function userIsReviewerOfPaper(userOID, paperOID) {
    if (!userOID || !paperOID) {
        return false;
    }

    const reviews = await Review.findOne({
        where: {
            paperOID: paperOID,
            reviewerOID: userOID,
        },
    });

    return reviews !== null;
}

/**
 * Checks if a user is a reviewer of a specific review.
 *
 * @param {number} userOID - The user's unique identifier.
 * @param {number} reviewOID - The review's unique identifier.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the user is a reviewer of the review, or false otherwise.
 */
async function isReviewerOfReview(userOID, reviewOID) {
    if (!userOID || !reviewOID) {
        return false;
    }

    const reviews = await Review.findOne({
        where: {
            reviewOID: reviewOID,
            reviewerOID: userOID,
        },
    });

    return reviews !== null;
}

/**
 * Checks if a user is the reviewer of a review, with the given userOID and reviewOID.
 * @param reviewOID
 * @param userOID
 * @returns {Promise<boolean>}
 */
async function userIsReviewerOfReviewOID(userOID, reviewOID) {
    if (!reviewOID || !userOID) {
        return false;
    }

    const review = await Review.findOne({
        where: {
            reviewOID: reviewOID,
            reviewerOID: userOID,
        },
    });

    return review !== null;
}

async function userIsAuthorOfReview(userOID, reviewOID) {
    if (!reviewOID || !userOID) {
        return false;
    }

    const review = await Review.findOne({
        where: {
            reviewOID: reviewOID,
        },
        include: [{
            model: Paper,
            as: "paperO",
            attributes: ['authorOID'],
        }],
    });

    if (review) {
        return review.paperO.authorOID || null;
    } else {
        return null;
    }
}

/**
 * Updates the rating of a review.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves once the review is successfully rated.
 */
async function rateReview(req, res) {
    try {
        const reviewOID = req.body.reviewOID;
        const rating = req.body.rating;

        await Review.update({
            rating: rating,
        }, {
            where: {
                reviewOID: reviewOID,
            },
        });

        return res.status(200).json({msg: 'Review successfully rated'});
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

/**
 * Retrieves the seminarOID associated with a review.
 *
 * @param {number} reviewOID - The OID of the review to fetch the seminarOID for.
 * @returns {Promise<number|null>} - A Promise that resolves with the seminarOID associated with the review, or null if reviewOID is missing or not found.
 * @throws {Error} - Throws an error if the reviewOID is null.
 */
async function getSeminarOIDOfReview(reviewOID){
    if (!reviewOID) {
        throw new Error("reviewOID is null");
    }

    const review = await Review.findOne({
        where: {
            reviewOID: reviewOID,
        },
        attributes: ['paperOID'],
        include: [{
            model: Paper,
            as: "paperO",
            attributes: ['seminarOID'],
        }],
    });

    if (review) {
        return review.paperO.seminarOID || null;
    } else {
        return null;
    }
}

module.exports = {
    getReviewerUserOfPaper,
    assignReviewer,
    getReviewOIDsOfPaper,
    userIsReviewerOfPaper,
    isReviewerOfReview,
    userIsReviewerOfReviewOID,
    userIsAuthorOfReview,
    rateReview,
    getSeminarOIDOfReview,
}
