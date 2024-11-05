const fs = require("fs");
const dynamoDbCon = require('../awsConfig');
const schoolRepository = require("../repository/schoolRepository");
const classRepository = require("../repository/classRepository");
const teacherRepository = require("../repository/teacherRepository");
const studentRepository = require("../repository/studentRepository");
const parentRepository = require("../repository/parentRepository");

const constant = require('../constants/constant');
const helper = require('../helper/helper');
const req = require("express/lib/request");

exports.addingSchool = function (request, callback) {
    schoolRepository.fetchDataBySchoolName(request, async function (fetch_school_err, fetch_school_response) {
        if (fetch_school_err) {
            console.log(fetch_school_err);
            callback(fetch_school_err, fetch_school_response);
        } else {

            if (fetch_school_response.Items.length === 0) {

                teacherRepository.getAdminDataByEmail(request, async function (fetch_admin_err, fetch_admin_response) {
                    if (fetch_admin_err) {
                        console.log(fetch_admin_err);
                        callback(fetch_admin_err, fetch_admin_response);
                    } else {

                        if (fetch_admin_response.Items.length === 0) {

                            let imageUrl = [];
                            if (request.data.school_logo && request.data.school_logo != "") {
                                let file_type = request.data.school_logo.split(".");
                                let file_ext = '.' + file_type[file_type.length - 1];

                                console.log(file_ext)

                                let URL_EXPIRATION_SECONDS = 300

                                let randomID = helper.getRandomString();

                                let Key = `uploads/${randomID}` + file_ext;

                                // Get signed URL from S3
                                let s3Params = {
                                    Bucket: process.env.BUCKET_NAME,
                                    Key,
                                    Expires: URL_EXPIRATION_SECONDS,
                                    ContentType: helper.getMimeType(file_ext),
                                    ACL: 'public-read'
                                }

                                let uploadURL = await dynamoDbCon.s3.getSignedUrlPromise('putObject', s3Params)
                                console.log({ uploadURL });

                                imageUrl.push({ "file_upload_url": uploadURL });
                                request.data["school_logo"] = Key;

                                const schoolId = helper.getRandomString();
                                request.data['school_id'] = schoolId;

                                console.log(request);

                                schoolRepository.addingSchool(request, function (insert_clients_err, insert_clients_response) {
                                    if (insert_clients_err) {
                                        console.log(insert_clients_err);
                                        callback(insert_clients_err, insert_clients_response);
                                    } else {
                                        // callback(0, imageUrl);

                                        teacherRepository.addMasterAdmin(request, function (insert_master_admin_err, insert_master_admin_response) {
                                            if (insert_master_admin_err) {
                                                console.log(insert_master_admin_err);
                                                callback(insert_master_admin_err, insert_master_admin_response);
                                            } else {
                                                callback(0, imageUrl);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                request.data["school_logo"] = "N.A.";

                                const schoolId = helper.getRandomString();
                                request.data['school_id'] = schoolId;

                                console.log(request);

                                schoolRepository.addingSchool(request, function (insert_clients_err, insert_clients_response) {
                                    if (insert_clients_err) {
                                        console.log(insert_clients_err);
                                        callback(insert_clients_err, insert_clients_response);
                                    } else {
                                        // callback(0, imageUrl);

                                        teacherRepository.addMasterAdmin(request, function (insert_master_admin_err, insert_master_admin_response) {
                                            if (insert_master_admin_err) {
                                                console.log(insert_master_admin_err);
                                                callback(insert_master_admin_err, insert_master_admin_response);
                                            } else {
                                                callback(0, imageUrl);
                                            }
                                        });
                                    }
                                });
                            }

                        } else {
                            console.log("Admin email already exists!");
                            callback(400, constant.messages.ADMIN_EMAIL_ALREADY_EXIST);
                        }
                    }
                });

            } else {
                console.log("School Name Already Exist!");
                callback(400, constant.messages.SCHOOL_NAME_ALREADY_EXIST);
            }
        }
    })
}

exports.getAllSchools = function (request, callback) {
    schoolRepository.getAllSchoolsDetails(request, function (fetch_all_school_err, fetch_all_school_response) {
        if (fetch_all_school_err) {
            console.log(fetch_all_school_err);
            callback(fetch_all_school_err, fetch_all_school_response);
        } else {
            async function appendS3Url(i) {
                if (i < fetch_all_school_response.Items.length) {
                    if (fetch_all_school_response.Items[i].school_logo && fetch_all_school_response.Items[i].school_logo !== "N.A." && fetch_all_school_response.Items[i].school_logo != "" && fetch_all_school_response.Items[i].school_logo.includes("uploads/")) {
                        let Key = fetch_all_school_response.Items[i].school_logo;

                        // Get signed URL from S3
                        let s3Params = {
                            Bucket: process.env.BUCKET_NAME,
                            Key,
                            // Expires: URL_EXPIRATION_SECONDS,
                        }

                        let fileS3URL = await dynamoDbCon.s3.getSignedUrlPromise('getObject', s3Params)
                        console.log({ fileS3URL })

                        fetch_all_school_response.Items[i].school_logoURL = fileS3URL;
                        i++;
                        appendS3Url(i);
                    }
                    else {
                        fetch_all_school_response.Items[i].school_logoURL = "N.A.";
                        i++;
                        appendS3Url(i);
                    }
                }
                else {
                    fetch_all_school_response.Items.sort((a, b) => {
                        return new Date(b.updated_ts) - new Date(a.updated_ts);
                    });  
                    callback(0, fetch_all_school_response);
                }
            }
            appendS3Url(0);

        }
    });
}

exports.getAllSchoolIds = function (request, callback) {
    schoolRepository.getAllSchoolsIdsAndNames(request, function (fetch_all_school_ids_err, fetch_all_school_ids_response) {
        if (fetch_all_school_ids_err) {
            console.log(fetch_all_school_ids_err);
            callback(fetch_all_school_ids_err, fetch_all_school_ids_response);
        } else {
            callback(0, fetch_all_school_ids_response);
        }
    });
}

exports.changeSchoolStatus = async function (request, callback) {
    if (request.data !== undefined) {
        if (request.data.school_status === `Active` || request.data.school_status === `Archived`) {
            schoolRepository.getSchoolDetailsById(request, async function (fetch_individual_school_err, fetch_individual_school_response) {
                if (fetch_individual_school_err) {
                    console.log(fetch_individual_school_err);
                    callback(fetch_individual_school_err, fetch_individual_school_response);
                } else {
                    if (fetch_individual_school_response.Items.length > 0) {
                        request.data.sch_archived_ts = fetch_individual_school_response.Items[0].updated_ts;
                        if (request.data.school_status == "Archived") {
                            if (fetch_individual_school_response.Items[0].subscription_active == "No") {
                                exports.fetchUsersandChangeStatus(request, function (change_user_status_err, change_user_status_response) {
                                    change_user_status_err ? callback(change_user_status_err, change_user_status_response) : (change_user_status_response === 200 ? callback(0, 200) : callback(400, constant.messages.TOGGLE_SCHOOL_STATUS_ERROR))
                                })
                            }
                            else {
                                console.log("ACTIVE SUBSCRIPTION SCHOOL");
                                callback(400, constant.messages.SCHOOL_IS_ACTIVE)
                            }
                        }
                        else {
                            exports.fetchUsersandChangeStatus(request, function (change_user_status_err, change_user_status_response) {
                                change_user_status_err ? callback(change_user_status_err, change_user_status_response) : (change_user_status_response === 200 ? callback(0, 200) : callback(400, constant.messages.TOGGLE_SCHOOL_STATUS_ERROR))
                            })
                        }
                    }
                    else {
                        console.log("SCHOOL DATA DOESN'T EXIST");
                        callback(400, constant.messages.INVALID_DATA)
                    }
                }
            })
        } else {
            console.log(constant.messages.INVALID_DATA);
            callback(400, constant.messages.INVALID_SCHOOL_STATUS)
        }
    } else {
        console.log(constant.messages.INVALID_REQUEST_FORMAT);
        callback(400, constant.messages.INVALID_REQUEST_FORMAT)
    }

}
exports.fetchUsersandChangeStatus = async function (request, callback) {

    request.data.updated_ts = helper.getCurrentTimestamp();
    teacherRepository.getAllTeachersBasedonSchool(request, function (teacher_data_err, teacher_data_response) {
        if (teacher_data_err) {
            console.log(teacher_data_err);
            callback(teacher_data_err, teacher_data_response);
        } else {
            parentRepository.getAllParentssBasedonSchool(request, function (parent_data_err, parent_data_response) {
                if (parent_data_err) {
                    console.log(parent_data_err);
                    callback(parent_data_err, parent_data_response);
                } else {
                    studentRepository.getAllStudentsBasedonSchool(request, async function (student_data_err, student_data_response) {
                        if (student_data_err) {
                            console.log(student_data_err);
                            callback(student_data_err, student_data_response);
                        } else {
                            // callback(0, student_data_response);
                            await teacher_data_response.Items.map(e => {
                                e.user_status = request.data.school_status;
                                e.updated_ts = request.data.updated_ts;
                            })

                            await parent_data_response.Items.map(e => {
                                e.user_status = request.data.school_status;
                                e.updated_ts = request.data.updated_ts;
                            })

                            await student_data_response.Items.map(e => {
                                e.user_status = request.data.school_status;
                                e.updated_ts = request.data.updated_ts;
                            })

                            teacherRepository.changeMultiTeachersStatus(teacher_data_response.Items, function (change_teachers_status_err, change_teachers_status_response) {
                                if (change_teachers_status_err) {
                                    console.log(change_teachers_status_err);
                                    callback(change_teachers_status_err, change_teachers_status_response);
                                } else {
                                    // callback(0, change_status_response);
                                    parentRepository.changeMultiParentsStatus(parent_data_response.Items, function (change_parents_status_err, change_parents_status_response) {
                                        if (change_parents_status_err) {
                                            console.log(change_parents_status_err);
                                            callback(change_parents_status_err, change_parents_status_response);
                                        } else {
                                            // callback(0, change_status_response);
                                            studentRepository.changeMultiStudentsStatus(student_data_response.Items, function (change_students_status_err, change_students_status_response) {
                                                if (change_students_status_err) {
                                                    console.log(change_students_status_err);
                                                    callback(change_students_status_err, change_students_status_response);
                                                } else {
                                                    // callback(0, change_students_status_response);
                                                    schoolRepository.toggleSchoolStatus(request, function (change_school_status_err, change_school_status_response) {
                                                        if (change_school_status_err) {
                                                            console.log(change_school_status_err);
                                                            callback(change_school_status_err, change_school_status_response);
                                                        } else {
                                                            // callback(0, change_students_status_response);
                                                            callback(0, 200);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });

                        }
                    });
                }
            });
        }
    });

}
exports.fetchIndividualSchoolById = async function (request, callback) {
    schoolRepository.getSchoolDetailsById(request, async function (fetch_individual_school_err, fetch_individual_school_response) {
        if (fetch_individual_school_err) {
            console.log(fetch_individual_school_err);
            callback(fetch_individual_school_err, fetch_individual_school_response);
        } else {
            if (fetch_individual_school_response.Items.length > 0) {
                if (fetch_individual_school_response.Items[0].school_logo && fetch_individual_school_response.Items[0].school_logo !== "" && fetch_individual_school_response.Items[0].school_logo !== "N.A." && fetch_individual_school_response.Items[0].school_logo.includes("uploads/")) {
                    let Key = fetch_individual_school_response.Items[0].school_logo;
                    let URL_EXPIRATION_SECONDS = 300;

                    // Get signed URL from S3
                    let s3Params = {
                        Bucket: process.env.BUCKET_NAME,
                        Key,
                        // Expires: URL_EXPIRATION_SECONDS,
                    }

                    let uploadURL = await dynamoDbCon.s3.getSignedUrlPromise('getObject', s3Params)
                    console.log({ uploadURL })

                    fetch_individual_school_response.Items[0].school_logoURL = uploadURL;
                }

                // fetch Master Admin details of the school
                teacherRepository.getMasterAdminDataBySchool(request, async function (fetch_master_admin_school_err, fetch_master_admin_school_response) {
                    if (fetch_master_admin_school_err) {
                        console.log(fetch_master_admin_school_err);
                        callback(fetch_master_admin_school_err, fetch_master_admin_school_response);
                    } else {
                        console.log("fetch_master_admin_school_response", fetch_master_admin_school_response);
                        if (fetch_master_admin_school_response.Items.length > 0) {
                            fetch_individual_school_response.Items[0].master_admin_id = fetch_master_admin_school_response.Items[0].teacher_id;
                            fetch_individual_school_response.Items[0].master_admin_email = fetch_master_admin_school_response.Items[0].user_email;
                            callback(0, fetch_individual_school_response);
                        } else {
                            callback(0, fetch_individual_school_response);
                        }
                    }
                });
            } else {
                callback(0, fetch_individual_school_response);
            }
        }
    });
}

exports.updatingSchool = async function (request, callback) {
    schoolRepository.getSchoolDetailsById(request, async function (fetch_individual_school_err, fetch_individual_school_response) {
        if (fetch_individual_school_err) {
            console.log(fetch_individual_school_err);
            callback(fetch_individual_school_err, fetch_individual_school_response);
        } else {
            if (fetch_individual_school_response.Items.length > 0) {
                /** CHECK FOR DUPLICATE **/
                schoolRepository.fetchDataBySchoolName(request, async function (fetch_school_err, fetch_school_response) {
                    if (fetch_school_err) {
                        console.log(fetch_school_err);
                        callback(fetch_school_err, fetch_school_response);
                    } else {

                        if ((fetch_school_response.Items.length > 0) && fetch_school_response.Items[0].school_id !== request.data.school_id) {
                            console.log(constant.messages.SCHOOL_NAME_ALREADY_EXIST);
                            callback(400, constant.messages.SCHOOL_NAME_ALREADY_EXIST);
                        }
                        else {

                            teacherRepository.getAdminDataByEmail(request, async function (get_admin_data_err, get_admin_data_response) {
                                if (get_admin_data_err) {
                                    console.log(get_admin_data_err);
                                    callback(get_admin_data_err, get_admin_data_response);
                                } else {

                                    if (get_admin_data_response.Items.length > 0 && get_admin_data_response.Items[0].teacher_id !== request.data.master_admin_id) {
                                        console.log(constant.messages.ADMIN_EMAIL_ALREADY_EXIST);
                                        callback(400, constant.messages.ADMIN_EMAIL_ALREADY_EXIST);
                                    } else {

                                        let imageUrl = [];

                                        if (request.data.school_logo && (!(request.data.school_logo.includes("uploads/")))) {
                                            let file_type = request.data.school_logo.split(".");
                                            let file_ext = '.' + file_type[file_type.length - 1];

                                            console.log(file_ext);

                                            let URL_EXPIRATION_SECONDS = 300;

                                            let randomID = helper.getRandomString();

                                            let Key = `uploads/${randomID}` + file_ext;

                                            // Get signed URL from S3
                                            let s3Params = {
                                                Bucket: process.env.BUCKET_NAME,
                                                Key,
                                                Expires: URL_EXPIRATION_SECONDS,
                                                ContentType: helper.getMimeType(file_ext),
                                                ACL: 'public-read'
                                            }

                                            console.log("s3Params", s3Params);

                                            let uploadURL = await dynamoDbCon.s3.getSignedUrlPromise('putObject', s3Params)
                                            console.log({ uploadURL })
                                            imageUrl.push({ "file_upload_url": uploadURL });
                                            request.data["school_logo"] = Key;
                                            console.log(request);

                                            schoolRepository.updateSchool(request, function (update_school_err, update_school_response) {
                                                if (update_school_err) {
                                                    console.log(update_school_err);
                                                    callback(update_school_err, update_school_response);
                                                } else {
                                                    // callback(0, imageUrl);

                                                    teacherRepository.updateMasterAdmin(request, function (update_school_err, update_school_response) {
                                                        if (update_school_err) {
                                                            console.log(update_school_err);
                                                            callback(update_school_err, update_school_response);
                                                        } else {
                                                            callback(0, imageUrl);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        else {
                                            request.data["school_logo"] = fetch_individual_school_response.Items[0].school_logo;
                                            schoolRepository.updateSchool(request, function (update_school_err, update_school_response) {
                                                if (update_school_err) {
                                                    console.log(update_school_err);
                                                    callback(update_school_err, update_school_response);
                                                } else {
                                                    // callback(0, imageUrl);

                                                    teacherRepository.updateMasterAdmin(request, function (update_school_err, update_school_response) {
                                                        if (update_school_err) {
                                                            console.log(update_school_err);
                                                            callback(update_school_err, update_school_response);
                                                        } else {
                                                            callback(0, imageUrl);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    }
                })
                /** END CHECK FOR DUPLICATE **/
            }
            else {
                console.log("No School Data");
                callback(400, constant.messages.NO_DATA);
            }
        }
    });
}

exports.getAllUpschoolClassWithClientClass = async function (request, callback) {
    classRepository.fetchAllUpschoolClass(function (fetch_all_class_err, fetch_all_class_res) {
        if (fetch_all_class_err) {
            console.log(fetch_all_class_err);
            callback(fetch_all_class_err, fetch_all_class_res);
        } else {
            /** FETCH CLIENT CLASSES **/
            schoolRepository.fetchAllClientClassList(request, function (fetch_client_class_err, fetch_client_class_res) {
                if (fetch_client_class_err) {
                    console.log(fetch_client_class_err);
                    callback(fetch_client_class_err, fetch_client_class_res);
                } else {
                    callback(0, { "upschoolClassItems": fetch_all_class_res.Items, "ClientClassItems": fetch_client_class_res.Items });
                }
            });
            /** FETCH CLIENT CLASSES **/
        }
    });
}

exports.classSubscribtion = async function (request, callback) {
    let classLists = request.data.classList;
    let findDuplicateName = helper.findDuplicatesInArrayOfObjects(classLists, "client_class_name");
    if (findDuplicateName.length == 0) {
        let findDuplicateUpschoolClass = helper.findDuplicatesInArrayOfObjects(classLists, "upschool_class_id");
        if (findDuplicateUpschoolClass.length == 0) {
            schoolRepository.fetchAllClientClassList(request, function (fetch_client_class_err, fetch_client_class_res) {
                if (fetch_client_class_err) {
                    console.log(fetch_client_class_err);
                    callback(fetch_client_class_err, fetch_client_class_res);
                } else {

                    console.log("CLASS LIST : ", fetch_client_class_res);

                    let toremoveClassList = JSON.parse(JSON.stringify(fetch_client_class_res));
                    let classNameCheck = "";
                    let upschoolClassIdCheck = "";
                    let clientClassId = "";
                    let classesToInsert = [];

                    function CheckDuplicates(i) {
                        if (i < classLists.length) {
                            classNameCheck = "";
                            upschoolClassIdCheck = "";
                            classNameCheck = fetch_client_class_res.Items.filter(e => e.client_class_name.toLowerCase() === classLists[i].client_class_name.toLowerCase());
                            upschoolClassIdCheck = fetch_client_class_res.Items.filter(e => e.upschool_class_id === classLists[i].upschool_class_id);

                            if (classNameCheck.length == 0 && upschoolClassIdCheck.length == 0) {
                                clientClassId = helper.getRandomString()
                                classesToInsert.push({
                                    client_class_id: clientClassId,
                                    upschool_class_id: classLists[i].upschool_class_id,
                                    common_id: constant.constValues.common_id,
                                    school_id: request.data.school_id,
                                    client_class_name: classLists[i].client_class_name,
                                    created_ts: helper.getCurrentTimestamp(),
                                    updated_ts: helper.getCurrentTimestamp()
                                })

                                fetch_client_class_res.Items.push({
                                    client_class_id: clientClassId,
                                    upschool_class_id: classLists[i].upschool_class_id,
                                    school_id: request.data.school_id,
                                    client_class_name: classLists[i].client_class_name,
                                });
                            }
                            else if (classNameCheck.length > 0 && upschoolClassIdCheck.length == 0) {
                                classesToInsert.push({
                                    client_class_id: classNameCheck[0].client_class_id,
                                    upschool_class_id: classLists[i].upschool_class_id,
                                    common_id: constant.constValues.common_id,
                                    school_id: request.data.school_id,
                                    client_class_name: classLists[i].client_class_name,
                                    created_ts: helper.getCurrentTimestamp(),
                                    updated_ts: helper.getCurrentTimestamp()
                                })

                                toremoveClassList.Items.splice(toremoveClassList.Items.findIndex(nameObj => {
                                    return nameObj.client_class_id === classNameCheck[0].client_class_id;
                                }), 1);

                                // indexOfNameObj = toremoveClassList.Items.findIndex(nameObj => {
                                //     return nameObj.client_class_id === classNameCheck[0].client_class_id;
                                // });

                                // toremoveClassList.Items.splice(indexOfNameObj, 1);
                            }
                            else if (classNameCheck.length == 0 && upschoolClassIdCheck.length > 0) {
                                classesToInsert.push({
                                    client_class_id: upschoolClassIdCheck[0].client_class_id,
                                    upschool_class_id: classLists[i].upschool_class_id,
                                    common_id: constant.constValues.common_id,
                                    school_id: request.data.school_id,
                                    client_class_name: classLists[i].client_class_name,
                                    created_ts: helper.getCurrentTimestamp(),
                                    updated_ts: helper.getCurrentTimestamp()
                                })

                                toremoveClassList.Items.splice(toremoveClassList.Items.findIndex(ClassObj => {
                                    return ClassObj.client_class_id === upschoolClassIdCheck[0].client_class_id;
                                }), 1);
                            }
                            else if (classNameCheck.length > 0 && upschoolClassIdCheck.length > 0) {
                                toremoveClassList.Items.splice(toremoveClassList.Items.findIndex(obj => {
                                    return obj.client_class_id === upschoolClassIdCheck[0].client_class_id;
                                }), 1);
                            }

                            i++;
                            CheckDuplicates(i);
                        }
                        else {
                            console.log("CLASS TO INSERT : ", classesToInsert);
                            console.log("CLASS TO REMOVE : ", toremoveClassList);

                            /** ADD CLIENT CLASSES **/
                            schoolRepository.insertManyClientClasses(classesToInsert, toremoveClassList.Items, function (insert_clientClasses_err, insert_clientClasses_res) {
                                if (insert_clientClasses_err) {
                                    console.log("ERROR : Insert Client Classes Data");
                                    console.log(insert_clientClasses_err);
                                } else {
                                    console.log("Client Classes Inserted Successfully");
                                    callback(0, 200);
                                }
                            })
                            /** END ADD CLIENT CLASSES **/
                        }
                    }
                    CheckDuplicates(0);
                }
            });
        }
        else {
            console.log("MULTIPLE SUBSCRIPTION : " + findDuplicateUpschoolClass[0].upschool_class_id);
            callback(400, "MULTIPLE SUBSCRIPTION : " + findDuplicateUpschoolClass[0].upschool_class_id);
        }
    }
    else {
        console.log("REPEATED CLASS NAME : " + findDuplicateName[0].client_class_name);
        callback(400, "REPEATED CLASS NAME  : " + findDuplicateName[0].client_class_name);
    }
}

exports.getClassesForSchool = async function (request, callback) {
    schoolRepository.fetchAllClientClassList(request, function (fetch_client_class_err, fetch_client_class_res) {
        if (fetch_client_class_err) {
            console.log(fetch_client_class_err);
            callback(fetch_client_class_err, fetch_client_class_res);
        } else {
            callback(0, fetch_client_class_res);
        }
    })
}

exports.setSchoolQuizConfig = async function (request, callback) {
    schoolRepository.getSchoolDetailsById(request, function (getSchoolData_err, getSchoolData_res) {
        if (getSchoolData_err) {
            console.log(getSchoolData_err);
            callback(getSchoolData_err, getSchoolData_res);
        } else {
            if (getSchoolData_res.Items.length > 0) {
                Object.keys(request.data)[1] === "pre_quiz_config"
                    ?
                    schoolRepository.setPreQuizConfig(request, function (setPreConfig_err, setPreConfig_res) {
                        if (setPreConfig_err) {
                            console.log(setPreConfig_err);
                            callback(setPreConfig_err, setPreConfig_res);
                        } else {
                            callback(0, setPreConfig_res);
                        }
                    })
                    :
                    Object.keys(request.data)[1] === "post_quiz_config"
                        ?
                        schoolRepository.setPostQuizConfig(request, function (setPostConfig_err, setPostConfig_res) {
                            if (setPostConfig_err) {
                                console.log(setPostConfig_err);
                                callback(setPostConfig_err, setPostConfig_res);
                            } else {
                                callback(0, setPostConfig_res);
                            }
                        })
                        :
                        callback(400, constant.messages.INVALID_REQUEST_FORMAT);
            }
            else {
                console.log(constant.messages.SCHOOL_DOESNOT_EXISTS);
                callback(400, constant.messages.SCHOOL_DOESNOT_EXISTS);
            }
        }
    })
}

exports.setSchoolSubscription = async function (request, callback) {
    schoolRepository.getSchoolDetailsById(request, function (getSchoolData_err, getSchoolData_res) {
        if (getSchoolData_err) {
            console.log(getSchoolData_err);
            callback(getSchoolData_err, getSchoolData_res);
        } else {
            if (getSchoolData_res.Items.length > 0) {
                schoolRepository.settingSubscriptionFeature(request, function (setPermission_err, setPermission_res) {
                    if (setPermission_err) {
                        console.log(setPermission_err);
                        callback(setPermission_err, setPermission_res);
                    } else {
                        callback(0, setPermission_res);
                    }
                })
            }
            else {
                console.log(constant.messages.SCHOOL_DOESNOT_EXISTS);
                callback(400, constant.messages.SCHOOL_DOESNOT_EXISTS);
            }
        }
    })
}

exports.setTeacherAccess = async function (request, callback) {
    console.log("test ok");
    console.log(request);
    schoolRepository.getSchoolDetailsById(request, function (getSchoolData_err, getSchoolData_res) {
        if (getSchoolData_err) {
            console.log(getSchoolData_err);
            callback(getSchoolData_err, getSchoolData_res);
        } else {
            if (getSchoolData_res.Items.length > 0) {
                schoolRepository.settingTeacherAccess(request, function (setPermission_err, setPermission_res) {
                    if (setPermission_err) {
                        console.log(setPermission_err);
                        callback(setPermission_err, setPermission_res);
                    } else {
                        callback(0, setPermission_res);
                    }
                })
            }
            else {
                console.log(constant.messages.SCHOOL_DOESNOT_EXISTS);
                callback(400, constant.messages.SCHOOL_DOESNOT_EXISTS);
            }
        }
    })
}