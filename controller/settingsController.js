const settingsServices = require("../services/settingsServices");
const constant = require('../constants/constant');

/** CATEGORIES **/
exports.fetchAllQuestionCategories = (req, res, next) => {
    console.log("Fetch Questions Categories");

    let request = req.body;
    request.data.category_type = constant.contentType.question;

    settingsServices.fetchContentCategories(request, function (contentCategory_err, contentCategory_res) {
        if (contentCategory_err) {
            res.status(contentCategory_err).json(contentCategory_res);
        } else {
            console.log("Got categories!");
            res.json(contentCategory_res);
        }
    });
};

exports.addQuestionCategory = (req, res, next) => {
    console.log("Add Questions Categories");

    let request = req.body;
    request.data.category_type = constant.contentType.question;

    settingsServices.addContentCategories(request, function (addContentCategory_err, addContentCategory_res) {
        if (addContentCategory_err) {
            res.status(addContentCategory_err).json(addContentCategory_res);
        } else {
            console.log("Question Category Added!");
            res.json(addContentCategory_res);
        }
    });
};

exports.fetchIndividualCategory = (req, res, next) => {
    console.log("Fetch Individual Category");

    let request = req.body;
    settingsServices.getIndividualCategory(request, function (IndividualCategory_err, IndividualCategory_res) {
        if (IndividualCategory_err) {
            res.status(IndividualCategory_err).json(IndividualCategory_res);
        } else {
            console.log("Got Category!");
            res.json(IndividualCategory_res);
        }
    });
};

exports.updateQuestionCategory = (req, res, next) => {
    console.log("Update Category");    
    let request = req.body;
    request.data.category_type = constant.contentType.question;

    settingsServices.editCategory(request, function (updateCategory_err, updateCategory_res) {
        if (updateCategory_err) {
            res.status(updateCategory_err).json(updateCategory_res);
        } else {
            console.log("Category Updated!");
            res.json(updateCategory_res);
        }
    });
};

exports.toggleQuestionCategoryStatus = (req, res, next) => {
    console.log("Toggle Question Category");    
    let request = req.body;
    request.data.category_type = constant.contentType.question;

    settingsServices.changeQuestionCategoryStatus(request, function (toggleCategory_err, toggleCategory_res) {
        if (toggleCategory_err) {
            res.status(toggleCategory_err).json(toggleCategory_res);
        } else {
            console.log("Question Category Status Changed!");
            res.json(toggleCategory_res);
        }
    });
};

exports.bulkToggleQuestionCategoryStatus = (req, res, next) => {
    console.log("Toggle Bulk Question Category");    
    let request = req.body;
    request.data.category_type = constant.contentType.question;

    settingsServices.changeBulkQuestionCategoryStatus(request, function (toggleBulkCategory_err, toggleBulkCategory_res) {
        if (toggleBulkCategory_err) {
            res.status(toggleBulkCategory_err).json(toggleBulkCategory_res);
        } else {
            console.log("Bulk Question Category Status Changed!");
            res.json(toggleBulkCategory_res);
        }
    });
};

/** DISCLAIMERS **/
exports.fetchAllQuestionDisclaimers = (req, res, next) => {
    console.log("Fetch Question Disclaimers");

    let request = req.body;
    request.data.disclaimer_type = constant.contentType.question;

    settingsServices.fetchContentDisclaimers(request, function (contentDisclaimers_err, contentDisclaimers_res) {
        if (contentDisclaimers_err) {
            res.status(contentDisclaimers_err).json(contentDisclaimers_res);
        } else {
            console.log("Got disclaimers!");
            res.json(contentDisclaimers_res);
        }
    });
};

exports.addQuestionDisclaimer = (req, res, next) => {
    console.log("Add Questions Disclaimer");

    let request = req.body;
    request.data.disclaimer_type = constant.contentType.question;

    settingsServices.addContentDisclaimer(request, function (addNewContentDisclaimer_err, addNewContentDisclaimer_res) {
        if (addNewContentDisclaimer_err) {
            res.status(addNewContentDisclaimer_err).json(addNewContentDisclaimer_res);
        } else {
            console.log("Question Disclaimer Added!");
            res.json(addNewContentDisclaimer_res);
        }
    });
};

exports.fetchIndividualDisclaimer = (req, res, next) => {
    console.log("Fetch Individual Disclaimer");

    let request = req.body;
    settingsServices.getIndividualDisclaimer(request, function (IndividualDisclaimer_err, IndividualDisclaimer_res) {
        if (IndividualDisclaimer_err) {
            res.status(IndividualDisclaimer_err).json(IndividualDisclaimer_res);
        } else {
            console.log("Got Disclaimer!");
            res.json(IndividualDisclaimer_res);
        }
    });
};

exports.updateQuestionDisclaimer = (req, res, next) => {
    console.log("Update Disclaimer");    
    let request = req.body;
    request.data.disclaimer_type = constant.contentType.question;
    
    settingsServices.editDisclaimer(request, function (updateDisclaimer_err, updateDisclaimer_res) {
        if (updateDisclaimer_err) {
            res.status(updateDisclaimer_err).json(updateDisclaimer_res);
        } else {
            console.log("Disclaimer Updated!");
            res.json(updateDisclaimer_res);
        }
    });
};

exports.fetchQuestionMasters = (req, res, next) => {
    console.log("Fetch Question Disclaimers and Categories");

    let request = req.body;
    request.data.disclaimer_type = constant.contentType.question;
    request.data.category_type = constant.contentType.question;
    request.data.source_type = constant.contentType.question;
    request.data.cognitive_type = constant.contentType.question;

    settingsServices.getDisclaimersCategoriesSourcesSkills(request, function (disclaimers_categories_source_skill_err, disclaimers_categories_source_skill_res) {
        if (disclaimers_categories_source_skill_err) { 
            res.status(disclaimers_categories_source_skill_err).json(disclaimers_categories_source_skill_res);
        } else {
            console.log("Got All Disclaimer, Categories, Sources, Skills !");
            res.json(disclaimers_categories_source_skill_res);
        }
    });
};

exports.toggleQuestionDisclaimerStatus = (req, res, next) => {
    console.log("Toggle Question Disclaimer");    
    let request = req.body;
    request.data.disclaimer_type = constant.contentType.question;

    settingsServices.changeQuestionDisclaimerStatus(request, function (toggleDisclaimer_err, toggleDisclaimer_res) {
        if (toggleDisclaimer_err) {
            res.status(toggleDisclaimer_err).json(toggleDisclaimer_res);
        } else {
            console.log("Question Disclaimer Status Changed!");
            res.json(toggleDisclaimer_res);
        }
    });
};

exports.bulkToggleQuestionDisclaimerStatus = (req, res, next) => {
    console.log("Toggle Bulk Question Disclaimer");    
    let request = req.body;
    request.data.disclaimer_type = constant.contentType.question;

    settingsServices.changeBulkQuestionDisclaimerStatus(request, function (toggleBulkDisclaimer_err, toggleBulkDisclaimer_res) {
        if (toggleBulkDisclaimer_err) {
            res.status(toggleBulkDisclaimer_err).json(toggleBulkDisclaimer_res);
        } else {
            console.log("Bulk Question Disclaimer Status Changed!");
            res.json(toggleBulkDisclaimer_res);
        }
    });
};

/** Question Source */
exports.fetchSourcesBasedonStatus = (req, res, next) => {
    console.log("Fetch Question Sources");

    let request = req.body;
    request.data.source_type = constant.contentType.question;

    settingsServices.fetchQuestionSources(request, function (fetch_all_sources_err, fetch_all_sources_res) {
        if (fetch_all_sources_err) {
            res.status(fetch_all_sources_err).json(fetch_all_sources_res);
        } else {
            console.log("Got Sources!");
            res.json(fetch_all_sources_res);
        }
    });
};

exports.addQuestionSource = (req, res, next) => {
    console.log("Add Questions Sources");

    let request = req.body;
    request.data.source_type = constant.contentType.question;

    settingsServices.insertQuestionSource(request, function (add_question_source_err, add_question_source_res) {
        if (add_question_source_err) {
            res.status(add_question_source_err).json(add_question_source_res);
        } else {
            console.log("Question Source Added!");
            res.json(add_question_source_res);
        }
    });
};

exports.fetchIndividualSource = (req, res, next) => {
    console.log("Fetch Individual Source");

    let request = req.body;
    settingsServices.getIndividualQuestionSource(request, function (get_question_source_err, get_question_source_res) {
        if (get_question_source_err) {
            res.status(get_question_source_err).json(get_question_source_res);
        } else { 
            console.log("Got Source!");
            res.json(get_question_source_res);
        }
    });
};

exports.updateQuestionSource = (req, res, next) => {
    console.log("Update Source");    
    let request = req.body;
    request.data.source_type = constant.contentType.question;
    
    settingsServices.editQuestionSource(request, function (update_source_err, update_source_res) {
        if (update_source_err) {
            res.status(update_source_err).json(update_source_res);
        } else {
            console.log("Source Updated!");
            res.json(update_source_res);
        }
    });
};

exports.toggleQuestionSourceStatus = (req, res, next) => {
    console.log("Toggle Question Source");    
    let request = req.body;
    request.data.source_type = constant.contentType.question;

    settingsServices.changeQuestionSourceStatus(request, function (toggle_source_err, toggle_source_res) {
        if (toggle_source_err) {
            res.status(toggle_source_err).json(toggle_source_res);
        } else {
            console.log("Question Source Status Changed!");
            res.json(toggle_source_res);
        }
    });
};

exports.bulkToggleQuestionSourceStatus = (req, res, next) => {
    console.log("Toggle Bulk Question Source");    
    let request = req.body;
    request.data.source_type = constant.contentType.question;

    settingsServices.changeBulkQuestionSourceStatus(request, function (toggle_bulk_source_err, toggle_bulk_source_res) {
        if (toggle_bulk_source_err) {
            res.status(toggle_bulk_source_err).json(toggle_bulk_source_res);
        } else {
            console.log("Bulk Question Source Status Changed!");
            res.json(toggle_bulk_source_res);
        }
    });
};

// exports.fetchDisclaimersandCategories = (req, res, next) => {
//     console.log("Fetch Question Disclaimers and Categories");

//     let request = req.body;
//     request.data.source_type = constant.contentType.question;
//     request.data.category_type = constant.contentType.question;

//     settingsServices.getAllDisclaimersandCategories(request, function (contentDisclaimersandCategories_err, contentDisclaimersandCategories_res) {
//         if (contentDisclaimersandCategories_err) { 
//             res.status(contentDisclaimersandCategories_err).json(contentDisclaimersandCategories_res);
//         } else {
//             console.log("Got disclaimers!");
//             res.json(contentDisclaimersandCategories_res);
//         }
//     });
// };

/** Cognitive Skills */

exports.addCognitiveSkill = (req, res, next) => {
    console.log("Add Cognitive Skill");

    let request = req.body;
    request.data.cognitive_type = constant.contentType.question;

    settingsServices.insertCognitiveSkill(request, function (add_cognitive_skill_err, add_cognitive_skill_res) {
        if (add_cognitive_skill_err) {
            res.status(add_cognitive_skill_err).json(add_cognitive_skill_res);
        } else {
            console.log("Cognitive Skill Added!");
            res.json(add_cognitive_skill_res);
        }
    });
};

exports.fetchIndividualCognitiveSkill = (req, res, next) => {
    console.log("Fetch Individual Cognitive Skill");

    let request = req.body;
    settingsServices.getIndividualCognitiveSkill(request, function (get_cognitive_skill_err, get_cognitive_skill_res) {
        if (get_cognitive_skill_err) {
            res.status(get_cognitive_skill_err).json(get_cognitive_skill_res);
        } else { 
            console.log("Got Cognitive Skill !");
            res.json(get_cognitive_skill_res);
        }
    });
};

exports.updateCognitiveSkill = (req, res, next) => {
    console.log("Update Cognitive Skill");    
    let request = req.body;
    request.data.cognitive_type = constant.contentType.question;
    
    settingsServices.editCognitiveSkill(request, function (update_cognitive_skill_err, update_cognitive_skill_res) {
        if (update_cognitive_skill_err) {
            res.status(update_cognitive_skill_err).json(update_cognitive_skill_res);
        } else {
            console.log("Cognitive Skill Updated!");
            res.json(update_cognitive_skill_res);
        }
    });
};

exports.fetchSkillsBasedonStatus = (req, res, next) => {
    console.log("Fetch Cognitive Skills");

    let request = req.body;
    request.data.cognitive_type = constant.contentType.question;

    settingsServices.fetchCognitiveSkills(request, function (fetch_all_skills_err, fetch_all_skills_res) {
        if (fetch_all_skills_err) {
            res.status(fetch_all_skills_err).json(fetch_all_skills_res);
        } else {
            console.log("Got Cognitive Skill !");
            res.json(fetch_all_skills_res);
        }
    });
};

exports.toggleCognitiveSkillStatus = (req, res, next) => {
    console.log("Toggle Cognitive Skill");    
    let request = req.body;
    request.data.cognitive_type = constant.contentType.question;

    settingsServices.changeCognitiveSkillStatus(request, function (toggle_skill_err, toggle_skill_res) {
        if (toggle_skill_err) {
            res.status(toggle_skill_err).json(toggle_skill_res);
        } else {
            console.log("Cognitive Skill Status Changed!");
            res.json(toggle_skill_res);
        }
    });
};

exports.bulkToggleCognitiveSkillStatus = (req, res, next) => {
    console.log("Toggle Bulk Cognitive Skill");    
    let request = req.body;
    request.data.cognitive_type = constant.contentType.question;

    settingsServices.changeBulkCognitiveSkillStatus(request, function (toggle_bulk_skill_err, toggle_bulk_skill_res) {
        if (toggle_bulk_skill_err) {
            res.status(toggle_bulk_skill_err).json(toggle_bulk_skill_res);
        } else {
            console.log("Bulk Cognitive Skill Status Changed!");
            res.json(toggle_bulk_skill_res);
        }
    });
};
