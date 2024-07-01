const fs = require("fs");
const dynamoDbCon = require('../awsConfig');  
const unitRepository = require("../repository/unitRepository");  
const subjectRepository = require("../repository/subjectRepository");  
const commonServices = require("../services/commonServices");
const constant = require('../constants/constant');
const helper = require('../helper/helper');
const { nextTick } = require("process");

// unit : 
exports.addUnit = function (request, callback) {

    // var unitArray = request.data.unit_chapter_id; 
    // let unitdName = request.data.unit_title;
    // unitdName === '' || unitdName === null || unitdName === undefined ? callback(501, constant.messages.INVALID_UNIT_TITLE) : ""
    // // unit_chapter_id Validation : 
    // Array.isArray(unitArray) && unitArray.length > 0 ? unitArray.forEach(element => { element === '' || element === null || element === undefined ?  callback(502, constant.messages.NO_UNIT_TO_DELETE) : '' }) : ""
  
    unitRepository.fetchUnitDataByTitle(request, async function (fetch_unit_err, fetch_unit_response) {
        if (fetch_unit_err) {
            console.log(fetch_unit_err);
            callback(fetch_unit_err, fetch_unit_response);
        } else {
                
            if (fetch_unit_response.Items.length === 0) {
                /** FETCH USER BY EMAIL **/
                unitRepository.insertUnit(request, function (insert_unit_err, insert_unit_response) {
                    if (insert_unit_err) {
                        console.log(insert_unit_err);
                        callback(insert_unit_err, insert_unit_response);
                    } else {
                        console.log("unit Added Successfully");
                        callback(0, insert_unit_response);
                    }
                })
            } else {
                console.log("Unit Name Already Exists");
                callback(401, constant.messages.UNIT_NAME_ALREADY_EXISTS);
            }
        }
    })
}
exports.fetchIndividualUnit = function (request, callback) {
    /** FETCH USER BY EMAIL **/
    unitRepository.fetchSingleUnit(request, function (single_unit_err, single_unit_response) {
        if (single_unit_err) {
            console.log(single_unit_err);
            callback(single_unit_err, single_unit_response);
        } else {
            console.log("Unit Fetched Successfully");
            // callback(0, 200);
            callback(single_unit_err, single_unit_response);
        }
    })
}
exports.editUnit = function (request, callback) {

    // var unitArray = request.data.unit_chapter_id; 
    // let unitdName = request.data.unit_title;
    // unitdName === '' || unitdName === null || unitdName === undefined ? callback(400, constant.messages.INVALID_UNIT_TITLE) : ""
    // // unit_chapter_id Validation : 
    // Array.isArray(unitArray) && unitArray.length > 0 ? unitArray.forEach(element => { element === '' || element === null || element === undefined ?  callback(400, constant.messages.NO_UNIT_TO_DELETE) : '' }) : ""
  
    /** FETCH USER BY EMAIL **/
    unitRepository.updateUnit(request, function (update_unit_err, update_unit_response) {
        if (update_unit_err) {
            console.log(update_unit_err);
            callback(update_unit_err, update_unit_response);
        } else {
            console.log("Unit Updated Successfully");
            callback(0, 200);
        }
    })
}
exports.toggleUnitStatus = function (request, callback) {
    if(request.data.unit_status == "Archived")
    {
        request.data.subject_status = "Active";
        subjectRepository.getSubjectBasedOnStatus(request, function (get_subject_err, get_subject_res) {
            if (get_subject_err) {
                console.log(get_subject_err);
                callback(get_subject_err, get_subject_res);
            } else {        
                console.log("SUBJECTS : ", get_subject_res);

                /** CHECK FOR MAPPTING **/
                var checkMapPayload = {
                    arrayToCheck: get_subject_res.Items,
                    fieldToCheck: ["subject_unit_id"],
                    checkId: request.data.unit_id,
                    fieldToPrint: "subject_title"
                };

                commonServices.CheckDataMapping(checkMapPayload, function (mapping_err, mapping_res) {
                    if (mapping_err) {
                        console.log(mapping_err);
                        callback(mapping_err, mapping_res);
                    } else {
                        console.log("MAPPING CHECK RESPONSE : ", mapping_res);
                        if(mapping_res.length == 0)
                        {
                            unitRepository.changeUnitStatus(request, function (toggle_unit_err, toggle_unit_response) { 
                                if (toggle_unit_err) {
                                    console.log(toggle_unit_err);
                                    callback(toggle_unit_err, toggle_unit_response);
                                } else {
                                    console.log("Unit Status Changed!");
                                    callback(0, 200);
                                }
                            })
                        }
                        else
                        {
                            console.log(constant.messages.UNABLE_TO_DELETE_THE_UNIT.replace("**REPLACE**", mapping_res));
                            callback(400, constant.messages.UNABLE_TO_DELETE_THE_UNIT.replace("**REPLACE**", mapping_res));
                        }
                    }
                });
                /** END CHECK FOR MAPPTING **/
            }
        })
    }
    else
    {
        unitRepository.changeUnitStatus(request, function (toggle_unit_err, toggle_unit_response) { 
            if (toggle_unit_err) {
                console.log(toggle_unit_err);
                callback(toggle_unit_err, toggle_unit_response);
            } else {
                console.log("Unit Status Changed!");
                callback(0, 200);
            }
        })
    }    
}
exports.fetchUnitsBasedonStatus = function (request, callback) {
    /** FETCH USER BY EMAIL **/
    unitRepository.getUnitsBasedOnStatus(request, function (fetch_all_unit_err, fetch_all_unit_response) {
        if (fetch_all_unit_err) {
            console.log(fetch_all_unit_err);
            callback(fetch_all_unit_err, fetch_all_unit_response);
        } else {
            console.log("Fetch All Units Successfully");
            // callback(0, 200);
            callback(0, fetch_all_unit_response);
        }
    })
}

exports.multiUnitToggleStatus = async function (request, callback) {

    let units_cant_delete = ""; 
    if(request.data.unit_status === "Active" || request.data.unit_status === "Archived"){
        if(request.data.unit_array.length > 0) 
        {
            unitRepository.fetchUnitDataforMultiDelete({unit_array: request.data.unit_array, unit_status: request.data.unit_status}, function (unit_data_err, unit_data_res) { 
                if (unit_data_err) {
                    console.log(unit_data_err);
                    callback(unit_data_err, unit_data_res);
                } else {
                    let activeData = [];
    
                    if(unit_data_res.Items.length > 0)
                    {
                        request.data.subject_status = "Active"; 
                        subjectRepository.getSubjectBasedOnStatus(request, function (get_unit_err, get_unit_res) {
                            if (get_unit_err) {
                                console.log(get_unit_err);
                                callback(get_unit_err, get_unit_res);
                            } else {        
                                function changeUnitStatus(i)
                                {
                                    if(i < unit_data_res.Items.length)
                                    {
                                        if(request.data.unit_status === "Archived"){
                                        
                                            /** CHECK FOR MAPPTING **/
                                            let checkMapPayload = { 
                                                arrayToCheck: get_unit_res.Items,
                                                fieldToCheck: "subject_unit_id",
                                                checkId: unit_data_res.Items[i].unit_id,
                                                fieldToPrint: "unit_title"
                                            };
    
                                            commonServices.CheckForMappings(checkMapPayload, function (mapping_err, mapping_res) {
                                                if (mapping_err) {
                                                    console.log(mapping_err);
                                                    callback(mapping_err, mapping_res);
                                                } else {
                                                    if(mapping_res.length == 0 || mapping_res === "")
                                                    {
                                                        console.log("No Mapping : ", unit_data_res.Items[i].unit_id);
                                                        unit_data_res.Items[i].unit_status = request.data.unit_status;
                                                        activeData.push(unit_data_res.Items[i])
                                                    }
                                                    else
                                                    {
                                                        (i == unit_data_res.Items.length - 1) ? 
                                                        units_cant_delete += unit_data_res.Items[i].unit_title : units_cant_delete += unit_data_res.Items[i].unit_title + ", "
                                                    }
                                                }
                                            });
                                            /** END CHECK FOR MAPPTING **/
                                        } else { 
                                            unit_data_res.Items[i].unit_status = request.data.unit_status;
                                            activeData.push(unit_data_res.Items[i])
                                        }
                                        i++;
                                        changeUnitStatus(i);
                                    }
                                    else
                                    {
                                        console.log("activeData : ", activeData);
                                        /** BULK UPDATE **/
                                        unitRepository.changeMultipleUnitsStatus(activeData, function (updateBulkData_err, updateBulkData_res) {
                                            if (updateBulkData_err) {
                                                console.log("ERROR : TOGGLE BULK UNITS DATA");
                                                console.log(updateBulkData_err);
                                            } else {
                                                console.log("BULK UNITS STATUS UPDATED!");
                                                // Check units_cant_delete length and Include digicard Titles in the response 
                                                units_cant_delete.endsWith(", ") && (units_cant_delete = units_cant_delete.substring(0, units_cant_delete.length-2))
                                                if(units_cant_delete.length === 0 || units_cant_delete === ""){ 
                                                    console.log(updateBulkData_res);
                                                    callback(0, 200);
                                                } else {
                                                    console.log(constant.messages.UNABLE_TO_DELETE_MULTIPLE_UNITS.replace("**REPLACE**", units_cant_delete)); 
                                                    callback(400, constant.messages.UNABLE_TO_DELETE_MULTIPLE_UNITS.replace("**REPLACE**", units_cant_delete)); 
                                                }
                                            }
                                        })
                                        /** END BULK UPDATE **/
                                    }
                                }
                                changeUnitStatus(0)
                            }
                        })
                    }
                    else
                    {
                        console.log("EMPTY DATA FROM BULK FETCH");
                        callback(401, constant.messages.INVALID_UNIT_TO_DELETE); 
                    }
                }
            });
        }
        else
        {
            console.log("EMPTY ARRAY");
            callback(401, constant.messages.NO_UNIT_TO_DELETE);
        }
    } else {
        console.log("Invalid Digicard Status");
        callback(401, constant.messages.INVALID_UNIT_STATUS);
    }
	
}