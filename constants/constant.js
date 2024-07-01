exports.messages = {
    USER_DATA_DATABASE_ERROR: "User Data Database Error",
    USER_EMAIL_DOESNOT_EXISTS: "User Email Doesn't Exist",
    UPSCHOOL_USER_ALREADY_EXISTS: "User with same Email or Username or Phone Number already Exists",
    USER_EMAIL_ALREADY_EXISTS: "User with same Email already Exists",
    USER_USERNAME_ALREADY_EXISTS: "User with Username already Exists",
    USER_PHONE_ALREADY_EXISTS: "User with Phone Number already Exists",
    DATABASE_ERROR: "DB Error",
    USER_DOESNOT_EXISTS : "User Doesn't Exist",
    INVALID_PASSWORD: "Invalid Password",
    INVALID_TOKEN: "Invalid Token",
    USER_DELETED: "User is Deleted", 
    ERROR_UPLOADING_FILES_TO_S3: "Error Uploading Files to S3",
    USER_LOGIN_DATABASE_ERROR: "User Login Database Error",
    CLIENT_NAME_ALREADY_EXISTS: "Client Name Already Exist",
    SCHOOL_NAME_ALREADY_EXIST: "School Name Already Exist",
    ADMIN_EMAIL_ALREADY_EXIST: "Admin email exists already!",
    SCHOOL_IS_ACTIVE : "Unable to delete the school as subscription status is active!",
    NO_DATA : "No Data",
    INVALID_DATA: "Invalid Data",
    
    //CMS User
    INVALID_CMS_USER_TYPE: "Invalid CMS User Type",
    NO_CMS_USER_TO_TOGGLE: "No CMS User to Toggle Status",
    
    // School :
    SCHOOL_DOESNOT_EXISTS : "School Doesn't Exist",
    TOGGLE_SCHOOL_STATUS_ERROR : "Error in Toggling School Status",
    INVALID_SCHOOL_STATUS : "Invalid School Status",
    INVALID_REQUEST_FORMAT : "Invaid Request Format",
    
    // DigiCard : 
    DIGICARD_DATABASE_ERROR: "DigiCard Database Error",
    UPSCHOOL_USER_DATABASE_ERROR: "Upschool User Database Error",
    INVALID_DIGICARD_TITLE: "Invalid Digicard Title",
    INVALID_DIGICARD_IMAGE: "Invalid Digicard Image",
    INVALID_DIGICARD_STATUS: "Invalid Digicard Status to toggle",
    INVALID_DIGICARD_TO_DELETE: "Invalid DigiCard is Selected to Delete",  
    NO_DIGICARD_TO_DELETE: "No DigiCard is Selected to Delete",
    DIGICARD_NAME_ALREADY_EXISTS: "Digicard Name Already Exists",
    UNABLE_TO_DELETE_THE_DIGICARD: "Unable to delete the digi card as it is mapped with the concept blocks: **REPLACE**",
    UNABLE_TO_DELETE_MULTIPLE_DIGICARDS: "Unable to delete **REPLACE** as they are mapped with the concept blocks",
    PRE_DIGICARDS_UNLOCKED: "Pre Learning Digicards Unlocked", 
    POST_DIGICARDS_UNLOCKED: "Post Learning Digicards Unlocked",

    // Topic : 
    TOPIC_DATABASE_ERROR: "Topic Database Error",
    INVALID_TOPIC_TITLE: "Invalid Standard Title",
    NO_TOPIC_TO_DELETE: "No Topic is Selected to Delete",
    TOPIC_NAME_ALREADY_EXISTS: "Topic Name Already Exists",
    UNABLE_TO_DELETE_THE_TOPIC: "Unable to delete the topic as it is mapped with the chapters: **REPLACE**",
    UNABLE_TO_DELETE_BULK_TOPIC_FOR_ONE: "Unable to delete **REPLACE** topic as it is mapped with chapters",
    UNABLE_TO_DELETE_BULK_TOPIC_FOR_MULTIPLE: "Unable to delete **REPLACE** topics as they have been mapped with chapters",

    // Chapter :
    CHAPTER_DATABASE_ERROR: "Chapter Database Error",
    INVALID_CHAPTER_TITLE: "Invalid Standard Title",
    NO_CHAPTER_TO_DELETE: "No Chapter is Selected to Delete",
    CHAPTER_NAME_ALREADY_EXISTS: "Chapter Name Already Exists",
    NO_CHAPTERS_TO_TOGGLE: "No Chapters to Toggle Status",
    INVALID_CHAPTER_TO_DELETE: "Invalid Chapter is Selected to Delete",  
    INVALID_CHAPTER_STATUS: "Invalid Chapter Status to toggle",
    UNABLE_TO_DELETE_THE_CHAPTER: "Unable to delete the chapter as it is mapped with the units: **REPLACE**",
    UNABLE_TO_DELETE_MULTIPLE_CHAPTERS: "Unable to delete **REPLACE** as they are mapped with the units",

    // Unit :
    UNIT_DATABASE_ERROR: "Unit Database Error",
    INVALID_UNIT_TITLE: "Invalid Standard Title",
    NO_UNIT_TO_DELETE: "No Unit is Selected to Delete",
    NO_UNITS_TO_TOGGLE: "No Units to Toggle Status",
    INVALID_UNIT_TO_DELETE: "Invalid Unit is Selected to Delete",  
    INVALID_UNIT_STATUS: "Invalid Unit Status to toggle",

    UNIT_NAME_ALREADY_EXISTS: "Unit Name Already Exists",
    UNABLE_TO_DELETE_THE_UNIT: "Unable to delete the unit as it is mapped with the subjects: **REPLACE**",    
    UNABLE_TO_DELETE_MULTIPLE_UNITS: "Unable to delete **REPLACE** as they are mapped with the Subjects",
    ERROR: "Error", 
    
    STANDARD_DATABASE_ERROR: "Standard Database Error",
    INVALID_STANDARD_TITLE: "Invalid Standard Title",
    NO_STANDARD_TO_DELETE: "No Standard is Selected to Delete",
    STANDARD_NAME_ALREADY_EXISTS: "Standard Name Already Exists",

    // Users :
    PHONE_NO_ALREADY_EXIST: "Phone No Already Exist",
    EMAIL_ID_ALREADY_EXIST : "Email Id Already Exist",
    INVALID_USER_ROLE: "Invalid User Role",
    PHONE_NO_ALREADY_IN_USE: "Phone Number Already In Use",
    EMAIL_ALREADY_IN_USE: "Email Id Already In Use",
    PARENT_DOESNT_EXIST: "Parent Doesn't Exist For This Phone Number",   
    UNABLE_TO_RESTORE_ONE_USER: "Unable to restore **REPLACE** user as their school is not active",
    UNABLE_TO_RESTORE_BULK_USERS: "Unable to restore **REPLACE** users as their school is not active",
    USER_CANT_TOGGLE : "User cannot be restored as user's School is Archived",
    INVALID_USER_STATUS: "Invalid User Status to toggle",
    ERROR_IN_PAGINATION: "Error in Pagination", 

    // Concept : 
    CONCEPT_TITLE_ALREADY_EXIST: "Concept Title Already Exist!",
    NO_CONCEPT_TO_TOGGLE: "No Concepts to Toggle Status",
    UNABLE_TO_DELETE_THE_CONCEPT: "Unable to delete the concept as it is mapped with the topics: **REPLACE**",
    UNABLE_TO_DELETE_MULTIPLE_CONCEPTS: "Unable to delete **REPLACE** as they are mapped with the Topics",
    INVALID_CONCEPT_TO_DELETE: "Invalid Unit is Selected to Delete",  
    INVALID_CONCEPT_STATUS: "Invalid Unit Status to toggle",

    // Subject : 
    SUBJECT_TITLE_ALREADY_EXIST: "Subject Title Already Exist!",
    UNABLE_TO_DELETE_THE_SUBJECT: "Unable to delete the subject as it is mapped with the classes: **REPLACE**",
    UNABLE_TO_DELETE_BULK_SUBJECT_FOR_ONE: "Unable to delete **REPLACE** subject as it is mapped with class",
    UNABLE_TO_DELETE_BULK_SUBJECT_FOR_MULTIPLE: "Unable to delete **REPLACE** subjects as they have been mapped with class",
    NO_SUBJECT_TO_DELETE: "No Subject is Selected to Delete",

    // Class : 
    CLASS_NAME_ALREADY_EXIST: "Class Name Already Exist!",
    UNABLE_TO_DELETE_THE_CLASS: "Unable to delete the class as it is subscribed with a client class!",
    NO_CLASS_TO_DELETE: "No Class is Selected to Delete",
    UNABLE_TO_DELETE_BULK_CLASS_FOR_ONE: "Unable to delete **REPLACE** class as it has reference with school class",
    UNABLE_TO_DELETE_BULK_CLASS_FOR_MULTIPLE: "Unable to delete **REPLACE** classes as they have reference with school classes",

    // Section : 
    SECTION_NAME_ALREADY_EXIST: "Section Name Already Exist!",

    // Teacher : 
    TEACHER_SECTION_ALLOCATION_ISNOT_EXIST: "Teacher section allocation is not exist!",
    TEACHER_SECTION_INFO_ISNOT_EXIST: "Teacher section info is not exist!",

    // Student : 
    ROLL_NO_ALREADY_EXIST: "Student roll no already exist!",

    // Question : 
    PUBLISHED_QUESTION_CANT_BE_DELETED: "Published question can't be deleted!",
    UNABLE_TO_DELETE_THE_QUESTION: "Unable to delete the question as it is mapped with the groups: **REPLACE**",
    UNABLE_TO_DELETE_THE_WORKSHEET_QUESTION: "Unable to delete the question as it is mapped with the concepts: **REPLACE**",
    QUESTION_LABEL_ALREADY_EXIST: "Question Label Already Exist!",
    UNABLE_TO_DELETE_MULTIPLE_QUESTIONS: "Unable to delete **REPLACE** as they are mapped with the Groups",
    INVALID_QUESTIONS_TO_DELETE: "Invalid Questions is Selected to Delete",  
    INVALID_QUESTIONS_STATUS: "Invalid Questions Status to toggle",
    NO_QUESTION_TO_TOGGLE: "No Question to Toggle Status",
    
    // Group : 
    GROUP_NAME_ALREADY_EXIST: "Group Name Already Exist!",
    UNABLE_TO_DELETE_THE_GROUP: "Unable to delete the group as it is mapped with the concept blocks: **REPLACE**",
    UNABLE_TO_DELETE_MULTIPLE_GROUPS: "Unable to delete **REPLACE** as they are mapped with the concept blocks",
    INVALID_GROUP_STATUS: "Invalid Group Status", 

    // Settings :
    CATEGORY_NAME_ALREADY_EXIST: "Category Name Already Exist!",
    DISCLAIMER_LABEL_ALREADY_EXIST: "Disclaimer Label Already Exist!",
    SOURCE_NAME_ALREADY_EXIST: "Source Name Already Exist!",
    SKILL_NAME_ALREADY_EXIST: "Cognitive Skill Name Already Exist!",

    UNABLE_TO_DELETE_THE_CATEGORY: "Unable to delete category as it is a part of **REPLACE** question",
    UNABLE_TO_DELETE_BULK_CATEGORY_FOR_MULTIPLE: "Unable to delete **REPLACE** categories as they have been mapped with question",

    UNABLE_TO_DELETE_THE_DISCLAIMER: "Unable to delete disclaimer as it is a part of **REPLACE** question",
    UNABLE_TO_DELETE_BULK_DISCLAIMER_FOR_MULTIPLE: "Unable to delete **REPLACE** disclaimers as they have been mapped with question",

    UNABLE_TO_DELETE_THE_SOURCE: "Unable to delete source as it is a part of **REPLACE** question",
    UNABLE_TO_DELETE_BULK_SOURCE_FOR_MULTIPLE: "Unable to delete **REPLACE** sources as they have been mapped with question",

    UNABLE_TO_DELETE_THE_SKILL: "Unable to delete cognitive skill as it is a part of **REPLACE** question",
    UNABLE_TO_DELETE_BULK_SKILL_FOR_MULTIPLE: "Unable to delete **REPLACE** cognitive skills as they have been mapped with question",

    NO_CATEGORY_TO_DELETE: "No Category is Selected to Delete",
    NO_DISCLAIMER_TO_DELETE: "No Disclaimer is Selected to Delete",
    NO_SOURCE_TO_DELETE: "No Source is Selected to Delete",
    NO_SKILL_TO_DELETE: "No Cognitive Skill is Selected to Delete",

    Reference_Number_Database_Error: "Reference Number Database Error", 

    BLUEPRINT_EXISTS: "BluePrint Name Already Exists!",

    // BLUEPRINT : 
    UNABLE_TO_DELETE_THE_BLUEPRINT: "Unable to delete the BluePrint as it is mapped with : **REPLACE**",

}

exports.constValues = {
    common_id: "61692656",
    splitCharacter: "&&&"
}

exports.typesOfGroup = {
    BASIC: "Basic",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced"
}

exports.mailSubject = {
    otpForLogin: "OTP for Login",
    otpForResettingPassword: "OTP for Creating/Resetting Password",
    otpForCreatingPassword: "OTP for Creating Password"
}

exports.contentType = {
    question: "question"
}

exports.status = {
    active: "Active",
    archived: "Archived"
}

exports.questionKeys = {
    objective: "Objective",
    subjective: "Subjective",
    desctiptive: "Desctiptive",
    lessDifficult: "lessDifficult",
    moderatelyDifficult: "moderatelyDifficult",
    highlyDifficult: "highlyDifficult",
    preOrPost: "preOrPost",
    worksheetOrTest: "worksheetOrTest",
}
exports.users = {
    Teacher: "Teacher", 
    Student: "Student", 
    Parent: "Parent", 
}