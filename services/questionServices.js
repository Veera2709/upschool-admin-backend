const questionRepository = require("../repository/questionRepository");
const groupRepository = require("../repository/groupRepository");
const commonServices = require("../services/commonServices");
const conceptRepository = require("../repository/conceptRepository");
const constant = require('../constants/constant');
const helper = require('../helper/helper');
const dynamoDbCon = require('../awsConfig');
const XLSX = require('node-xlsx');
const { getDisclaimersCategoriesSourcesSkills } = require("./settingsServices");
const { fetchUserDataByUserId, fetchAdminDataById } = require("../repository/userRepository");

exports.addNewQuestion = async function (request, callback) {
    console.log("INITIAL REQUEST : ", JSON.stringify(request));

    /** FETCH QUESTION BY LABEL **/
    questionRepository.fetchQuestionByLabel(request, async function (questionLabelData_err, questionLabelData_response) {
        if (questionLabelData_err) {
            console.log(questionLabelData_err);
            callback(questionLabelData_err, questionLabelData_response);
        } else {
            if (questionLabelData_response.Items.length > 0) {
                console.log(constant.messages.QUESTION_LABEL_ALREADY_EXIST)
                callback(400, constant.messages.QUESTION_LABEL_ALREADY_EXIST)
            }
            else {
                let responseToSend = {
                    question_voice_note: [],
                    answers_options: []
                };
                let answersFilesS3 = "";
                let answerPayload = JSON.parse(JSON.stringify(request.data.answers_of_question));
                let questionVoiceNote = request.data.question_voice_note;

                if (!(questionVoiceNote.includes("question_uploads/"))) {
                    let voiceNotesUrl = (questionVoiceNote != "" && questionVoiceNote != "N.A.") ? await helper.PutObjectS3SigneUdrl(questionVoiceNote, "question_uploads") : "N.A.";
                    request.data.question_voice_note = (voiceNotesUrl == "N.A.") ? voiceNotesUrl : voiceNotesUrl.Key;
                    if (voiceNotesUrl != "N.A.") {
                        responseToSend.question_voice_note.push({ file_name: questionVoiceNote, s3Url: voiceNotesUrl.uploadURL });
                    }
                }

                async function getAnswerFilesUrl(i) {
                    answersFilesS3 = "";
                    if (i < answerPayload.length) {
                        if (answerPayload[i].answer_type == "Image" || answerPayload[i].answer_type == "Audio File") {
                            if ((!(JSON.stringify(answerPayload[i].answer_content).includes("question_uploads/"))) && answerPayload[i].answer_content != "" && answerPayload[i].answer_content != "N.A.") {
                                answersFilesS3 = await helper.PutObjectS3SigneUdrl(answerPayload[i].answer_content, "question_uploads");
                                request.data.answers_of_question[i].answer_content = answersFilesS3.Key;
                                responseToSend.answers_options.push({ file_name: answerPayload[i].answer_content, s3Url: answersFilesS3.uploadURL });
                            }
                        }

                        i++;
                        getAnswerFilesUrl(i);
                    }
                    else {
                        console.log("FIANL REQUEST(S3) : ", JSON.stringify(request));
                        console.log({ responseToSend });
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

const sendBulkUploadResponse = async (bulkError, reqToken, callback) => {
    console.log({ reqToken })
    let decode_token = helper.decodeJwtToken(reqToken);
    let getMailReq = { user_id: decode_token.user_role === 'admin' || Array.isArray(decode_token.user_role) ? decode_token.user_id : decode_token.teacher_id };

    decode_token.user_role === 'admin' || Array.isArray(decode_token.user_role) ? fetchUserDataByUserId(getMailReq, function (fetch_user_data_err, fetch_user_data_response) {
        if (fetch_user_data_err) {
            console.log(fetch_user_data_err);
            callback(fetch_user_data_err, 0);
        } else {
            if (fetch_user_data_response.Items.length > 0) {
                console.log("USER EMAIL : ", fetch_user_data_response.Items[0].user_email);

                let mailPayload = {
                    "bulkResponse": JSON.stringify(bulkError),
                    "toMail": fetch_user_data_response.Items[0].user_email,
                    "subject": 'Question Upload Response',
                    "mailFor": "questionBulkUpload",
                };

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
            } else {
                console.log("ERROR : FETCHING USER");
                callback(1, 0);
            }
        }
    }) : fetchAdminDataById(getMailReq, function (fetch_user_data_err, fetch_user_data_response) {
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
            } else {
                console.log("ERROR : FETCHING USER");
                callback(1, 0);
            }
        }
    })
}

exports.questionBulkUpload = async (request, reqToken, callback) => {
    let Key = request.data.excelFileName;
    // let Key = "temp/2fa103b3-616e-59df-a54b-ce577e6e0b34_a8cab7b8-ca8f-5c4b-bb29-e258b591a67d.xlsx";
    let school_id = Key.split('/')[1].split('_')[0];
    request.data.school_id = school_id || "";

    console.log({ Key });
    console.log({ school_id });

    const data = {
        disclaimer_type: "Question",
        disclaimer_status: "Active",
        category_type: "Question",
        category_status: "Active",
        cognitive_type: "Question",
        cognitive_status: "Active",
        source_type: "Question",
        source_status: "Active",
        disclaimer_type: constant.contentType.question,
        category_type: constant.contentType.question,
        source_type: constant.contentType.question,
        cognitive_type: constant.contentType.question,
    }

    let request1 = { data };

    console.log({ firstttttt: request1.data })

    if (Key.includes('.xlxs') || Key.includes('.xls') || Key.includes('.txt')) {
        console.log("xlxs || xls");

        let s3object = (await dynamoDbCon.s3.getObject({ Bucket: process.env.BUCKET_NAME, Key }).promise());

        console.log({ s3object })

        let buffers = [];

        let errorRes = [];

        buffers.push(s3object.Body);

        let buffer = Buffer.concat(buffers);
        let workbook = XLSX.parse(buffer);
        console.log("workbook", JSON.stringify(workbook));
        getDisclaimersCategoriesSourcesSkills(request1, async function (disclaimer_err, disclaimer_response) {
            if (disclaimer_err) {
                console.log("Error while fetching disclaimer details", disclaimer_err);
                callback(disclaimer_err, disclaimer_response);
            } else {
                disclaimer_response.categories.forEach(category => {
                    if (category.category_name) {
                        category.category_name = category.category_name.toUpperCase();
                    }
                });
                disclaimer_response.question_sources.forEach(source => {
                    if (source.source_name) {
                        source.source_name = source.source_name.toUpperCase();
                    }
                });

                let questionLabels = [];

                for (let i = 0; i < workbook.length; i++) {
                    for (let j = 1; j < workbook[i].data.length; j++) {
                        if (workbook[i].data[j][0]) {
                            questionLabels.push(workbook[i].data[j][0]);
                        }
                    }
                }

                console.log({ firsttttt: questionLabels });

                request.data['question_labels'] = questionLabels;

                questionRepository.fetchQuestionByLabel2(request, async function (questionLabelData_err, questionLabelData_response) {
                    if (questionLabelData_err) {
                        console.log(questionLabelData_err);
                        callback(questionLabelData_err, questionLabelData_response);
                    } else {
                        let questionsData = [];
                        let duplicateLables = questionLabelData_response.filter(question => questionLabels.includes(question.question_label)).map(qtn => qtn.question_label);
                        function sheetLoop(i) {
                            if (i < workbook.length) {
                                console.log("WORKBOOK NAME : " + workbook[i].name);
                                async function rowLoop(j) {
                                    if (j < workbook[i].data.length) {
                                        if (workbook[i].name == "Objective") {
                                            if (workbook[i].data[j].length > 5 && workbook[i].data[j]?.[0]) {
                                                if (await helper.validateQuestionRows(workbook[i].name, workbook[i].data[j])) {
                                                    if (!duplicateLables.includes(workbook[i].data[j][0])) {
                                                        tempUserId = helper.getRandomString()
                                                        questionsData.push({
                                                            question_id: tempUserId,
                                                            answers_of_question: [
                                                                {
                                                                    answer_type: workbook[i].data[j][8]?.toString(),
                                                                    answer_content: workbook[i].data[j][9]?.toString(),
                                                                    answer_display: workbook[i].data[j][10]?.toString(),
                                                                    answer_weightage: workbook[i].data[j][11]?.toString(),
                                                                    answer_option: "Options",
                                                                },
                                                                {
                                                                    answer_type: workbook[i].data[j][12]?.toString(),
                                                                    answer_content: workbook[i].data[j][13]?.toString(),
                                                                    answer_display: workbook[i].data[j][14]?.toString(),
                                                                    answer_weightage: workbook[i].data[j][15]?.toString(),
                                                                    answer_option: "Options",
                                                                },
                                                                {
                                                                    answer_type: workbook[i].data[j][16]?.toString(),
                                                                    answer_content: workbook[i].data[j][17]?.toString(),
                                                                    answer_display: workbook[i].data[j][18]?.toString(),
                                                                    answer_weightage: workbook[i].data[j][19]?.toString(),
                                                                    answer_option: "Options",
                                                                },
                                                                {
                                                                    answer_type: workbook[i].data[j][20]?.toString(),
                                                                    answer_content: workbook[i].data[j][21]?.toString(),
                                                                    answer_display: workbook[i].data[j][22]?.toString(),
                                                                    answer_weightage: workbook[i].data[j][23]?.toString(),
                                                                    answer_option: "Options",
                                                                }
                                                            ],
                                                            answer_explanation: workbook[i].data[j]?.[24],
                                                            appears_in: helper.prePostArray.includes(workbook[i].data[j]?.[4]) ? 'preOrPost' : worksheetOrTestArray.includes(workbook[i].data[j][4]) ? 'worksheetOrTest' : ["preOrPost", "worksheetOrTest"],
                                                            cognitive_skill: "",
                                                            question_content: `<p>${workbook[i].data[j]?.[6]}</p>`,
                                                            difficulty_level: workbook[i].data[j]?.[5]?.toLowerCase(),
                                                            display_answer: "N.A.",
                                                            lc_question_label: workbook[i].data[j]?.[0],
                                                            question_label: workbook[i].data[j]?.[0],
                                                            marks: workbook[i].data[j]?.[7],
                                                            question_active_status: "Active",
                                                            question_category: disclaimer_response?.categories?.find(category => category?.category_name == workbook[i]?.data[j]?.[1]?.toUpperCase())?.category_id || "N.A.",
                                                            question_disclaimer: [],
                                                            question_source: disclaimer_response?.question_sources?.find(source => source?.source_name == workbook[i]?.data[j]?.[3]?.toUpperCase())?.source_id || "N.A.",
                                                            question_status: "Save",
                                                            question_type: workbook[i].name,
                                                            question_voice_note: "N.A.",
                                                            show_math_keyboard: "No",
                                                            common_id: constant.constValues.common_id,
                                                            created_ts: helper.getCurrentTimestamp(),
                                                            updated_ts: helper.getCurrentTimestamp()
                                                        });
                                                    } else {
                                                        errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "Found Duplicate Label!" });
                                                    }
                                                } else {
                                                    errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "Found Empty Cells!" });
                                                }
                                            }
                                            j++;
                                            rowLoop(j)
                                        }
                                        else if (workbook[i].name == "Subjective") {
                                            if (workbook[i].data[j]?.length > 5 && workbook[i].data[j]?.[0]) {
                                                if (await helper.validateQuestionRows(workbook[i].name, workbook[i].data[j])) {
                                                    if (!duplicateLables.includes(workbook[i].data[j][0])) {
                                                        tempUserId = helper.getRandomString()
                                                        questionsData.push({
                                                            question_id: tempUserId,
                                                            answers_of_question: [
                                                                {
                                                                    answer_type: workbook[i].data[j]?.[8]?.toString(),
                                                                    answer_content: workbook[i].data[j]?.[9]?.toString(),
                                                                    answer_display: workbook[i].data[j]?.[10]?.toString(),
                                                                    answer_weightage: workbook[i].data[j]?.[11]?.toString(),
                                                                    answer_option: workbook[i].data[j]?.[12],
                                                                },
                                                            ],
                                                            answer_explanation: workbook[i].data[j]?.[13],
                                                            appears_in: workbook[i].data[j]?.[4],
                                                            cognitive_skill: workbook[i].data[j]?.[2]?.toUpperCase(),
                                                            question_content: `<p>${workbook[i].data[j]?.[6]}</p>`,
                                                            difficulty_level: workbook[i].data[j]?.[5]?.toLowerCase(),
                                                            display_answer: "N.A.",
                                                            lc_question_label: workbook[i].data[j]?.[0],
                                                            question_label: workbook[i].data[j]?.[0],
                                                            marks: workbook[i].data[j]?.[7],
                                                            question_active_status: "Active",
                                                            question_category: disclaimer_response?.categories?.find(category => category?.category_name == workbook[i]?.data[j][1]?.toUpperCase())?.category_id || "N.A.",
                                                            question_disclaimer: [],
                                                            question_source: disclaimer_response?.question_sources?.find(source => source?.source_name == workbook[i]?.data[j][3]?.toUpperCase())?.source_id || "N.A.",
                                                            question_status: "Save",
                                                            question_type: workbook[i].name,
                                                            question_voice_note: "N.A.",
                                                            show_math_keyboard: "No",
                                                            common_id: constant.constValues.common_id,
                                                            created_ts: helper.getCurrentTimestamp(),
                                                            updated_ts: helper.getCurrentTimestamp()
                                                        });

                                                        // }
                                                        // }else {
                                                        //     console.log(workbook[i].name + ": EMPTY FIELDS IN SHEET ROW :" + j);
                                                        //     errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "Found Empty Cells!" });
                                                        // }
                                                    } else {
                                                        errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "Found Duplicate Label!" });
                                                    }
                                                } else {
                                                    errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "Found Empty Cells!" });
                                                }
                                            }
                                            j++;
                                            rowLoop(j)
                                        }
                                        else if (workbook[i].name == "Descriptive") {
                                            if (workbook[i].data[j]?.length > 5 && workbook[i].data[j]?.[0]) {
                                                if (await helper.validateQuestionRows(workbook[i].name, workbook[i].data[j])) {
                                                    if (!duplicateLables.includes(workbook[i].data[j][0])) {
                                                        tempUserId = helper.getRandomString()
                                                        questionsData.push({
                                                            question_id: tempUserId,
                                                            answers_of_question: [
                                                                {
                                                                    answer_type: workbook[i].data[j]?.[9]?.toString(),
                                                                    answer_content: workbook[i].data[j]?.[11]?.toString(),
                                                                    answer_weightage: workbook[i].data[j]?.[10]?.toString(),
                                                                },
                                                            ],
                                                            answer_explanation: workbook[i].data[j]?.[12] || "N.A.",
                                                            appears_in: workbook[i].data[j]?.[4],
                                                            cognitive_skill: workbook[i].data[j]?.[2]?.toUpperCase(),
                                                            question_content: `<p>${workbook[i].data[j]?.[6]}</p>`,
                                                            difficulty_level: workbook[i].data[j]?.[5]?.toLowerCase(),
                                                            display_answer: workbook[i].data[j]?.[8],
                                                            lc_question_label: workbook[i].data[j]?.[0],
                                                            question_label: workbook[i].data[j]?.[0],
                                                            marks: workbook[i].data[j]?.[7],
                                                            question_active_status: "Active",
                                                            question_category: disclaimer_response?.categories?.find(category => category?.category_name == workbook[i]?.data[j]?.[1]?.toUpperCase())?.category_id || "N.A.",
                                                            question_disclaimer: [],
                                                            question_source: disclaimer_response?.question_sources?.find(source => source?.source_name == workbook[i]?.data[j]?.[3]?.toUpperCase())?.source_id || "N.A.",
                                                            question_status: "Save",
                                                            question_type: workbook[i].name,
                                                            question_voice_note: "N.A.",
                                                            show_math_keyboard: "No",
                                                            common_id: constant.constValues.common_id,
                                                            created_ts: helper.getCurrentTimestamp(),
                                                            updated_ts: helper.getCurrentTimestamp()
                                                        });
                                                    } else {
                                                        errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "Found Duplicate Label!" });
                                                    }
                                                } else {
                                                    errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "Found Empty Cells!" });
                                                }
                                            }
                                            j++;
                                            rowLoop(j)
                                        }
                                        else {
                                            console.log("UNKNOWN WORK SHEET : " + workbook[i].name);
                                            errorRes.push({ sheet: workbook[i].name, rowNo: "N.A.", reason: "Unknown Worksheet Name" });
                                            j++;
                                            rowLoop(j)
                                        }
                                    }
                                    else {
                                        i++;
                                        sheetLoop(i);
                                    }
                                }
                                rowLoop(1);
                            }
                            else {
                                console.log("SHEET END");
                                console.log("ERROR : ", errorRes);
                                request.data['questions'] = questionsData;
                                questionRepository.bulkInsertQuestions(request, function (insert_many_questions_err, insert_many_questions_response) {
                                    if (insert_many_questions_err) {
                                        console.log("ERROR : Insert Question Data");
                                        callback(400, errorRes);
                                    } else {
                                        console.log("Question Data Inserted Successfully");
                                        callback(0, errorRes);
                                    }
                                })
                            }
                        }
                        sheetLoop(0);
                    }
                    // }
                });
            }
        })
    }
}

exports.getAllQuestionsData = function (request, callback) {
    if (request.data.questions_type === "preOrPost") {
        questionRepository.fetchPreorPostQuestionsBasedOnStatus(request, function (fetch_pre_and_post_err, fetch_pre_and_post_res) {
            if (fetch_pre_and_post_err) {
                console.log(fetch_pre_and_post_err);
                callback(fetch_pre_and_post_err, fetch_pre_and_post_res);
            } else {
                callback(fetch_pre_and_post_err, fetch_pre_and_post_res);
            }
        })
    } else if (request.data.questions_type === "worksheetOrTest") {
        questionRepository.fetchworksheetOrTestQuestionsBasedOnStatus(request, function (fetch_worksheet_and_test_err, fetch_worksheet_and_test_res) {
            if (fetch_worksheet_and_test_err) {
                console.log(fetch_worksheet_and_test_err);
                callback(fetch_worksheet_and_test_err, fetch_worksheet_and_test_res);
            } else {
                callback(fetch_worksheet_and_test_err, fetch_worksheet_and_test_res);
            }
        })
    } else if (request.data.questions_type === "All") {
        questionRepository.fetchAllQuestionsBasedonStatus(request, function (fetch_worksheet_and_test_err, fetch_worksheet_and_test_res) {
            if (fetch_worksheet_and_test_err) {
                console.log(fetch_worksheet_and_test_err);
                callback(fetch_worksheet_and_test_err, fetch_worksheet_and_test_res);
            } else {
                callback(fetch_worksheet_and_test_err, fetch_worksheet_and_test_res);
            }
        })
    } else {
        callback(400, constant.messages.INVALID_REQUEST_FORMAT);
    }

}

exports.getIndividualQuestionData = function (request, callback) {
    questionRepository.fetchQuestionById(request, async function (fetch_question_err, fetch_question_res) {
        if (fetch_question_err) {
            console.log(fetch_question_err);
            callback(fetch_question_err, fetch_question_res);
        } else {
            if (fetch_question_res.Items.length > 0) {
                let questionVoiceNote = fetch_question_res.Items[0].question_voice_note;
                fetch_question_res.Items[0].question_voice_note_url = (questionVoiceNote.includes("question_uploads/")) ? await helper.getS3SignedUrl(questionVoiceNote) : "N.A.";

                async function getAnswerS3Url(i) {
                    if (i < fetch_question_res.Items[0].answers_of_question.length) {
                        let answerContent = fetch_question_res.Items[0].answers_of_question[i].answer_content;
                        console.log("answerContent", answerContent);
                        console.log("fetch_question_res.Items[0].answers_of_question[i].answer_content_url : ", fetch_question_res.Items[0].answers_of_question[i].answer_content_url);

                        fetch_question_res.Items[0].answers_of_question[i].answer_content_url = (JSON.stringify(answerContent).includes("question_uploads/")) ? await helper.getS3SignedUrl(answerContent) : "N.A.";
                        i++;
                        getAnswerS3Url(i);
                    }
                    else {
                        console.log("QUESTION DATA : ", fetch_question_res);
                        callback(fetch_question_err, fetch_question_res);
                    }
                }
                getAnswerS3Url(0);
            }
            else {
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
            if (fetch_question_res.Items.length > 0 && fetch_question_res.Items[0].question_id !== request.data.question_id) {
                console.log(constant.messages.QUESTION_LABEL_ALREADY_EXIST)
                callback(400, constant.messages.QUESTION_LABEL_ALREADY_EXIST)
            }
            else {
                let responseToSend = {
                    question_voice_note: [],
                    answers_options: []
                };
                let answersFilesS3 = "";
                let answerPayload = JSON.parse(JSON.stringify(request.data.answers_of_question));
                let questionVoiceNote = request.data.question_voice_note;

                if (!(questionVoiceNote.includes("question_uploads/"))) {
                    let voiceNotesUrl = (questionVoiceNote && questionVoiceNote != "" && questionVoiceNote != "N.A.") ? await helper.PutObjectS3SigneUdrl(questionVoiceNote, "question_uploads") : "N.A.";
                    request.data.question_voice_note = (voiceNotesUrl == "N.A.") ? voiceNotesUrl : voiceNotesUrl.Key;
                    if (voiceNotesUrl != "N.A.") {
                        responseToSend.question_voice_note.push({ file_name: questionVoiceNote, s3Url: voiceNotesUrl.uploadURL });
                    }
                }

                async function getAnswerFilesUrl(i) {
                    answersFilesS3 = "";
                    if (i < answerPayload.length) {
                        if (answerPayload[i].answer_type == "Image" || answerPayload[i].answer_type == "Audio File") {
                            if ((!(JSON.stringify(answerPayload[i].answer_content).includes("question_uploads/"))) && answerPayload[i].answer_content != "" && answerPayload[i].answer_content != "N.A.") {
                                answersFilesS3 = await helper.PutObjectS3SigneUdrl(answerPayload[i].answer_content, "question_uploads");
                                request.data.answers_of_question[i].answer_content = answersFilesS3.Key;
                                responseToSend.answers_options.push({ file_name: answerPayload[i].answer_content, s3Url: answersFilesS3.uploadURL });
                            }
                        }

                        i++;
                        getAnswerFilesUrl(i);
                    }
                    else {
                        console.log("EDIT FIANL REQUEST(S3) : ", JSON.stringify(request));
                        console.log({ responseToSend });
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
            if (fetch_question_res.Items[0].question_status === "Publish" && request.data.question_active_status === "Archived") // condition can be changed based on roles
            {
                console.log(constant.messages.PUBLISHED_QUESTION_CANT_BE_DELETED);
                callback(400, constant.messages.PUBLISHED_QUESTION_CANT_BE_DELETED);
            }
            else {
                if (fetch_question_res.Items[0].question_status === "Publish" && request.data.question_active_status === "Archived") // more question status can be added
                {
                    if (fetch_question_res.Items[0].appears_in) {

                        // if(fetch_question_res.Items[0].appears_in && fetch_question_res.Items[0].appears_in === constant.questionKeys.preOrPost)
                        // {
                        if ((Array.isArray(fetch_question_res.Items[0].appears_in) && fetch_question_res.Items[0].appears_in.includes(constant.questionKeys.preOrPost)) || fetch_question_res.Items[0].appears_in === constant.questionKeys.preOrPost) {

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
                                            if (mapping_res.length == 0) {
                                                questionRepository.toggleQuestionStatus(request, function (toggleQuestion_err, toggleQuestion_res) {
                                                    if (toggleQuestion_err) {
                                                        console.log(toggleQuestion_err);
                                                        callback(toggleQuestion_err, toggleQuestion_res);
                                                    } else {
                                                        callback(toggleQuestion_err, toggleQuestion_res);
                                                    }
                                                })
                                            }
                                            else {
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
                        else {
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
                                            if (conMapping_res.length == 0) {
                                                questionRepository.toggleQuestionStatus(request, function (toggleQuestion_err, toggleQuestion_res) {
                                                    if (toggleQuestion_err) {
                                                        console.log(toggleQuestion_err);
                                                        callback(toggleQuestion_err, toggleQuestion_res);
                                                    } else {
                                                        callback(toggleQuestion_err, toggleQuestion_res);
                                                    }
                                                })
                                            }
                                            else {
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
                }
                else {
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
    if (request.data.question_active_status === "Active" || request.data.question_active_status === "Archived") {
        if (request.data.question_array.length > 0) {
            questionRepository.fetchQuestionData({ question_array: request.data.question_array }, function (question_data_err, question_data_res) {
                if (question_data_err) {
                    console.log(question_data_err);
                    callback(question_data_err, question_data_res);
                } else {
                    let activeData = [];

                    if (question_data_res.Items.length > 0) {
                        request.data.group_status = "Active";
                        groupRepository.fetchGroupBasedOnStatus(request, function (get_group_err, get_group_res) {
                            if (get_group_err) {
                                console.log(get_group_err);
                                callback(get_group_err, get_group_res);
                            } else {
                                function changeQuestionStatus(i) {
                                    if (i < question_data_res.Items.length) {
                                        if (request.data.question_active_status === "Archived") {

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
                                                    if (mapping_res.length == 0 || mapping_res === "") {
                                                        console.log("No Mapping : ", question_data_res.Items[i].question_id);
                                                        question_data_res.Items[i].question_active_status = request.data.question_active_status;
                                                        activeData.push(question_data_res.Items[i])
                                                    }
                                                    else {
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
                                    else {
                                        console.log("activeData : ", activeData);
                                        /** BULK UPDATE **/
                                        questionRepository.changeMultipleQuestionsStatus(activeData, function (updateBulkData_err, updateBulkData_res) {
                                            if (updateBulkData_err) {
                                                console.log("ERROR : TOGGLE BULK QUESTIONS DATA");
                                                console.log(updateBulkData_err);
                                            } else {
                                                console.log("BULK QUESTIONS STATUS UPDATED!");
                                                // Check questions_cant_delete length and Include digicard Titles in the response 
                                                questions_cant_delete.endsWith(", ") && (questions_cant_delete = questions_cant_delete.substring(0, questions_cant_delete.length - 2))
                                                if (questions_cant_delete.length === 0 || questions_cant_delete === "") {
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
                    else {
                        console.log("EMPTY DATA FROM BULK FETCH");
                        callback(401, constant.messages.INVALID_QUESTIONS_TO_DELETE);
                    }
                }
            });
        }
        else {
            console.log("EMPTY ARRAY");
            callback(401, constant.messages.NO_QUESTION_TO_TOGGLE);
        }
    } else {
        console.log("Invalid Digicard Status");
        callback(401, constant.messages.INVALID_QUESTIONS_STATUS);
    }
}
