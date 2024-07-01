const fs = require("fs");
const dynamoDbCon = require('../awsConfig');  
const chapterRepository = require("../repository/chapterRepository");  
const commonServices = require("../services/commonServices");
const unitRepository = require("../repository/unitRepository");  
const constant = require('../constants/constant');
const helper = require('../helper/helper');
const { nextTick } = require("process");
const { response } = require("express");

exports.addChapter = function (request, callback) {

    chapterRepository.fetchChapterDataByName(request, async function (fetch_chapter_err, fetch_chapter_response) {
        if (fetch_chapter_err) {
            callback(fetch_chapter_err, fetch_chapter_response);
        } else {
            if (fetch_chapter_response.Items.length === 0) {          
                    chapterRepository.insertChapter(request, function (insert_chapter_err, insert_chapter_response) {
                        if (insert_chapter_err) {
                            console.log(insert_chapter_err);
                            callback(insert_chapter_err, insert_chapter_response);
                        } else {
                            console.log("Chapter Added Successfully");
                            callback(0, 200);   
                        }
                    })
            } else {
                console.log("Chapter Name Already Exists");
                callback(400, constant.messages.CHAPTER_NAME_ALREADY_EXISTS);
            }
        }
    })
}

exports.fetchIndividualChapter = async function (request, callback) {
    /** FETCH USER BY EMAIL **/
    chapterRepository.fetchChapterByID(request, async function (single_chapter_err, single_chapter_response) {
        if (single_chapter_err) {
            console.log(single_chapter_err);
            callback(single_chapter_err, single_chapter_response);
        } else {
            callback(0, single_chapter_response);
        }
    })
}
exports.editChapter = function (request, callback) {

    chapterRepository.fetchChapterByID(request, async function (fetch_chapter_err, fetch_chapter_response) {
        if (fetch_chapter_err) {
            console.log(fetch_chapter_err);
            callback(fetch_chapter_err, fetch_chapter_response);
        } else {
            
            if (fetch_chapter_response.Items.length > 0) {
                /** CHECK FOR DUPLICATE **/
                        if (fetch_chapter_response.Items[0].chapter_id !== request.data.chapter_id) {
                            console.log("Chapter Name Already Exist");
                            callback(400, constant.messages.CHAPTER_NAME_ALREADY_EXISTS);
                        }
                        else
                        {
                            chapterRepository.updateChapter(request, function (update_chapter_err, update_chapter_response) {
                                if (update_chapter_err) {
                                    console.log(update_chapter_err);
                                    callback(update_chapter_err, update_chapter_response);
                                } else {
                                    callback(0, update_chapter_response);
                                }
                            });
                        }
                /** END CHECK FOR DUPLICATE **/                            
            }
            else
            {
                console.log("No Chapter Data");
                callback(400, constant.messages.NO_DATA);
            }
        }
    })
}
exports.toggleChapterStatus = function (request, callback) {
    let chapter_id = request.data.chapter_id;

    chapterRepository.checkForExistence(chapter_id, function (existance_chapter_err, existance_chapter_response) {
        if (existance_chapter_err) {
            console.log(existance_chapter_err);
            callback(existance_chapter_err, existance_chapter_response);
        } else {

            if(existance_chapter_response.Items.length === 0){
                callback(400, constant.messages.NO_CHAPTER_TO_DELETE);
            } else { 

                if(request.data.chapter_status == "Archived")
                {
                    request.data.unit_status = "Active";
                    unitRepository.getUnitsBasedOnStatus(request, function (get_unit_err, get_unit_res) {
                        if (get_unit_err) {
                            console.log(get_unit_err);
                            callback(get_unit_err, get_unit_res);
                        } else {
                            console.log("UNITS : ", get_unit_res);

                            /** CHECK FOR MAPPTING **/
                            let checkMapPayload = {
                                arrayToCheck: get_unit_res.Items,
                                fieldToCheck: ["unit_chapter_id"],
                                checkId: request.data.chapter_id,
                                fieldToPrint: "unit_title"
                            };

                            commonServices.CheckDataMapping(checkMapPayload, function (mapping_err, mapping_res) {
                                if (mapping_err) {
                                    console.log(mapping_err);
                                    callback(mapping_err, mapping_res);
                                } else {
                                    console.log("MAPPING CHECK RESPONSE : ", mapping_res);
                                    if(mapping_res.length == 0)
                                    {
                                        chapterRepository.changeChapterStatus(request, function (delete_chapter_err, delete_chapter_response) {
                                            if (delete_chapter_err) {
                                                console.log(delete_chapter_err);
                                                callback(delete_chapter_err, delete_chapter_response);
                                            } else {
                                                console.log("Chapter Status Changed"); 
                                                callback(0, 200);
                                            }
                                        });
                                    }
                                    else
                                    {
                                        console.log(constant.messages.UNABLE_TO_DELETE_THE_CHAPTER.replace("**REPLACE**", mapping_res));
                                        callback(400, constant.messages.UNABLE_TO_DELETE_THE_CHAPTER.replace("**REPLACE**", mapping_res));
                                    }
                                }
                            });
                            /** END CHECK FOR MAPPTING **/
                        }   
                    })   
                }
                else
                {
                    chapterRepository.changeChapterStatus(request, function (delete_chapter_err, delete_chapter_response) {
                        if (delete_chapter_err) {
                            console.log(delete_chapter_err);
                            callback(delete_chapter_err, delete_chapter_response);
                        } else {
                            console.log("Chapter Status Changed"); 
                            callback(0, 200);
                        }
                    });
                }                
            }
        }
    });
}

exports.fetchChaptersBasedonStatus = function (request, callback) {
    /** FETCH USER BY EMAIL **/
    chapterRepository.getChaptersBasedOnStatus(request, function (fetch_all_chapter_err, fetch_all_chapter_response) {
        if (fetch_all_chapter_err) {
            console.log(fetch_all_chapter_err);
            callback(fetch_all_chapter_err, fetch_all_chapter_response);
        } else {
            callback(0, fetch_all_chapter_response);
        }
    })
}
exports.multiChapterToggleStatus = async function (request, callback) {

    let chapters_cant_delete = ""; 
    if(request.data.chapter_status === "Active" || request.data.chapter_status === "Archived"){
        if(request.data.chapter_array.length > 0) 
        {
            chapterRepository.fetchChapterData({chapter_array: request.data.chapter_array}, function (chapter_data_err, chapter_data_res) { 
                if (chapter_data_err) {
                    console.log(chapter_data_err);
                    callback(chapter_data_err, chapter_data_res);
                } else {
                    let activeData = [];
    
                    if(chapter_data_res.Items.length > 0)
                    {
                        request.data.unit_status = "Active"; 
                        unitRepository.getUnitsBasedOnStatus(request, function (get_unit_err, get_unit_res) {
                            if (get_unit_err) {
                                console.log(get_unit_err);
                                callback(get_unit_err, get_unit_res);
                            } else {        
                                function changeChapterStatus(i)
                                {
                                    if(i < chapter_data_res.Items.length)
                                    {
                                        if(request.data.chapter_status === "Archived"){
                                        
                                            /** CHECK FOR MAPPTING **/
                                            let checkMapPayload = { 
                                                arrayToCheck: get_unit_res.Items,
                                                fieldToCheck: "unit_chapter_id",
                                                checkId: chapter_data_res.Items[i].chapter_id,
                                                fieldToPrint: "unit_title"
                                            };
    
                                            commonServices.CheckForMappings(checkMapPayload, function (mapping_err, mapping_res) {
                                                if (mapping_err) {
                                                    console.log(mapping_err);
                                                    callback(mapping_err, mapping_res);
                                                } else {
                                                    if(mapping_res.length == 0 || mapping_res === "")
                                                    {
                                                        console.log("No Mapping : ", chapter_data_res.Items[i].chapter_id);
                                                        chapter_data_res.Items[i].chapter_status = request.data.chapter_status;
                                                        activeData.push(chapter_data_res.Items[i])
                                                    }
                                                    else
                                                    {
                                                        (i == chapter_data_res.Items.length - 1) ? 
                                                        chapters_cant_delete += chapter_data_res.Items[i].chapter_title : chapters_cant_delete += chapter_data_res.Items[i].chapter_title + ", "
                                                    }
                                                }
                                            });
                                            /** END CHECK FOR MAPPTING **/
                                        } else { 
                                            chapter_data_res.Items[i].chapter_status = request.data.chapter_status;
                                            activeData.push(chapter_data_res.Items[i])
                                        }
                                        i++;
                                        changeChapterStatus(i);
                                    }
                                    else
                                    {
                                        /** BULK UPDATE **/
                                        chapterRepository.changeMultipleChaptersStatus(activeData, function (updateBulkData_err, updateBulkData_res) {
                                            if (updateBulkData_err) {
                                                console.log("ERROR : TOGGLE BULK CHAPTERS DATA");
                                                console.log(updateBulkData_err);
                                            } else {
                                                console.log("BULK CHAPTERS STATUS UPDATED!");
                                                chapters_cant_delete.endsWith(", ") && (chapters_cant_delete = chapters_cant_delete.substring(0, chapters_cant_delete.length-2))
                                                // Check chapters_cant_delete length and Include digicard Titles in the response 
                                                if(chapters_cant_delete.length === 0 || chapters_cant_delete === ""){ 
                                                    console.log(updateBulkData_res);
                                                    callback(0, 200);
    
                                                } else {
                                                    console.log(constant.messages.UNABLE_TO_DELETE_MULTIPLE_CHAPTERS.replace("**REPLACE**", chapters_cant_delete)); 
                                                    callback(400, constant.messages.UNABLE_TO_DELETE_MULTIPLE_CHAPTERS.replace("**REPLACE**", chapters_cant_delete)); 
                                                }
                                            }
                                        })
                                        /** END BULK UPDATE **/
                                    }
                                }
                                changeChapterStatus(0)
                            }
                        })
                    }
                    else
                    {
                        console.log("EMPTY DATA FROM BULK FETCH");
                        callback(401, constant.messages.INVALID_CHAPTER_TO_DELETE); 
                    }
                    
                }
            });
        }
        else
        {
            console.log("EMPTY ARRAY");
            callback(401, constant.messages.NO_CHAPTER_TO_DELETE);
        }
    } else {
        console.log("Invalid Digicard Status");
        callback(401, constant.messages.INVALID_CHAPTER_STATUS);
    }
	
}