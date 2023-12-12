const db = require("../models");

const Review = db.review;
const User = db.user;
const RoleAssignment = db.roleassignment;
const Paper = db.paper;
const Concept = db.concept;

/**
 * Returns the reviewer of a paper.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getReviewerUserOfPaper(req, res) {
    try{
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
    }catch (e) {
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
    // Jeder User (Student) eines Seminars soll 2 Reviewer Einträge als Reviewer bekommen
    let assignment = [];
    //let assignment: { paper, reviewer1, reviewer2, betreuer }[] = [];
    let reviewerMap = new Map();
    let reviewerCount = new Map();

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

    for (const user1 of studentsInSeminar) {
        reviewerCount.set(user1.userOID, 0);
    }

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

        let reviewer1;
        let reviewer2;

        do {
            // Durch mögliche UserIDs Iterieren die frei sind
            const randomUser = studentsInSeminar[Math.floor(Math.random() * studentsInSeminar.length)];
            const randomUser2 = studentsInSeminar[Math.floor(Math.random() * studentsInSeminar.length)];

            reviewer1 = randomUser;
            reviewer2 = randomUser2;
            console.log("");
            //...
        } while (
            reviewer1.userOID === newestPaper.authorOID ||
            reviewer2.userOID === newestPaper.authorOID ||
            reviewer1.userOID === reviewer2.userOID ||
            reviewerMap.get(reviewer1.userOID) === reviewer2.userOID ||
            reviewerMap.get(reviewer2.userOID) === reviewer1.userOID ||
            reviewerCount.get(reviewer1.userOID) >= 2 ||
            reviewerCount.get(reviewer2.userOID) >= 2
            );

        reviewerMap.set(reviewer1.userOID, reviewer2.userOID);
        reviewerMap.set(reviewer2.userOID, reviewer1.userOID);

        reviewerCount.set(reviewer1.userOID, reviewerCount.get(reviewer1.userOID) + 1);
        reviewerCount.set(reviewer2.userOID, reviewerCount.get(reviewer2.userOID) + 1);

        assignment.push({
            paper: newestPaper.paperOID,
            author: user1.userOID,
            reviewer1: reviewer1.userOID,
            reviewer2: reviewer2.userOID,
            betreuer: user1.userOIDStudent_concepts[0].userOIDSupervisor_user.userOID
        });

        console.log(studentsInSeminar);
    }

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
        }else{
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

async function rateReview(req, res){
    try{
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
