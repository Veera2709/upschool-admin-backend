const fs = require("fs");
const dynamoDbCon = require('../awsConfig');  
const { TABLE_NAMES } = require('../constants/tables');
const topicRepository = require("../repository/topicRepository");  
const commonRepository = require("../repository/commonRepository");  
const chapterRepository = require("../repository/chapterRepository");  
const commonServices = require("../services/commonServices");
const constant = require('../constants/constant');
const helper = require('../helper/helper');
const { nextTick } = require("process");


// Topic : 
exports.addTopic = function (request, callback) {
    topicRepository.fetchTopicDataByTitle(request, async function (fetch_topic_err, fetch_topic_response) {
        if (fetch_topic_err) {
            console.log(fetch_topic_err);
            callback(fetch_topic_err, fetch_topic_response);
        } else {

            console.log("else : ", fetch_topic_response);

            if (fetch_topic_response.Items.length === 0) {

                
                topicRepository.insertTopic(request, function (insert_topic_err, insert_topic_response) {
                    if (insert_topic_err) {
                        console.log(insert_topic_err);
                        callback(insert_topic_err, insert_topic_response);
                    } else {
                        console.log("Topic Added Successfully");
                        callback(0, 200);
                    }
                })
            } else {
                console.log("Topic Name Already Exists");
                callback(401, constant.messages.TOPIC_NAME_ALREADY_EXISTS);
            }
        }
    })
  
}
exports.fetchIndividualTopic = function (request, callback) {
    
    topicRepository.fetchTopicByID(request, function (single_topic_err, single_topic_response) {
        if (single_topic_err) {
            console.log(single_topic_err);
            callback(single_topic_err, single_topic_response);
        } else {
            console.log("Topic Fetched Successfully");
            callback(single_topic_err, single_topic_response);

        }
    })
}
exports.editTopic = function (request, callback) {

    topicRepository.fetchTopicByID(request, async function (edit_topic_err, edit_topic_response) {
        if (edit_topic_err) {
            console.log(edit_topic_err);
            callback(edit_topic_err, edit_topic_response);
        } else {
            
            if (edit_topic_response.Items.length > 0) {
                /** CHECK FOR DUPLICATE **/

                if (edit_topic_response.Items[0].topic_id !== request.data.topic_id) {
                            console.log("Topic Name Already Exist");
                            callback(400, constant.messages.TOPIC_NAME_ALREADY_EXISTS);
                        }
                        else
                        {
                            topicRepository.updateTopic(request, function (update_topic_err, update_topic_response) {
                                if (update_topic_err) {
                                    console.log(update_topic_err);
                                    callback(update_topic_err, update_topic_response);
                                } else {
                                    console.log("Topic Updated Successfully");
                                    callback(0, 200);
                                }
                            })
                        }
                        /** END CHECK FOR DUPLICATE **/                            
                    }
                    else
                    {
                        console.log("No Topic Data");
                        callback(400, constant.messages.NO_DATA);
                    }
                }
            })
}

exports.toggleTopicStatus = function (request, callback) {
    if(request.data.topic_status == "Archived")
    {
        request.data.chapter_status = "Active";
        chapterRepository.getChaptersBasedOnStatus(request, function (get_chapter_err, get_chapter_res) {
            if (get_chapter_err) {
                console.log(get_chapter_err);
                callback(get_chapter_err, get_chapter_res);
            } else {        
                console.log("CHAPTER : ", get_chapter_res);

                /** CHECK FOR MAPPTING **/
                let checkMapPayload = {
                    arrayToCheck: get_chapter_res.Items,
                    fieldToCheck: ["postlearning_topic_id", "prelearning_topic_id"],
                    checkId: request.data.topic_id,
                    fieldToPrint: "chapter_title"
                };

                commonServices.CheckDataMapping(checkMapPayload, function (mapping_err, mapping_res) {
                    if (mapping_err) {
                        console.log(mapping_err);
                        callback(mapping_err, mapping_res);
                    } else {
                        console.log("MAPPING CHECK RESPONSE : ", mapping_res);
                        if(mapping_res.length == 0)
                        {
                            topicRepository.changeTopicStatus(request, function (delete_topic_err, delete_topic_response) {
                                if (delete_topic_err) {
                                    console.log(delete_topic_err);
                                    callback(delete_topic_err, delete_topic_response);
                                } else {
                                    console.log("Topic status changed Successfully");
                                    callback(0, 200);
                                }
                            })
                        }
                        else
                        {
                            console.log(constant.messages.UNABLE_TO_DELETE_THE_TOPIC.replace("**REPLACE**", mapping_res));
                            callback(400, constant.messages.UNABLE_TO_DELETE_THE_TOPIC.replace("**REPLACE**", mapping_res));
                        }
                    }
                });
                /** END CHECK FOR MAPPTING **/

            }
        })
    }
    else
    {
        topicRepository.changeTopicStatus(request, function (delete_topic_err, delete_topic_response) {
            if (delete_topic_err) {
                console.log(delete_topic_err);
                callback(delete_topic_err, delete_topic_response);
            } else {
                console.log("Topic status changed Successfully");
                callback(0, 200);
            }
        })
    }    
}
exports.fetchTopicsBasedonStatus = function (request, callback) {
    /** FETCH USER BY EMAIL **/
    topicRepository.getTopicsBasedonStatus(request, function (fetch_all_topic_err, fetch_all_topic_response) {
        if (fetch_all_topic_err) {
            console.log(fetch_all_topic_err);
            callback(fetch_all_topic_err, fetch_all_topic_response);
        } else {
            fetch_all_topic_response.Items.sort((a, b) => {
                return new Date(b.topic_updated_ts) - new Date(a.topic_updated_ts);
            });
            console.log("Fetch All Topics Successfully");
            callback(0, fetch_all_topic_response);
        }
    })
}

exports.fetchPreLearningTopics = function (request, callback) {
    
    topicRepository.fetchPreLearningTopicsList(request, function (fetch_all_topic_err, fetch_all_topic_response) {
        if (fetch_all_topic_err) {
            console.log(fetch_all_topic_err);
            callback(fetch_all_topic_err, fetch_all_topic_response);
        } else {
            console.log("Fetch All PreLearning Topics Successfully");
            callback(0, fetch_all_topic_response);
        }
    })
}

exports.fetchPostLearningTopics = function (request, callback) {
    
    topicRepository.fetchPostLearningTopicsList(request, function (fetch_all_topic_err, fetch_all_topic_response) {
        if (fetch_all_topic_err) {
            console.log(fetch_all_topic_err);
            callback(fetch_all_topic_err, fetch_all_topic_response);
        } else {
            console.log("Fetch All PostLearning Topics Successfully");
            callback(0, fetch_all_topic_response);
        }
    })
}

exports.toggleBulkTopicStatus = function (request, callback) {
    
    if(request.data.topic_array.length > 0)
    {
        let fetchBulkReq = {
            IdArray : request.data.topic_array,
            fetchIdName : "topic_id",
            TableName : TABLE_NAMES.upschool_topic_table
        }
        
        commonRepository.fetchBulkData(fetchBulkReq, function (topicData_err, topicData_res) {
            if (topicData_err) {
                console.log(topicData_err);
                callback(topicData_err, topicData_res);
            } else {
                console.log(topicData_res.Items);  
                
                let finalUpdateData = [];
                let finalResponse = "";
                let topicCount = 0;
                request.data.chapter_status = "Active";
                chapterRepository.getChaptersBasedOnStatus(request, function (get_chapter_err, get_chapter_res) {
                    if (get_chapter_err) {
                        console.log(get_chapter_err);
                        callback(get_chapter_err, get_chapter_res);
                    } else {        
                        console.log("CHAPTER : ", get_chapter_res);

                        /** SET STATUS **/
                        async function changeActiveTopicStatus(i)
                        {
                            if(i < topicData_res.Items.length)
                            {
                                if(request.data.topic_status === "Archived")
                                {
                                    /** CHECK FOR MAPPTING **/
                                    let checkMapPayload = {
                                        arrayToCheck: get_chapter_res.Items,
                                        fieldToCheck: ["postlearning_topic_id", "prelearning_topic_id"],
                                        checkId: topicData_res.Items[i].topic_id,
                                        fieldToPrint: "chapter_title"
                                    };                                    

                                    await commonServices.CheckDataMapping(checkMapPayload, async function (mapping_err, mapping_res) {

                                        // let mappingRes = await mapping_res;

                                        if (mapping_err) {
                                            console.log(mapping_err);
                                            callback(mapping_err, mapping_res);
                                        } else {
                                            console.log("MAPPING CHECK RESPONSE : ", mapping_res);
                                            if(mapping_res.length == 0)
                                            {
                                                topicData_res.Items[i].topic_status = request.data.topic_status;
                                                finalUpdateData.push(topicData_res.Items[i]);
                                            }
                                            else
                                            {
                                                finalResponse += ", " + topicData_res.Items[i].topic_title;
                                                topicCount++;
                                            }
                                        }
                                    });
                                    /** END CHECK FOR MAPPTING **/
                                }
                                else
                                {
                                    topicData_res.Items[i].topic_status = request.data.topic_status;
                                    finalUpdateData.push(topicData_res.Items[i]);
                                }

                                i++;
                                changeActiveTopicStatus(i);
                            }
                            else
                            {
                                /** END STATUS CHANGE **/
                                finalResponse = finalResponse.slice(2);
                                commonRepository.BulkInsert(finalUpdateData, TABLE_NAMES.upschool_topic_table, function (updateBulkData_err, updateBulkData_res) {
                                    if (updateBulkData_err) {
                                        console.log("ERROR : TOGGLE BULK TOPIC DATA");
                                        console.log(updateBulkData_err);
                                    } else {
                                        console.log("BULK TOPIC STATUS UPDATED!");
                                        console.log(updateBulkData_res);

                                        if(topicCount > 0)
                                        {
                                            // console.log(constant.messages.UNABLE_TO_DELETE_BULK_TOPIC.replace("**REPLACE**", finalResponse));
                                            // callback(400, constant.messages.UNABLE_TO_DELETE_BULK_TOPIC.replace("**REPLACE**", finalResponse));

                                            console.log((topicCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_TOPIC_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_BULK_TOPIC_FOR_ONE.replace("**REPLACE**", finalResponse));

                                            callback(400, (topicCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_TOPIC_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_BULK_TOPIC_FOR_ONE.replace("**REPLACE**", finalResponse));
                                        }
                                        else
                                        {
                                            callback(0, 200);
                                        }                                        
                                    }
                                })
                                /** END STATUS CHANGE **/
                            }
                        }
                        changeActiveTopicStatus(0)
                        /** END SET STATUS **/
                    }
                }) 
            }
        })
    }
    else
    {
        console.log(constant.messages.NO_TOPIC_TO_DELETE);
        callback(400, constant.messages.NO_TOPIC_TO_DELETE);
    }
}
