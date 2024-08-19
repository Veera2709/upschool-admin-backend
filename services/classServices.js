const dynamoDbCon = require('../awsConfig');  
const classRepository = require("../repository/classRepository");  
const schoolRepository = require("../repository/schoolRepository");  
const constant = require('../constants/constant');
const helper = require('../helper/helper');
const { TABLE_NAMES } = require('../constants/tables');
const commonRepository = require("../repository/commonRepository");

exports.addNewClass = function (request, callback) {    
    classRepository.fetchClassByName(request, async function (fetch_class_err, fetch_class_response) {
        if (fetch_class_err) {
            console.log(fetch_class_err);
            callback(fetch_class_err, fetch_class_response);
        } else {
            if (fetch_class_response.Items.length === 0) {

                classRepository.insertnewClass(request, function (insert_class_err, insert_class_response) {
                    if (insert_class_err) {
                        console.log(insert_class_err);
                        callback(insert_class_err, insert_class_response);
                    } else {
                        console.log("Class Added Successfully");
                        callback(0, 200);
                    }
                })
            } else {
                console.log(constant.messages.CLASS_NAME_ALREADY_EXIST);
                callback(400, constant.messages.CLASS_NAME_ALREADY_EXIST);
            }
        }
    })
}

exports.getAllClassBasedOnStatus = function (request, callback) {
    classRepository.getClassByStatus(request, function (fetch_all_class_err, fetch_all_class_response) {
        if (fetch_all_class_err) {
            console.log(fetch_all_class_err);
            callback(fetch_all_class_err, fetch_all_class_response);
        } else {
            fetch_all_class_response.Items.sort((a, b) => {
                return new Date(b.updated_ts) - new Date(a.updated_ts);
            });
            callback(fetch_all_class_err, fetch_all_class_response);
        }
    })
}

exports.getIndividualClass = function (request, callback) {
    
    classRepository.fetchClassById(request, function (class_err, class_response) {
        if (class_err) {
            console.log(class_err);
            callback(class_err, class_response);
        } else {
            callback(class_err, class_response);
        }
    })
}

exports.updateClass = function (request, callback) { 
    
    classRepository.fetchClassByName(request, function (fetch_class_err, fetch_class_res) {
        if (fetch_class_err) {
            console.log(fetch_class_err);
            callback(fetch_class_err, fetch_class_res);
        } else {        
            console.log("SUBJECT : ", fetch_class_res);
            if((fetch_class_res.Items.length > 0) && fetch_class_res.Items[0].class_id !== request.data.class_id)
            {
                console.log(constant.messages.CLASS_NAME_ALREADY_EXIST);
                callback(400, constant.messages.CLASS_NAME_ALREADY_EXIST);              
            }
            else
            {
                classRepository.editClass(request, function (update_class_err, update_class_response) {
                    if (update_class_err) {
                        console.log(update_class_err);
                        callback(update_class_err, update_class_response);
                    } else {
                        console.log("Class Updated Successfully");
                        callback(0, 200);
                    }
                })
            }
        }
    })    
}

exports.changeClassStatus = function (request, callback) {
    if(request.data.class_status == "Archived")
    {
        schoolRepository.fetchClientClassByUpClassId(request, function (clientClass_err, clientClass_response) {
            if (clientClass_err) {
                console.log(clientClass_err);
                callback(clientClass_err, clientClass_response);
            } else {
                if(clientClass_response.Items.length == 0)
                {
                    classRepository.updateClassStatus(request, function (classStatus_err, classStatus_response) {
                        if (classStatus_err) {
                            console.log(classStatus_err);
                            callback(classStatus_err, classStatus_response);
                        } else {
                            callback(0, 200);
                        }
                    })
                }
                else
                {
                    console.log(constant.messages.UNABLE_TO_DELETE_THE_CLASS);
                    callback(400, constant.messages.UNABLE_TO_DELETE_THE_CLASS);
                }
            }
        })
    }
    else
    {
        classRepository.updateClassStatus(request, function (classStatus_err, classStatus_response) {
            if (classStatus_err) {
                console.log(classStatus_err);
                callback(classStatus_err, classStatus_response);
            } else {
                callback(0, 200);
            }
        })
    }    
}

exports.changeBulkClassStatus = function (request, callback) {     
    if(request.data.class_array.length > 0)
    {
        let fetchBulkReq = {
            IdArray : request.data.class_array,
            fetchIdName : "class_id",
            TableName : TABLE_NAMES.upschool_class_table
        }
        
        commonRepository.fetchBulkData(fetchBulkReq, function (classData_err, classData_res) {
            if (classData_err) {
                console.log(classData_err);
                callback(classData_err, classData_res);
            } else {
                console.log("CLASS DATA");
                console.log(classData_res.Items);                
                
                /** FETCH CLIENT CLASS DATA **/
                let fetchBulkReq = {
                    IdArray : request.data.class_array,
                    fetchIdName : "upschool_class_id",
                    TableName : TABLE_NAMES.upschool_client_class_table
                }
                
                commonRepository.fetchBulkDataUsingIndex(fetchBulkReq, function (classClientData_err, classClientData_res) {
                    if (classClientData_err) {
                        console.log(classClientData_err);
                        callback(classClientData_err, classClientData_res);
                    } else {
                        console.log("CLIENT CLASS DATA");
                        console.log(classClientData_res.Items);  

                        let finalUpdateData = [];
                        let checkClassId = "";
                        let finalResponse = "";
                        let classCount = 0;

                        function setClassStatus(i)
                        {
                            if(i < classData_res.Items.length)
                            {
                                checkClassId = "";
                                if(request.data.class_status == "Archived")
                                {
                                    checkClassId = classClientData_res.Items.filter(clientItem => clientItem.upschool_class_id === classData_res.Items[i].class_id);
                                    if(checkClassId.length > 0)
                                    {
                                        finalResponse += ", " + classData_res.Items[i].class_name;
                                        classCount++;
                                    }
                                    else
                                    {
                                        classData_res.Items[i].class_status = request.data.class_status;
                                        finalUpdateData.push(classData_res.Items[i]);  
                                    }
                                }
                                else
                                {
                                    classData_res.Items[i].class_status = request.data.class_status;
                                    finalUpdateData.push(classData_res.Items[i]);                                    
                                }

                                i++;
                                setClassStatus(i);
                            }
                            else
                            {
                                /** END STATUS CHANGE **/
                                finalResponse = finalResponse.slice(2);
                                commonRepository.BulkInsert(finalUpdateData, TABLE_NAMES.upschool_class_table, function (updateBulkData_err, updateBulkData_res) {
                                    if (updateBulkData_err) {
                                        console.log("ERROR : TOGGLE BULK CLASS DATA");
                                        console.log(updateBulkData_err);
                                    } else {
                                        console.log("BULK CLASS STATUS UPDATED!");
                                        console.log(updateBulkData_res);

                                        if(classCount > 0)
                                        {
                                            console.log((classCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_CLASS_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_BULK_CLASS_FOR_ONE.replace("**REPLACE**", finalResponse));

                                            callback(400, (classCount > 1) ? constant.messages.UNABLE_TO_DELETE_BULK_CLASS_FOR_MULTIPLE.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_DELETE_BULK_CLASS_FOR_ONE.replace("**REPLACE**", finalResponse));
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
                        setClassStatus(0);
                    }
                })
                /** END FETCH CLIENT CLASS DATA **/
            }
        })
    }
    else
    {
        console.log(constant.messages.NO_CLASS_TO_DELETE);
        callback(400, constant.messages.NO_CLASS_TO_DELETE);
    }
}
