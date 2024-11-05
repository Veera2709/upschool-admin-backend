const groupRepository = require("../repository/groupRepository");  
const conceptRepository = require("../repository/conceptRepository");  
const commonServices = require("../services/commonServices");
const constant = require('../constants/constant');
const helper = require('../helper/helper');
const e = require("express");

exports.addNewGroup = function (request, callback) {    
    groupRepository.fetchGroupByName(request, async function (fetchGroup_err, fetchGroup_response) {
        if (fetchGroup_err) {
            console.log(fetchGroup_err);
            callback(fetchGroup_err, fetchGroup_response);
        } else {
            if (fetchGroup_response.Items.length === 0) {

                groupRepository.insertnewGroup(request, function (insertGroup_err, insertGroup_response) {
                    if (insertGroup_err) {
                        console.log(insertGroup_err);
                        callback(insertGroup_err, insertGroup_response);
                    } else {
                        console.log("Group Added Successfully");
                        callback(0, 200);
                    }
                })
            } else {
                console.log(constant.messages.GROUP_NAME_ALREADY_EXIST);
                callback(400, constant.messages.GROUP_NAME_ALREADY_EXIST);
            }
        }
    })
}

exports.getGoupDataByItsStatusTypes = function (request, callback) {    
    groupRepository.fetchGroupBasedOnTypes(request, function (groupData_err, groupData_res) {
        if (groupData_err) {
            console.log(groupData_err);
            callback(groupData_err, groupData_res);
        } else {
            groupData_res.Items.sort((a, b) => {
                return new Date(b.updated_ts) - new Date(a.updated_ts);
            });
            groupData_res.Items.map(e => {
                e.questions_count = e.group_question_id.length; 
            })

            callback(groupData_err, groupData_res);
        }
    })
}

exports.changeGroupStatus = function (request, callback) {  
    if(request.data.group_status == "Archived")
    {
        request.data.concept_status = "Active";
        conceptRepository.getConceptBasedOnStatus(request, function (get_concept_err, get_concept_res) {
            if (get_concept_err) {
                console.log(get_concept_err);
                callback(get_concept_err, get_concept_res);
            } else {        
                console.log("CONCEPTS DATA : ", get_concept_res);

                /** CHECK FOR MAPPTING **/
                let groupTypes = constant.typesOfGroup;

                let checkMapPayload = {
                    arrayToCheck: get_concept_res.Items,
                    fieldToCheck: [groupTypes.BASIC, groupTypes.INTERMEDIATE, groupTypes.ADVANCED],
                    checkId: request.data.group_id,
                    fieldToPrint: "concept_title"
                };

                commonServices.CheckGroupMappingToConcept(checkMapPayload, function (mapping_err, mapping_res) {
                    if (mapping_err) {
                        console.log(mapping_err);
                        callback(mapping_err, mapping_res);
                    } else {
                        console.log("MAPPING CHECK RESPONSE : ", mapping_res);
                        if(mapping_res.length == 0)
                        {
                            groupRepository.toggleGroupStatus(request, function (groupStatus_err, groupStatus_res) {
                                if (groupStatus_err) {
                                    console.log(groupStatus_err);
                                    callback(groupStatus_err, groupStatus_res);
                                } else {
                                    callback(groupStatus_err, groupStatus_res);
                                }
                            })
                        }
                        else
                        {
                            console.log(constant.messages.UNABLE_TO_DELETE_THE_GROUP.replace("**REPLACE**", mapping_res));
                            callback(400, constant.messages.UNABLE_TO_DELETE_THE_GROUP.replace("**REPLACE**", mapping_res));
                        }
                    }
                });
                /** END CHECK FOR MAPPTING **/
            }
        })
    }  
    else
    {
        groupRepository.toggleGroupStatus(request, function (groupStatus_err, groupStatus_res) {
            if (groupStatus_err) {
                console.log(groupStatus_err);
                callback(groupStatus_err, groupStatus_res);
            } else {
                callback(groupStatus_err, groupStatus_res);
            }
        })
    }    

    /** OLD **/
    // groupRepository.toggleGroupStatus(request, function (groupStatus_err, groupStatus_res) {
    //     if (groupStatus_err) {
    //         console.log(groupStatus_err);
    //         callback(groupStatus_err, groupStatus_res);
    //     } else {
    //         callback(groupStatus_err, groupStatus_res);
    //     }
    // })
    /** END OLD **/
}

exports.getIndividualGroupData = function (request, callback) {    
    groupRepository.fetchGroupById(request, function (groupStatus_err, groupStatus_res) {
        if (groupStatus_err) {
            console.log(groupStatus_err);
            callback(groupStatus_err, groupStatus_res);
        } else {
            callback(groupStatus_err, groupStatus_res);
        }
    })
}

exports.updateGroupData = function (request, callback) {    
    groupRepository.fetchGroupByName(request, async function (fetchGroup_err, fetchGroup_response) {
        if (fetchGroup_err) {
            console.log(fetchGroup_err);
            callback(fetchGroup_err, fetchGroup_response);
        } else {
            if((fetchGroup_response.Items.length > 0) && fetchGroup_response.Items[0].group_id !== request.data.group_id)
            {
                console.log(constant.messages.GROUP_NAME_ALREADY_EXIST);
                callback(400, constant.messages.GROUP_NAME_ALREADY_EXIST);                
            }
            else
            {
                groupRepository.editGroup(request, function (updateGroup_err, updateGroup_response) {
                    if (updateGroup_err) {
                        console.log(updateGroup_err);
                        callback(updateGroup_err, updateGroup_response);
                    } else {
                        callback(updateGroup_err, updateGroup_response);
                    }
                })
            }
        }
    })
}

exports.getAllTypesOfGroups = function (request, callback) {    
    /** FETCH BASIC GROUP **/
    let fetchReq = {
        data : {
            group_status : "Active",
            group_type : constant.typesOfGroup.BASIC
        }
    }
    groupRepository.fetchGroupBasedOnTypes(fetchReq, function (basicGroupData_err, basicGroupData_res) {
        if (basicGroupData_err) {
            console.log(basicGroupData_err);
            callback(basicGroupData_err, basicGroupData_res);
        } else {
            /** FETCH INTERMEDIATE GROUP **/
            fetchReq.data.group_type = constant.typesOfGroup.INTERMEDIATE;            
            groupRepository.fetchGroupBasedOnTypes(fetchReq, function (intermediateGroupData_err, intermediateGroupData_res) {
                if (intermediateGroupData_err) {
                    console.log(intermediateGroupData_err);
                    callback(intermediateGroupData_err, intermediateGroupData_res);
                } else {                    
                    /** FETCH ADVANCED GROUP **/
                    fetchReq.data.group_type = constant.typesOfGroup.ADVANCED; 
                    groupRepository.fetchGroupBasedOnTypes(fetchReq, function (advancedGroupData_err, advancedGroupData_res) {
                        if (advancedGroupData_err) {
                            console.log(advancedGroupData_err);
                            callback(advancedGroupData_err, advancedGroupData_res);
                        } else {                            
                            let finalGroup = {
                                "Basic" : basicGroupData_res.Items,
                                "Intermediate" : intermediateGroupData_res.Items,
                                "Advanced" : advancedGroupData_res.Items
                            }
                            callback(0, finalGroup);
                        }   
                    })
                    /** END FETCH ADVANCED GROUP **/
                }
            })
            /** END FETCH INTERMEDIATE GROUP **/
        }
    })
    /** END FETCH BASIC GROUP **/
}

exports.multiGroupsToggleStatus = async function (request, callback) {
    let groups_cant_delete = ""; 
    if(request.data.group_status === "Active" || request.data.group_status === "Archived"){
        if(request.data.group_array.length > 0) 
        {
            groupRepository.fetchGroupsData({group_array: request.data.group_array}, function (groups_data_err, groups_data_res) { 
                if (groups_data_err) {
                    console.log(groups_data_err);
                    callback(groups_data_err, groups_data_res);
                } else {
                    let activeData = [];
    
                    if(groups_data_res.Items.length > 0)
                    {
                        request.data.concept_status = "Active"; 
                        conceptRepository.getConceptBasedOnStatus(request, function (get_concept_err, get_concept_res) {
                            if (get_concept_err) {
                                console.log(get_concept_err);
                                callback(get_concept_err, get_concept_res);
                            } else {        
                                function changeDigiCardStatus(i)
                                {
                                    if(i < groups_data_res.Items.length)
                                    {
                                        if(request.data.group_status === "Archived"){
                                        
                                            /** CHECK FOR MAPPTING **/
                                            let checkMapPayload = { 
                                                arrayToCheck: get_concept_res.Items,
                                                fieldToCheck: "concept_group_id",
                                                checkId: groups_data_res.Items[i].group_id,
                                                fieldToPrint: "concept_title"
                                            };
                                            console.log(" Log : ",  { 
                                                arrayToCheck: get_concept_res.Items,
                                                fieldToCheck: "concept_group_id",
                                                checkId: groups_data_res.Items[i].group_id,
                                                fieldToPrint: "concept_title"
                                            });
                                            commonServices.CheckForMappings(checkMapPayload, function (mapping_err, mapping_res) {
                                                if (mapping_err) {
                                                    console.log(mapping_err);
                                                    callback(mapping_err, mapping_res);
                                                } else {
                                                    
                                                    if(mapping_res.length == 0 || mapping_res === "")
                                                    {
                                                        console.log("No Mapping : ", groups_data_res.Items[i].group_id);
                                                        groups_data_res.Items[i].group_status = request.data.group_status;
                                                        activeData.push(groups_data_res.Items[i])
                                                    }
                                                    else
                                                    {
                                                        (i == groups_data_res.Items.length - 1) ? 
                                                        groups_cant_delete += groups_data_res.Items[i].group_name : groups_cant_delete += groups_data_res.Items[i].group_name + ", "
                                                    }
                                                }
                                            });
                                            /** END CHECK FOR MAPPTING **/
                                        } else { 
                                            groups_data_res.Items[i].group_status = request.data.group_status;
                                            activeData.push(groups_data_res.Items[i])
                                        }
                                        i++;
                                        changeDigiCardStatus(i);
                                    }
                                    else
                                    {
                                        /** BULK UPDATE **/
                                        groupRepository.changeMultipleGroupsStatus(activeData, function (updateBulkData_err, updateBulkData_res) {
                                            if (updateBulkData_err) {
                                                console.log("ERROR : TOGGLE BULK DIGICARDS DATA");
                                                console.log(updateBulkData_err);
                                            } else {
                                                console.log("BULK DIGICARDS STATUS UPDATED!");
                                                groups_cant_delete.endsWith(", ") && (groups_cant_delete = groups_cant_delete.substring(0, groups_cant_delete.length-2))
                                                // Check groups_cant_delete length and Include digicard Titles in the response 
                                                if(groups_cant_delete.length === 0 || groups_cant_delete === ""){ 
    
                                                    console.log(updateBulkData_res);
                                                    callback(0, 200);
    
                                                } else {
                                                    console.log(constant.messages.UNABLE_TO_DELETE_MULTIPLE_GROUPS.replace("**REPLACE**", groups_cant_delete)); 
                                                    callback(400, constant.messages.UNABLE_TO_DELETE_MULTIPLE_GROUPS.replace("**REPLACE**", groups_cant_delete)); 
                                                }
                                            }
                                        })
                                        /** END BULK UPDATE **/
                                    }
                                }
                                changeDigiCardStatus(0)
                            }
                        })
                    }
                    else
                    {
                        console.log("EMPTY DATA FROM BULK FETCH");
                        callback(401, constant.messages.INVALID_DIGICARD_TO_DELETE); 
                    }
                    
                }
            });
        }
        else
        {
            console.log("EMPTY ARRAY");
            callback(401, constant.messages.NO_DIGICARD_TO_DELETE);
        }
    } else {
        console.log("Invalid Digicard Status");
        callback(401, constant.messages.INVALID_GROUP_STATUS);
    }
	
}