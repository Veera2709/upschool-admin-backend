const questionRepository = require("../repository/questionRepository");  
const groupRepository = require("../repository/groupRepository");
const commonServices = require("../services/commonServices");
const conceptRepository = require("../repository/conceptRepository");  
const constant = require('../constants/constant');
const helper = require('../helper/helper');

exports.addNewQuestion = async function (request, callback) {    
    console.log("INITIAL REQUEST : ", JSON.stringify(request));

    /** FETCH QUESTION BY LABEL **/
    questionRepository.fetchQuestionByLabel(request, async function (questionLabelData_err, questionLabelData_response) {
        if (questionLabelData_err) {
            console.log(questionLabelData_err);
            callback(questionLabelData_err, questionLabelData_response);
        } else {
            if(questionLabelData_response.Items.length > 0)
            {
                console.log(constant.messages.QUESTION_LABEL_ALREADY_EXIST)
                callback(400, constant.messages.QUESTION_LABEL_ALREADY_EXIST)
            }
            else
            {
                let responseToSend = {
                    question_voice_note : [],
                    answers_options : []
                };
                let answersFilesS3 = "";
                let answerPayload = JSON.parse(JSON.stringify(request.data.answers_of_question)); 
                let questionVoiceNote = request.data.question_voice_note;
            
                if (!(questionVoiceNote.includes("question_uploads/")))
                {
                    let voiceNotesUrl = (questionVoiceNote != "" && questionVoiceNote != "N.A.") ? await helper.PutObjectS3SigneUdrl(questionVoiceNote, "question_uploads") : "N.A.";
                    request.data.question_voice_note = (voiceNotesUrl == "N.A.") ? voiceNotesUrl : voiceNotesUrl.Key;
                    if(voiceNotesUrl != "N.A.")
                    {
                        responseToSend.question_voice_note.push({file_name : questionVoiceNote, s3Url : voiceNotesUrl.uploadURL});
                    }
                }    
            
                async function getAnswerFilesUrl(i)
                {
                    answersFilesS3 = "";
                    if(i < answerPayload.length)
                    {
                        if(answerPayload[i].answer_type == "Image" || answerPayload[i].answer_type == "Audio File")
                        {
                            if((!(JSON.stringify(answerPayload[i].answer_content).includes("question_uploads/"))) && answerPayload[i].answer_content != "" && answerPayload[i].answer_content != "N.A.")
                            {
                                answersFilesS3 = await helper.PutObjectS3SigneUdrl(answerPayload[i].answer_content, "question_uploads");
                                request.data.answers_of_question[i].answer_content = answersFilesS3.Key;
                                responseToSend.answers_options.push({file_name : answerPayload[i].answer_content, s3Url : answersFilesS3.uploadURL});
                            }   
                        }                                     
        
                        i++;
                        getAnswerFilesUrl(i);
                    }
                    else
                    {
                        console.log("FIANL REQUEST(S3) : ", JSON.stringify(request));
                        console.log({responseToSend});
                        /** INSERT NEW QUESTION **/
                        questionRepository.insertnewQuestion(request, function (insertQuestion_err, insertQuestion_response) {
                            if (insertQuestion_err) {
                                console.log(insertQuestion_err);
                                callback(insertQuestion_err, insertQuestion_response);
                            } else {
                                console.log("Question Added Successfully");
                                callback(0, responseToSend);
                            }
                        })
                        /** END INSERT NEW QUESTION **/
                    }
                }
                getAnswerFilesUrl(0);
            }
        }
    })
    /** END FETCH QUESTION BY LABEL **/    
}

exports.getAllQuestionsData = function (request, callback) {    
    if(request.data.questions_type === "preOrPost"){
        questionRepository.fetchPreorPostQuestionsBasedOnStatus(request, function (fetch_pre_and_post_err, fetch_pre_and_post_res) {
            if (fetch_pre_and_post_err) {
                console.log(fetch_pre_and_post_err);
                callback(fetch_pre_and_post_err, fetch_pre_and_post_res);
            } else {
                callback(fetch_pre_and_post_err, fetch_pre_and_post_res);
            }
        })
    }else if(request.data.questions_type === "worksheetOrTest"){
        questionRepository.fetchworksheetOrTestQuestionsBasedOnStatus(request, function (fetch_worksheet_and_test_err, fetch_worksheet_and_test_res) {
            if (fetch_worksheet_and_test_err) {
                console.log(fetch_worksheet_and_test_err);
                callback(fetch_worksheet_and_test_err, fetch_worksheet_and_test_res);
            } else {
                callback(fetch_worksheet_and_test_err, fetch_worksheet_and_test_res);
            }
        })
    }else if(request.data.questions_type === "All"){ 
        questionRepository.fetchAllQuestionsBasedonStatus(request, function (fetch_worksheet_and_test_err, fetch_worksheet_and_test_res) { 
            if (fetch_worksheet_and_test_err) {
                console.log(fetch_worksheet_and_test_err);
                callback(fetch_worksheet_and_test_err, fetch_worksheet_and_test_res);
            } else {
                callback(fetch_worksheet_and_test_err, fetch_worksheet_and_test_res);
            }
        })
    }else{
        callback(400, constant.messages.INVALID_REQUEST_FORMAT); 
    }
  
}

exports.getIndividualQuestionData = function (request, callback) {    
    questionRepository.fetchQuestionById(request, async function (fetch_question_err, fetch_question_res) {
        if (fetch_question_err) {
            console.log(fetch_question_err);
            callback(fetch_question_err, fetch_question_res);
        } else {
            if(fetch_question_res.Items.length > 0)
            {
                let questionVoiceNote = fetch_question_res.Items[0].question_voice_note;
                fetch_question_res.Items[0].question_voice_note_url = (questionVoiceNote.includes("question_uploads/")) ? await helper.getS3SignedUrl(questionVoiceNote) : "N.A.";
                
                async function getAnswerS3Url(i)
                {
                    if(i < fetch_question_res.Items[0].answers_of_question.length)
                    {
                        let answerContent = fetch_question_res.Items[0].answers_of_question[i].answer_content;
                        console.log("answerContent", answerContent);
                        console.log("fetch_question_res.Items[0].answers_of_question[i].answer_content_url : ", fetch_question_res.Items[0].answers_of_question[i].answer_content_url);
                        
                        fetch_question_res.Items[0].answers_of_question[i].answer_content_url = (JSON.stringify(answerContent).includes("question_uploads/")) ? await helper.getS3SignedUrl(answerContent) : "N.A.";
                        i++;
                        getAnswerS3Url(i);
                    }
                    else
                    {
                        console.log("QUESTION DATA : ", fetch_question_res);
                        callback(fetch_question_err, fetch_question_res);
                    }
                }
                getAnswerS3Url(0);
            }
            else
            {
                callback(fetch_question_err, fetch_question_res);
            }           

        }
    })
}

exports.updateQuestion = async function (request, callback) {  
    console.log("EDIT INITIAL REQUEST : ", JSON.stringify(request));

    /** FETCH QUESTION DATA **/
    questionRepository.fetchQuestionByLabel(request, async function (fetch_question_err, fetch_question_res) {
        if (fetch_question_err) {
            console.log(fetch_question_err);
            callback(fetch_question_err, fetch_question_res);
        } else {
            if(fetch_question_res.Items.length > 0 && fetch_question_res.Items[0].question_id !== request.data.question_id)
            {
                console.log(constant.messages.QUESTION_LABEL_ALREADY_EXIST)
                callback(400, constant.messages.QUESTION_LABEL_ALREADY_EXIST)
            }
            else
            {
                let responseToSend = {
                    question_voice_note : [],
                    answers_options : []
                };
                let answersFilesS3 = "";
                let answerPayload = JSON.parse(JSON.stringify(request.data.answers_of_question)); 
                let questionVoiceNote = request.data.question_voice_note;
            
                if (!(questionVoiceNote.includes("question_uploads/")))
                {
                    let voiceNotesUrl = (questionVoiceNote && questionVoiceNote != "" && questionVoiceNote != "N.A.") ? await helper.PutObjectS3SigneUdrl(questionVoiceNote, "question_uploads") : "N.A.";
                    request.data.question_voice_note = (voiceNotesUrl == "N.A.") ? voiceNotesUrl : voiceNotesUrl.Key;
                    if(voiceNotesUrl != "N.A.")
                    {
                        responseToSend.question_voice_note.push({file_name : questionVoiceNote, s3Url : voiceNotesUrl.uploadURL});
                    }
                }    
            
                async function getAnswerFilesUrl(i)
                {
                    answersFilesS3 = "";
                    if(i < answerPayload.length)
                    {
                        if(answerPayload[i].answer_type == "Image" || answerPayload[i].answer_type == "Audio File")
                        {
                            if((!(JSON.stringify(answerPayload[i].answer_content).includes("question_uploads/"))) && answerPayload[i].answer_content != "" && answerPayload[i].answer_content != "N.A.")
                            {
                                answersFilesS3 = await helper.PutObjectS3SigneUdrl(answerPayload[i].answer_content, "question_uploads");
                                request.data.answers_of_question[i].answer_content = answersFilesS3.Key;
                                responseToSend.answers_options.push({file_name : answerPayload[i].answer_content, s3Url : answersFilesS3.uploadURL});
                            }  
                        }                                 
        
                        i++;
                        getAnswerFilesUrl(i);
                    }
                    else
                    {
                        console.log("EDIT FIANL REQUEST(S3) : ", JSON.stringify(request));
                        console.log({responseToSend});
                        /** UPDATE QUESTION **/
                        questionRepository.editQuestion(request, function (editQuestion_err, editQuestion_response) {
                            if (editQuestion_err) {
                                console.log(editQuestion_err);
                                callback(editQuestion_err, editQuestion_response);
                            } else {
                                console.log("Question Updated Successfully");
                                callback(0, responseToSend);
                            }
                        })
                        /** END UPDATE QUESTION **/
                    }
                }
                getAnswerFilesUrl(0);
            }
        }
    })
    /** END FETCH QUESTION DATA **/    
}

exports.deleteRestoreQuestion = function (request, callback) {    
    
    /** FETCH QUESTION DATA **/
    questionRepository.fetchQuestionById(request, async function (fetch_question_err, fetch_question_res) {
        if (fetch_question_err) {
            console.log(fetch_question_err);
            callback(fetch_question_err, fetch_question_res);
        } else {
            if(fetch_question_res.Items[0].question_status === "Publish" && request.data.question_active_status === "Archived") // condition can be changed based on roles
            {
                console.log(constant.messages.PUBLISHED_QUESTION_CANT_BE_DELETED);
                callback(400, constant.messages.PUBLISHED_QUESTION_CANT_BE_DELETED);
            }
            else
            {
                if(fetch_question_res.Items[0].question_status === "Publish" && request.data.question_active_status === "Archived") // more question status can be added
                {
                    if(fetch_question_res.Items[0].appears_in && fetch_question_res.Items[0].appears_in === constant.questionKeys.preOrPost)
                    {
                        /** ARCHIVE PREPOST QUESTION **/
                        /** FETCH ALL ACTIVE GROUP **/
                        request.data.group_status = "Active"
                        groupRepository.fetchGroupBasedOnStatus(request, function (groupData_err, groupData_res) {
                            if (groupData_err) {
                                console.log(groupData_err);
                                callback(groupData_err, groupData_res);
                            } else {
                                console.log("ACTIVE GROUP DATA : ", groupData_res);

                                /** CHECK FOR MAPPTING **/
                                let checkMapPayload = {
                                    arrayToCheck: groupData_res.Items,
                                    fieldToCheck: ["group_question_id"],
                                    checkId: request.data.question_id,
                                    fieldToPrint: "group_name"
                                };

                                commonServices.CheckDataMapping(checkMapPayload, function (mapping_err, mapping_res) {
                                    if (mapping_err) {
                                        console.log(mapping_err);
                                        callback(mapping_err, mapping_res);
                                    } else {
                                        console.log("MAPPING CHECK RESPONSE : ", mapping_res);
                                        if(mapping_res.length == 0)
                                        {
                                            questionRepository.toggleQuestionStatus(request, function (toggleQuestion_err, toggleQuestion_res) {
                                                if (toggleQuestion_err) {
                                                    console.log(toggleQuestion_err);
                                                    callback(toggleQuestion_err, toggleQuestion_res);
                                                } else {
                                                    callback(toggleQuestion_err, toggleQuestion_res);
                                                }
                                            })
                                        }
                                        else
                                        {
                                            console.log(constant.messages.UNABLE_TO_DELETE_THE_QUESTION.replace("**REPLACE**", mapping_res));
                                            callback(400, constant.messages.UNABLE_TO_DELETE_THE_QUESTION.replace("**REPLACE**", mapping_res));
                                        }
                                    }
                                });
                                /** END CHECK FOR MAPPTING **/
                            }
                        })
                        /** END FETCH ACTIVE GROUP **/
                        /** END ARCHIVE PREPOST QUESTION **/
                    }
                    else
                    {
                        /** ARCHIVE WORKSHEET QUESTION **/
                            /** FETCH ALL CONCEPT **/
                            request.data.concept_status = "Active";
                            conceptRepository.getConceptBasedOnStatus(request, function (get_concept_err, get_concept_res) {
                                if (get_concept_err) {
                                    console.log(get_concept_err);
                                    callback(get_concept_err, get_concept_res);
                                } else {        
                                    console.log("CONCEPTS DATA : ", get_concept_res);

                                    /** CHECK FOR MAPPTING **/
                                    let checkQuesMap = {
                                        arrayToCheck: get_concept_res.Items,
                                        fieldToCheck: ["concept_question_id"],
                                        checkId: request.data.question_id,
                                        fieldToPrint: "concept_title"
                                    };  

                                    commonServices.CheckDataMapping(checkQuesMap, function (conMapping_err, conMapping_res) {
                                        if (conMapping_err) {
                                            console.log(conMapping_err);
                                            callback(conMapping_err, conMapping_res);
                                        } else {
                                            console.log("QUESTION CONCEPT MAPPING CHECK RESPONSE : ", conMapping_res);
                                            if(conMapping_res.length == 0)
                                            {
                                                questionRepository.toggleQuestionStatus(request, function (toggleQuestion_err, toggleQuestion_res) {
                                                    if (toggleQuestion_err) {
                                                        console.log(toggleQuestion_err);
                                                        callback(toggleQuestion_err, toggleQuestion_res);
                                                    } else {
                                                        callback(toggleQuestion_err, toggleQuestion_res);
                                                    }
                                                })
                                            }
                                            else
                                            {
                                                console.log(constant.messages.UNABLE_TO_DELETE_THE_WORKSHEET_QUESTION.replace("**REPLACE**", conMapping_res));
                                                callback(400, constant.messages.UNABLE_TO_DELETE_THE_WORKSHEET_QUESTION.replace("**REPLACE**", conMapping_res));
                                            }
                                        }
                                    });
                                }
                            })
                            /** END FETCH ALL CONCEPT **/
                        /** END ARCHIVE WORKSHEET QUESTION **/
                    }                    
                }
                else
                {
                    questionRepository.toggleQuestionStatus(request, function (toggleQuestion_err, toggleQuestion_res) {
                        if (toggleQuestion_err) {
                            console.log(toggleQuestion_err);
                            callback(toggleQuestion_err, toggleQuestion_res);
                        } else {
                            callback(toggleQuestion_err, toggleQuestion_res);
                        }
                    })
                }
            }
        }
    })
    /** END FETCH QUESTION DATA **/    
}

exports.multiToggleQuestionStatus = async function (request, callback) {

    let questions_cant_delete = ""; 
    if(request.data.question_active_status === "Active" || request.data.question_active_status === "Archived"){
        if(request.data.question_array.length > 0) 
        {
            questionRepository.fetchQuestionData({question_array: request.data.question_array}, function (question_data_err, question_data_res) { 
                if (question_data_err) {
                    console.log(question_data_err);
                    callback(question_data_err, question_data_res);
                } else {
                    let activeData = [];
    
                    if(question_data_res.Items.length > 0)
                    {
                        request.data.group_status = "Active"; 
                        groupRepository.fetchGroupBasedOnStatus(request, function (get_group_err, get_group_res) {
                            if (get_group_err) {
                                console.log(get_group_err);
                                callback(get_group_err, get_group_res);
                            } else {        
                                function changeQuestionStatus(i)
                                {
                                    if(i < question_data_res.Items.length)
                                    {
                                        if(request.data.question_active_status === "Archived"){
                                        
                                            /** CHECK FOR MAPPTING **/
                                            let checkMapPayload = { 
                                                arrayToCheck: get_group_res.Items,
                                                fieldToCheck: "group_question_id",
                                                checkId: question_data_res.Items[i].question_id,
                                                fieldToPrint: "question_label"
                                            };
    
                                            commonServices.CheckForMappings(checkMapPayload, function (mapping_err, mapping_res) {
                                                if (mapping_err) {
                                                    console.log(mapping_err);
                                                    callback(mapping_err, mapping_res);
                                                } else {
                                                    if(mapping_res.length == 0 || mapping_res === "")
                                                    {
                                                        console.log("No Mapping : ", question_data_res.Items[i].question_id);
                                                        question_data_res.Items[i].question_active_status = request.data.question_active_status;
                                                        activeData.push(question_data_res.Items[i])
                                                    }
                                                    else
                                                    {
                                                        (i == question_data_res.Items.length - 1) ? 
                                                        questions_cant_delete += question_data_res.Items[i].question_label : questions_cant_delete += question_data_res.Items[i].question_label + ", "
                                                    }
                                                }
                                            });
                                            /** END CHECK FOR MAPPTING **/
                                        } else { 
                                            question_data_res.Items[i].question_active_status = request.data.question_active_status;
                                            activeData.push(question_data_res.Items[i])
                                        }
                                        i++;
                                        changeQuestionStatus(i);
                                    }
                                    else
                                    {
                                        console.log("activeData : ", activeData);
                                        /** BULK UPDATE **/
                                        questionRepository.changeMultipleQuestionsStatus(activeData, function (updateBulkData_err, updateBulkData_res) {
                                            if (updateBulkData_err) {
                                                console.log("ERROR : TOGGLE BULK QUESTIONS DATA");
                                                console.log(updateBulkData_err);
                                            } else {
                                                console.log("BULK QUESTIONS STATUS UPDATED!");
                                                // Check questions_cant_delete length and Include digicard Titles in the response 
                                                questions_cant_delete.endsWith(", ") && (questions_cant_delete = questions_cant_delete.substring(0, questions_cant_delete.length-2))
                                                if(questions_cant_delete.length === 0 || questions_cant_delete === ""){ 
                                                    console.log(updateBulkData_res);
                                                    callback(0, 200);
                                                } else {
                                                    console.log(constant.messages.UNABLE_TO_DELETE_MULTIPLE_QUESTIONS.replace("**REPLACE**", questions_cant_delete)); 
                                                    callback(400, constant.messages.UNABLE_TO_DELETE_MULTIPLE_QUESTIONS.replace("**REPLACE**", questions_cant_delete)); 
                                                }
                                            }
                                        })
                                        /** END BULK UPDATE **/
                                    }
                                }
                                changeQuestionStatus(0)
                            }
                        })
                    }
                    else
                    {
                        console.log("EMPTY DATA FROM BULK FETCH");
                        callback(401, constant.messages.INVALID_QUESTIONS_TO_DELETE); 
                    }
                }
            });
        }
        else
        {
            console.log("EMPTY ARRAY");
            callback(401, constant.messages.NO_QUESTION_TO_TOGGLE);
        }
    } else {
        console.log("Invalid Digicard Status");
        callback(401, constant.messages.INVALID_QUESTIONS_STATUS);
    }	
}
