const dynamoDbCon = require('../awsConfig');  
const teacherRepository = require("../repository/teacherRepository");  
const schoolRepository = require("../repository/schoolRepository");  
const sectionRepository = require("../repository/sectionRepository");  
const userRepository = require("../repository/userRepository");
const classRepository = require("../repository/classRepository");  
const subjectRepository = require("../repository/subjectRepository");  
const constant = require('../constants/constant');
const helper = require('../helper/helper');

exports.sectionAllocationTeacher = function (request, callback) {      
    let allocateLists = request.data.allocateLists;
    request.data.user_id = request.data.teacher_id;
    request.data.user_role = "Teacher";

    userRepository.getIndividualUserByRole(request, function (teacher_data_err, teacher_data_res) {
        if (teacher_data_err) {
            console.log(teacher_data_err);
            callback(teacher_data_err, teacher_data_res);
        } else {                
            console.log("TEACHER DETAIL : ", teacher_data_res);
            let sectionToReplace = [];
            let existSectionCheck = "";

            if(teacher_data_res.Items.length > 0 && teacher_data_res.Items[0].teacher_section_allocation)
            {
                let teacherInfo = teacher_data_res.Items[0].teacher_section_allocation;

                function properTeacherInfo(i)
                {
                    if(i < allocateLists.length)
                    {
                        existSectionCheck = teacherInfo.filter(e => e.client_class_id === allocateLists[i].client_class_id && e.section_id === allocateLists[i].section_id);
                        if(existSectionCheck.length == 0)
                        {
                            sectionToReplace.push({
                                allocation_id : helper.getRandomString(),
                                client_class_id : allocateLists[i].client_class_id,
                                section_id : allocateLists[i].section_id
                            });
                        }
                        else
                        {
                            sectionToReplace.push(existSectionCheck[0]);
                        }
                        i++;
                        properTeacherInfo(i);           
                    }
                    else
                    {
                        console.log("FINAL SECTION : ", sectionToReplace);
                        let allocationReq = {
                            data : {
                                teacher_id: request.data.teacher_id,
                                teacher_section_allocation: sectionToReplace
                            }                                
                        }
                        teacherRepository.updateTeacherSectionAllocationInfo(allocationReq, function (updateInfo_err, updateInfo_res) {
                            if (updateInfo_err) {
                                console.log(updateInfo_err);
                                callback(updateInfo_err, updateInfo_res);
                            } else {
                                callback(0, updateInfo_res);
                            }
                        })
                    }
                }
                properTeacherInfo(0)
            }
            else
            {
                console.log(constant.messages.TEACHER_SECTION_ALLOCATION_ISNOT_EXIST);
                callback(400, constant.messages.TEACHER_SECTION_ALLOCATION_ISNOT_EXIST);
            }
        }
    })
}

exports.getTeacherInfoDetails = function (request, callback) { 
    request.data.user_id = request.data.teacher_id;
    request.data.user_role = "Teacher";
    userRepository.getIndividualUserByRole(request, function (getTeacherInfo_err, getTeacherInfo_res) {
        if (getTeacherInfo_err) {
            console.log(getTeacherInfo_err);
            callback(getTeacherInfo_err, getTeacherInfo_res);
        } else {
            if(getTeacherInfo_res.Items.length > 0 && getTeacherInfo_res.Items[0].teacher_section_allocation)
            {
                callback(0, getTeacherInfo_res.Items[0].teacher_section_allocation);
            }
            else
            {
                callback(0, []);
            }            
        }
    })
}

exports.getClassAndSectionOfTeacher = function (request, callback) {     
    request.data.user_id = request.data.teacher_id;
    request.data.user_role = "Teacher";
    let teacherClassSection = [];

    /** FETCH CLIENT CLASS **/
    schoolRepository.fetchAllClientClassList(request, function (clientClassList_err, clientClassList_res) {
        if (clientClassList_err) {
            console.log(clientClassList_err);
            callback(clientClassList_err, clientClassList_res);
        } else {
            console.log("CLIENT CLASS LIST : ", clientClassList_res);

            /** FETCH SECTION **/
            sectionRepository.fetchAllSectionBySchoolId(request, function (sectionList_err, sectionList_res) {
                if (sectionList_err) {
                    console.log(sectionList_err);
                    callback(sectionList_err, sectionList_res);
                } else {
                    console.log("SECTION LIST : ", sectionList_res);

                    /** GET TEACHER DETAILS **/
                    userRepository.getIndividualUserByRole(request, function (getTeacherInfo_err, getTeacherInfo_res) {
                        if (getTeacherInfo_err) {
                            console.log(getTeacherInfo_err);
                            callback(getTeacherInfo_err, getTeacherInfo_res);
                        } else {
                            if(getTeacherInfo_res.Items.length > 0 && getTeacherInfo_res.Items[0].teacher_section_allocation)
                            {
                                // callback(0, getTeacherInfo_res.Items[0].teacher_section_allocation);
                                let teacherSectionAllocation = getTeacherInfo_res.Items[0].teacher_section_allocation;
                                console.log("teacherSectionAllocation : ", teacherSectionAllocation);
                                console.log("LENGTH : ", teacherSectionAllocation.length);
                                let className;
                                let sectionName;
                                function seperateClassAndSection(i)
                                {
                                    if(i < teacherSectionAllocation.length)
                                    {
                                        className = clientClassList_res.Items.filter(e => e.client_class_id === teacherSectionAllocation[i].client_class_id);
                                        sectionName = sectionList_res.Items.filter(e => e.section_id === teacherSectionAllocation[i].section_id);
                                        teacherClassSection.push({                                            
                                            classAndSection : ((className.length > 0) ? className[0].client_class_name : "N.A." ) + " - " + ((sectionName.length > 0) ? sectionName[0].section_name : "N.A." ),
                                            valueId : ((className.length > 0) ? className[0].client_class_id : "N.A." ) + constant.constValues.splitCharacter + ((sectionName.length > 0) ? sectionName[0].section_id : "N.A." )
                                        });                                        

                                        i++;
                                        seperateClassAndSection(i);
                                    }
                                    else
                                    {
                                        /** FINAL **/
                                        console.log("FINAL TEACHER CLASS SECTION", teacherClassSection);
                                        callback(0, teacherClassSection);
                                        /** END FINAL **/
                                    }
                                }
                                seperateClassAndSection(0)
                            }
                            else
                            {
                                callback(0, []);
                            }            
                        }
                    })
                    /** END TEACHER DETAILS **/
                }
            })
            /** END FETCH SECTION **/
        }
    })
    /** END FETCH CLIENT CLASS **/    
}

exports.getSubjectListForClientClass = function (request, callback) { 
    let clientClassId = request.data.clientClassId;
    request.data.client_class_id = (clientClassId.includes(constant.constValues.splitCharacter) ? clientClassId.split(constant.constValues.splitCharacter)[0] : clientClassId);
    classRepository.getIndividualClientClassById(request, function (clientClass_err, clientClass_res) {
        if (clientClass_err) {
            console.log(clientClass_err);
            callback(clientClass_err, clientClass_res);
        } else {
            console.log("CLIENT CLASS DATA : ", clientClass_res);
            request.data.class_id = clientClass_res.Items[0].upschool_class_id;
            /** FETCH UPSCHOOL CLASS DATA **/
            classRepository.fetchClassById(request, function (class_err, class_response) {
                if (class_err) {
                    console.log(class_err);
                    callback(class_err, class_response);
                } else {
                    console.log("UPSCHOOL CLASS DATA : ", JSON.stringify(class_response));
                    if(class_response.Items.length > 0)
                    {
                        let class_subject_id = class_response.Items[0].class_subject_id;

                        if(class_subject_id.length > 0)
                        {
                            /** FETCH BULK SUBJECT DATA **/
                            subjectRepository.fetchBulkSubjectData(class_subject_id, function (subjectData_err, subjectData_response) {
                                if (subjectData_err) {
                                    console.log(subjectData_err);
                                    callback(subjectData_err, subjectData_response);
                                } else {
                                    console.log("SUBJECT DATA : ", JSON.stringify(subjectData_response));
                                    callback(subjectData_err, subjectData_response.Items);
                                }
                            })
                            /** END FETCH BULK SUBJECT DATA **/
                        }
                        else
                        {
                            console.log("EMPTY SUBJECTS");
                            callback(0, []);
                        }                        
                    }
                    else
                    {
                        console.log("EMPTY UPSCHOOL CLASS RESPONSE");
                        callback(0, []);
                    }
                }
            })
            /** FETCH UPSCHOOL CLASS DATA **/
        }
    })
}

exports.teacherSubjectMapping = function (request, callback) { 
    let subjectList = request.data.subjectList;    
    if(subjectList.length > 0)
    {
        let checkField = ["classSectionId", "subject_id"];
        let findDuplicateMapping = helper.findDuplicateObjectwithSameKeyValue(subjectList, checkField);
        if(findDuplicateMapping.length == 0)
        {
            /** FETCH TEACHER DATA **/
            request.data.user_id = request.data.teacher_id;
            request.data.user_role = "Teacher";
            userRepository.getIndividualUserByRole(request, function (teacher_data_err, teacher_data_res) {
                if (teacher_data_err) {
                    console.log(teacher_data_err);
                    callback(teacher_data_err, teacher_data_res);
                } else {                
                    console.log("TEACHER DETAIL : ", teacher_data_res);
                    if(teacher_data_res.Items.length > 0 && teacher_data_res.Items[0].teacher_info)
                    {
                        let teacherInfo = teacher_data_res.Items[0].teacher_info;
                        let infoToReplace = [];
                        let existInfoCheck = "";
                        let splitedId = ""

                        async function properTeacherInfo(i)
                        {
                            if(i < subjectList.length)
                            {
                                existInfoCheck = "";
                                splitedId = "";

                                splitedId = subjectList[i].classSectionId.split(constant.constValues.splitCharacter);

                                existInfoCheck = teacherInfo.filter(e => e.client_class_id === splitedId[0] && e.section_id === splitedId[1] && e.subject_id === subjectList[i].subject_id);
                                if(existInfoCheck.length == 0)
                                {
                                    infoToReplace.push({
                                        info_id : helper.getRandomString(),
                                        client_class_id : splitedId[0],
                                        section_id : splitedId[1],
                                        subject_id : subjectList[i].subject_id,
                                        info_status : "Active"
                                    });
                                }
                                else
                                {
                                    if(existInfoCheck[0].info_status == "Archived")
                                    {
                                        infoToReplace.push({
                                            info_id : existInfoCheck[0].info_id,
                                            client_class_id : existInfoCheck[0].client_class_id,
                                            section_id : existInfoCheck[0].section_id,
                                            subject_id : existInfoCheck[0].subject_id,
                                            info_status : "Active"
                                        });
                                    }
                                    else
                                    {
                                        infoToReplace.push(existInfoCheck[0]);
                                    }                                    
                                }
                                i++;
                                properTeacherInfo(i);           
                            }
                            else
                            {
                                console.log("AFTER LOOP - TEACHER INFO : ", JSON.stringify(infoToReplace)); 
                                let diffCheckField = ["client_class_id", "section_id", "subject_id"];  
                                let infoDifference = await helper.getDifferenceBetweenTwoArrays(teacherInfo, infoToReplace, diffCheckField);  
                                
                                /** ARCHIVE INFO FUNCTION **/
                                let finalInfoTOReplace = (infoDifference.length > 0) ? await helper.concatTwoInfo(infoToReplace, infoDifference) : infoToReplace; 

                                /** INFO REPLACE **/
                                let infoRequest = {
                                    data : {
                                        teacher_id: request.data.teacher_id,
                                        teacher_info: finalInfoTOReplace
                                    }                                
                                }
                                teacherRepository.updateTeacherInfo(infoRequest, function (updatetechInfo_err, updatetechInfo_res) {
                                    if (updatetechInfo_err) {
                                        console.log(updatetechInfo_err);
                                        callback(updatetechInfo_err, updatetechInfo_res);
                                    } else {
                                        console.log("TEACHER INFO UPDATED!");
                                        callback(0, updatetechInfo_res);
                                    }
                                })
                                /** END INFO REPLACE **/
                            }
                        }
                        properTeacherInfo(0)
                    }
                    else
                    {
                        console.log(constant.messages.TEACHER_SECTION_INFO_ISNOT_EXIST);
                        callback(400, constant.messages.TEACHER_SECTION_INFO_ISNOT_EXIST);
                    }
                }
            })
            /** END FETCH TEACHER DATA **/
        }
        else
        {
            console.log("DUPLICATE SUBJECT MAPPING");
            console.log(JSON.stringify(findDuplicateMapping));
            callback(400, findDuplicateMapping);
        }
    }
    else
    {
        console.log("EMPTY SUBJECT LIST");
        callback(0, 200);
    }
}

exports.getMappedSubjectForTeacher = function (request, callback) { 
    exports.getClassAndSectionOfTeacher(request, (classSectionErr, classSectionData) => {
        if(classSectionErr)
        {
            console.log("ERROR : FETCH CLASS AND SECTION FOR TEACHER");
            callback(classSectionErr, classSectionData);
        }
        else
        {
            console.log("CLASS AND SECTION DATA : ", classSectionData);

            /** FETCH TEACHER DATA **/
            request.data.user_id = request.data.teacher_id;
            request.data.user_role = "Teacher";
            userRepository.getIndividualUserByRole(request, function (teacher_data_err, teacher_data_res) {
                if (teacher_data_err) {
                    console.log(teacher_data_err);
                    callback(teacher_data_err, teacher_data_res);
                } else {                
                    console.log("TEACHER DETAIL : ", teacher_data_res);
                    if(teacher_data_res.Items.length > 0 && teacher_data_res.Items[0].teacher_info)
                    {
                        let teacherInfo = teacher_data_res.Items[0].teacher_info;
                        let classSectionId = "";
                        let checkClassAndSection = "";
                        let mappedSubject = [];
                        let fetchSubjectId = [];

                        function getTeacherSubject(i)
                        {
                            classSectionId = "";
                            checkClassAndSection = "";
                            if(i < teacherInfo.length)
                            {
                                classSectionId = teacherInfo[i].client_class_id + constant.constValues.splitCharacter + teacherInfo[i].section_id;
                                checkClassAndSection = classSectionData.filter(e => e.valueId === classSectionId);

                                if(checkClassAndSection.length > 0 && teacherInfo[i].info_status == "Active")
                                {
                                    mappedSubject.push({
                                        classSectionId : classSectionId,
			                            subject_id : teacherInfo[i].subject_id
                                    });

                                    fetchSubjectId.push(teacherInfo[i].subject_id);
                                }

                                i++;
                                getTeacherSubject(i);
                            }
                            else
                            {
                                /** END OF TEACHER SUBJECT LOOP **/
                                console.log("OVERALL MAPPED SUBJECT FOR TEACHER");
                                console.log(mappedSubject);
                                console.log("SUBJECT ID ARRAY : ",fetchSubjectId);

                                let finalResponse = {
                                    mappedSubject : mappedSubject, 
                                    classSectionList : classSectionData, 
                                    subjectList : []
                                }

                                if(fetchSubjectId.length > 0)
                                {
                                    /** FETCH BULK SUBJECT DATA **/
                                    subjectRepository.fetchBulkSubjectData(fetchSubjectId, function (subjectData_err, subjectData_response) {
                                        if (subjectData_err) {
                                            console.log(subjectData_err);
                                            callback(subjectData_err, subjectData_response);
                                        } else {
                                            console.log("SUBJECT DATA : ", JSON.stringify(subjectData_response));
                                            finalResponse.subjectList = subjectData_response.Items;
                                            callback(subjectData_err, finalResponse);
                                        }
                                    })
                                    /** END FETCH BULK SUBJECT DATA **/
                                }
                                else
                                {
                                    console.log("EMPTY SUBJECTS");
                                    callback(0, finalResponse);
                                }
                                
                                /** END OF TEACHER SUBJECT LOOP **/
                            }
                        }
                        getTeacherSubject(0);
                    }
                    else
                    {
                        console.log(constant.messages.TEACHER_SECTION_INFO_ISNOT_EXIST);
                        callback(400, constant.messages.TEACHER_SECTION_INFO_ISNOT_EXIST);
                    }
                }
            })
            /** END FETCH TEACHER DATA **/
        }
    });
}