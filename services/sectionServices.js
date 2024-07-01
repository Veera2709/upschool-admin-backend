const dynamoDbCon = require('../awsConfig');  
const sectionRepository = require("../repository/sectionRepository");  
const schoolRepository = require("../repository/schoolRepository");  
const constant = require('../constants/constant');
const helper = require('../helper/helper');

exports.addNewSection = function (request, callback) {  
    
    sectionRepository.fetchSectionByClassIdAndName(request, function (fetchSection_err, fetchSection_response) {
        if (fetchSection_err) {
            console.log(fetchSection_err);
            callback(fetchSection_err, fetchSection_response);
        } else {
            console.log("SECTION DATA : ", fetchSection_response);
            if(fetchSection_response.Items.length == 0 )
            {
                sectionRepository.insertNewSection(request, function (insertSection_err, insertSection_response) {
                    if (insertSection_err) {
                        console.log(insertSection_err);
                        callback(insertSection_err, insertSection_response);
                    } else {
                        console.log("Section Added Successfully");
                        callback(insertSection_err, 200);
                    }
                })
            }
            else
            {
                console.log(constant.messages.SECTION_NAME_ALREADY_EXIST);
                callback(400, constant.messages.SECTION_NAME_ALREADY_EXIST);
            }
        }
    })   
}

exports.updateSection = function (request, callback) {  
    
    sectionRepository.fetchSectionByClassIdAndName(request, function (fetchSection_err, fetchSection_response) {
        if (fetchSection_err) {
            console.log(fetchSection_err);
            callback(fetchSection_err, fetchSection_response);
        } else {
            console.log("SECTION DATA : ", fetchSection_response);
            if((fetchSection_response.Items.length > 0) &&  fetchSection_response.Items[0].section_id !==  request.data.section_id)
            {
                console.log(constant.messages.SECTION_NAME_ALREADY_EXIST);
                callback(400, constant.messages.SECTION_NAME_ALREADY_EXIST);                
            }
            else
            {
                sectionRepository.editSection(request, function (editSection_err, editSection_response) {
                    if (editSection_err) {
                        console.log(editSection_err);
                        callback(editSection_err, editSection_response);
                    } else {
                        console.log("Section edited Successfully");
                        callback(editSection_err, 200);
                    }
                })
            }
        }
    })   
}

exports.getSchoolSections = function (request, callback) {  

    schoolRepository.fetchAllClientClassList(request, function (fetch_client_class_err, fetch_client_class_res) {
        if (fetch_client_class_err) {
            console.log(fetch_client_class_err);
            callback(fetch_client_class_err, fetch_client_class_res);
        } else {
            /** FETCH ALL SECTION **/
            sectionRepository.fetchAllSectionBySchoolId(request, function (schoolSectionData_err, schoolSectionData_res) {
                if (schoolSectionData_err) {
                    console.log(schoolSectionData_err);
                    callback(schoolSectionData_err, schoolSectionData_res);
                } else {
                    let getclassName = "";
                    function setClassName(i)
                    {
                        getclassName = "";
                        if(i < schoolSectionData_res.Items.length)
                        {
                            getclassName = fetch_client_class_res.Items.filter(e => e.client_class_id === schoolSectionData_res.Items[i].client_class_id);
                            
                            schoolSectionData_res.Items[i].client_class_name = (getclassName.length > 0) ? getclassName[0].client_class_name : "";
                            
                            i++;
                            setClassName(i);
                        }
                        else
                        {
                            console.log("SECTION LIST : ", schoolSectionData_res.Items);
                            callback(0, schoolSectionData_res);
                        }
                    }
                    setClassName(0);                    
                }
            });   
            /** END FETCH ALL SECTION **/
        }   
    });   
 
}

exports.getSectionById = function (request, callback) {  

    sectionRepository.getSectionDetailsById(request, async function (fetch_individual_section_err, fetch_individual_section_response) {
        if (fetch_individual_section_err) {
            console.log(fetch_individual_section_err);
            callback(fetch_individual_section_err, fetch_individual_section_response);
        } else {
            console.log("SECTION : ", fetch_individual_section_response);
            callback(fetch_individual_section_err, fetch_individual_section_response);
        }
    })
 
}

exports.getSectionByClientClassId = function (request, callback) {  

    sectionRepository.fetchSectionByClientClassId(request, async function (ClientSection_err, ClientSection_response) {
        if (ClientSection_err) {
            console.log(ClientSection_err);
            callback(ClientSection_err, ClientSection_response);
        } else {
            console.log("CLIENT CLASS SECTION : ", ClientSection_response);
            callback(ClientSection_err, ClientSection_response);
        }
    })
 
}