const settingsRepository = require("../repository/settingsRepository");  
const constant = require('../constants/constant');
const { TABLE_NAMES } = require('../constants/tables');
const commonRepository = require("../repository/commonRepository");

exports.fetchContentCategories = async function (request, callback) {
    console.log(request);
    settingsRepository.getContentCategories(request, function (categories_err, categories_res) {
        if (categories_err) {
            console.log(categories_err);
            callback(categories_err, categories_res);
        } else {
            categories_res.Items.sort((a, b) => {
                return new Date(b.updated_ts) - new Date(a.updated_ts);
            });          
            callback(0, categories_res);
        }
    })
}

exports.addContentCategories = async function (request, callback) {
    console.log(request);

    settingsRepository.fetchCategoryByName(request, function (fetchCategory_err, fetchCategory_res) {
        if (fetchCategory_err) {
            console.log(fetchCategory_err);
            callback(fetchCategory_err, fetchCategory_res);
        } else {        
            console.log("CATEGORY : ", fetchCategory_res);
            if(fetchCategory_res.Items.length > 0)
            {
                console.log(constant.messages.CATEGORY_NAME_ALREADY_EXIST);
                callback(400, constant.messages.CATEGORY_NAME_ALREADY_EXIST)
            }
            else
            {
                settingsRepository.insertContentCategory(request, function (insertCategory_err, insertCategory_response) {
                    if (insertCategory_err) {
                        console.log(insertCategory_err);
                        callback(insertCategory_err, insertCategory_response);
                    } else {
                        console.log("Category Added Successfully");
                        callback(0, 200);   
                    }
                })
            }
        }
    })   
}

exports.getIndividualCategory = async function (request, callback) {
    console.log(request);
    settingsRepository.fetchCategoryById(request, function (individualCat_err, individualCat_res) {
        if (individualCat_err) {
            console.log(individualCat_err);
            callback(individualCat_err, individualCat_res);
        } else {        
            callback(0, individualCat_res);
        }
    })
}

exports.editCategory = async function (request, callback) {
    console.log(request);
    settingsRepository.fetchCategoryByName(request, function (fetch_category_err, fetch_category_res) {
        if (fetch_category_err) {
            console.log(fetch_category_err);
            callback(fetch_category_err, fetch_category_res);
        } else {        
            console.log("CATEGORY : ", fetch_category_res);
            if((fetch_category_res.Items.length > 0) && fetch_category_res.Items[0].category_id !== request.data.category_id)
            {
                console.log(constant.messages.CATEGORY_NAME_ALREADY_EXIST);
                callback(400, constant.messages.CATEGORY_NAME_ALREADY_EXIST);                
            }
            else
            {
                settingsRepository.updateCategory(request, function (eidtCat_err, eidtCat_response) {
                    if (eidtCat_err) {
                        console.log(eidtCat_err);
                        callback(eidtCat_err, eidtCat_response);
                    } else {
                        callback(eidtCat_err, eidtCat_response);
                    }
                })
            }
        }
    }) 
}

exports.changeQuestionCategoryStatus = async function (request, callback) {
    console.log(request);

    if(request.data.category_status === "Archived")
    {
        console.log("ARCHIVED");
        /** FETCH QUESTION DATA **/
        let fetchBulkReq = {
            IdArray : [request.data.category_id],
            fetchIdName : "question_category",
            TableName : TABLE_NAMES.upschool_question_table
        }
        
        console.log({fetchBulkReq});
        commonRepository.fetchBulkDataUsingIndex(fetchBulkReq, function (bulkQuestionData_err, bulkQuestionData_res) {
            if (bulkQuestionData_err) {
                console.log(bulkQuestionData_err);
                callback(bulkQuestionData_err, bulkQuestionData_res);
            } else {
                console.log("QUESTION DATA");
                console.log(bulkQuestionData_res.Items); 

                if(bulkQuestionData_res.Items.length > 0)
                {
                    console.log(constant.messages.UNABLE_TO_DELETE_THE_CATEGORY.replace("**REPLACE**", bulkQuestionData_res.Items[0].question_label));
                    callback(400, constant.messages.UNABLE_TO_DELETE_THE_CATEGORY.replace("**REPLACE**", bulkQuestionData_res.Items[0].question_label));
                }
                else
                {
                    /** CHANGE CATEGORY STATUS **/
                    settingsRepository.changeCategoryStatus(request, function (statusChange_err, statusChange_res) {
                        if (statusChange_err) {
                            console.log(statusChange_err);
                            callback(statusChange_err, statusChange_res);
                        } else {        
                            callback(0, statusChange_res);
                        }
                    })
                    /** END CHANGE CATEGORY STATUS **/
                }
            }
        })
        /** FETCH QUESTION DATA **/
    }
    else
    {
        /** CHANGE CATEGORY STATUS **/
        settingsRepository.changeCategoryStatus(request, function (statusChange_err, statusChange_res) {
            if (statusChange_err) {
                console.log(statusChange_err);
                callback(statusChange_err, statusChange_res);
            } else {        
                callback(0, statusChange_res);
            }
        })
        /** END CHANGE CATEGORY STATUS **/
        
    }    
}

exports.changeBulkQuestionCategoryStatus = async function (request, callback) {
    if(request.data.category_array.length > 0)
    {
        let fetchBulkReq = {
            IdArray : request.data.category_array,
            fetchIdName : "category_id",
            TableName : TABLE_NAMES.upschool_content_category
        }
        
        commonRepository.fetchBulkData(fetchBulkReq, function (categoryData_err, categoryData_res) {
            if (categoryData_err) {
                console.log(categoryData_err);
                callback(categoryData_err, categoryData_res);
            } else {
                console.log("CATEGORY DATA");
                console.log(categoryData_res.Items);

                /** FETCH QUESTION DATA **/
                let fetchBulkIndexReq = {
                    IdArray : request.data.category_array,
                    fetchIdName : "question_category",
                    TableName : TABLE_NAMES.upschool_question_table
                }
                
                console.log({fetchBulkIndexReq});
                commonRepository.fetchBulkDataUsingIndex(fetchBulkIndexReq, function (bulkQuestionData_err, bulkQuestionData_res) {
                    if (bulkQuestionData_err) {
                        console.log(bulkQuestionData_err);
                        callback(bulkQuestionData_err, bulkQuestionData_res);
                    } else {
                        console.log("QUESTION DATA");
                        console.log(bulkQuestionData_res.Items); 

                        let mapCheck = "";
                        let finalUpdateData = [];
                        let finalResponse = "";
                        let resCount = 0;

                        function checkMapping(i)
                        {
                            mapCheck = "";
                            if(i < categoryData_res.Items.length)
                            {
                                if(request.data.category_status === "Archived")
                                {
                                    mapCheck = bulkQuestionData_res.Items.filter(que => que.question_category === categoryData_res.Items[i].category_id);
                                    if(mapCheck.length > 0)
                                    {
                                        finalResponse += ", " + categoryData_res.Items[i].category_name;
                                        resCount++;
                                    }
                                    else
                                    {
                                        categoryData_res.Items[i].category_status = request.data.category_status;
                                        finalUpdateData.push(categoryData_res.Items[i]);
                                    }
                                }
                                else
                                {
                                    categoryData_res.Items[i].category_status = request.data.category_status;
                                    finalUpdateData.push(categoryData_res.Items[i]);
                                }                                

                                i++;
                                checkMapping(i);
                            }   
                            else
                            {
                                /** END CHECK MAPPING **/
                                console.log("FINAL UPDATE DATA : ", finalUpdateData);
                                console.log("FINAL RESPONSE : ", finalResponse);

                                finalResponse = finalResponse.slice(2);

                                commonRepository.BulkInsert(finalUpdateData, TABLE_NAMES.upschool_content_category, function (updateBulkData_err, updateBulkData_res) {
                                    if (updateBulkData_err) {
                                        console.log("ERROR : TOGGLE BULK CATEGORY DATA");
                                        console.log(updateBulkData_err);
                                    } else {
                                        console.log("BULK CATEGORY STATUS UPDATED!");
                                        console.log(updateBulkData_res);                                        

                                        if(resCount > 0)
                                        {
                                            console.log((resCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_CATEGORY_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_THE_CATEGORY.replace("**REPLACE**", finalResponse));

                                            callback(400, (resCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_CATEGORY_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_THE_CATEGORY.replace("**REPLACE**", finalResponse));
                                        }
                                        else
                                        {
                                            callback(0, 200);
                                        }                                        
                                    }
                                })
                                /** END CHECK MAPPING **/
                            }
                        }
                        checkMapping(0)
                    }
                })
                /** END FETCH QUESTION DATA **/
            }
        })
    }
    else
    {
        console.log(constant.messages.NO_CATEGORY_TO_DELETE);
        callback(400, constant.messages.NO_CATEGORY_TO_DELETE);
    }
}

exports.fetchContentDisclaimers = async function (request, callback) {
    console.log(request);
    settingsRepository.getContentDisclaimers(request, function (disclaimer_err, disclaimer_res) {
        if (disclaimer_err) {
            console.log(disclaimer_err);
            callback(disclaimer_err, disclaimer_res);
        } else {        
            disclaimer_res.Items.sort((a, b) => {
                return new Date(b.updated_ts) - new Date(a.updated_ts);
            });  
            callback(0, disclaimer_res);
        }
    })
}

exports.addContentDisclaimer = async function (request, callback) {
    console.log(request);

    settingsRepository.fetchDisclaimerByLabel(request, function (fetchDisclaimer_err, fetchDisclaimer_res) {
        if (fetchDisclaimer_err) {
            console.log(fetchDisclaimer_err);
            callback(fetchDisclaimer_err, fetchDisclaimer_res);
        } else {        
            console.log("DISCLAIMER : ", fetchDisclaimer_res);
            if(fetchDisclaimer_res.Items.length > 0)
            {
                console.log(constant.messages.DISCLAIMER_LABEL_ALREADY_EXIST);
                callback(400, constant.messages.DISCLAIMER_LABEL_ALREADY_EXIST)
            }
            else
            {
                settingsRepository.insertContentDisclaimer(request, function (insertDisclaimer_err, insertDisclaimer_response) {
                    if (insertDisclaimer_err) {
                        console.log(insertDisclaimer_err);
                        callback(insertDisclaimer_err, insertDisclaimer_response);
                    } else {
                        console.log("Disclaimer Added Successfully");
                        callback(0, 200);   
                    }
                })
            }
        }
    })   
}

exports.getIndividualDisclaimer = async function (request, callback) {
    console.log(request);
    settingsRepository.fetchDisclaimerById(request, function (individualDis_err, individualDis_res) {
        if (individualDis_err) {
            console.log(individualDis_err);
            callback(individualDis_err, individualDis_res);
        } else {        
            callback(0, individualDis_res);
        }
    })
}

exports.editDisclaimer = async function (request, callback) {
    console.log(request);
    settingsRepository.fetchDisclaimerByLabel(request, function (disclaimerData_err, disclaimerData_res) {
        if (disclaimerData_err) {
            console.log(disclaimerData_err);
            callback(disclaimerData_err, disclaimerData_res);
        } else {        
            console.log("DISCLAIMER : ", disclaimerData_res);
            if((disclaimerData_res.Items.length > 0) && disclaimerData_res.Items[0].category_id !== request.data.category_id)
            {
                console.log(constant.messages.DISCLAIMER_LABEL_ALREADY_EXIST);
                callback(400, constant.messages.DISCLAIMER_LABEL_ALREADY_EXIST);                
            }
            else
            {
                settingsRepository.updateDisclaimer(request, function (eidtDisclaimer_err, eidtDisclaimer_response) {
                    if (eidtDisclaimer_err) {
                        console.log(eidtDisclaimer_err);
                        callback(eidtDisclaimer_err, eidtDisclaimer_response);
                    } else {
                        callback(eidtDisclaimer_err, eidtDisclaimer_response);
                    }
                })
            }
        }
    }) 
}

exports.getDisclaimersCategoriesSourcesSkills = async function (request, callback) {
    console.log(request);
    
    let response = {}; 
    settingsRepository.getContentCategories(request, function (categories_err, categories_res) {
        if (categories_err) {
            console.log(categories_err);
            callback(categories_err, categories_res);
        } else {        
            settingsRepository.getContentDisclaimers(request, function (disclaimer_err, disclaimer_res) {
                if (disclaimer_err) {
                    console.log(disclaimer_err);
                    callback(disclaimer_err, disclaimer_res);
                } else {       
                    settingsRepository.getQuestionSources(request, function (source_err, source_res) {
                        if (source_err) {
                            console.log(source_err);
                            callback(source_err, source_res);
                        } else {  
                            settingsRepository.getCognitiveSkills(request, function (skill_err, skill_res) {
                                if (skill_err) {
                                    console.log(skill_err);
                                    callback(skill_err, skill_res);
                                } else {        
                                    response.categories = categories_res.Items;
                                    response.disclaimers = disclaimer_res.Items;
                                    response.question_sources = source_res.Items;
                                    response.cognitive_skills = skill_res.Items;
                                    callback(0, response);
                                }
                            })      
                        }
                    })
                }
            })
        }
    })
}

exports.changeQuestionDisclaimerStatus = async function (request, callback) {
    console.log(request);

    if(request.data.disclaimer_status === "Archived")
    {
        /** FETCH QUESTION DATA **/
        let fetchBulkReq = {
            IdArray : [request.data.disclaimer_id],
            fetchIdName : "question_disclaimer",
            TableName : TABLE_NAMES.upschool_question_table
        }
        
        console.log({fetchBulkReq});
        commonRepository.fetchBulkDataUsingIndex(fetchBulkReq, function (bulkQuestionData_err, bulkQuestionData_res) {
            if (bulkQuestionData_err) {
                console.log(bulkQuestionData_err);
                callback(bulkQuestionData_err, bulkQuestionData_res);
            } else {
                console.log("QUESTION DATA");
                console.log(bulkQuestionData_res.Items); 

                if(bulkQuestionData_res.Items.length > 0)
                {
                    console.log(constant.messages.UNABLE_TO_DELETE_THE_DISCLAIMER.replace("**REPLACE**", bulkQuestionData_res.Items[0].question_label));
                    callback(400, constant.messages.UNABLE_TO_DELETE_THE_DISCLAIMER.replace("**REPLACE**", bulkQuestionData_res.Items[0].question_label));
                }
                else
                {
                    /** CHANGE CATEGORY STATUS **/
                    settingsRepository.changeDisclaimerStatus(request, function (statusChange_err, statusChange_res) {
                        if (statusChange_err) {
                            console.log(statusChange_err);
                            callback(statusChange_err, statusChange_res);
                        } else {        
                            callback(0, statusChange_res);
                        }
                    })
                    /** END CHANGE CATEGORY STATUS **/
                }
            }
        })
        /** FETCH QUESTION DATA **/
    }
    else
    {
        /** CHANGE CATEGORY STATUS **/
        settingsRepository.changeDisclaimerStatus(request, function (statusChange_err, statusChange_res) {
            if (statusChange_err) {
                console.log(statusChange_err);
                callback(statusChange_err, statusChange_res);
            } else {        
                callback(0, statusChange_res);
            }
        })
        /** END CHANGE CATEGORY STATUS **/
        
    }    
}

exports.changeBulkQuestionDisclaimerStatus = async function (request, callback) {
    if(request.data.disclaimer_array.length > 0)
    {
        let fetchBulkReq = {
            IdArray : request.data.disclaimer_array,
            fetchIdName : "disclaimer_id",
            TableName : TABLE_NAMES.upschool_content_disclaimer

        }
        
        commonRepository.fetchBulkData(fetchBulkReq, function (disclaimersData_err, disclaimersData_res) {
            if (disclaimersData_err) {
                console.log(disclaimersData_err);
                callback(disclaimersData_err, disclaimersData_res);
            } else {
                console.log("DISCLAIMER DATA");
                console.log(disclaimersData_res.Items);

                /** FETCH QUESTION DATA **/
                let fetchBulkIndexReq = {
                    IdArray : request.data.disclaimer_array,
                    fetchIdName : "question_disclaimer",
                    TableName : TABLE_NAMES.upschool_question_table
                }
                
                console.log({fetchBulkIndexReq});
                commonRepository.fetchBulkDataUsingIndex(fetchBulkIndexReq, function (bulkQuestionData_err, bulkQuestionData_res) {
                    if (bulkQuestionData_err) {
                        console.log(bulkQuestionData_err);
                        callback(bulkQuestionData_err, bulkQuestionData_res);
                    } else {
                        console.log("QUESTION DATA");
                        console.log(bulkQuestionData_res.Items); 

                        let mapCheck = "";
                        let finalUpdateData = [];
                        let finalResponse = "";
                        let resCount = 0;

                        function checkMapping(i)
                        {
                            mapCheck = "";
                            if(i < disclaimersData_res.Items.length)
                            {
                                if(request.data.disclaimer_status === "Archived")
                                {
                                    mapCheck = bulkQuestionData_res.Items.filter(que => que.question_disclaimer === disclaimersData_res.Items[i].disclaimer_id);
                                    if(mapCheck.length > 0)
                                    {
                                        finalResponse += ", " + disclaimersData_res.Items[i].disclaimer_label;
                                        resCount++;
                                    }
                                    else
                                    {
                                        disclaimersData_res.Items[i].disclaimer_status = request.data.disclaimer_status;
                                        finalUpdateData.push(disclaimersData_res.Items[i]);
                                    }
                                }
                                else
                                {
                                    disclaimersData_res.Items[i].disclaimer_status = request.data.disclaimer_status;
                                    finalUpdateData.push(disclaimersData_res.Items[i]);
                                }                                

                                i++;
                                checkMapping(i);
                            }   
                            else
                            {
                                /** END CHECK MAPPING **/
                                console.log("FINAL UPDATE DATA : ", finalUpdateData);
                                console.log("FINAL RESPONSE : ", finalResponse);

                                finalResponse = finalResponse.slice(2);

                                commonRepository.BulkInsert(finalUpdateData, TABLE_NAMES.upschool_content_disclaimer, function (updateBulkData_err, updateBulkData_res) {
                                    if (updateBulkData_err) {
                                        console.log("ERROR : TOGGLE BULK CATEGORY DATA");
                                        console.log(updateBulkData_err);
                                    } else {
                                        console.log("BULK CATEGORY STATUS UPDATED!");
                                        console.log(updateBulkData_res);                                        

                                        if(resCount > 0)
                                        {
                                            console.log((resCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_DISCLAIMER_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_THE_DISCLAIMER.replace("**REPLACE**", finalResponse));

                                            callback(400, (resCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_DISCLAIMER_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_THE_DISCLAIMER.replace("**REPLACE**", finalResponse));
                                        }
                                        else
                                        {
                                            callback(0, 200);
                                        }                                        
                                    }
                                })
                                /** END CHECK MAPPING **/
                            }
                        }
                        checkMapping(0)
                    }
                })
                /** END FETCH QUESTION DATA **/
            }
        })
    }
    else
    {
        console.log(constant.messages.NO_DISCLAIMER_TO_DELETE);
        callback(400, constant.messages.NO_DISCLAIMER_TO_DELETE);
    }
}
/** Question Sources  */
exports.insertQuestionSource = async function (request, callback) {
    console.log(request);

    settingsRepository.fetchSourceByLabel(request, function (fetch_source_err, fetch_source_res) {
        if (fetch_source_err) {
            console.log(fetch_source_err);
            callback(fetch_source_err, fetch_source_res);
        } else {        
            console.log("DISCLAIMER : ", fetch_source_res);
            if(fetch_source_res.Items.length > 0)
            {
                console.log(constant.messages.SOURCE_NAME_ALREADY_EXIST);
                callback(400, constant.messages.SOURCE_NAME_ALREADY_EXIST)
            }
            else
            {
                settingsRepository.insertSource(request, function (insert_source_of_question_err, insert_source_of_question_response) {
                    if (insert_source_of_question_err) {
                        console.log(insert_source_of_question_err);
                        callback(insert_source_of_question_err, insert_source_of_question_response);
                    } else {
                        console.log("Question Source Added Successfully");
                        callback(0, 200);   
                    }
                })
            }
        }
    })   
}

exports.getIndividualQuestionSource = async function (request, callback) {
    console.log(request);
    settingsRepository.fetchQuestionSourceById(request, function (individual_source_err, individual_source_res) {
        if (individual_source_err) {
            console.log(individual_source_err);
            callback(individual_source_err, individual_source_res);
        } else {        
            callback(0, individual_source_res);
        }
    })
}

exports.editQuestionSource = async function (request, callback) {
    console.log(request);
    settingsRepository.fetchSourceByLabel(request, function (source_data_err, source_data_res) {
        if (source_data_err) {
            console.log(source_data_err);
            callback(source_data_err, source_data_res);
        } else {        
            console.log("Source : ", source_data_res);
            if((source_data_res.Items.length > 0) && (source_data_res.Items.filter((e) => e.source_id !== request.data.source_id).length > 0))
            {
                console.log(constant.messages.SOURCE_NAME_ALREADY_EXIST);
                callback(400, constant.messages.SOURCE_NAME_ALREADY_EXIST);                
            }
            else
            {
                settingsRepository.updateSource(request, function (edit_source_err, edit_source_response) {
                    if (edit_source_err) {
                        console.log(edit_source_err);
                        callback(edit_source_err, edit_source_response);
                    } else {
                        callback(edit_source_err, edit_source_response);
                    }
                })
            }
        }
    }) 
}
exports.fetchQuestionSources = async function (request, callback) {
    console.log(request);
    settingsRepository.getQuestionSources(request, function (get_sources_err, get_sources_res) {
        if (get_sources_err) {
            console.log(get_sources_err);
            callback(get_sources_err, get_sources_res);
        } else {        
            get_sources_res.Items.sort((a, b) => {
                return new Date(b.updated_ts) - new Date(a.updated_ts);
            });  
            callback(0, get_sources_res);
        }
    })
}
exports.getAllDisclaimersandCategories = async function (request, callback) {
    console.log(request);
    
    let response = {}; 
    settingsRepository.getContentCategories(request, function (categories_err, categories_res) {
        if (categories_err) {
            console.log(categories_err);
            callback(categories_err, categories_res);
        } else {        
            settingsRepository.getContentDisclaimers(request, function (disclaimer_err, disclaimer_res) {
                if (disclaimer_err) {
                    console.log(disclaimer_err);
                    callback(disclaimer_err, disclaimer_res);
                } else {        
                    response.categories = categories_res.Items;
                    response.disclaimers = disclaimer_res.Items;
                    callback(0, response);
                }
            })
        }
    })
}

exports.changeQuestionSourceStatus = async function (request, callback) {
    console.log(request);

    if(request.data.source_status === "Archived")
    {
        /** FETCH QUESTION DATA **/
        let fetchBulkReq = {
            IdArray : [request.data.source_id],
            fetchIdName : "question_source",
            TableName : TABLE_NAMES.upschool_question_table
        }
        
        console.log({fetchBulkReq});
        commonRepository.fetchBulkDataUsingIndex(fetchBulkReq, function (bulkQuestionData_err, bulkQuestionData_res) {
            if (bulkQuestionData_err) {
                console.log(bulkQuestionData_err);
                callback(bulkQuestionData_err, bulkQuestionData_res);
            } else {
                console.log("QUESTION DATA");
                console.log(bulkQuestionData_res.Items); 

                if(bulkQuestionData_res.Items.length > 0)
                {
                    console.log(constant.messages.UNABLE_TO_DELETE_THE_SOURCE.replace("**REPLACE**", bulkQuestionData_res.Items[0].question_label));
                    callback(400, constant.messages.UNABLE_TO_DELETE_THE_SOURCE.replace("**REPLACE**", bulkQuestionData_res.Items[0].question_label));
                }
                else
                {
                    /** CHANGE CATEGORY STATUS **/
                    settingsRepository.changeSourceStatus(request, function (statusChange_err, statusChange_res) {
                        if (statusChange_err) {
                            console.log(statusChange_err);
                            callback(statusChange_err, statusChange_res);
                        } else {        
                            callback(0, statusChange_res);
                        }
                    })
                    /** END CHANGE CATEGORY STATUS **/
                }
            }
        })
        /** FETCH QUESTION DATA **/
    }
    else
    {
        /** CHANGE CATEGORY STATUS **/
        settingsRepository.changeSourceStatus(request, function (statusChange_err, statusChange_res) {
            if (statusChange_err) {
                console.log(statusChange_err);
                callback(statusChange_err, statusChange_res);
            } else {        
                callback(0, statusChange_res);
            }
        })
        /** END CHANGE CATEGORY STATUS **/
        
    }    
}

exports.changeBulkQuestionSourceStatus = async function (request, callback) {
    if(request.data.source_array.length > 0)
    {
        let fetchBulkReq = {
            IdArray : request.data.source_array,
            fetchIdName : "source_id",
            TableName : TABLE_NAMES.upschool_question_source
        }
        
        commonRepository.fetchBulkData(fetchBulkReq, function (source_data_err, source_data_res) {
            if (source_data_err) {
                console.log(source_data_err);
                callback(source_data_err, source_data_res);
            } else {
                console.log("SOURCE DATA");
                console.log(source_data_res.Items);

                /** FETCH QUESTION DATA **/
                let fetchBulkIndexReq = {
                    IdArray : request.data.source_array,
                    fetchIdName : "question_source",
                    TableName : TABLE_NAMES.upschool_question_table
                }
                
                console.log({fetchBulkIndexReq});
                commonRepository.fetchBulkDataUsingIndex(fetchBulkIndexReq, function (bulkQuestionData_err, bulkQuestionData_res) {
                    if (bulkQuestionData_err) {
                        console.log(bulkQuestionData_err);
                        callback(bulkQuestionData_err, bulkQuestionData_res);
                    } else {
                        console.log("QUESTION DATA");
                        console.log(bulkQuestionData_res.Items); 

                        let mapCheck = "";
                        let finalUpdateData = [];
                        let finalResponse = "";
                        let resCount = 0;

                        function checkMapping(i)
                        {
                            mapCheck = "";
                            if(i < source_data_res.Items.length)
                            {
                                if(request.data.source_status === "Archived")
                                {
                                    mapCheck = bulkQuestionData_res.Items.filter(que => que.question_source === source_data_res.Items[i].source_id);
                                    if(mapCheck.length > 0)
                                    {
                                        finalResponse += ", " + source_data_res.Items[i].source_name;
                                        resCount++;
                                    }
                                    else
                                    {
                                        source_data_res.Items[i].source_status = request.data.source_status;
                                        finalUpdateData.push(source_data_res.Items[i]);
                                    }
                                }
                                else
                                {
                                    source_data_res.Items[i].source_status = request.data.source_status;
                                    finalUpdateData.push(source_data_res.Items[i]);
                                }                                

                                i++;
                                checkMapping(i);
                            }   
                            else
                            {
                                /** END CHECK MAPPING **/
                                console.log("FINAL UPDATE DATA : ", finalUpdateData);
                                console.log("FINAL RESPONSE : ", finalResponse);

                                finalResponse = finalResponse.slice(2);

                                commonRepository.BulkInsert(finalUpdateData, TABLE_NAMES.upschool_question_source, function (updateBulkData_err, updateBulkData_res) {
                                    if (updateBulkData_err) {
                                        console.log("ERROR : TOGGLE BULK SOURCE DATA");
                                        console.log(updateBulkData_err);
                                    } else {
                                        console.log("BULK SOURCE STATUS UPDATED!");
                                        console.log(updateBulkData_res);                                        

                                        if(resCount > 0)
                                        {
                                            console.log((resCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_SOURCE_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_THE_SOURCE.replace("**REPLACE**", finalResponse));

                                            callback(400, (resCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_SOURCE_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_THE_SOURCE.replace("**REPLACE**", finalResponse));
                                        }
                                        else
                                        {
                                            callback(0, 200);
                                        }                                        
                                    }
                                })
                                /** END CHECK MAPPING **/
                            }
                        }
                        checkMapping(0)
                    }
                })
                /** END FETCH QUESTION DATA **/
            }
        })
    }
    else
    {
        console.log(constant.messages.NO_SOURCE_TO_DELETE);
        callback(400, constant.messages.NO_SOURCE_TO_DELETE);
    }
}
/** Cognitive Skill */

exports.insertCognitiveSkill = async function (request, callback) {
    console.log(request);

    settingsRepository.fetchCognitiveSkillByLabel(request, function (fetch_skill_err, fetch_skill_res) {
        if (fetch_skill_err) {
            console.log(fetch_skill_err);
            callback(fetch_skill_err, fetch_skill_res);
        } else {        
            console.log("COGNITIVE : ", fetch_skill_res);
            if(fetch_skill_res.Items.length > 0)
            {
                console.log(constant.messages.SKILL_NAME_ALREADY_EXIST);
                callback(400, constant.messages.SKILL_NAME_ALREADY_EXIST)
            }
            else
            {
                settingsRepository.insertCognitiveSkill(request, function (insert_cognitive_skill_err, insert_cognitive_skill_response) {
                    if (insert_cognitive_skill_err) {
                        console.log(insert_cognitive_skill_err);
                        callback(insert_cognitive_skill_err, insert_cognitive_skill_response);
                    } else {
                        console.log("Cognitive Skill Added Successfully");
                        callback(0, 200);   
                    }
                })
            }
        }
    })   
}

exports.getIndividualCognitiveSkill = async function (request, callback) {
    console.log(request);
    settingsRepository.fetchCognitiveSkillById(request, function (individual_skill_err, individual_skill_res) {
        if (individual_skill_err) {
            console.log(individual_skill_err);
            callback(individual_skill_err, individual_skill_res);
        } else {        
            callback(0, individual_skill_res);
        }
    })
}

exports.editCognitiveSkill = async function (request, callback) {
    console.log(request);
    settingsRepository.fetchCognitiveSkillByLabel(request, function (skill_data_err, skill_data_res) {
        if (skill_data_err) {
            console.log(skill_data_err);
            callback(skill_data_err, skill_data_res);
        } else {        
            console.log("Source : ", skill_data_res);
            if((skill_data_res.Items.length > 0) && (skill_data_res.Items.filter((e) => e.cognitive_id !== request.data.cognitive_id).length > 0)) 
            {
                console.log(constant.messages.SKILL_NAME_ALREADY_EXIST);
                callback(400, constant.messages.SKILL_NAME_ALREADY_EXIST);                
            }
            else
            {
                settingsRepository.updateCognitiveSkill(request, function (edit_source_err, edit_source_response) {
                    if (edit_source_err) {
                        console.log(edit_source_err);
                        callback(edit_source_err, edit_source_response);
                    } else {
                        callback(edit_source_err, edit_source_response);
                    }
                })
            }
        }
    }) 
}
exports.fetchCognitiveSkills = async function (request, callback) {
    console.log(request);
    settingsRepository.getCognitiveSkills(request, function (get_skills_err, get_skills_res) {
        if (get_skills_err) {
            console.log(get_skills_err);
            callback(get_skills_err, get_skills_res);
        } else {  
            get_skills_res.Items.sort((a, b) => {
                return new Date(b.updated_ts) - new Date(a.updated_ts);
            });        
            callback(0, get_skills_res);
        }
    })
}
exports.getAllDisclaimersandCategories = async function (request, callback) {
    console.log(request);
    
    let response = {}; 
    settingsRepository.getContentCategories(request, function (categories_err, categories_res) {
        if (categories_err) {
            console.log(categories_err);
            callback(categories_err, categories_res);
        } else {        
            settingsRepository.getContentDisclaimers(request, function (disclaimer_err, disclaimer_res) {
                if (disclaimer_err) {
                    console.log(disclaimer_err);
                    callback(disclaimer_err, disclaimer_res);
                } else {        
                    response.categories = categories_res.Items;
                    response.disclaimers = disclaimer_res.Items;
                    callback(0, response);
                }
            })
        }
    })
}

exports.changeCognitiveSkillStatus = async function (request, callback) {
    console.log(request);

    if(request.data.cognitive_status === "Archived")
    {
        /** FETCH QUESTION DATA **/
        let fetchBulkReq = {
            IdArray : [request.data.cognitive_id],
            fetchIdName : "cognitive_skill",
            TableName : TABLE_NAMES.upschool_question_table
        }
        
        console.log({fetchBulkReq});
        commonRepository.fetchBulkDataUsingIndex(fetchBulkReq, function (bulkQuestionData_err, bulkQuestionData_res) {
            if (bulkQuestionData_err) {
                console.log(bulkQuestionData_err);
                callback(bulkQuestionData_err, bulkQuestionData_res);
            } else {
                console.log("QUESTION DATA");
                console.log(bulkQuestionData_res.Items); 

                if(bulkQuestionData_res.Items.length > 0)
                {
                    console.log(constant.messages.UNABLE_TO_DELETE_THE_SKILL.replace("**REPLACE**", bulkQuestionData_res.Items[0].question_label));
                    callback(400, constant.messages.UNABLE_TO_DELETE_THE_SKILL.replace("**REPLACE**", bulkQuestionData_res.Items[0].question_label));
                }
                else
                {
                    /** CHANGE CATEGORY STATUS **/
                    settingsRepository.changeSkillStatus(request, function (statusChange_err, statusChange_res) {
                        if (statusChange_err) {
                            console.log(statusChange_err);
                            callback(statusChange_err, statusChange_res);
                        } else {        
                            callback(0, statusChange_res);
                        }
                    })
                    /** END CHANGE CATEGORY STATUS **/
                }
            }
        })
        /** FETCH QUESTION DATA **/
    }
    else
    {
        /** CHANGE CATEGORY STATUS **/
        settingsRepository.changeSkillStatus(request, function (statusChange_err, statusChange_res) {
            if (statusChange_err) {
                console.log(statusChange_err);
                callback(statusChange_err, statusChange_res);
            } else {        
                callback(0, statusChange_res);
            }
        })
        /** END CHANGE CATEGORY STATUS **/
        
    }    
}

exports.changeBulkCognitiveSkillStatus = async function (request, callback) {
    if(request.data.cognitive_skill_array.length > 0)
    {
        let fetchBulkReq = {
            IdArray : request.data.cognitive_skill_array,
            fetchIdName : "cognitive_id",
            TableName : TABLE_NAMES.upschool_cognitive_skill
        }
        
        commonRepository.fetchBulkData(fetchBulkReq, function (skills_data_err, skills_data_res) {
            if (skills_data_err) {
                console.log(skills_data_err);
                callback(skills_data_err, skills_data_res);
            } else {
                console.log("SKILL DATA");
                console.log(skills_data_res.Items);

                /** FETCH QUESTION DATA **/
                let fetchBulkIndexReq = {
                    IdArray : request.data.cognitive_skill_array,
                    fetchIdName : "cognitive_skill",
                    TableName : TABLE_NAMES.upschool_question_table
                }
                
                console.log({fetchBulkIndexReq});
                commonRepository.fetchBulkDataUsingIndex(fetchBulkIndexReq, function (bulkQuestionData_err, bulkQuestionData_res) {
                    if (bulkQuestionData_err) {
                        console.log(bulkQuestionData_err);
                        callback(bulkQuestionData_err, bulkQuestionData_res);
                    } else {
                        console.log("QUESTION DATA");
                        console.log(bulkQuestionData_res.Items); 

                        let mapCheck = "";
                        let finalUpdateData = [];
                        let finalResponse = "";
                        let resCount = 0;

                        function checkMapping(i)
                        {
                            mapCheck = "";
                            if(i < skills_data_res.Items.length)
                            {
                                if(request.data.cognitive_status === "Archived")
                                {
                                    mapCheck = bulkQuestionData_res.Items.filter(que => que.cognitive_skill === skills_data_res.Items[i].cognitive_id);
                                    if(mapCheck.length > 0)
                                    {
                                        finalResponse += ", " + skills_data_res.Items[i].cognitive_name;
                                        resCount++;
                                    }
                                    else
                                    {
                                        skills_data_res.Items[i].cognitive_status = request.data.cognitive_status;
                                        finalUpdateData.push(skills_data_res.Items[i]);
                                    }
                                }
                                else
                                {
                                    skills_data_res.Items[i].cognitive_status = request.data.cognitive_status;
                                    finalUpdateData.push(skills_data_res.Items[i]);
                                }                                

                                i++;
                                checkMapping(i);
                            }   
                            else
                            {
                                /** END CHECK MAPPING **/
                                console.log("FINAL UPDATE DATA : ", finalUpdateData);
                                console.log("FINAL RESPONSE : ", finalResponse);

                                finalResponse = finalResponse.slice(2);

                                commonRepository.BulkInsert(finalUpdateData, TABLE_NAMES.upschool_cognitive_skill, function (updateBulkData_err, updateBulkData_res) {
                                    if (updateBulkData_err) {
                                        console.log("ERROR : TOGGLE BULK SKILL DATA");
                                        console.log(updateBulkData_err);
                                    } else {
                                        console.log("BULK SKILL STATUS UPDATED!");
                                        console.log(updateBulkData_res);                                        

                                        if(resCount > 0)
                                        {
                                            console.log((resCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_SKILL_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_THE_SKILL.replace("**REPLACE**", finalResponse));

                                            callback(400, (resCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_SKILL_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_THE_SKILL.replace("**REPLACE**", finalResponse));
                                        }
                                        else
                                        {
                                            callback(0, 200);
                                        }                                        
                                    }
                                })
                                /** END CHECK MAPPING **/
                            }
                        }
                        checkMapping(0)
                    }
                })
                /** END FETCH QUESTION DATA **/
            }
        })
    }
    else
    {
        console.log(constant.messages.NO_SKILL_TO_DELETE);
        callback(400, constant.messages.NO_SKILL_TO_DELETE);
    }
}
