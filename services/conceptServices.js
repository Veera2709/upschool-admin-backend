const dynamoDbCon = require('../awsConfig');  
const conceptRepository = require("../repository/conceptRepository");  
const digicardRepository = require("../repository/digicardRepository");  
const topicRepository = require("../repository/topicRepository");  
const commonServices = require("../services/commonServices");
const constant = require('../constants/constant');
const helper = require('../helper/helper');


exports.getActiveArchivedConcepts = async function (request, callback) {
    console.log(request);
    conceptRepository.getConceptBasedOnStatus(request, function (get_concept_err, get_concept_res) {
        if (get_concept_err) {
            console.log(get_concept_err);
            callback(get_concept_err, get_concept_res);
        } else {
            get_concept_res.Items.sort((a, b) => {
                return new Date(b.updated_ts) - new Date(a.updated_ts);
            });        
            callback(0, get_concept_res);
        }
    })
}

exports.addNewConcept = async function (request, callback) {

    conceptRepository.fetchConceptByName(request, function (fetch_concept_err, fetch_concept_res) {
        if (fetch_concept_err) {
            console.log(fetch_concept_err);
            callback(fetch_concept_err, fetch_concept_res);
        } else {        
            console.log("CONCEPTS : ", fetch_concept_res);
            if(fetch_concept_res.Items.length == 0)
            {
                conceptRepository.insertConcept(request, function (insert_concept_err, insert_concept_res) {
                    if (insert_concept_err) {
                        console.log(insert_concept_err);
                        callback(insert_concept_err, insert_concept_res);
                    } else {        
                        callback(0, insert_concept_res);
                    }
                })
            }
            else
            {
                console.log(constant.messages.CONCEPT_TITLE_ALREADY_EXIST);
                callback(400, constant.messages.CONCEPT_TITLE_ALREADY_EXIST)
            }
        }
    })    
}

exports.changeConceptStatus = async function (request, callback) {
    if(request.data.concept_status == "Archived")
    {
        request.data.topic_status = "Active"
        topicRepository.fetchTopicDataByStatus(request, async function (fetch_topic_err, fetch_topic_response) {
            if (fetch_topic_err) {
                console.log(fetch_topic_err);
                callback(fetch_topic_err, fetch_topic_response);
            } else {
    
                console.log("TOPICS : ", fetch_topic_response);

                /** CHECK FOR MAPPTING **/
                let checkMapPayload = {
                    arrayToCheck: fetch_topic_response.Items,
                    fieldToCheck: ["topic_concept_id"],
                    checkId: request.data.concept_id,
                    fieldToPrint: "topic_title"
                };

                commonServices.CheckDataMapping(checkMapPayload, function (mapping_err, mapping_res) {
                    if (mapping_err) {
                        console.log(mapping_err);
                        callback(mapping_err, mapping_res);
                    } else {
                        console.log("MAPPING CHECK RESPONSE : ", mapping_res);
                        if(mapping_res.length == 0)
                        {
                            conceptRepository.toggleConceptStatus(request, function (toggle_err, toggle_res) {
                                if (toggle_err) {
                                    console.log(toggle_err);
                                    callback(toggle_err, toggle_res);
                                } else {        
                                    callback(0, toggle_res);
                                }
                            }) 
                        }
                        else
                        {
                            console.log(constant.messages.UNABLE_TO_DELETE_THE_CONCEPT.replace("**REPLACE**", mapping_res));
                            callback(400, constant.messages.UNABLE_TO_DELETE_THE_CONCEPT.replace("**REPLACE**", mapping_res));
                        }
                    }
                });
                /** END CHECK FOR MAPPTING **/
            }
        })
    }
    else
    {
        conceptRepository.toggleConceptStatus(request, function (toggle_err, toggle_res) {
            if (toggle_err) {
                console.log(toggle_err);
                callback(toggle_err, toggle_res);
            } else {        
                callback(0, toggle_res);
            }
        }) 
    }        
}

exports.getDigicardAndConcept = async function (request, callback) {
    digicardRepository.fetchIdAndNameOfDigicards(request, function (get_digi_idName_err, get_digi_idName_response) {
        if (get_digi_idName_err) {
            console.log(get_digi_idName_err);
            callback(get_digi_idName_err, get_digi_idName_response);
        } else {
            
            conceptRepository.fetchIdAndNameOfConcepts(request, function (get_concept_err, get_concept_response) {
                if (get_concept_err) {
                    console.log(get_concept_err);
                    callback(get_concept_err, get_concept_response);
                } else {
                    callback(0, {digicardList: get_digi_idName_response.Items, conceptList: get_concept_response.Items})
                }
            })   
        }
    })    
}

exports.getIndividualConcept = async function (request, callback) {
    conceptRepository.getIndividualConcept(request, function (individualConcept_err, individualConcept_response) {
        if (individualConcept_err) {
            console.log(individualConcept_err);
            callback(individualConcept_err, individualConcept_response);
        } else {
            callback(0, individualConcept_response);
        }
    })   
}

exports.editConcept = async function (request, callback) {

    conceptRepository.fetchConceptByName(request, function (fetch_concept_err, fetch_concept_res) {
        if (fetch_concept_err) {
            console.log(fetch_concept_err);
            callback(fetch_concept_err, fetch_concept_res);
        } else {        
            console.log("CONCEPTS : ", fetch_concept_res);
            if((fetch_concept_res.Items.length > 0) && fetch_concept_res.Items[0].concept_id !== request.data.concept_id)
            {
                console.log(constant.messages.CONCEPT_TITLE_ALREADY_EXIST);
                callback(400, constant.messages.CONCEPT_TITLE_ALREADY_EXIST);
            }
            else
            {
                conceptRepository.updateConcept(request, function (updateConcept_err, updateConcept_response) {
                    if (updateConcept_err) {
                        console.log(updateConcept_err);
                        callback(updateConcept_err, updateConcept_response);
                    } else {
                        callback(0, updateConcept_response);
                    }
                })
            }
        }
    })   
}
exports.multiConceptToggleStatus = async function (request, callback) {

    let concepts_cant_delete = ""; 
    if(request.data.concept_status === "Active" || request.data.concept_status === "Archived"){
        if(request.data.concept_array.length > 0) 
        {
            conceptRepository.fetchConceptData({concept_array: request.data.concept_array}, function (concept_data_err, concept_data_res) { 
                if (concept_data_err) {
                    console.log(concept_data_err);
                    callback(concept_data_err, concept_data_res);
                } else {
                    let activeData = [];
    
                    if(concept_data_res.Items.length > 0)
                    {
                        request.data.topic_status = "Active"; 
                        topicRepository.fetchTopicDataByStatus(request, function (get_topics_err, get_topics_res) {
                            if (get_topics_err) { 
                                console.log(get_topics_err);
                                callback(get_topics_err, get_topics_res);
                            } else {        
                                function changeConceptStatus(i)
                                {
                                    if(i < concept_data_res.Items.length)
                                    {
                                        if(request.data.concept_status === "Archived"){
                                        
                                            /** CHECK FOR MAPPTING **/
                                            let checkMapPayload = { 
                                                arrayToCheck: get_topics_res.Items,
                                                fieldToCheck: "topic_concept_id",
                                                checkId: concept_data_res.Items[i].concept_id,
                                                fieldToPrint: "topic_title"
                                            };
    
                                            commonServices.CheckForMappings(checkMapPayload, function (mapping_err, mapping_res) {
                                                if (mapping_err) {
                                                    console.log(mapping_err);
                                                    callback(mapping_err, mapping_res);
                                                } else {
                                                    if(mapping_res.length == 0 || mapping_res === "")
                                                    {
                                                        console.log("No Mapping : ", concept_data_res.Items[i].concept_id);
                                                        concept_data_res.Items[i].concept_status = request.data.concept_status;
                                                        activeData.push(concept_data_res.Items[i])
                                                    }
                                                    else
                                                    {
                                                        (i == concept_data_res.Items.length - 1) ? 
                                                        concepts_cant_delete += concept_data_res.Items[i].concept_title : concepts_cant_delete += concept_data_res.Items[i].concept_title + ", "
                                                    }
                                                }
                                            });
                                            /** END CHECK FOR MAPPTING **/
                                        } else { 
                                            concept_data_res.Items[i].concept_status = request.data.concept_status;
                                            activeData.push(concept_data_res.Items[i])
                                        }
                                        i++;
                                        changeConceptStatus(i);
                                    }
                                    else
                                    {
                                        console.log("activeData : ", activeData);
                                        /** BULK UPDATE **/
                                        conceptRepository.changeMultipleConceptsStatus(activeData, function (updateBulkData_err, updateBulkData_res) {
                                            if (updateBulkData_err) {
                                                console.log("ERROR : TOGGLE BULK CONCEPTS DATA");
                                                console.log(updateBulkData_err);
                                            } else {
                                                console.log("BULK CONCEPTS STATUS UPDATED!");
                                                // Check concepts_cant_delete length and Include digicard Titles in the response 
                                                concepts_cant_delete.endsWith(", ") && (concepts_cant_delete = concepts_cant_delete.substring(0, concepts_cant_delete.length-2))
                                                if(concepts_cant_delete.length === 0 || concepts_cant_delete === ""){ 
                                                    console.log(updateBulkData_res);
                                                    callback(0, 200);
                                                } else {
                                                    console.log(constant.messages.UNABLE_TO_DELETE_MULTIPLE_CONCEPTS.replace("**REPLACE**", concepts_cant_delete)); 
                                                    callback(400, constant.messages.UNABLE_TO_DELETE_MULTIPLE_CONCEPTS.replace("**REPLACE**", concepts_cant_delete)); 
                                                }
                                            }
                                        })
                                        /** END BULK UPDATE **/
                                    }
                                }
                                changeConceptStatus(0)
                            }
                        })
                    }
                    else
                    {
                        console.log("EMPTY DATA FROM BULK FETCH");
                        callback(401, constant.messages.INVALID_CONCEPT_TO_DELETE); 
                    }
                }
            });
        }
        else
        {
            console.log("EMPTY ARRAY");
            callback(401, constant.messages.NO_CONCEPT_TO_TOGGLE);
        }
    } else {
        console.log("Invalid Digicard Status");
        callback(401, constant.messages.INVALID_CONCEPT_STATUS);
    }
}
