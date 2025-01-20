const http = require("http");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const cors = require('cors');

const commonController = require('./controller/commonController');
const digicardController = require('./controller/digicardController');
const topicController = require('./controller/topicController');
const chapterController = require('./controller/chapterController');
const unitController = require('./controller/unitController');
const classController = require('./controller/classController');
const schoolController = require('./controller/schoolController');
const userController = require('./controller/userController');
const conceptController = require('./controller/conceptController');
const subjectController = require('./controller/subjectController');
const questionController = require('./controller/questionController');
const sectionController = require('./controller/sectionController');
const teacherController = require('./controller/teacherController');
const groupController = require('./controller/groupController');
const blueprintController = require('./controller/blueprintController');
const settingsController = require('./controller/settingsController');
const studentController = require('./controller/studentController');

const validator = require('./middleware/validator');

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 100000,
}));

app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.json({
    type: "application/vnd.api+json",
}));

app.use(cors());

/** ADMIN **/
app.post("/v1/login", commonController.userLogin);
app.post("/v1/loginWithOTP", commonController.userLoginWithoutPassword);
app.post("/v1/validateOTP", commonController.validateUserOtp);
app.post("/v1/logout", validator.validUser, commonController.userLogout);
app.post("/v1/resetOrCreatePassword", validator.validUser, commonController.resetOrCreatePassword);

app.post("/v1/addCMSUser", validator.validUser, userController.addCMSUser);
app.post("/v1/editCMSUser", validator.validUser, userController.editCMSUser);
app.post("/v1/fetchIndividualCMSUser", validator.validUser, userController.fetchIndividualCMSUser);
app.post("/v1/fetchCMSUsersBasedonRoleStatus", validator.validUser, userController.fetchCMSUsersBasedonRoleStatus);
app.post("/v1/toggleCMSUserStatus", validator.validUser, userController.toggleCMSUserStatus);
app.post("/v1/bulkToggleCMSUserStatus", validator.validUser, userController.bulkToggleCMSUserStatus);

// DigiCard : 
app.post("/v1/addDigiCard", validator.validUser, digicardController.addDigiCard);
app.post("/v1/fetchIndividualDigiCard", validator.validUser, digicardController.fetchIndividualDigiCard);
app.post("/v1/editDigiCard", validator.validUser, digicardController.editDigiCard);
app.post("/v1/toggleDigiCardStatus", validator.validUser, digicardController.toggleDigiCardStatus);
app.post("/v1/fetchDigicardIdAndName", validator.validUser, digicardController.fetchDigicardIdAndName);
app.post("/v1/fetchDigiCardsBasedonStatus", validator.validUser, digicardController.fetchDigiCardsBasedonStatus);
app.post("/v1/bulkToggleDigiCardStatus", validator.validUser, digicardController.bulkToggleDigiCardStatus);

// Topic : 
app.post("/v1/addTopic", validator.validUser, topicController.addTopic);
app.post("/v1/fetchIndividualTopic", validator.validUser, topicController.fetchIndividualTopic);
app.post("/v1/editTopic", validator.validUser, topicController.editTopic);
app.post("/v1/toggleTopicStatus", validator.validUser, topicController.toggleTopicStatus);
app.post("/v1/fetchTopicsBasedonStatus", validator.validUser, topicController.fetchTopicsBasedonStatus);
app.post("/v1/fetchPreLearningTopics", validator.validUser, topicController.fetchPreLearningTopics);
app.post("/v1/fetchPostLearningTopics", validator.validUser, topicController.fetchPostLearningTopics);
app.post("/v1/bulkToggleTopicStatus", validator.validUser, topicController.bulkToggleTopicStatus);

// Chapter : 
app.post("/v1/addChapter", validator.validUser, chapterController.addChapter);
app.post("/v1/fetchIndividualChapter", validator.validUser, chapterController.fetchIndividualChapter);
app.post("/v1/editChapter", validator.validUser, chapterController.editChapter);
app.post("/v1/toggleChapterStatus", validator.validUser, chapterController.toggleChapterStatus);
app.post("/v1/fetchChaptersBasedonStatus", validator.validUser, chapterController.fetchChaptersBasedonStatus);
app.post("/v1/bulkToggleChapterStatus", validator.validUser, chapterController.bulkToggleChapterStatus);

// Units : 
app.post("/v1/addUnit", validator.validUser, unitController.addUnit);
app.post("/v1/fetchIndividualUnit", validator.validUser, unitController.fetchIndividualUnit);
app.post("/v1/editUnit", validator.validUser, unitController.editUnit);
app.post("/v1/toggleUnitStatus", validator.validUser, unitController.toggleUnitStatus);
app.post("/v1/fetchUnitsBasedonStatus", validator.validUser, unitController.fetchUnitsBasedonStatus);
app.post("/v1/bulkToggleUnitStatus", validator.validUser, unitController.bulkToggleUnitStatus);

// Class : 
app.post("/v1/addClass", validator.validUser, classController.addClass);
app.post("/v1/fetchIndividualClass", validator.validUser, classController.fetchIndividualClass);
app.post("/v1/editClass", validator.validUser, classController.editClass);
app.post("/v1/toggleClassStatus", validator.validUser, classController.toggleClassStatus);
app.post("/v1/fetchClassesBasedonStatus", validator.validUser, classController.fetchClassesBasedonStatus);
app.post("/v1/bulkToggleClassStatus", validator.validUser, classController.bulkToggleClassStatus);

// School :
app.post("/v1/insertSchool", validator.validUser, schoolController.insertSchool);
app.post("/v1/fetchActiveSchool", validator.validUser, schoolController.fetchActiveSchools);
app.post("/v1/fetchArchivedSchool", validator.validUser, schoolController.fetchArchivedSchool);
app.post("/v1/fetchSchoolIdNames", validator.validUser, schoolController.fetchSchoolIdNames);
app.post("/v1/toggleSchoolStatus", validator.validUser, schoolController.toggleSchoolStatus);  // Delete/Restore school
app.post("/v1/fetchIndividualSchool", validator.validUser, schoolController.fetchIndividualSchool);
app.post("/v1/updateSchool", validator.validUser, schoolController.updateSchool);
app.post("/v1/fetchUpschoolAndClientClasses", validator.validUser, schoolController.fetchUpschoolClassesAndClientClasses);
app.post("/v1/classSubscribe", validator.validUser, schoolController.classSubscribe);
app.post("/v1/fetchClassBasedOnSchool", validator.validUser, schoolController.fetchClassBasedOnSchool);

// School Settings :
app.post("/v1/setQuizConfiguration", validator.validUser, schoolController.setQuizConfiguration);
app.post("/v1/setTestConfiguration", validator.validUser, schoolController.setTestConfiguration);
app.post("/v1/schoolubscriptionFeatures", validator.validUser, schoolController.schoolubscriptionFeatures);
app.post("/v1/teacherAccess",  schoolController.teacherAccess);


// Users :
app.post("/v1/getUserBulkuploadUrl", validator.validUser, userController.getUserBulkuploadUrl);
app.post("/v1/fetchAllUsersData", validator.validUser, userController.fetchAllUsersData); // Fetch active users  
app.post("/v1/fetchInactiveUsersData", validator.validUser, userController.fetchInactiveUsersData); // Fetch archived users
app.post("/v1/bulkUsersUpload", validator.validUser, userController.bulkUsersUpload); //
app.post("/v1/fetchIndividualUserByRole", validator.validUser, userController.fetchIndividualUserByRole);
app.post("/v1/updateUsersByRole", userController.updateUsersByRole); // validator.validUser,
app.post("/v1/toggleUserStatus", validator.validUser, userController.toggleUserStatus); // Delete/Restore user status
app.post("/v1/bulkToggleUsersStatus", validator.validUser, userController.bulkToggleUsersStatus);

app.post("/v1/searchUsers", validator.validUser, userController.searchUsers);
app.post("/v1/usersPagination", validator.validUser, userController.usersPagination); //


// Teacher : 
app.post("/v1/teacherSectionAllocation", validator.validUser, teacherController.teacherSectionAllocation);
app.post("/v1/fetchTeacherInfoDetails", validator.validUser, teacherController.fetchTeacherInfoDetails);
app.post("/v1/fetchTeacherClassAndSection", validator.validUser, teacherController.fetchTeacherClassAndSection);
app.post("/v1/fetchSubjectForClientClass", validator.validUser, teacherController.fetchSubjectForClientClass);
app.post("/v1/mappingSubjectToTeacher", validator.validUser, teacherController.mappingSubjectToTeacher);
app.post("/v1/fetchMappedSubjectForTeacher", validator.validUser, teacherController.fetchMappedSubjectForTeacher);

// Concepts : 
app.post("/v1/fetchDigicardAndConcept", validator.validUser, conceptController.fetchDigicardAndConcept);
app.post("/v1/addConcepts", validator.validUser, conceptController.addConcepts);
app.post("/v1/fetchAllConcepts", validator.validUser, conceptController.fetchAllConcepts);
app.post("/v1/toggleConceptStatus", validator.validUser, conceptController.toggleConceptStatus); // Delete/Restore Concept
app.post("/v1/fetchIndividualConcept", validator.validUser, conceptController.fetchIndividualConcept);
app.post("/v1/updateConcept", validator.validUser, conceptController.updateConcept);
app.post("/v1/bulkToggleConceptStatus", validator.validUser, conceptController.bulkToggleConceptStatus);

// Subjects :
app.post("/v1/addSubject", validator.validUser, subjectController.addSubject);
app.post("/v1/fetchAllSubjects", validator.validUser, subjectController.fetchAllSubjects);
app.post("/v1/toggleSubjectStatus", validator.validUser, subjectController.toggleSubjectStatus); // Delete/Restore Concept
app.post("/v1/fetchUnitAndSubject", validator.validUser, subjectController.fetchUnitAndSubject);
app.post("/v1/fetchIndividualSubject", validator.validUser, subjectController.fetchIndividualSubject);
app.post("/v1/updateSubject", validator.validUser, subjectController.updateSubject);
app.post("/v1/fetchSubjectIdName", validator.validUser, subjectController.fetchSubjectIdName);
app.post("/v1/bulkToggleSubjectStatus", validator.validUser, subjectController.bulkToggleSubjectStatus);

// Section : 
app.post("/v1/addSection", validator.validUser, sectionController.addSection);
app.post("/v1/editSection", validator.validUser, sectionController.editSection);
app.post("/v1/fetchSchoolSection", validator.validUser, sectionController.fetchSchoolSection);
app.post("/v1/fetchSectionById", validator.validUser, sectionController.fetchSectionById);
app.post("/v1/fetchSectionByClientClassId", validator.validUser, sectionController.fetchSectionByClientClassId);

// Questions :
app.post("/v1/addQuestions", validator.validUser, questionController.addQuestions);
app.post("/v1/fetchAllQuestionsData", validator.validUser, questionController.fetchAllQuestionsData);
app.post("/v1/fetchIndividualQuestionData", validator.validUser, questionController.fetchIndividualQuestionData);
app.post("/v1/editQuestion", validator.validUser, questionController.editQuestion);
app.post("/v1/toggleQuestionStatus", validator.validUser, questionController.toggleQuestionStatus);
app.post("/v1/bulkToggleQuestionStatus", validator.validUser, questionController.bulkToggleQuestionStatus);

// Group :
app.post("/v1/fetchAllGroupsData", validator.validUser, groupController.fetchAllGroupsData);
app.post("/v1/addGroups", validator.validUser, groupController.addGroups);
app.post("/v1/toggleGroupStatus", validator.validUser, groupController.toggleGroupStatus);
app.post("/v1/fetchIndividualGroupData", validator.validUser, groupController.fetchIndividualGroupData);
app.post("/v1/editGroup", validator.validUser, groupController.editGroup);
app.post("/v1/fetchAllTypesOfGroups", validator.validUser, groupController.fetchAllTypesOfGroups);
app.post("/v1/bulkToggleGroupsStatus", validator.validUser, groupController.bulkToggleGroupsStatus);
app.post("/v1/bulkGroupsUpload", groupController.bulkGroupsUpload);

// Settings - Category :
app.post("/v1/fetchAllQuestionCategories", validator.validUser, settingsController.fetchAllQuestionCategories);
app.post("/v1/addQuestionCategory", validator.validUser, settingsController.addQuestionCategory);
app.post("/v1/fetchIndividualCategory", validator.validUser, settingsController.fetchIndividualCategory);
app.post("/v1/updateQuestionCategory", validator.validUser, settingsController.updateQuestionCategory);
app.post("/v1/toggleQuestionCategoryStatus", validator.validUser, settingsController.toggleQuestionCategoryStatus);
app.post("/v1/bulkToggleQuestionCategoryStatus", validator.validUser, settingsController.bulkToggleQuestionCategoryStatus);

// Settings - Disclaimer :
app.post("/v1/fetchAllQuestionDisclaimers", validator.validUser, settingsController.fetchAllQuestionDisclaimers);
app.post("/v1/addQuestionDisclaimer", validator.validUser, settingsController.addQuestionDisclaimer);
app.post("/v1/fetchIndividualDisclaimer", validator.validUser, settingsController.fetchIndividualDisclaimer);
app.post("/v1/updateQuestionDisclaimer", validator.validUser, settingsController.updateQuestionDisclaimer);
app.post("/v1/toggleQuestionDisclaimerStatus", validator.validUser, settingsController.toggleQuestionDisclaimerStatus);
app.post("/v1/bulkToggleQuestionDisclaimerStatus", validator.validUser, settingsController.bulkToggleQuestionDisclaimerStatus);

// Source of Question : 
app.post("/v1/fetchSourcesBasedonStatus", validator.validUser, settingsController.fetchSourcesBasedonStatus);
app.post("/v1/addQuestionSource", validator.validUser, settingsController.addQuestionSource);
app.post("/v1/fetchIndividualSource", validator.validUser, settingsController.fetchIndividualSource);
app.post("/v1/updateQuestionSource", validator.validUser, settingsController.updateQuestionSource);
app.post("/v1/toggleQuestionSourceStatus", validator.validUser, settingsController.toggleQuestionSourceStatus);
app.post("/v1/bulkToggleQuestionSourceStatus", validator.validUser, settingsController.bulkToggleQuestionSourceStatus);

// Cognitive Skills : 
app.post("/v1/fetchSkillsBasedonStatus", validator.validUser, settingsController.fetchSkillsBasedonStatus);
app.post("/v1/addCognitiveSkill", validator.validUser, settingsController.addCognitiveSkill);
app.post("/v1/fetchIndividualCognitiveSkill", validator.validUser, settingsController.fetchIndividualCognitiveSkill);
app.post("/v1/updateCognitiveSkill", validator.validUser, settingsController.updateCognitiveSkill);
app.post("/v1/toggleCognitiveSkillStatus", validator.validUser, settingsController.toggleCognitiveSkillStatus);
app.post("/v1/bulkToggleCognitiveSkillStatus", validator.validUser, settingsController.bulkToggleCognitiveSkillStatus);

// fetch Disclaimers, Categories, Sources, Skills : 
app.post("/v1/fetchQuestionMasters", validator.validUser, settingsController.fetchQuestionMasters);

// Blue Prints : 
app.post("/v1/addBluePrint", validator.validUser, blueprintController.addBluePrint);
app.post("/v1/fetchBluePrintsBasedonStatus", validator.validUser, blueprintController.fetchBluePrintsBasedonStatus);
app.post("/v1/toggleBluePrintStatus", validator.validUser, blueprintController.toggleBluePrintStatus);
app.post("/v1/fetchIndividualBluePrint", validator.validUser, blueprintController.fetchIndividualBluePrint);

app.post("/v1/deleteDynamoDBData", commonController.deleteDynamoDBData);

// Students
app.post("/v1/fetchAllStudents", studentController.fetchAllStudents);


/** END ADMIN APIS **/

const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'development') {

    app.set("port", process.env.PORT || 3001);
    let server = http.createServer(app);

    server.listen(app.get("port"), "0.0.0.0", () => {
        console.log(`Express server listening on http://localhost:${app.get("port")}`);
    });
}
else {
    const serverless = require("serverless-http");
    module.exports.upschoolAdminServer = serverless(app);
}