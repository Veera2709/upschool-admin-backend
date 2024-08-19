const dynamoDbCon = require('../awsConfig');  
const subjectRepository = require("../repository/subjectRepository");  
const unitRepository = require("../repository/unitRepository"); 
const classRepository = require("../repository/classRepository");  
const constant = require('../constants/constant');
const helper = require('../helper/helper');
const commonServices = require("../services/commonServices");
const { TABLE_NAMES } = require('../constants/tables');
const commonRepository = require("../repository/commonRepository");

exports.addNewSubject = async function (request, callback) {

    subjectRepository.fetchSubjectByName(request, function (fetch_subject_err, fetch_subject_res) {
        if (fetch_subject_err) {
            console.log(fetch_subject_err);
            callback(fetch_subject_err, fetch_subject_res);
        } else {        
            console.log("SUBJECT : ", fetch_subject_res);
            if(fetch_subject_res.Items.length > 0)
            {
                console.log(constant.messages.SUBJECT_TITLE_ALREADY_EXIST);
                callback(400, constant.messages.SUBJECT_TITLE_ALREADY_EXIST)
            }
            else
            {
                subjectRepository.insertSubject(request, function (insert_subject_err, insert_subject_response) {
                    if (insert_subject_err) {
                        console.log(insert_subject_err);
                        callback(insert_subject_err, insert_subject_response);
                    } else {
                        console.log("Subject Added Successfully");
                        callback(0, 200);   
                    }
                })
            }
        }
    })    
}

exports.getActiveArchivedSubject = async function (request, callback) {
    console.log(request);
    subjectRepository.getSubjectBasedOnStatus(request, function (get_subject_err, get_subject_res) {
        if (get_subject_err) {
            console.log(get_subject_err);
            callback(get_subject_err, get_subject_res);
        } else {
            get_subject_res.Items.sort((a, b) => {
                return new Date(b.updated_ts) - new Date(a.updated_ts);
            });        
            callback(0, get_subject_res);
        }
    })
}

exports.changeSubjectStatus = async function (request, callback) {
    if(request.data.subject_status == "Archived")
    {
        classRepository.fetchAllUpschoolClass(function (fetch_all_class_err, fetch_all_class_res) {
            if (fetch_all_class_err) {
                console.log(fetch_all_class_err);
                callback(fetch_all_class_err, fetch_all_class_res);
            } else {

                console.log("CLASS : ", fetch_all_class_res);

                /** CHECK FOR MAPPTING **/
                var checkMapPayload = {
                    arrayToCheck: fetch_all_class_res.Items,
                    fieldToCheck: ["class_subject_id"],
                    checkId: request.data.subject_id,
                    fieldToPrint: "class_name"
                };

                commonServices.CheckDataMapping(checkMapPayload, function (mapping_err, mapping_res) {
                    if (mapping_err) {
                        console.log(mapping_err);
                        callback(mapping_err, mapping_res);
                    } else {
                        console.log("MAPPING CHECK RESPONSE : ", mapping_res);
                        if(mapping_res.length == 0)
                        {
                            subjectRepository.toggleSubjectStatus(request, function (toggle_err, toggle_res) {
                                if (toggle_err) {
                                    console.log(toggle_err);
                                    callback(toggle_err, toggle_res);
                                } else {        
                                    callback(toggle_err, toggle_res);
                                }
                            }) 
                        }
                        else
                        {
                            console.log(constant.messages.UNABLE_TO_DELETE_THE_SUBJECT.replace("**REPLACE**", mapping_res));
                            callback(400, constant.messages.UNABLE_TO_DELETE_THE_SUBJECT.replace("**REPLACE**", mapping_res));
                        }
                    }
                });
                /** END CHECK FOR MAPPTING **/
            }
        });
    }
    else
    {
        subjectRepository.toggleSubjectStatus(request, function (toggle_err, toggle_res) {
            if (toggle_err) {
                console.log(toggle_err);
                callback(toggle_err, toggle_res);
            } else {        
                callback(toggle_err, toggle_res);
            }
        }) 
    }        
}

exports.getUnitAndSubject = async function (request, callback) {
    unitRepository.fetchIdAndNameOfUints(request, function (get_unitIdName_err, get_unitIdName_response) {
        if (get_unitIdName_err) {
            console.log(get_unitIdName_err);
            callback(get_unitIdName_err, get_unitIdName_response);
        } else {
            
            subjectRepository.fetchIdAndNameOfSubjects(request, function (get_subject_err, get_subject_response) {
                if (get_subject_err) {
                    console.log(get_subject_err);
                    callback(get_subject_err, get_subject_response);
                } else {
                    callback(0, {unitList: get_unitIdName_response.Items, subjectList: get_subject_response.Items})
                }
            })   
        }
    })    
}

exports.getIndividualSubject = async function (request, callback) {
    subjectRepository.getSubjetById(request, function (individualSubject_err, individualSubject_response) {
        if (individualSubject_err) {
            console.log(individualSubject_err);
            callback(individualSubject_err, individualSubject_response);
        } else {
            callback(individualSubject_err, individualSubject_response);
        }
    })   
}

exports.editSubject = async function (request, callback) {
    subjectRepository.fetchSubjectByName(request, function (fetch_subject_err, fetch_subject_res) {
        if (fetch_subject_err) {
            console.log(fetch_subject_err);
            callback(fetch_subject_err, fetch_subject_res);
        } else {        
            console.log("SUBJECT : ", fetch_subject_res);
            if((fetch_subject_res.Items.length > 0) && fetch_subject_res.Items[0].subject_id !== request.data.subject_id)
            {
                console.log(constant.messages.SUBJECT_TITLE_ALREADY_EXIST);
                callback(400, constant.messages.SUBJECT_TITLE_ALREADY_EXIST);                
            }
            else
            {
                subjectRepository.updateSubject(request, function (updateSubject_err, updateSubject_response) {
                    if (updateSubject_err) {
                        console.log(updateSubject_err);
                        callback(updateSubject_err, updateSubject_response);
                    } else {
                        callback(updateSubject_err, updateSubject_response);
                    }
                })
            }
        }
    })          
}

exports.getIdNAmeOfSubject = async function (request, callback) {
    subjectRepository.fetchIdAndNameOfSubjects(request, function (idNAme_err, idNAme_response) {
        if (idNAme_err) {
            console.log(idNAme_err);
            callback(idNAme_err, idNAme_response);
        } else {
            callback(idNAme_err, idNAme_response.Items);
        }
    })   
}

exports.toggleBulkSubjectStatus = async function (request, callback) {
    if(request.data.subject_array.length > 0)
    {
        let fetchBulkReq = {
            IdArray : request.data.subject_array,
            fetchIdName : "subject_id",
            TableName : TABLE_NAMES.upschool_subject_table
        }
        
        commonRepository.fetchBulkData(fetchBulkReq, function (subjectData_err, subjectData_res) {
            if (subjectData_err) {
                console.log(subjectData_err);
                callback(subjectData_err, subjectData_res);
            } else {
                console.log(subjectData_res.Items);  
                
                let finalUpdateData = [];
                let finalResponse = "";
                let subjectCount = 0;
                
                classRepository.fetchAllUpschoolClass(function (allClass_err, allClass_res) {
                    if (allClass_err) {
                        console.log(allClass_err);
                        callback(allClass_err, allClass_res);
                    } else {        
                        console.log("CLASSES : ", allClass_res);

                        /** SET STATUS **/
                        async function changeStatusLoop(i)
                        {
                            if(i < subjectData_res.Items.length)
                            {
                                if(request.data.subject_status === "Archived")
                                {
                                    /** CHECK FOR MAPPTING **/
                                    let checkMapPayload = {
                                        arrayToCheck: allClass_res.Items,
                                        fieldToCheck: ["class_subject_id"],
                                        checkId: subjectData_res.Items[i].subject_id,
                                        fieldToPrint: "class_name"
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
                                                subjectData_res.Items[i].subject_status = request.data.subject_status;
                                                finalUpdateData.push(subjectData_res.Items[i]);
                                            }
                                            else
                                            {
                                                finalResponse += ", " + subjectData_res.Items[i].subject_title;
                                                subjectCount++;
                                            }
                                        }
                                    });
                                    /** END CHECK FOR MAPPTING **/
                                }
                                else
                                {
                                    subjectData_res.Items[i].subject_status = request.data.subject_status;
                                    finalUpdateData.push(subjectData_res.Items[i]);
                                }

                                i++;
                                changeStatusLoop(i);
                            }
                            else
                            {
                                /** END STATUS CHANGE **/
                                finalResponse = finalResponse.slice(2);
                                commonRepository.BulkInsert(finalUpdateData, TABLE_NAMES.upschool_subject_table, function (updateBulkData_err, updateBulkData_res) {
                                    if (updateBulkData_err) {
                                        console.log("ERROR : TOGGLE BULK SUBJECT DATA");
                                        console.log(updateBulkData_err);
                                    } else {
                                        console.log("BULK SUBJECT STATUS UPDATED!");
                                        console.log(updateBulkData_res);

                                        if(subjectCount > 0)
                                        {
                                            console.log((subjectCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_SUBJECT_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_BULK_SUBJECT_FOR_ONE.replace("**REPLACE**", finalResponse));

                                            callback(400, (subjectCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_SUBJECT_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_BULK_SUBJECT_FOR_ONE.replace("**REPLACE**", finalResponse));
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
                        changeStatusLoop(0)
                        /** END SET STATUS **/
                    }
                }) 
            }
        })
    }
    else
    {
        console.log(constant.messages.NO_SUBJECT_TO_DELETE);
        callback(400, constant.messages.NO_SUBJECT_TO_DELETE);
    }
}