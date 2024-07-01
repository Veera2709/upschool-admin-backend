const fs = require("fs");
const dynamoDbCon = require('../awsConfig');  
const digicardRepository = require("../repository/digicardRepository");  
const conceptRepository = require("../repository/conceptRepository"); 
const teacherRepository = require("../repository/teacherRepository");
const presetRepository = require("../repository/presetRepository");   
const commonServices = require("../services/commonServices");
const constant = require('../constants/constant');
const helper = require('../helper/helper');
const { nextTick } = require("process");
const { response } = require("express");
const { log } = require("console");
const req = require("express/lib/request");

exports.addDigiCard = function (request, callback) {

    // var relatedDigicardArr = request.data.related_digi_cards; 
    // var keywordDigicardArr = request.data.digi_card_keywords; 
    // var digicardImage = request.data.digicard_image; 
    // let digicardName = request.data.digi_card_title; 
    // // digicardExtension = (digicardImage.split('.'))[(digicardImage.split('.')).length - 1]; 
    // // if(digicardExtension === "jpg" || digicardExtension === "jpeg" || digicardExtension === "png" ? "" : callback(501, constant.messages.INVALID_DIGICARD_IMAGE));
    // digicardName === '' || digicardName === null || digicardName === undefined ? callback(502, constant.messages.INVALID_DIGICARD_TITLE) : "" 
    // digicardImage === '' || digicardImage === null || digicardImage === undefined ? callback(503, constant.messages.INVALID_DIGICARD_IMAGE) : "" 
    // // digi_card_id Validation : 
    // Array.isArray(relatedDigicardArr) && relatedDigicardArr.length > 0 ? relatedDigicardArr.forEach(element => { element === '' || element === null || element === undefined ?  callback(504, constant.messages.NO_DIGICARD_TO_DELETE) : '' }) : ""; 
    // Array.isArray(keywordDigicardArr) && keywordDigicardArr.length > 0 ? keywordDigicardArr.forEach(element => { element === '' || element === null || element === undefined ?  callback(505, constant.messages.NO_DIGICARD_TO_DELETE) : '' }) : ""; 
     
    digicardRepository.fetchDigicardDataByName(request, async function (fetch_digicard_err, fetch_digicard_response) {
        if (fetch_digicard_err) {
            console.log("---", fetch_digicard_err);
            callback(fetch_digicard_err, fetch_digicard_response);
        } else {

            if (fetch_digicard_response.Items.length === 0) {
          
                let imageUrl = [];
                if (!(request.data.digicard_image.includes("uploads/")) && request.data.digicard_image !== "") {
                    if (request.data.digicard_image) {

                        let digiCardURL  = await helper.PutObjectS3SigneUdrl(request.data.digicard_image, "uploads"); 

                        imageUrl.push({ "digicard_image": digiCardURL.uploadURL });
                        request.data["digicard_image"] = digiCardURL.Key;
                    }
                }
                if (!(request.data.digicard_voice_note.includes("uploads/")) && request.data.digicard_voice_note !== "") {
                    if (request.data.digicard_voice_note) {

                        let digiCardURL  = await helper.PutObjectS3SigneUdrl(request.data.digicard_voice_note, "uploads"); 

                        imageUrl.push({ "digicard_voice_note": digiCardURL.uploadURL });
                        request.data["digicard_voice_note"] = digiCardURL.Key;
                    }
                }
                if (!(request.data.digicard_document.includes("uploads/")) && request.data.digicard_document !== "") {
                    if (request.data.digicard_document) {

                        let digiCardURL  = await helper.PutObjectS3SigneUdrl(request.data.digicard_document, "uploads"); 
                       
                        imageUrl.push({ "digicard_document": digiCardURL.uploadURL });
                        request.data["digicard_document"] = digiCardURL.Key;
                    }
                }

                    /** FETCH USER BY EMAIL **/
                    digicardRepository.insertDigiCard(request, function (insert_digicard_err, insert_digicard_response) {
                        if (insert_digicard_err) {
                            console.log(insert_digicard_err);
                            callback(insert_digicard_err, insert_digicard_response);
                        } else {
                            console.log("DigiCard Added Successfully");
                            callback(0, imageUrl);
                        }
                    })
            } else {
                console.log("Its here :");
                console.log("DigiCard Name Already Exists");
                callback(401, constant.messages.DIGICARD_NAME_ALREADY_EXISTS);
            }
        }
    })
}
exports.fetchIndividualDigiCard = async function (request, callback) {
    /** FETCH USER BY EMAIL **/
    digicardRepository.fetchDigiCardByID(request, async function (single_digicard_err, single_digicard_response) {
        if (single_digicard_err) {
            console.log(single_digicard_err);
            callback(single_digicard_err, single_digicard_response);
        } else {
            if (single_digicard_response.Items.length > 0) {

                let digiContent = (single_digicard_response.Items[0].digi_card_content === undefined) ? "" : single_digicard_response.Items[0].digi_card_content;

                console.log("DIGI CONTENT : ", digiContent);
                /** SET PRESETS **/
                presetRepository.getAllPresets(request, async function (presetData_err, presetData_res) {
                    if (presetData_err) {
                        console.log(presetData_err);
                        callback(presetData_err, presetData_res);
                    } else {

                        console.log("PRESET DATA : ", presetData_res);

                        let openTag = "";
                        let closeTag = "</p></div>";
                        let replaceCondition;
                        async function checkAndSetPreset(k)
                        {
                            if(k < presetData_res.Items.length)
                            {
                                if(digiContent.includes(presetData_res.Items[k].preset_markup))
                                {
                                    openTag = "<div style = '";
                                    openTag += presetData_res.Items[k].preset_bg_style +"'><span style='" + presetData_res.Items[k].preset_heading_style + "'>" + presetData_res.Items[k].preset_heading + "</span><br><p style='" + presetData_res.Items[k].preset_content_style + "'>";

                                    replaceCondition = new RegExp(`${presetData_res.Items[k].preset_markup}(.*?)${presetData_res.Items[k].preset_markup}`, "g");

                                    digiContent = digiContent.replace(replaceCondition, openTag+"$1"+closeTag);
                                }

                                k++;
                                checkAndSetPreset(k);
                            }
                            else
                            {
                                /** END PRESET LOOP **/
                                console.log("PREVIEW DIGICARD : ", digiContent);
                                single_digicard_response.Items[0].preview_content = digiContent;

                                if (single_digicard_response.Items[0].digicard_image && single_digicard_response.Items[0].digicard_image !== "" && single_digicard_response.Items[0].digicard_image !== "N.A." && single_digicard_response.Items[0].digicard_image.includes("uploads/")) 
                                {
                                    single_digicard_response.Items[0].digicard_imageURL = await helper.getS3SignedUrl(single_digicard_response.Items[0].digicard_image);
                                }
                                if (single_digicard_response.Items[0].digicard_voice_note && single_digicard_response.Items[0].digicard_voice_note !== "" && single_digicard_response.Items[0].digicard_voice_note !== "N.A." && single_digicard_response.Items[0].digicard_voice_note.includes("uploads/")) 
                                {
                                    single_digicard_response.Items[0].digicard_voice_noteURL = await helper.getS3SignedUrl(single_digicard_response.Items[0].digicard_voice_note);
                                }
                                if (single_digicard_response.Items[0].digicard_document && single_digicard_response.Items[0].digicard_document !== "" && single_digicard_response.Items[0].digicard_document !== "N.A." && single_digicard_response.Items[0].digicard_document.includes("uploads/")) 
                                {
                                    single_digicard_response.Items[0].digicard_documentURL = await helper.getS3SignedUrl(single_digicard_response.Items[0].digicard_document);
                                }

                                /** END PRESET LOOP **/
                                   // Voice Inputs into Icon as Play 
                                let digi_card_content = `<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">` + single_digicard_response.Items[0].preview_content;

                                const toReplace = /##audio##(.*?)##audio##/
                                let j = 0; 
                                if(digi_card_content != undefined && digi_card_content != ""){
                                    let spliArray = digi_card_content.split("##audio##"); 
                                    console.log("spliArray : ", spliArray);
                                    
                                    spliArray.forEach((e, i) => {
                                        console.log("e : ", JSON.stringify(e), JSON.stringify(e).includes("http") && e[0] === "h");
                                        if(JSON.stringify(e).includes("http") && e[0] === "h"){
                                            
                                            digi_card_content = digi_card_content.replace(toReplace, '<i id="itag'+ j +'" class="fa fa-volume-up" onclick="document.getElementById('+"\'audio"+""+j+'\').play()" alt="Play"><audio id="audio'+ j +'" src="$1"></audio></i>');
                                            j++;
                                        }
                                    })
                                }
                                
                                single_digicard_response.Items[0].preview_content = digi_card_content;
                                callback(0, single_digicard_response);
                                
                            }
                        }
                        checkAndSetPreset(0)
                    }
                })
                /** END SET PRESETS **/              
            } else {
                callback(0, single_digicard_response);
            }


        }
    })
}

exports.editDigiCard = function (request, callback) {
    console.log("---", request);

    digicardRepository.fetchDigiCardByID(request, async function (fetch_digicard_err, fetch_digicard_response) {
        if (fetch_digicard_err) {
            console.log(fetch_digicard_err);
            callback(fetch_digicard_err, fetch_digicard_response);
        } else {
            console.log("0");
            console.log("---", fetch_digicard_response);

            if (fetch_digicard_response.Items.length > 0) {
                /** CHECK FOR DUPLICATE **/
                        console.log("1");
                        if (fetch_digicard_response.Items[0].digi_card_id !== request.data.digi_card_id) {
                            console.log("Digicard Name Already Exist");
                            callback(400, constant.messages.DIGICARD_NAME_ALREADY_EXISTS);
                        }
                        else
                        {
                        console.log("2");

                            let imageUrl = [];
                            
                            if ((!(request.data.digicard_image.includes("uploads/"))) && request.data.digicard_voice_note !== "") {

                                let digiCardURL  = await helper.PutObjectS3SigneUdrl(request.data.digicard_image, "uploads"); 
                                imageUrl.push({ "digicard_image": digiCardURL.uploadURL });
                                request.data["digicard_image"] = digiCardURL.Key;
                            }
                            else
                            {
                                request.data["digicard_image"] = fetch_digicard_response.Items[0].digicard_image;                    

                            }

                            if (!(request.data.digicard_voice_note.includes("uploads/")) && request.data.digicard_voice_note !== "") {
                                if (request.data.digicard_voice_note) {
                                    
                                let digiCardURL  = await helper.PutObjectS3SigneUdrl(request.data.digicard_voice_note, "uploads"); 
                                imageUrl.push({ "digicard_voice_note": digiCardURL.uploadURL });
                                request.data["digicard_voice_note"] = digiCardURL.Key;
                                }
                            }
                            else
                            {
                                request.data["digicard_voice_note"] = fetch_digicard_response.Items[0].digicard_voice_note;                    
                            }
                            if (!(request.data.digicard_document.includes("uploads/")) && request.data.digicard_document !== "") {
                                if (request.data.digicard_document) {

                                    let digiCardURL  = await helper.PutObjectS3SigneUdrl(request.data.digicard_document, "uploads"); 
                                    imageUrl.push({ "digicard_document": digiCardURL.uploadURL });
                                    request.data["digicard_document"] = digiCardURL.Key;
                                }
                            }
                            else
                            {
                                request.data["digicard_document"] = fetch_digicard_response.Items[0].digicard_document;                    
                            }
                            
                            digicardRepository.updateDigiCard(request, function (update_digicard_err, update_digicard_response) {
                                if (update_digicard_err) {
                                    console.log(update_digicard_err);
                                    callback(update_digicard_err, update_digicard_response);
                                } else {
                                    callback(0, imageUrl);
                                }
                            });
                            // }    
                        }
                /** END CHECK FOR DUPLICATE **/                            
            }
            else
            {
                console.log("No Digicard Data");
                callback(400, constant.messages.NO_DATA);
            }
        }
    })
}
exports.toggleDigiCardStatus = function (request, callback) {
    let digi_card_id = request.data.digi_card_id;

        digicardRepository.checkForExistence(digi_card_id, function (existance_digicard_err, existance_digicard_response) {
            if (existance_digicard_err) {
                console.log(existance_digicard_err);
                callback(existance_digicard_err, existance_digicard_response);
            } else {

                console.log("existance_digicard_response : ", existance_digicard_response.Items.length);
                if(existance_digicard_response.Items.length === 0){
                    callback(400, constant.messages.NO_DIGICARD_TO_DELETE);
                } else { 
                    if(request.data.digicard_status == "Archived")
                    {
                        request.data.concept_status = "Active";
                        conceptRepository.getConceptBasedOnStatus(request, function (get_concept_err, get_concept_res) {
                            if (get_concept_err) {
                                console.log(get_concept_err);
                                callback(get_concept_err, get_concept_res);
                            } else {        
                                console.log("CONCEPTS : ", get_concept_res);

                                /** CHECK FOR MAPPTING **/
                                let checkMapPayload = {
                                    arrayToCheck: get_concept_res.Items,
                                    fieldToCheck: ["concept_digicard_id"],
                                    checkId: request.data.digi_card_id,
                                    fieldToPrint: "concept_title"
                                };

                                commonServices.CheckDataMapping(checkMapPayload, function (mapping_err, mapping_res) {
                                    if (mapping_err) {
                                        console.log(mapping_err);
                                        callback(mapping_err, mapping_res);
                                    } else {
                                        console.log("MAPPING CHECK RESPONSE : ", mapping_res);
                                        if(mapping_res.length == 0)
                                        {
                                            digicardRepository.changeDigiCardStatus(request, function (delete_digicard_err, delete_digicard_response) {
                                                if (delete_digicard_err) {
                                                    console.log(delete_digicard_err);
                                                    callback(delete_digicard_err, delete_digicard_response);
                                                } else {
                                                    console.log("DigiCard status changed Successfully"); 
                                                    callback(0, 200);
                                                }
                                            });
                                        }
                                        else 
                                        {
                                            console.log(constant.messages.UNABLE_TO_DELETE_THE_DIGICARD.replace("**REPLACE**", mapping_res));
                                            callback(400, constant.messages.UNABLE_TO_DELETE_THE_DIGICARD.replace("**REPLACE**", mapping_res));
                                        }
                                    }
                                });
                                /** END CHECK FOR MAPPTING **/
                            }
                        })
                    }
                    else
                    {
                        digicardRepository.changeDigiCardStatus(request, function (delete_digicard_err, delete_digicard_response) {
                            if (delete_digicard_err) {
                                console.log(delete_digicard_err);
                                callback(delete_digicard_err, delete_digicard_response);
                            } else {
                                console.log("DigiCard status changed Successfully"); 
                                callback(0, 200);
                            }
                        });
                    }                    
                }
            }
        });
}


exports.fetchDigiCardsBasedonStatus = function (request, callback) {
    /** FETCH USER BY EMAIL **/
    digicardRepository.fetchDigiCardsListBasedonStatus(request, function (fetch_all_digicard_err, fetch_all_digicard_response) {
        if (fetch_all_digicard_err) {
            console.log(fetch_all_digicard_err);
            callback(fetch_all_digicard_err, fetch_all_digicard_response);
        } else {

            async function appendUrlS3(i)
            {   
                if(i < fetch_all_digicard_response.Items.length)
                {
                    if(fetch_all_digicard_response.Items[i].digicard_image && fetch_all_digicard_response.Items[i].digicard_image !== "N.A." && fetch_all_digicard_response.Items[i].digicard_image != "" && fetch_all_digicard_response.Items[i].digicard_image.includes("uploads/"))
                    {
                        fetch_all_digicard_response.Items[i].digicard_imageURL = await helper.getS3SignedUrl(fetch_all_digicard_response.Items[i].digicard_image);

                        i++;
                        appendUrlS3(i);
                    }
                    else
                    {
                        fetch_all_digicard_response.Items[i].digicard_imageURL = "N.A.";
                        i++;
                        appendUrlS3(i);
                    }
                }
                else
                {
                    console.log("fetch_all_digicard_response.Items.length : ", fetch_all_digicard_response.Items.length);
                    callback(0, fetch_all_digicard_response);
                }
            }
            appendUrlS3(0);

        }
    })
}

exports.fetchDigiIdAndName = function (request, callback) {
    digicardRepository.fetchIdAndNameOfDigicards(request, function (get_digi_idName_err, get_digi_idName_response) {
        if (get_digi_idName_err) {
            console.log(get_digi_idName_err);
            callback(get_digi_idName_err, get_digi_idName_response);
        } else {
            callback(0, get_digi_idName_response);
        }
    })
}

exports.multiDigiCardToggleStatus = async function (request, callback) {

    let digicards_cant_delete = ""; 
    if(request.data.digicard_status === "Active" || request.data.digicard_status === "Archived"){
        if(request.data.digi_card_array.length > 0) 
        {
            digicardRepository.fetchDigiCardData({digi_card_array: request.data.digi_card_array}, function (digi_card_data_err, digi_card_data_res) { 
                if (digi_card_data_err) {
                    console.log(digi_card_data_err);
                    callback(digi_card_data_err, digi_card_data_res);
                } else {
                    let activeData = [];
    
                    if(digi_card_data_res.Items.length > 0)
                    {
                        request.data.concept_status = "Active"; 
                        conceptRepository.getConceptBasedOnStatus(request, function (get_concept_err, get_concept_res) {
                            if (get_concept_err) {
                                console.log(get_concept_err);
                                callback(get_concept_err, get_concept_res);
                            } else {        
                                function changeDigiCardStatus(i)
                                {
                                    if(i < digi_card_data_res.Items.length)
                                    {
                                        if(request.data.digicard_status === "Archived"){
                                        
                                            /** CHECK FOR MAPPTING **/
                                            let checkMapPayload = { 
                                                arrayToCheck: get_concept_res.Items,
                                                fieldToCheck: "concept_digicard_id",
                                                checkId: digi_card_data_res.Items[i].digi_card_id,
                                                fieldToPrint: "concept_title"
                                            };
    
                                            commonServices.CheckForMappings(checkMapPayload, function (mapping_err, mapping_res) {
                                                if (mapping_err) {
                                                    console.log(mapping_err);
                                                    callback(mapping_err, mapping_res);
                                                } else {
                                                    
                                                    if(mapping_res.length == 0 || mapping_res === "")
                                                    {
                                                        console.log("No Mapping : ", digi_card_data_res.Items[i].digi_card_id);
                                                        digi_card_data_res.Items[i].digicard_status = request.data.digicard_status;
                                                        activeData.push(digi_card_data_res.Items[i])
                                                    }
                                                    else
                                                    {
                                                        (i == digi_card_data_res.Items.length - 1) ? 
                                                        digicards_cant_delete += digi_card_data_res.Items[i].digi_card_title : digicards_cant_delete += digi_card_data_res.Items[i].digi_card_title + ", "
                                                    }
                                                }
                                            });
                                            /** END CHECK FOR MAPPTING **/
                                        } else { 
                                            digi_card_data_res.Items[i].digicard_status = request.data.digicard_status;
                                            activeData.push(digi_card_data_res.Items[i])
                                        }
                                        i++;
                                        changeDigiCardStatus(i);
                                    }
                                    else
                                    {
                                        /** BULK UPDATE **/
                                        digicardRepository.changeMultipleDigiCardStatus(activeData, function (updateBulkData_err, updateBulkData_res) {
                                            if (updateBulkData_err) {
                                                console.log("ERROR : TOGGLE BULK DIGICARDS DATA");
                                                console.log(updateBulkData_err);
                                            } else {
                                                console.log("BULK DIGICARDS STATUS UPDATED!");
                                                digicards_cant_delete.endsWith(", ") && (digicards_cant_delete = digicards_cant_delete.substring(0, digicards_cant_delete.length-2))
                                                // Check digicards_cant_delete length and Include digicard Titles in the response 
                                                if(digicards_cant_delete.length === 0 || digicards_cant_delete === ""){ 
    
                                                    console.log(updateBulkData_res);
                                                    callback(0, 200);
    
                                                } else {
                                                    console.log(constant.messages.UNABLE_TO_DELETE_MULTIPLE_DIGICARDS.replace("**REPLACE**", digicards_cant_delete)); 
                                                    callback(400, constant.messages.UNABLE_TO_DELETE_MULTIPLE_DIGICARDS.replace("**REPLACE**", digicards_cant_delete)); 
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
        callback(401, constant.messages.INVALID_DIGICARD_STATUS);
    }
	
}
