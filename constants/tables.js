let database_prefix = process.env.DB_PREFIX;

exports.TABLE_NAMES = {
    upschool_users_table: `${database_prefix}upschool_users_table`,  
    upschool_digi_card_table: `${database_prefix}upschool_digi_card_table`,  
    upschool_topic_table: `${database_prefix}upschool_topic_table`,  
    upschool_chapter_table: `${database_prefix}upschool_chapter_table`,  
    upschool_unit_table: `${database_prefix}upschool_unit_table`,  
    upschool_standard_table: `${database_prefix}upschool_standard_table`,  
    
    upschool_parent_info: `${database_prefix}upschool_parent_info`,
    upschool_student_info: `${database_prefix}upschool_student_info`,
    upschool_teacher_info: `${database_prefix}upschool_teacher_info`,
    upschool_school_info_table: `${database_prefix}upschool_school_info_table`,
    upschool_class_table: `${database_prefix}upschool_class_table`,
    upschool_client_class_table: `${database_prefix}upschool_client_class_table`,
    upschool_concept_blocks_table: `${database_prefix}upschool_concept_blocks_table`,
    upschool_subject_table: `${database_prefix}upschool_subject_table`,
    upschool_question_table: `${database_prefix}upschool_question_table`,
    upschool_section_table: `${database_prefix}upschool_section_table`,
    upschool_group_table: `${database_prefix}upschool_group_table`,
    upschool_presets_table: `${database_prefix}upschool_presets_table`,
    upschool_content_category: `${database_prefix}upschool_content_category`,
    upschool_content_disclaimer: `${database_prefix}upschool_content_disclaimer`,
    upschool_question_source: `${database_prefix}upschool_question_source`,
    upschool_cognitive_skill: `${database_prefix}upschool_cognitive_skill`,
    upschool_teaching_activity: `${database_prefix}upschool_teaching_activity`,
    upschool_blueprint_table: `${database_prefix}upschool_blueprint_table`,
    upschool_test_question_paper: `${database_prefix}upschool_test_question_paper`,

}