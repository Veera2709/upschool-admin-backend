const groupRepository = require("../repository/groupRepository");
const userRepository = require("../repository/userRepository");
const conceptRepository = require("../repository/conceptRepository");
const commonServices = require("../services/commonServices");
const constant = require('../constants/constant');
const helper = require('../helper/helper');
const e = require("express");
const dynamoDbCon = require('../awsConfig');
const XLSX = require('node-xlsx');

exports.addNewGroup = function (request, callback) {
    console.log("--", request.data);
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
    if (request.data.group_status == "Archived") {
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
                        if (mapping_res.length == 0) {
                            groupRepository.toggleGroupStatus(request, function (groupStatus_err, groupStatus_res) {
                                if (groupStatus_err) {
                                    console.log(groupStatus_err);
                                    callback(groupStatus_err, groupStatus_res);
                                } else {
                                    callback(groupStatus_err, groupStatus_res);
                                }
                            })
                        }
                        else {
                            console.log(constant.messages.UNABLE_TO_DELETE_THE_GROUP.replace("**REPLACE**", mapping_res));
                            callback(400, constant.messages.UNABLE_TO_DELETE_THE_GROUP.replace("**REPLACE**", mapping_res));
                        }
                    }
                });
                /** END CHECK FOR MAPPTING **/
            }
        })
    }
    else {
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
            if ((fetchGroup_response.Items.length > 0) && fetchGroup_response.Items[0].group_id !== request.data.group_id) {
                console.log(constant.messages.GROUP_NAME_ALREADY_EXIST);
                callback(400, constant.messages.GROUP_NAME_ALREADY_EXIST);
            }
            else {
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
        data: {
            group_status: "Active",
            group_type: constant.typesOfGroup.BASIC
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
                                "Basic": basicGroupData_res.Items,
                                "Intermediate": intermediateGroupData_res.Items,
                                "Advanced": advancedGroupData_res.Items
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
    if (request.data.group_status === "Active" || request.data.group_status === "Archived") {
        if (request.data.group_array.length > 0) {
            groupRepository.fetchGroupsData({ group_array: request.data.group_array }, function (groups_data_err, groups_data_res) {
                if (groups_data_err) {
                    console.log(groups_data_err);
                    callback(groups_data_err, groups_data_res);
                } else {
                    let activeData = [];

                    if (groups_data_res.Items.length > 0) {
                        request.data.concept_status = "Active";
                        conceptRepository.getConceptBasedOnStatus(request, function (get_concept_err, get_concept_res) {
                            if (get_concept_err) {
                                console.log(get_concept_err);
                                callback(get_concept_err, get_concept_res);
                            } else {
                                function changeDigiCardStatus(i) {
                                    if (i < groups_data_res.Items.length) {
                                        if (request.data.group_status === "Archived") {

                                            /** CHECK FOR MAPPTING **/
                                            let checkMapPayload = {
                                                arrayToCheck: get_concept_res.Items,
                                                fieldToCheck: "concept_group_id",
                                                checkId: groups_data_res.Items[i].group_id,
                                                fieldToPrint: "concept_title"
                                            };
                                            console.log(" Log : ", {
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

                                                    if (mapping_res.length == 0 || mapping_res === "") {
                                                        console.log("No Mapping : ", groups_data_res.Items[i].group_id);
                                                        groups_data_res.Items[i].group_status = request.data.group_status;
                                                        activeData.push(groups_data_res.Items[i])
                                                    }
                                                    else {
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
                                    else {
                                        /** BULK UPDATE **/
                                        groupRepository.changeMultipleGroupsStatus(activeData, function (updateBulkData_err, updateBulkData_res) {
                                            if (updateBulkData_err) {
                                                console.log("ERROR : TOGGLE BULK DIGICARDS DATA");
                                                console.log(updateBulkData_err);
                                            } else {
                                                console.log("BULK DIGICARDS STATUS UPDATED!");
                                                groups_cant_delete.endsWith(", ") && (groups_cant_delete = groups_cant_delete.substring(0, groups_cant_delete.length - 2))
                                                // Check groups_cant_delete length and Include digicard Titles in the response 
                                                if (groups_cant_delete.length === 0 || groups_cant_delete === "") {

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
                    else {
                        console.log("EMPTY DATA FROM BULK FETCH");
                        callback(401, constant.messages.INVALID_DIGICARD_TO_DELETE);
                    }

                }
            });
        }
        else {
            console.log("EMPTY ARRAY");
            callback(401, constant.messages.NO_DIGICARD_TO_DELETE);
        }
    } else {
        console.log("Invalid Digicard Status");
        callback(401, constant.messages.INVALID_GROUP_STATUS);
    }

}

const sendBulkUploadResponse = (bulkError, reqToken, callback) => {
    console.log({ reqToken })
    let decode_token = helper.decodeJwtToken(reqToken);
    let getMailReq = { user_id: decode_token.user_role === 'admin' || Array.isArray(decode_token.user_role) ? decode_token.user_id : decode_token.teacher_id };

    decode_token.user_role === 'admin' || Array.isArray(decode_token.user_role) ? userRepository.fetchUserDataByUserId(getMailReq, function (fetch_user_data_err, fetch_user_data_response) {
        if (fetch_user_data_err) {
            console.log(fetch_user_data_err);
            callback(fetch_user_data_err, 0);
        } else {
            if (fetch_user_data_response.Items.length > 0) {
                console.log("USER EMAIL : ", fetch_user_data_response.Items[0].user_email);

                let mailPayload = {
                    "bulkResponse": JSON.stringify(bulkError),
                    "toMail": fetch_user_data_response.Items[0].user_email,
                    "subject": 'User Upload Response',
                    "mailFor": "userBulkUpload",
                };

                /** PUBLISH SNS **/
                let mailParams = {
                    Message: JSON.stringify(mailPayload),
                    TopicArn: process.env.SEND_OTP_ARN
                };

                dynamoDbCon.sns.publish(mailParams, function (err, data) {
                    if (err) {
                        console.log("SNS PUBLISH ERROR : BULK UPLOAD");
                        console.log(err, err.stack);
                        callback(err, data);
                    }
                    else {
                        console.log("SNS PUBLISH SUCCESS : BULK UPLOAD");
                        callback(0, 1);
                    }
                });
                /** END PUBLISH SNS **/
            } else {
                console.log("ERROR : FETCHING USER");
                callback(1, 0);
            }
        }
    }) : userRepository.fetchAdminDataById(getMailReq, function (fetch_user_data_err, fetch_user_data_response) {
        if (fetch_user_data_err) {
            console.log(fetch_user_data_err);
            callback(fetch_user_data_err, 0);
        } else {
            if (fetch_user_data_response.Items.length > 0) {
                console.log("USER EMAIL : ", fetch_user_data_response.Items[0].user_email);

                let mailPayload = {
                    "bulkResponse": JSON.stringify(bulkError),
                    "toMail": fetch_user_data_response.Items[0].user_email,
                    "subject": 'User Upload Response',
                    "mailFor": "userBulkUpload",
                };

                /** PUBLISH SNS **/
                let mailParams = {
                    Message: JSON.stringify(mailPayload),
                    TopicArn: process.env.SEND_OTP_ARN
                };

                dynamoDbCon.sns.publish(mailParams, function (err, data) {
                    if (err) {
                        console.log("SNS PUBLISH ERROR : BULK UPLOAD");
                        console.log(err, err.stack);
                        callback(err, data);
                    }
                    else {
                        console.log("SNS PUBLISH SUCCESS : BULK UPLOAD");
                        callback(0, 1);
                    }
                });
                /** END PUBLISH SNS **/
            } else {
                console.log("ERROR : FETCHING USER");
                callback(1, 0);
            }
        }
    })
}

exports.bulkGroupsUpload = async (request, reqToken, callback) => {
    let Key = request.data.excelFileName;
    // let Key = "temp/2fa103b3-616e-59df-a54b-ce577e6e0b34_a8cab7b8-ca8f-5c4b-bb29-e258b591a67d.xlsx";
    let school_id = Key.split('/')[1].split('_')[0];
    request.data.school_id = school_id;

    console.log({ Key });
    console.log({ school_id });

    if (Key.includes('.xlxs') || Key.includes('.xls') || Key.includes('.txt')) {
        console.log("xlxs || xls");

        let s3object = (await dynamoDbCon.s3.getObject({ Bucket: process.env.BUCKET_NAME, Key }).promise());

        console.log({ s3object })

        let buffers = [];

        let groupsData = [];

        let errorRes = [];

        buffers.push(s3object.Body);

        let buffer = Buffer.concat(buffers);
        let workbook = XLSX.parse(buffer);
        console.log("workbook", JSON.stringify(workbook));
        function worksheetLoop(i) {
            if (i < workbook.length) {
                async function rowLoop(j) {
                    if (j < workbook[i].data.length) {
                        if (workbook[i].data[j].length > 0) {
                            request.data.group_name = workbook[i].data[j][2]
                            console.log(workbook[i].data[j][2])
                            if (workbook[i].data[j][2]) {
                                groupRepository.fetchGroupByName(request, async function (fetchGroup_err, fetchGroup_response) {
                                    if (fetchGroup_err) {
                                        console.log(fetchGroup_err);
                                        callback(fetchGroup_err, fetchGroup_response);
                                    } else {
                                        if (fetchGroup_response.Items.length > 0) {
                                            //craete error array and send mail as to why it is not craeated
                                            // console.log(request.data.group_name, "", constant.messages.GROUP_NAME_ALREADY_EXIST);
                                            errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: workbook[i].data[j][2].toString() + " " + constant.messages.GROUP_NAME_ALREADY_EXIST })
                                            j++;
                                            rowLoop(j)
                                        }
                                        else if (fetchGroup_response.Items.length === 0) {
                                            //create array for bulk insert
                                            console.log(request.data.group_name, "needs to be created")
                                            groupsData.push({
                                                group_id: helper.getRandomString(),
                                                common_id: constant.constValues.common_id,
                                                created_ts: helper.getCurrentTimestamp(),
                                                display_name: workbook[i].data[j][0],
                                                group_description: workbook[i].data[j][1],
                                                group_name: workbook[i].data[j][2],
                                                group_question_id: [],
                                                group_related_digicard: [],
                                                group_status: workbook[i].data[j][3],
                                                group_type: workbook[i].data[j][4],
                                                lc_group_name: workbook[i].data[j][2].toLowerCase().replace(/ /g, ''),
                                                question_duration: workbook[i].data[j][5],
                                                updated_ts: helper.getCurrentTimestamp()
                                            })
                                            j++;
                                            rowLoop(j)
                                        }
                                    }
                                })
                            }
                            else {
                                errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "group name undefined" })
                                j++;
                                rowLoop(j)
                            }

                        }
                        else {
                            console.log("no rows : " + workbook[i].name);
                            // errorRes.push({ sheet: workbook[i].name, rowNo: "N.A.", reason: "Unknown" });
                            j++;
                            rowLoop(j)
                        }
                    }
                    else {
                        i++;
                        worksheetLoop(i);
                    }
                }
                rowLoop(1)


            }
            else {
                console.log("SHEET END", groupsData);
                console.log("ERRORs array has to be sent now ", errorRes);

                groupRepository.insertManyCases(groupsData, function (insert_many_parents_err, insert_many_parents_response) {
                    if (insert_many_parents_err) {
                        console.log("ERROR : Insert groups Data");
                        console.log(insert_many_parents_err);
                    } else {
                        console.log("Groups Data Inserted Successfully");
                        // errorRes = errorRes.filter((NA) => NA !== "N.A.");

                        /** SENDING RESPONSE **/
                        if (errorRes.length > 0) {
                            sendBulkUploadResponse(errorRes, reqToken, (mailErr, mailRes) => {
                                if (mailErr) {
                                    console.log("ERROR : Sending mail for bulkupload!");
                                    callback(400, "ERROR : SENDING MAIL");
                                }
                                else {
                                    console.log("BULK UPLOAD RESPONSE SENT!");
                                    callback(0, errorRes);
                                }
                            })
                        }
                        else {
                            callback(0, errorRes);
                        }
                    }
                })
            }
        }
        worksheetLoop(0)
    }
}