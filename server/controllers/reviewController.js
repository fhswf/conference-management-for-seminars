const db = require("../models");

const Review = db.review;
const User = db.user;
const RoleAssignment = db.roleassignment;
const Paper = db.paper;
const Concept = db.concept;

/**
 * Returns an array of reviewer user of a paper.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getReviewerUserOfPaper(req, res) {
    try {
        const paperOID = req.params.paperOID;

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
            attributes: ['userOID', 'firstName', 'lastName', 'mail'],
        });

        return res.status(200).json(reviewer);
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

/**
 * Assigns reviewers to papers according to the given rules
 * @param seminarOID
 * @param t
 * @returns {Promise<void>}
 */
async function assignReviewer(seminarOID, t) {
    // Jeder User (Student) eines Seminars soll 2 Reviewe Eintrag mit sich als Reviewer bekommen
    let assignment = [];

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
                as: "phase4paperO",
                required: true,
            }],
        }, {
            model: Concept,
            as: "userOIDStudent_concepts",
            //Studenten könnten nur ein Konzept im Seminar haben, welches Akzeptiert ist
            where: {
                seminarOID: seminarOID,
                accepted: true,
            },
            include: [{
                model: User,
                as: "userOIDSupervisor_user",
            }],
        }
        ],
        transaction: t
    });

    // for randomness, possible to mix studentsInSeminar-array here

    // users do not review themselves: at least 3 students in the seminar
    // users do not review each other: at least 4 students in the seminar
    let studentIndex = 0;
    for (const user1 of studentsInSeminar) {
        const newestPaper = await Paper.findOne({
            where: {
                authorOID: user1.userOID,
                seminarOID: seminarOID,
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });

        const reviewer1Index = (studentIndex + 1) % studentsInSeminar.length;
        const reviewer2Index = (studentIndex + 2) % studentsInSeminar.length;

        const reviewer1 = studentsInSeminar[reviewer1Index];
        const reviewer2 = studentsInSeminar[reviewer2Index];

        studentIndex = (studentIndex + 1) % studentsInSeminar.length;

        assignment.push({
            paper: newestPaper.paperOID,
            author: user1.userOID,
            reviewer1: reviewer1.userOID,
            reviewer2: reviewer2.userOID,
            betreuer: user1.userOIDStudent_concepts[0].userOIDSupervisor_user.userOID
        });

        console.log(studentsInSeminar);
    }

    // for every assignment create three review entries
    for (const assignment1 of assignment) {
        await Review.create({
            paperOID: assignment1.paper,
            reviewerOID: assignment1.reviewer1,
        }, {transaction: t});
        await Review.create({
            paperOID: assignment1.paper,
            reviewerOID: assignment1.reviewer2,
        }, {transaction: t});
        await Review.create({
            paperOID: assignment1.paper,
            reviewerOID: assignment1.betreuer,
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
 * Checks if a user is the reviewer of a review, with the given userOID and reviewOID.
 * @param reviewOID
 * @param userOID
 * @returns {Promise<boolean>}
 */
async function userIsReviewerOfReviewOID(reviewOID, userOID) {
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

        return res.status(200).json({message: 'Review successfully rated'});
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

module.exports = {
    getReviewerUserOfPaper,
    assignReviewer,
    getReviewOIDsOfPaper,
    userIsReviewerOfPaper,
    userIsReviewerOfReviewOID,
    rateReview,
}
