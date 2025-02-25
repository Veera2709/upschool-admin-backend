const dynamoDbCon = require('../awsConfig');
const userRepository = require("../repository/userRepository");
const parentRepository = require("../repository/parentRepository");
const teacherRepository = require("../repository/teacherRepository");
const studentRepository = require("../repository/studentRepository");
const schoolRepository = require("../repository/schoolRepository");
const sectionRepository = require("../repository/sectionRepository");
const constant = require('../constants/constant');
const helper = require('../helper/helper');
const XLSX = require('node-xlsx');
const { TABLE_NAMES } = require('../constants/tables');
const commonRepository = require("../repository/commonRepository");

exports.getBulkUploadUrl = async function (request, callback) {

	let fileUrl = []
	let filePath = []

	let file_type = request.data.ExcelFile.split(".");
	let file_ext = '.' + file_type[file_type.length - 1];

	console.log(file_ext)

	let URL_EXPIRATION_SECONDS = 300;

	let randomID = request?.data?.school_id || "" + '_' + helper.getRandomString();

	let Key = `temp/${randomID}` + file_ext;

	// Get signed URL from S3
	let s3Params = {
		Bucket: process.env.BUCKET_NAME,
		Key,
		Expires: URL_EXPIRATION_SECONDS,
		ContentType: helper.getMimeType(file_ext),
		ACL: 'public-read'
	}

	let uploadURL = await dynamoDbCon.s3.getSignedUrlPromise('putObject', s3Params)
	console.log({ uploadURL })
	fileUrl.push({ "excelFileUploadUrl": uploadURL });
	filePath.push({ "excelFilePath": Key });

	callback(0, { "fileUploadUrl": fileUrl, "filePath": filePath });
}

exports.usersbulkUpload = async function (request, reqToken, callback) {
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
		let parentsData = [];
		let teachersData = [];
		let studentsData = [];

		let errorRes = [];

		buffers.push(s3object.Body);

		let buffer = Buffer.concat(buffers);
		let workbook = XLSX.parse(buffer);
		console.log("workbook", JSON.stringify(workbook));

		/** FETCH ALL PARENTS **/
		parentRepository.getAllParentsData(request, function (All_parents_data_err, All_parents_data_res) {
			if (All_parents_data_err) {
				console.log(All_parents_data_err);
				callback(All_parents_data_err, All_parents_data_res);
			} else {

				console.log("PARENTS : ", All_parents_data_res);
				teacherRepository.getAllTeachersData(function (All_teachers_data_err, All_teachers_data_res) {
					if (All_teachers_data_err) {
						console.log(All_teachers_data_err);
						callback(All_teachers_data_err, All_teachers_data_res);
					} else {
						console.log("TEACHERS : ", All_teachers_data_res);
						/** FETCH CLIENT CLASSES **/
						schoolRepository.fetchAllClientClassList(request, function (fetch_client_class_err, fetch_client_class_res) {
							if (fetch_client_class_err) {
								console.log(fetch_client_class_err);
								callback(fetch_client_class_err, fetch_client_class_res);
							} else {
								console.log("CLASS LIST : ", fetch_client_class_res);

								/** FETCH CLIENT CLASSES **/
								sectionRepository.fetchAllSectionBySchoolId(request, function (section_data_err, section_data_res) {
									if (section_data_err) {
										console.log(section_data_err);
										callback(section_data_err, section_data_res);
									} else {
										console.log("SECTION LIST : ", section_data_res);

										exports.getStudentsDataBySection(workbook, fetch_client_class_res.Items, section_data_res.Items, async (studentDatasErr, studentDataRes) => {
											if (studentDatasErr) {
												console.log(studentDatasErr)
												callback(studentDatasErr, studentDataRes)
											}
											else {
												console.log("GOT STUDENTS LIST");
												console.log(studentDataRes);

												/** PROCESS GOES **/
												let phoneCheck = "";
												let mailCheck = "";
												let mailSyntaxCheck = "";
												let parentCheck = "";
												let tempUserId = "";
												let classIdCheck = "";
												let SectionIdCheck = "";
												let rollNoCheck = "";
												function sheetLoop(i) {
													if (i < workbook.length) {
														console.log("WORKBOOK NAME : " + workbook[i].name);

														/** ROW LOOP **/
														async function rowLoop(j) {
															if (j < workbook[i].data.length) {
																if (workbook[i].name == "Parents") {
																	if (workbook[i].data[j].length > 0) {
																		if (await helper.validateRows(workbook[i].name, workbook[i].data[j])) {
																			phoneCheck = "";
																			mailCheck = "";
																			phoneCheck = All_parents_data_res.Items.filter(e => e.user_phone_no === workbook[i].data[j][2].toString());
																			mailCheck = All_parents_data_res.Items.filter(e => e.user_email === workbook[i].data[j][3].toLowerCase());
																			mailSyntaxCheck = helper.validateEmail(workbook[i].data[j][3]);

																			if (phoneCheck.length > 0 || mailCheck.length > 0 || !mailSyntaxCheck) {
																				errorRes.push((phoneCheck.length > 0) ? { sheet: workbook[i].name, rowNo: j, reason: workbook[i].data[j][2].toString() + " Phone No Already Exist" } : "N.A.");

																				errorRes.push((mailCheck.length > 0) ? { sheet: workbook[i].name, rowNo: j, reason: workbook[i].data[j][3].toString() + " Email Id Already Exist" } : "N.A.");

																				errorRes.push((!mailSyntaxCheck) ? { sheet: workbook[i].name, rowNo: j, reason: workbook[i].data[j][3].toString() + "Wrong Email Id Format" } : "N.A.")
																			}
																			else {
																				tempUserId = helper.getRandomString()
																				parentsData.push({
																					parent_id: tempUserId,
																					school_id: school_id,
																					user_firstname: workbook[i].data[j][0],
																					user_lastname: workbook[i].data[j][1],
																					user_phone_no: workbook[i].data[j][2].toString(),
																					user_email: workbook[i].data[j][3].toLowerCase(),
																					user_dob: { yyyy_mm_dd: workbook[i].data[j][4], dd_mm_yyyy: helper.change_dd_mm_yyyy(workbook[i].data[j][4]) },
																					user_role: "Parent",
																					user_status: "Active",
																					common_id: constant.constValues.common_id,
																					created_ts: helper.getCurrentTimestamp(),
																					updated_ts: helper.getCurrentTimestamp()
																				});

																				All_parents_data_res.Items.push({ parent_id: tempUserId, user_phone_no: workbook[i].data[j][2].toString(), user_email: workbook[i].data[j][3].toLowerCase() });
																			}
																		}
																		else {
																			console.log(workbook[i].name + ": EMPTY FIELDS IN SHEET ROW :" + j);
																			errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "Found Empty Cells!" });
																		}
																	}
																	j++;
																	rowLoop(j)
																}
																else if (workbook[i].name == "Teachers") {
																	if (workbook[i].data[j].length > 0) {

																		if (await helper.validateRows(workbook[i].name, workbook[i].data[j])) {
																			phoneCheck = "";
																			mailCheck = "";
																			phoneCheck = All_teachers_data_res.Items.filter(e => e.user_phone_no === workbook[i].data[j][2].toString());
																			mailCheck = All_teachers_data_res.Items.filter(e => e.user_email === workbook[i].data[j][3].toLowerCase());
																			mailSyntaxCheck = helper.validateEmail(workbook[i].data[j][3]);

																			if (phoneCheck.length > 0 || mailCheck.length > 0 || !mailSyntaxCheck) {
																				errorRes.push((phoneCheck.length > 0) ? { sheet: workbook[i].name, rowNo: j, reason: workbook[i].data[j][2].toString() + " Phone No Already Exist" } : "N.A.");

																				errorRes.push((mailCheck.length > 0) ? { sheet: workbook[i].name, rowNo: j, reason: workbook[i].data[j][3].toString() + " Email Id Already Exist" } : "N.A.");

																				errorRes.push((!mailSyntaxCheck) ? { sheet: workbook[i].name, rowNo: j, reason: workbook[i].data[j][3].toString() + "Wrong Email Id Format" } : "N.A.")
																			}
																			else {
																				teachersData.push({
																					teacher_id: helper.getRandomString(),
																					school_id: school_id,
																					user_firstname: workbook[i].data[j][0],
																					user_lastname: workbook[i].data[j][1],
																					user_phone_no: workbook[i].data[j][2].toString(),
																					user_email: workbook[i].data[j][3].toLowerCase(),
																					user_dob: { yyyy_mm_dd: workbook[i].data[j][4], dd_mm_yyyy: helper.change_dd_mm_yyyy(workbook[i].data[j][4]) },
																					user_role: "Teacher",
																					user_status: "Active",
																					teacher_info: [],
																					teacher_section_allocation: [],
																					common_id: constant.constValues.common_id,
																					created_ts: helper.getCurrentTimestamp(),
																					updated_ts: helper.getCurrentTimestamp()
																				});

																				All_teachers_data_res.Items.push({ user_phone_no: workbook[i].data[j][2].toString(), user_email: workbook[i].data[j][3].toLowerCase() });
																			}
																		}
																		else {
																			console.log(workbook[i].name + ": EMPTY FIELDS IN SHEET ROW :" + j);
																			errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "Found Empty Cells!" });
																		}
																	}

																	j++;
																	rowLoop(j)
																}
																else if (workbook[i].name == "Students") {
																	if (workbook[i].data[j].length > 0) {
																		if (await helper.validateRows(workbook[i].name, workbook[i].data[j])) {
																			parentCheck = "";
																			parentCheck = All_parents_data_res.Items.filter(e => e.user_phone_no === workbook[i].data[j][2].toString());
																			console.log("PARENT CHECK : ", parentCheck);

																			if (parentCheck.length == 0) {
																				errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "Parent doesn't exist for Ph.No : " + workbook[i].data[j][2].toString() });
																				console.log({ errorRes });
																			}
																			else {
																				classIdCheck = "";
																				classIdCheck = fetch_client_class_res.Items.filter(e => e.client_class_name.toLowerCase() === workbook[i].data[j][5].toString().toLowerCase());

																				if (classIdCheck.length == 0) {
																					errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "Unsubscribed class name : " + workbook[i].data[j][5].toString() });
																				}
																				else {
																					SectionIdCheck = "";
																					SectionIdCheck = section_data_res.Items.filter(e => e.client_class_id === classIdCheck[0].client_class_id && e.section_name.toLowerCase() === workbook[i].data[j][6].toLowerCase());

																					console.log("SECTION LENGTH : ", SectionIdCheck);

																					if (SectionIdCheck.length == 0) {
																						errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: "'" + workbook[i].data[j][6].toString() + "' Section is not exist for the '" + workbook[i].data[j][5] + "' Class." });
																					}
																					else {
																						rollNoCheck = "";
																						rollNoCheck = studentDataRes.filter(e => e.class_id === classIdCheck[0].client_class_id && e.section_id === SectionIdCheck[0].section_id && e.roll_no === workbook[i].data[j][7].toString().replace(/ /g, ''));

																						console.log("ROLL No LENGTH : ", rollNoCheck);
																						if (rollNoCheck.length > 0) {
																							errorRes.push({ sheet: workbook[i].name, rowNo: j, reason: workbook[i].data[j][7].toString() + " - Roll No already exist!" });
																						}
																						else {
																							studentsData.push({
																								student_id: helper.getRandomString(),
																								school_id: school_id,
																								parent_id: parentCheck[0].parent_id,
																								user_firstname: workbook[i].data[j][0],
																								user_lastname: workbook[i].data[j][1],
																								// user_phone_no: workbook[i].data[j][2].toString(),
																								// user_email: workbook[i].data[j][3].toLowerCase(),
																								user_dob: { yyyy_mm_dd: workbook[i].data[j][4], dd_mm_yyyy: helper.change_dd_mm_yyyy(workbook[i].data[j][4]) },
																								class_id: classIdCheck[0].client_class_id,
																								section_id: SectionIdCheck[0].section_id,
																								roll_no: workbook[i].data[j][7].toString().replace(/ /g, ''),
																								user_role: "Student",
																								user_status: "Active",
																								common_id: constant.constValues.common_id,
																								created_ts: helper.getCurrentTimestamp(),
																								updated_ts: helper.getCurrentTimestamp()
																							});

																							studentDataRes.push({ class_id: classIdCheck[0].client_class_id, section_id: SectionIdCheck[0].section_id, roll_no: workbook[i].data[j][7].toString() })
																						}
																					}
																				}
																			}
																		}
																		else {
																			console.log(workbook[i].name + ": EMPTY FIELDS IN SHEET ROW :" + j);
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
														/** END ROW LOOP **/
													}
													else {
														console.log("SHEET END");
														console.log("ERROR : ", errorRes);

														/** INSERT PARENTS **/
														userRepository.insertManyCases(parentsData, "Parents", function (insert_many_parents_err, insert_many_parents_response) {
															if (insert_many_parents_err) {
																console.log("ERROR : Insert Parent Data");
																console.log(insert_many_parents_err);
															} else {
																console.log("Parents Data Inserted Successfully");
																/** INSERT TEACHERS **/
																userRepository.insertManyCases(teachersData, "Teachers", function (insert_many_teacher_err, insert_many_teacher_response) {
																	if (insert_many_teacher_err) {
																		console.log("ERROR : Insert Teachers Data");
																		console.log(insert_many_teacher_err);
																	} else {
																		console.log("Teachers Data Inserted Successfully");

																		/** INSERT STUDENTS **/
																		userRepository.insertManyCases(studentsData, "Students", function (insert_many_students_err, insert_many_students_response) {
																			if (insert_many_students_err) {
																				console.log("ERROR : Insert Students Data");
																				console.log(insert_many_students_err);
																			} else {
																				console.log("Students Data Inserted Successfully");
																				errorRes = errorRes.filter((NA) => NA !== "N.A.");

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
																				/** END SENDING RESPONSE **/
																			}
																		})
																		/** INSERT STUDENTS **/
																	}
																})
																/** INSERT TEACHERS **/
															}
														})
														/** INSERT PARENTS **/
													}
												}
												sheetLoop(0);
												/** END PROCESS GOES **/
											}
										})
									}
								});
								/** FETCH CLIENT CLASSES **/
							}
						});
						/** FETCH CLIENT CLASSES **/
					}
				});
			}
		});
		/** END FETCH ALL PARENTS **/

	} else {
		callback(400, constant.messages.INVALID_DATA)
	}
}

exports.getStudentsDataBySection = async function (sheetData, clientClass, sectionData, callback) {
	let sectionIds = [];
	let classIdCheck = "";
	let Sections = "";
	async function sheetLoop(i) {
		if (i < sheetData.length) {
			if (sheetData[i].name == "Students") {
				async function loopRow(j) {
					if (j < sheetData[i].data.length) {
						if (sheetData[i].data[j].length > 0) {
							if (await helper.validateRows(sheetData[i].name, sheetData[i].data[j])) {
								classIdCheck = "";
								classIdCheck = clientClass.filter(ce => ce.client_class_name.toLowerCase() === sheetData[i].data[j][5].toString().toLowerCase());

								if (classIdCheck.length > 0) {
									Sections = "";
									Sections = sectionData.filter(e => e.client_class_id === classIdCheck[0].client_class_id && e.section_name.toLowerCase() === sheetData[i].data[j][6].toLowerCase());

									console.log("SECTION LENGTH : ", Sections);

									if (Sections.length > 0) {
										sectionIds.push(Sections[0].section_id);
									}
								}
							}
						}
						j++;
						loopRow(j);
					}
					else {
						i++;
						sheetLoop(i);
					}
				}
				loopRow(0);
			}
			else {
				i++;
				sheetLoop(i);
			}
		}
		else {
			/** END OF SHEET LOOP **/
			sectionIds = await helper.removeDuplicates(sectionIds);
			let fetchBulkStud = {
				IdArray: sectionIds,
				fetchIdName: "section_id",
				TableName: TABLE_NAMES.upschool_student_info
			}
			commonRepository.fetchBulkDataUsingIndex(fetchBulkStud, function (studentDataErr, studentDataRes) {
				if (studentDataErr) {
					console.log(studentDataErr);
					callback(studentDataErr, studentDataRes);
				} else {
					console.log("GOT STUDENT'S DATA");
					callback(0, studentDataRes.Items);
				}
			})
			/** END OF SHEET LOOP **/
		}
	}
	sheetLoop(0)
}

const sendBulkUploadResponse = (bulkError, reqToken, callback) => {
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

exports.getAllUsersData = async function (request, callback) {
	console.log(request);
	if (request.data.user_role == "Parents") {
		parentRepository.getActiveParentsData(request, function (All_parents_data_err, All_parents_data_res) {
			if (All_parents_data_err) {
				console.log(All_parents_data_err);
				callback(All_parents_data_err, All_parents_data_res);
			} else {
				callback(All_parents_data_err, All_parents_data_res.Items);
			}
		})
	}
	else if (request.data.user_role == "Teachers") {
		teacherRepository.getActiveTeachersData(request, function (All_teachers_data_err, All_teachers_data_res) {
			if (All_teachers_data_err) {
				console.log(All_teachers_data_err);
				callback(All_teachers_data_err, All_teachers_data_res);
			} else {
				callback(All_teachers_data_err, All_teachers_data_res.Items);
			}
		})
	}
	else if (request.data.user_role == "Students") {
		studentRepository.getActiveStudentsData(request, function (All_students_data_err, All_students_data_res) {
			if (All_students_data_err) {
				console.log(All_students_data_err);
				callback(All_students_data_err, All_students_data_res);
			} else {
				callback(All_students_data_err, All_students_data_res.Items);
			}
		})
	}
	else {
		console.log(constant.messages.INVALID_USER_ROLE);
		callback(400, constant.messages.INVALID_USER_ROLE)
	}
}

exports.getIndividualUser = async function (request, callback) {
	userRepository.getIndividualUserByRole(request, function (fetch_user_err, fetch_user_res) {
		if (fetch_user_err) {
			console.log(fetch_user_err);
			callback(fetch_user_err, fetch_user_res);
		} else {
			console.log(fetch_user_res);

			schoolRepository.getAllSchoolsIdsAndNames(request, function (fetch_all_school_ids_err, fetch_all_school_ids_response) {
				if (fetch_all_school_ids_err) {
					console.log(fetch_all_school_ids_err);
					callback(fetch_all_school_ids_err, fetch_all_school_ids_response);
				} else {

					if (request.data.user_role == "Student" && fetch_user_res.Items.length > 0) {
						let getPAtentRequest = {
							data: {
								user_id: fetch_user_res.Items[0].parent_id,
								user_role: "Parent",
							}
						};
						userRepository.getIndividualUserByRole(getPAtentRequest, function (parentNo_err, parentNo_res) {
							if (parentNo_err) {
								console.log(parentNo_err);
								callback(parentNo_err, parentNo_res);
							} else {
								fetch_user_res.Items[0].user_phone_no = parentNo_res.Items[0].user_phone_no;
								fetch_user_res.Items[0].user_email = parentNo_res.Items[0].user_email;

								/** FETCH CLASS LIST **/
								request.data.school_id = fetch_user_res.Items[0].school_id;
								schoolRepository.fetchAllClientClassList(request, function (fetch_client_class_err, fetch_client_class_res) {
									if (fetch_client_class_err) {
										console.log(fetch_client_class_err);
										callback(fetch_client_class_err, fetch_client_class_res);
									} else {
										let getStudentClassSections = {
											data: {
												client_class_id: fetch_user_res.Items[0].class_id,
											}
										};
										/** FETCH ALL CLASS SECTIONS **/
										sectionRepository.fetchSectionByClientClassId(getStudentClassSections, function (fetchSections_err, fetchSections_res) {
											if (fetchSections_err) {
												console.log(fetchSections_err);
												callback(fetchSections_err, fetchSections_res);
											} else {
												callback(0, { "Items": fetch_user_res.Items, "classList": fetch_client_class_res.Items, "schoolList": fetch_all_school_ids_response.Items, "sectionList": fetchSections_res.Items });
											}
										});
										/** END FETCH ALL CLASS SECTIONS **/
									}
								});
								/** FETCH CLASS LIST **/
							}
						})
					}
					else {
						callback(0, { "Items": fetch_user_res.Items, "classList": [], "schoolList": fetch_all_school_ids_response.Items, "sectionList": [] });
					}
				}
			});

		}
	});
}

exports.editUserByRole = async function (request, callback) {

	if (request.data.user_role == "Parent") {
		exports.updateParentData(request, (parentUpdateErr, parentUpdateRes) => {
			if (parentUpdateErr) {
				console.log(parentUpdateErr);
				callback(parentUpdateErr, parentUpdateRes)
			}
			else {
				console.log(parentUpdateRes);
				callback(parentUpdateErr, parentUpdateRes);
			}
		})
	}
	else if (request.data.user_role == "Teacher") {
		exports.updateTeacherData(request, (teacherUpdateErr, teacherUpdateRes) => {
			if (teacherUpdateErr) {
				console.log(teacherUpdateErr);
				callback(teacherUpdateErr, teacherUpdateRes)
			}
			else {
				console.log(teacherUpdateRes);
				callback(teacherUpdateErr, teacherUpdateRes);
			}
		})
	}
	else if (request.data.user_role == "Student") {
		exports.updateStudentData(request, (studentUpdateErr, studentUpdateRes) => {
			if (studentUpdateErr) {
				console.log(studentUpdateErr);
				callback(studentUpdateErr, studentUpdateRes)
			}
			else {
				console.log(studentUpdateRes);
				callback(studentUpdateErr, studentUpdateRes);
			}
		})
	}
	else {
		callback(400, constant.messages.INVALID_USER_ROLE)
	}
}

exports.updateParentData = async function (request, callback) {
	let mailCheck = "";
	let phoneCheck = "";
	parentRepository.getAllParentsData(request, function (All_parents_data_err, All_parents_data_res) {
		if (All_parents_data_err) {
			console.log(All_parents_data_err);
			callback(All_parents_data_err, All_parents_data_res);
		} else {

			console.log("PARENTS : ", All_parents_data_res);
			phoneCheck = All_parents_data_res.Items.filter(e => e.user_phone_no === request.data.user_phone_no.toString());
			mailCheck = All_parents_data_res.Items.filter(e => e.user_email === request.data.user_email);

			if (phoneCheck.length > 0 && phoneCheck[0].parent_id != request.data.parent_id) {
				console.log("PARENT PHONE NUMBER ALREADY IN USE");
				callback(400, constant.messages.PHONE_NO_ALREADY_IN_USE)
			}
			else {
				if (mailCheck.length > 0 && mailCheck[0].parent_id != request.data.parent_id) {
					console.log("PARENT EMAIL ID ALREADY IN USE");
					callback(400, constant.messages.EMAIL_ALREADY_IN_USE)
				}
				else {
					parentRepository.updateParent(request, function (update_Parent_err, update_Parent_response) {
						if (update_Parent_err) {
							console.log(update_Parent_err);
							callback(update_Parent_err, update_Parent_response);
						} else {
							console.log("Parent Updated !");
							callback(0, update_Parent_response);
						}
					});
				}
			}
		}
	})
}

exports.updateTeacherData = async function (request, callback) {
	let mailCheck = "";
	let phoneCheck = "";

	teacherRepository.getAllTeachersData(function (All_teachers_data_err, All_teachers_data_res) {
		if (All_teachers_data_err) {
			console.log(All_teachers_data_err);
			callback(All_teachers_data_err, All_teachers_data_res);
		} else {
			console.log("TEACHERS : ", All_teachers_data_res);
			phoneCheck = All_teachers_data_res.Items.filter(e => e.user_phone_no === request.data.user_phone_no.toString());
			mailCheck = All_teachers_data_res.Items.filter(e => e.user_email === request.data.user_email);

			if (phoneCheck.length > 0 && phoneCheck[0].teacher_id != request.data.teacher_id) {
				console.log("TEACHER PHONE NUMBER ALREADY IN USE");
				callback(400, constant.messages.PHONE_NO_ALREADY_IN_USE);
			}
			else {
				if (mailCheck.length > 0 && mailCheck[0].teacher_id != request.data.teacher_id) {
					console.log("TEACHER EMAIL ID ALREADY IN USE");
					callback(400, constant.messages.EMAIL_ALREADY_IN_USE);
				}
				else {
					teacherRepository.updateTeacher(request, function (update_teacher_err, update_teacher_response) {
						if (update_teacher_err) {
							console.log(update_teacher_err);
							callback(update_teacher_err, update_teacher_response);
						} else {
							console.log("Teacher Updated !");
							callback(0, update_teacher_response);
						}
					});
				}
			}
		}
	})
}

exports.updateStudentData = async function (request, callback) {
	console.log("UPDATE STUDENT");
	studentRepository.fetchStudentByRollNo(request, function (studentData_err, studentData_res) {
		if (studentData_err) {
			console.log(studentData_err);
			callback(studentData_err, studentData_res);
		} else {
			console.log("STUDENT DATA : ", studentData_res);
			if (studentData_res.Items.length > 0 && studentData_res.Items[0].student_id && studentData_res.Items[0].student_id != request.data.student_id) {
				console.log(constant.messages.ROLL_NO_ALREADY_EXIST);
				callback(400, constant.messages.ROLL_NO_ALREADY_EXIST);
			}
			else {
				/** PARENT CHECK **/
				parentRepository.getParentByPhoneAndSchoolId(request, function (parentData_err, parentData_res) {
					if (parentData_err) {
						console.log(parentData_err);
						callback(parentData_err, parentData_res);
					} else {
						console.log("PARENT : ", parentData_res);
						if (parentData_res.Items.length == 0) {
							console.log(constant.messages.PARENT_DOESNT_EXIST);
							callback(400, constant.messages.PARENT_DOESNT_EXIST);
						}
						else {
							request.data.parent_id = parentData_res.Items[0].parent_id;
							studentRepository.updateStudent(request, function (update_student_err, update_student_response) {
								if (update_student_err) {
									console.log(update_student_err);
									callback(update_student_err, update_student_response);
								} else {
									console.log("Student Updated !");
									callback(0, update_student_response);
								}
							});
						}
					}
				})
				/** END PARENT CHECK **/
			}
		}
	})
}

exports.ChangeUserStatus = async function (request, callback) {
	if (request.data.user_status === `Active` || request.data.user_status === `Archived`) {
		schoolRepository.getSchoolDetailsById(request, function (fetch_school_details_err, fetch_school_details_response) {
			if (fetch_school_details_err) {
				console.log(fetch_school_details_err);
				callback(fetch_school_details_err, fetch_school_details_response);
			} else {
				if (fetch_school_details_response.Items[0].school_status === `Active`) {
					switch (request.data.user_role) {
						case `Parent`:
							// code block
							parentRepository.changeParentStatus(request, function (delete_parent_err, delete_parent_response) {
								if (delete_parent_err) {
									console.log(delete_parent_err);
									callback(delete_parent_err, delete_parent_response);
								} else {
									callback(0, delete_parent_response);
								}
							});
							break;
						case `Teacher`:
							// code block
							teacherRepository.changeTeacherStatus(request, function (delete_teacher_err, delete_teacher_response) {
								if (delete_teacher_err) {
									console.log(delete_teacher_err);
									callback(delete_teacher_err, delete_teacher_response);
								} else {
									callback(0, delete_teacher_response);
								}
							});
							break;
						case `Student`:
							studentRepository.changeStudentStatus(request, function (delete_student_err, delete_student_response) {
								if (delete_student_err) {
									console.log(delete_student_err);
									callback(delete_student_err, delete_student_response);
								} else {
									callback(0, delete_student_response);
								}
							});
							break;
						default:
							// code block
							callback(400, constant.messages.INVALID_USER_ROLE)
					}
				} else {
					callback(400, constant.messages.USER_CANT_TOGGLE)
				}
			}
		});
	} else {
		callback(400, constant.messages.INVALID_USER_STATUS)
	}
}

exports.addCMSUser = function (request, callback) {

	userRepository.fetchCMSUserByUserName(request, async function (fetch_by_username_err, fetch_by_username_response) {
		if (fetch_by_username_err) {
			console.log("---", fetch_by_username_err);
			callback(fetch_by_username_err, fetch_by_username_response);
		} else {
			console.log("fetch_by_username_response : ", fetch_by_username_response);

			if (fetch_by_username_response.Items.length === 0) {

				userRepository.fetchCMSUserByEmail(request, async function (fetch_by_email_err, fetch_by_email_response) {
					if (fetch_by_email_err) {
						console.log("---", fetch_by_email_err);
						callback(fetch_by_email_err, fetch_by_email_response);
					} else {

						if (fetch_by_email_response.Items.length === 0) {
							console.log(" fetch_by_email_response : ", fetch_by_email_response.Items);

							userRepository.fetchCMSUserByPhone(request, async function (fetch_by_phone_err, fetch_by_phone_response) {
								if (fetch_by_phone_err) {
									console.log("---", fetch_by_phone_err);
									callback(fetch_by_phone_err, fetch_by_phone_response);
								} else {

									if (fetch_by_phone_response.Items.length === 0) {

										var user_salt = helper.getRandomString();
										let hashReq = {
											"salt": user_salt,
											"password": request.data.user_password
										}

										console.log("helper.hashingPassword(hashReq) : ", helper.hashingPassword(hashReq));
										console.log("CHANGE HASH REQ : ", hashReq);
										console.log("user_salt : ", user_salt);

										let user_pwd = helper.hashingPassword(hashReq);
										request.data["user_salt"] = user_salt;
										request.data["user_pwd"] = user_pwd;

										/** FETCH USER BY EMAIL **/
										userRepository.insertCMSUser(request, function (insert_user_err, insert_user_response) {
											if (insert_user_err) {
												console.log(insert_user_err);
												callback(insert_user_err, insert_user_response);
											} else {
												console.log("user Added Successfully");
												callback(0, insert_user_response);
											}
										});
									} else {
										console.log("User Phone Number Already Exists");
										callback(401, constant.messages.USER_PHONE_ALREADY_EXISTS);
									}
								}
							})
						} else {
							console.log("User Email Already Exists");
							callback(401, constant.messages.USER_EMAIL_ALREADY_EXISTS);
						}
					}
				})
			} else {
				console.log("User Name Already Exists");
				callback(401, constant.messages.USER_USERNAME_ALREADY_EXISTS);
			}
		}
	});
}

exports.bulkUserStatusToggle = async function (request, callback) {

	request.data.tableUserID = (request.data.user_role == "Parent") ? "parent_id" : (request.data.user_role == "Teacher") ? "teacher_id" : "student_id";

	request.data.userTableName = (request.data.user_role == "Parent") ? TABLE_NAMES.upschool_parent_info : (request.data.user_role == "Teacher") ? TABLE_NAMES.upschool_teacher_info : TABLE_NAMES.upschool_student_info;

	let passUserRole = (request.data.user_role == "Parent") ? "Parents" : (request.data.user_role == "Teacher") ? "Teachers" : "Students";

	if (request.data.selectedUsers.length > 0) {
		let userIdArray = request.data.selectedUsers.map(uID => uID.user_id);
		let schoolIdArray = request.data.selectedUsers.map(uID => uID.school_id);

		userIdArray = [...new Set(userIdArray)];
		schoolIdArray = [...new Set(schoolIdArray)];

		console.log({ userIdArray });
		console.log({ schoolIdArray });
		request.data.userIdArray = userIdArray;

		console.log("CHANGED REQUEST : ", request);

		userRepository.fetchBulkUserssData(request, function (bulkUserData_err, bulkUserData_res) {
			if (bulkUserData_err) {
				console.log(bulkUserData_err);
				callback(bulkUserData_err, bulkUserData_res);
			} else {
				console.log("BULK USER DATA : ", bulkUserData_res);

				let fetchBulkReq = {
					IdArray: schoolIdArray,
					fetchIdName: "school_id",
					TableName: TABLE_NAMES.upschool_school_info_table
				}

				commonRepository.fetchBulkData(fetchBulkReq, function (schoolData_err, schoolData_res) {
					if (schoolData_err) {
						console.log(schoolData_err);
						callback(schoolData_err, schoolData_res);
					} else {
						console.log("SCHOOL DATA");
						console.log(schoolData_res.Items);

						if (bulkUserData_res.Items.length > 0) {
							let updateData = [];
							let schoolStatusCheck = "";
							let finalResponse = "";
							let failCount = 0;
							function changeUserStatus(i) {
								if (i < bulkUserData_res.Items.length) {
									schoolStatusCheck = "";
									if (request.data.user_status === "Active") {
										schoolStatusCheck = schoolData_res.Items.filter(sch => (sch.school_id === bulkUserData_res.Items[i].school_id && sch.school_status === "Active"));
										if (schoolStatusCheck.length > 0) {
											bulkUserData_res.Items[i].user_status = request.data.user_status;
											updateData.push(bulkUserData_res.Items[i]);
										}
										else {
											finalResponse += ", " + bulkUserData_res.Items[i].user_firstname;
											failCount++;
										}
									}
									else {
										bulkUserData_res.Items[i].user_status = request.data.user_status;
										updateData.push(bulkUserData_res.Items[i]);
									}

									i++;
									changeUserStatus(i);
								}
								else {
									console.log("FINAL USER DATA : ", updateData);
									console.log("FAIL RESPONSE : ", finalResponse);

									/** BULK UPDATE **/
									userRepository.insertManyCases(updateData, passUserRole, function (updateBulkData_err, updateBulkData_res) {
										if (updateBulkData_err) {
											console.log("ERROR : TOGGLE BULK USER DATA");
											console.log(updateBulkData_err);
										} else {
											console.log("BULK USER STATUS UPDATED!");
											console.log(updateBulkData_res);

											if (failCount > 0) {
												finalResponse = finalResponse.slice(2);
												console.log((failCount > 1) ? constant.messages.UNABLE_TO_RESTORE_BULK_USERS.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_RESTORE_ONE_USER.replace("**REPLACE**", finalResponse));
												callback(400, (failCount > 1) ? constant.messages.UNABLE_TO_RESTORE_BULK_USERS.replace("**REPLACE**", finalResponse) : constant.messages.UNABLE_TO_RESTORE_ONE_USER.replace("**REPLACE**", finalResponse));
											}
											else {
												callback(0, 200);
											}
										}
									})
									/** END BULK UPDATE **/
								}
							}
							changeUserStatus(0)
						}
						else {
							console.log("EMPTY DATA FROM BULK FETCH");
							callback(0, 200);
						}
					}
				})
			}
		});
	}
	else {
		console.log("EMPTY ARRAY");
		callback(0, 200);
	}
}

exports.editCMSUser = function (request, callback) {

	userRepository.fetchCMSUserByUserName(request, async function (fetch_by_username_err, fetch_by_username_response) {
		if (fetch_by_username_err) {
			console.log("---", fetch_by_username_err);
			callback(fetch_by_username_err, fetch_by_username_response);
		} else {
			console.log("fetch_by_username_response.Items : ", fetch_by_username_response.Items);

			if (fetch_by_username_response.Items.length > 0 && fetch_by_username_response.Items.filter(e => e.user_id !== request.data.user_id).length > 0) {
				console.log("User Name Already Exists");
				callback(401, constant.messages.USER_USERNAME_ALREADY_EXISTS);
			} else {
				userRepository.fetchCMSUserByEmail(request, async function (fetch_by_email_err, fetch_by_email_response) {
					if (fetch_by_email_err) {
						console.log("---", fetch_by_email_err);
						callback(fetch_by_email_err, fetch_by_email_response);
					} else {
						console.log("fetch_by_email_response.Items : ", fetch_by_email_response.Items);

						if (fetch_by_email_response.Items.length > 0 && fetch_by_email_response.Items.filter(e => e.user_id !== request.data.user_id).length > 0) {

							console.log("User Email Already Exists");
							callback(401, constant.messages.USER_EMAIL_ALREADY_EXISTS);

						} else {
							userRepository.fetchCMSUserByPhone(request, async function (fetch_by_phone_err, fetch_by_phone_response) {
								if (fetch_by_phone_err) {
									console.log("---", fetch_by_phone_err);
									callback(fetch_by_phone_err, fetch_by_phone_response);
								} else {
									console.log("fetch_by_phone_response.Items : ", fetch_by_phone_response.Items);

									if (fetch_by_phone_response.Items.length > 0 && fetch_by_phone_response.Items.filter(e => e.user_id !== request.data.user_id).length > 0) {

										console.log("User Phone Number Already Exists");
										callback(401, constant.messages.USER_PHONE_ALREADY_EXISTS);

									} else {
										userRepository.updateCMSUser(request, function (update_user_err, update_user_response) {
											if (update_user_err) {
												console.log(update_user_err);
												callback(update_user_err, update_user_response);
											} else {
												console.log("user Added Successfully");
												callback(0, update_user_response);
											}
										});
									}
								}
							})

						}
					}
				})
			}
		}
	});

}
exports.getIndividualCMSUser = function (request, callback) {
	/** FETCH USER BY EMAIL **/
	userRepository.fetchCMSUserDataByUserId(request, function (fetch_single_user_err, fetch_single_user_response) {
		if (fetch_single_user_err) {
			console.log(fetch_single_user_err);
			callback(fetch_single_user_err, fetch_single_user_response);
		} else {
			console.log("Single User Fetched Successfully");
			// callback(0, 200);
			callback(fetch_single_user_err, fetch_single_user_response);
		}
	})
}

exports.getCMSUsersBasedonRoleStatus = function (request, callback) {
	/** FETCH USER BY EMAIL **/
	userRepository.fetchCMSUsersListBasedonRoleStatus(request, function (fetch_all_users_err, fetch_all_users_response) {
		if (fetch_all_users_err) {
			console.log(fetch_all_users_err);
			callback(fetch_all_users_err, fetch_all_users_response);
		} else {
			let userType = request.data.user_type;

			switch (userType) {
				case 'admin':
					let adminData = fetch_all_users_response.Items.filter(e => e.user_role === userType);
					adminData.sort((a, b) => {
						return new Date(b.updated_ts) - new Date(a.updated_ts);
					});
					callback(fetch_all_users_err, adminData);
					break;
				case 'reviewer':
					let reviewerData = [];
					let reviewer_data = fetch_all_users_response.Items.filter(e => e.user_role !== "admin");
					reviewer_data.map(e => {
						let checkReviewer = e.user_role.filter(f => f.roles.includes(userType));
						checkReviewer.length > 0 && reviewerData.push(e);
					});
					reviewerData.sort((a, b) => {
						return new Date(b.updated_ts) - new Date(a.updated_ts);
					});
					console.log("All Reviewers Fetched Successfully");
					callback(fetch_all_users_err, reviewerData);
					break;
				case 'creator':
					let creatorData = [];
					let creator_data = fetch_all_users_response.Items.filter(e => e.user_role !== "admin");
					console.log("creator_data : ", creator_data)
					creator_data.map(e => {
						let checkCreator = e.user_role.filter(f => f.roles.includes(userType));
						checkCreator.length > 0 && creatorData.push(e);
					});
					creatorData.sort((a, b) => {
						return new Date(b.updated_ts) - new Date(a.updated_ts);
					});
					console.log("All Creators Fetched Successfully");
					callback(fetch_all_users_err, creatorData);
					break;
				case 'publisher':
					let publisherData = [];
					let publisher_data = fetch_all_users_response.Items.filter(e => e.user_role !== "admin");
					publisher_data.map(e => {
						let checkPublisher = e.user_role.filter(f => f.roles.includes(userType));
						checkPublisher.length > 0 && publisherData.push(e);
					});
					publisherData.sort((a, b) => {
						return new Date(b.updated_ts) - new Date(a.updated_ts);
					});
					console.log("All Publishers Fetched Successfully");
					callback(fetch_all_users_err, publisherData);
					break;
				default:
					callback(501, constant.messages.INVALID_CMS_USER_TYPE);
			}

		}
	})
}
exports.changeCMSUserStatus = function (request, callback) {
	/** FETCH USER BY EMAIL **/
	userRepository.switchCMSUserStatus(request, function (fetch_switch_status_err, fetch_switch_status_response) {
		if (fetch_switch_status_err) {
			console.log(fetch_switch_status_err);
			callback(fetch_switch_status_err, fetch_switch_status_response);
		} else {
			console.log("User Status Changed Successfully");
			// callback(0, 200);
			callback(fetch_switch_status_err, fetch_switch_status_response);
		}
	})
}
exports.multiToggleCMSUserStatus = async function (request, callback) {
	console.log("request ; ", request);
	if (request.data.cms_user_array.length > 0) {
		userRepository.fetchCMSUserData(request, function (bulkCMSUserData_err, bulkCMSUserData_res) {
			if (bulkCMSUserData_err) {
				console.log(bulkCMSUserData_err);
				callback(bulkCMSUserData_err, bulkCMSUserData_res);
			} else {
				console.log("BULK DATA : ", bulkCMSUserData_res);

				if (bulkCMSUserData_res.Items.length > 0) {
					function changeCMSUserStatus(i) {
						if (i < bulkCMSUserData_res.Items.length) {
							bulkCMSUserData_res.Items[i].user_status = request.data.user_status;
							i++;
							changeCMSUserStatus(i);
						}
						else {
							/** BULK UPDATE **/
							userRepository.changeMultipleCMSUsersStatus(bulkCMSUserData_res.Items, function (updateBulkData_err, updateBulkData_res) {
								if (updateBulkData_err) {
									console.log("ERROR : TOGGLE BULK CMS USER DATA");
									console.log(updateBulkData_err);
								} else {
									console.log("BULK CMS USER STATUS UPDATED!");
									console.log(updateBulkData_res);
									callback(0, 200);
								}
							})
							/** END BULK UPDATE **/
						}
					}
					changeCMSUserStatus(0)
				}
				else {
					console.log("EMPTY DATA FROM BULK FETCH");
					callback(0, 200);
				}

			}
		});
	}
	else {
		console.log("EMPTY ARRAY");
		callback(0, 200);
	}
}

exports.searchFilter = function (request, callback) {


	if (request.data.user === "Teacher") {
		// Teachers : 
		userRepository.searchTeachers(request, function (search_teachers_err, search_teachers_response) {
			if (search_teachers_err) {
				console.log(search_teachers_err);
				callback(search_teachers_err, search_teachers_response);
			} else {
				console.log("Teachers fetched Successfully");
				// callback(0, 200);
				callback(search_teachers_err, search_teachers_response);
			}
		})
	} else if (request.data.user === "Parent") {
		// Parents : 
		userRepository.searchParents(request, function (search_parents_err, search_parents_response) {
			if (search_parents_err) {
				console.log(search_parents_err);
				callback(search_parents_err, search_parents_response);
			} else {
				console.log("Parents fetched Successfully");
				// callback(0, 200);
				callback(search_parents_err, search_parents_response);
			}
		})
	} else if (request.data.user === "Student") {
		// Students : 
		userRepository.searchStudents(request, function (search_students_err, search_students_response) {
			if (search_students_err) {
				console.log(search_students_err);
				callback(search_students_err, search_students_response);
			} else {
				console.log("Students fetched Successfully");
				// callback(0, 200);
				callback(search_students_err, search_students_response);
			}
		})
	} else {
		callback(400, constant.messages.INVALID_REQUEST_FORMAT)
	}
}
exports.fetchPaginatedUsers = function (request, callback) {
	if (request.data.user === "Teacher" || request.data.user === "Parent" || request.data.user === "Student" || request.data.user === "Admin") {

		(request.data.start_key === "0" || request.data.start_key === 0) ? (request.data.start_key = null) : (request.data.start_key = request.data.start_key);


		userRepository.getPaginatedItems(request, function (get_paginated_users_err, get_paginated_users_response) {
			if (get_paginated_users_err) {
				console.log(get_paginated_users_err);
				callback(get_paginated_users_err, get_paginated_users_response);
			} else {
				get_paginated_users_response.Items.sort((a, b) => {
					return new Date(b.updated_ts) - new Date(a.updated_ts);
				});  
				console.log("Paginated Users fetched Successfully");
				callback(get_paginated_users_err, get_paginated_users_response);
			}
		})
	} else {
		get_paginated_users_response.Items.sort((a, b) => {
			return new Date(b.updated_ts) - new Date(a.updated_ts);
		});  
		callback(400, constant.messages.INVALID_REQUEST_FORMAT);
	}
}
