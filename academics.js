// academics.js - faculties/colleges/schools and departments per institution.
// Key = exact institution name from the institution list in auth.html.
const SCHOOL_ACADEMICS = {
    'University of Ibadan': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics', 'Agricultural Extension and Rural Development', 'Agronomy', 'Animal Science', 'Crop Protection and Environmental Biology']],
        ['Faculty of Arts', ['Arabic and Islamic Studies', 'Archaeology and Anthropology', 'Classics', 'Communication and Language Arts', 'English', 'European Studies', 'History', 'Linguistics and African Languages', 'Music', 'Philosophy', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Biochemistry', 'Medical Laboratory Science', 'Pharmacology and Therapeutics', 'Physiology']],
        ['Faculty of Clinical Sciences', ['Anaesthesia', 'Medicine and Surgery (MBBS)', 'Nursing', 'Obstetrics and Gynaecology', 'Ophthalmology', 'Otorhinolaryngology', 'Paediatrics', 'Physiotherapy', 'Psychiatry', 'Radiology']],
        ['Faculty of Computing', ['Computer Science and Artificial Intelligence', 'Data Science', 'Information and Communication Technology', 'Software Engineering']],
        ['Faculty of Dentistry', ['Child Oral Health', 'Oral and Maxillofacial Surgery', 'Oral Pathology and Oral Medicine', 'Periodontology and Community Dentistry', 'Restorative Dentistry']],
        ['Faculty of Economics and Management Sciences', ['Accounting', 'Banking and Finance', 'Economics', 'Marketing']],
        ['Faculty of Education', ['Adult Education', 'Arts and Social Sciences Education', 'Counselling and Human Development Studies', 'Early Childhood and Educational Foundations', 'Educational Management', 'Human Kinetics and Health Education', 'Library, Archival and Information Studies', 'Science and Technology Education', 'Social Work', 'Special Education', 'Teacher Education']],
        ['Faculty of Environmental Design and Management', ['Architecture', 'Estate Management', 'Quantity Surveying', 'Urban and Regional Planning']],
        ['Faculty of Law', ['Jurisprudence and International Law', 'Private and Business Law', 'Public Law']],
        ['Faculty of Pharmacy', ['Clinical Pharmacy and Pharmacy Administration', 'Pharmaceutical Chemistry', 'Pharmaceutical Microbiology', 'Pharmaceutics and Industrial Pharmacy', 'Pharmacognosy', 'Pharmacology and Toxicology']],
        ['Faculty of Public Health', ['Environmental Health Sciences', 'Epidemiology and Medical Statistics', 'Health Policy and Management', 'Health Promotion and Education', 'Human Nutrition and Dietetics']],
        ['Faculty of Renewable Natural Resources', ['Aquaculture and Fisheries Management', 'Forest Production and Products', 'Forest Resources Management', 'Social and Environmental Forestry', 'Wildlife and Ecotourism Management']],
        ['Faculty of Science', ['Botany', 'Chemistry', 'Geology', 'Industrial Chemistry', 'Mathematics', 'Microbiology', 'Physics', 'Statistics', 'Zoology']],
        ['Faculty of Social Sciences', ['Geography', 'Political Science', 'Psychology', 'Sociology']],
        ['Faculty of Technology', ['Agricultural and Environmental Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Food Technology', 'Industrial and Production Engineering', 'Mechanical Engineering', 'Petroleum Engineering', 'Wood Products Engineering']],
        ['Faculty of Veterinary Medicine', ['Veterinary Anatomy', 'Veterinary Medicine', 'Veterinary Microbiology', 'Veterinary Parasitology and Entomology', 'Veterinary Pathology', 'Veterinary Pharmacology and Toxicology', 'Veterinary Physiology and Biochemistry', 'Veterinary Public Health and Preventive Medicine', 'Veterinary Surgery and Radiology']]
      ].map(([name, departments]) => ({ name, departments }))
     },
     'University of Lagos': {
      label: 'Faculty',
      list: [
        ['Faculty of Architecture', ['Architecture', 'Landscape Architecture and Urban Design', 'Interior Architecture and Design']],
        ['Faculty of Arts', ['English', 'European Languages and Integration Studies', 'History and Strategic Studies', 'Linguistics, African and Asian Studies', 'Philosophy', 'Religious Studies']],
        ['Faculty of Basic Clinical Sciences', ['Anatomic and Molecular Pathology', 'Haematology and Blood Transfusion', 'Medical Microbiology and Parasitology', 'Clinical Pathology', 'Clinical Pharmacology']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Physiology', 'Medical Biochemistry', 'Pharmacology, Therapeutics and Toxicology']],
        ['Faculty of Clinical Sciences', ['Anaesthesia', 'Community Health and Primary Care', 'Medicine', 'Obstetrics and Gynaecology', 'Ophthalmology', 'Paediatrics', 'Psychiatry', 'Radiation Biology, Radiotherapy and Radiodiagnosis', 'Surgery']],
        ['Faculty of Communication and Media Studies', ['Mass Communication', 'Public Relations and Advertising', 'Journalism, Broadcasting and Media Studies']],
        ['Faculty of Computing and Informatics', ['Computer Science', 'Intelligent Systems and Robotics', 'Cybersecurity and Software Engineering']],
        ['Faculty of Creative Arts', ['Music and Sound Production', 'Theatre Arts and Film Studies', 'Fine and Applied Arts']],
        ['Faculty of Dental Sciences', ['Child Dental Health', 'Oral and Maxillofacial Pathology/Biology', 'Oral and Maxillofacial Surgery', 'Preventive Dentistry', 'Restorative Dentistry']],
        ['Faculty of Education', ['Adult Education', 'Arts Education', 'Educational Foundations', 'Educational Management', 'Human Kinetics and Health Education', 'Science Education', 'Social Sciences Education', 'Technology and Vocational Education']],
        ['Faculty of Engineering', ['Biomedical Engineering', 'Chemical Engineering', 'Petroleum and Gas Engineering', 'Civil and Environmental Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Metallurgical and Materials Engineering', 'Surveying and Geoinformatics', 'Systems Engineering']],
        ['Faculty of Environmental Sciences', ['Building', 'Estate Management', 'Quantity Surveying', 'Urban and Regional Planning']],
        ['Faculty of Health Professions', ['Medical Laboratory Science', 'Nursing Science', 'Physiotherapy', 'Radiography']],
        ['Faculty of Law', ['Commercial and Industrial Law', 'Jurisprudence and International Law', 'Private and Property Law', 'Public Law']],
        ['Faculty of Life Sciences', ['Biochemistry', 'Botany', 'Cell Biology and Genetics', 'Marine Science', 'Microbiology', 'Zoology', 'Fisheries and Aquaculture']],
        ['Faculty of Management Sciences', ['Accounting', 'Actuarial Science and Insurance', 'Business Administration', 'Employment Relations and Human Resource Management', 'Finance']],
        ['Faculty of Pharmacy', ['Clinical Pharmacy and Biopharmacy', 'Pharmaceutical Chemistry', 'Pharmaceutical Microbiology and Biotechnology', 'Pharmaceutics and Pharmaceutical Technology', 'Pharmacognosy']],
        ['Faculty of Physical and Earth Sciences', ['Chemistry', 'Geosciences', 'Mathematics', 'Physics', 'Statistics']],
        ['Faculty of Social Sciences', ['Economics', 'Geography', 'Library and Information Science', 'Political Science', 'Psychology', 'Social Work', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
  },
        'University of Benin': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension Services', 'Animal Science', 'Aquaculture and Fisheries Management', 'Crop Science', 'Food Science and Nutrition', 'Forestry Resources and Wildlife Management', 'Soil Science and Land Management']],
        ['Faculty of Arts', ['English and Literature', 'Fine and Applied Arts', 'Foreign Languages', 'History and International Studies', 'Linguistics and Nigerian Languages', 'Mass Communication', 'Philosophy', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Biochemistry', 'Medical Laboratory Science', 'Nursing Science', 'Pharmacology and Toxicology', 'Physiology', 'Public Health']],
        ['Faculty of Dentistry', ['Child Dental Health', 'Oral and Maxillofacial Surgery', 'Oral Diagnosis and Radiology', 'Preventive Dentistry', 'Restorative Dentistry']],
        ['Faculty of Education', ['Arts Education', 'Educational Evaluation and Counselling Psychology', 'Educational Management', 'Health, Safety and Environmental Education', 'Human Kinetics and Sports Science', 'Library and Information Science', 'Science Education', 'Social Science Education', 'Vocational and Technical Education']],
        ['Faculty of Engineering', ['Agricultural Engineering', 'Chemical Engineering', 'Civil Engineering', 'Computer Engineering', 'Electrical/Electronics Engineering', 'Mechanical Engineering', 'Metallurgical and Materials Engineering', 'Petroleum Engineering', 'Production Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Building', 'Estate Management', 'Quantity Surveying', 'Surveying and Geoinformatics', 'Urban and Regional Planning']],
        ['Faculty of Law', ['Commercial and Industrial Law', 'Jurisprudence and International Law', 'Private and Property Law', 'Public Law']],
        ['Faculty of Life Sciences', ['Animal and Environmental Biology', 'Biochemistry', 'Environmental Management and Toxicology', 'Microbiology', 'Optometry', 'Plant Biology and Biotechnology', 'Science Laboratory Technology']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Industrial Relations and Personnel Management', 'Insurance', 'Marketing']],
        ['Faculty of Medicine', ['Medicine and Surgery (MBBS)', 'Anaesthesia', 'Chemical Pathology', 'Community Health', 'Haematology and Blood Transfusion', 'Medical Microbiology', 'Morbid Anatomy', 'Obstetrics and Gynaecology', 'Ophthalmology', 'Otorhinolaryngology', 'Paediatrics', 'Psychiatry', 'Radiology', 'Surgery']],
        ['Faculty of Pharmacy', ['Clinical Pharmacy and Pharmacy Practice', 'Pharmaceutical Chemistry', 'Pharmaceutical Microbiology and Biotechnology', 'Pharmaceutics and Pharmaceutical Technology', 'Pharmacognosy', 'Pharmacology and Toxicology']],
        ['Faculty of Physical Sciences', ['Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Physics', 'Statistics']],
        ['Faculty of Social Sciences', ['Demography and Social Statistics', 'Economics and Statistics', 'Geography and Regional Planning', 'Political Science and Public Administration', 'Psychology', 'Social Work', 'Sociology and Anthropology']],
        ['Faculty of Veterinary Medicine', ['Veterinary Medicine']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'University of Ilorin': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Farm Management', 'Agricultural Extension and Rural Development', 'Agronomy', 'Animal Production', 'Aquaculture and Fisheries', 'Crop Protection', 'Forest Resources Management', 'Home Economics and Food Science']],
        ['Faculty of Arts', ['Arabic and Transnational Studies', 'English', 'French', 'History and International Studies', 'Linguistics and Nigerian Languages', 'Performing Arts', 'Religions']],
        ['Faculty of Basic Clinical Sciences', ['Chemical Pathology and Immunology', 'Haematology and Blood Transfusion', 'Medical Laboratory Science', 'Medical Microbiology and Parasitology', 'Medical Radiography', 'Pathology', 'Pharmacology and Therapeutics', 'Physiotherapy']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Biochemistry', 'Physiology']],
        ['Faculty of Clinical Sciences', ['Anaesthesia', 'Behavioural Science', 'Dentistry', 'Epidemiology and Community Health', 'Family Medicine', 'Medicine', 'Nursing Science', 'Obstetrics and Gynaecology', 'Ophthalmology', 'Otorhinolaryngology', 'Paediatrics and Child Health', 'Radiology', 'Surgery']],
        ['Faculty of Communication and Information Sciences', ['Computer Science', 'Information Technology', 'Library and Information Science', 'Mass Communication', 'Telecommunication Science']],
        ['Faculty of Education', ['Adult and Primary Education', 'Arts Education', 'Educational Guidance and Counselling', 'Educational Management', 'Educational Technology', 'Health Promotion and Environmental Health Education', 'Human Kinetics and Health Education', 'Science Education', 'Social Sciences Education']],
        ['Faculty of Engineering and Technology', ['Agricultural and Biosystems Engineering', 'Biomedical Engineering', 'Chemical Engineering', 'Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Food and Bioprocess Engineering', 'Materials and Metallurgical Engineering', 'Mechanical Engineering', 'Water Resources and Environmental Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Estate Management', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['Faculty of Law', ['Business Law', 'Islamic Law', 'Jurisprudence and International Law', 'Private and Property Law', 'Public Law']],
        ['Faculty of Life Sciences', ['Biochemistry', 'Microbiology', 'Optometry and Vision Science', 'Plant Biology', 'Zoology']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Finance', 'Industrial Relations and Personnel Management', 'Marketing', 'Public Administration']],
        ['Faculty of Pharmaceutical Sciences', ['Clinical Pharmacy and Pharmacy Practice', 'Pharmaceutical and Medicinal Chemistry', 'Pharmaceutical Microbiology and Biotechnology', 'Pharmaceutics and Industrial Pharmacy', 'Pharmacognosy and Drug Development', 'Pharmacology and Toxicology']],
        ['Faculty of Physical Sciences', ['Chemistry', 'Geology and Mineral Science', 'Geophysics', 'Industrial Chemistry', 'Mathematics', 'Physics', 'Statistics']],
        ['Faculty of Social Sciences', ['Criminology and Security Studies', 'Economics', 'Geography and Environmental Management', 'Political Science', 'Psychology', 'Social Work', 'Sociology']],
        ['Faculty of Veterinary Medicine', ['Theriogenology and Production', 'Veterinary Anatomy', 'Veterinary Medicine', 'Veterinary Microbiology', 'Veterinary Parasitology and Entomology', 'Veterinary Pathology', 'Veterinary Pharmacology and Toxicology', 'Veterinary Physiology and Biochemistry', 'Veterinary Public Health and Preventive Medicine', 'Veterinary Surgery and Radiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'University of Jos': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Production', 'Crop Production']],
        ['Faculty of Architecture', ['Architecture', 'Interior Architecture Design', 'Landscape Architecture']],
        ['Faculty of Arts', ['Archaeology and Heritage Studies', 'English', 'Foreign Languages', 'History and International Studies', 'Linguistics and Nigerian Languages', 'Mass Communication', 'Music', 'Religion and Philosophy', 'Theatre and Film Arts']],
        ['Faculty of Basic Medical Sciences', ['Biochemistry', 'Human Anatomy', 'Human Physiology', 'Medical Biochemistry']],
        ['Faculty of Clinical Sciences', ['Anaesthesia', 'Community Medicine', 'Medicine', 'Obstetrics and Gynaecology', 'Ophthalmology', 'Otorhinolaryngology', 'Paediatrics', 'Pathology', 'Psychiatry', 'Radiology', 'Surgery']],
        ['Faculty of Dental Sciences', ['Child Oral Health', 'Oral and Maxillofacial Surgery', 'Oral Pathology', 'Preventive Dental Sciences', 'Restorative Dental Sciences']],
        ['Faculty of Education', ['Arts Education', 'Educational Foundations', 'Educational Management', 'Physical and Health Education', 'Science and Technology Education', 'Social Science Education', 'Special Education and Rehabilitation Sciences']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronic Engineering', 'Mechanical Engineering', 'Mining Engineering']],
        ['Faculty of Environmental Sciences', ['Building', 'Estate Management', 'Fine and Applied Arts', 'Geography and Planning', 'Quantity Surveying', 'Urban and Regional Planning']],
        ['Faculty of Health Sciences and Technology', ['Medical Laboratory Science', 'Nursing Science', 'Physiotherapy', 'Radiography']],
        ['Faculty of Law', ['Commercial Law', 'International Law and Jurisprudence', 'Private Law', 'Public Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Actuarial Science', 'Banking and Finance', 'Business Administration', 'Business Management', 'Insurance', 'Marketing']],
        ['Faculty of Natural Sciences', ['Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Microbiology', 'Physics', 'Plant Science and Biotechnology', 'Science Laboratory Technology', 'Statistics', 'Zoology']],
        ['Faculty of Pharmaceutical Sciences', ['Clinical Pharmacy and Pharmacy Practice', 'Pharmaceutical and Medicinal Chemistry', 'Pharmaceutical Microbiology and Biotechnology', 'Pharmaceutical Technology and Industrial Pharmacy', 'Pharmaceutics', 'Pharmacognosy and Traditional Medicine', 'Pharmacology and Toxicology']],
        ['Faculty of Social Sciences', ['Economics', 'Political Science', 'Psychology', 'Sociology']],
        ['Faculty of Veterinary Medicine', ['Veterinary Medicine', 'Veterinary Microbiology', 'Veterinary Pathology', 'Veterinary Pharmacology and Toxicology', 'Veterinary Physiology and Biochemistry', 'Veterinary Surgery and Radiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'University of Maiduguri': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics', 'Agricultural Extension Services', 'Animal Science', 'Crop Production', 'Crop Protection', 'Fisheries', 'Forestry and Wildlife', 'Soil Science']],
        ['Faculty of Arts', ['Arabic and Islamic Studies', 'English', 'Fine Arts', 'History', 'Industrial Design', 'Languages and Linguistics', 'Theatre Arts']],
        ['College of Medical Sciences', ['Dental Surgery', 'Ear, Nose and Throat Surgery', 'Human Anatomy', 'Human Nutrition and Dietetics', 'Human Pathology', 'Human Physiology', 'Medical Laboratory Science', 'Medicine and Surgery', 'Nursing Science', 'Physiotherapy / Medical Rehabilitation', 'Radiography']],
        ['Faculty of Education', ['Continuing Education and Extension Services', 'Education', 'Library and Information Science', 'Physical and Health Education']],
        ['Faculty of Engineering', ['Agricultural and Environmental Resources Engineering', 'Architectural Technology', 'Chemical Engineering', 'Civil and Water Resources Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Food Science and Technology', 'Mechanical Engineering', 'Urban and Regional Planning']],
        ['Faculty of Law', ['Private Law', 'Public Law', 'Sharia Law']],
        ['Faculty of Management Sciences', ['Accountancy', 'Business Management', 'Economics', 'Marketing', 'Public Administration']],
        ['Faculty of Pharmacy', ['Clinical Pharmacy and Pharmacy Administration', 'Pharmaceutical Chemistry', 'Pharmaceutics and Pharmaceutical Microbiology', 'Pharmacognosy', 'Pharmacology and Toxicology']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Biotechnology', 'Chemistry', 'Computer Science', 'Environmental Biology', 'Glass and Silicate Technology', 'Industrial Chemistry', 'Mathematics and Statistics', 'Microbiology', 'Petroleum Chemistry', 'Physics']],
        ['Faculty of Social Sciences', ['Geography', 'Mass Communication', 'Political Science', 'Sociology and Anthropology']],
        ['Faculty of Veterinary Medicine', ['Veterinary Anatomy', 'Veterinary Medicine', 'Veterinary Microbiology and Parasitology', 'Veterinary Pathology', 'Veterinary Physiology, Pharmacology and Biochemistry', 'Veterinary Public Health and Preventive Medicine', 'Veterinary Surgery and Theriogenology']]
      ].map(([name, departments]) => ({ name, departments }))
        },
        'University of Nigeria, Nsukka': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics', 'Agricultural Extension', 'Animal Science', 'Crop Science', 'Food Science and Technology', 'Home Science', 'Nutrition and Dietetics', 'Soil Science']],
        ['Faculty of Arts', ['Archaeology and Tourism', 'Combined Arts', 'English and Literary Studies', 'Fine and Applied Arts', 'Foreign Languages and Literature', 'History and International Studies', 'Linguistics and Nigerian Languages', 'Mass Communication', 'Music', 'Theatre and Film Studies']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Biochemistry and Molecular Biology', 'Physiology']],
        ['Faculty of Biological Sciences', ['Aquaculture and Marine Studies', 'Biochemistry', 'Botany', 'Combined Biological Sciences', 'Genetics and Biotechnology', 'Microbiology', 'Plant Science and Biotechnology', 'Zoology']],
        ['Faculty of Business Administration', ['Accountancy', 'Banking and Finance', 'Management', 'Marketing']],
        ['Faculty of Dentistry', ['Dentistry']],
        ['Faculty of Education', ['Arts Education', 'Continuing Education and Development Studies', 'Educational Foundations', 'Health and Physical Education', 'Human Kinetics and Health Education', 'Library and Information Science', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Agricultural and Bio-Resources Engineering', 'Biomedical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Electronic and Computer Engineering', 'Mechanical Engineering', 'Mechatronics Engineering', 'Metallurgical and Materials Engineering']],
        ['Faculty of Environmental Studies', ['Architecture', 'Estate Management', 'Geoinformatics and Surveying', 'Urban and Regional Planning']],
        ['Faculty of Health Sciences and Technology', ['Medical Laboratory Sciences', 'Medical Radiography and Radiological Sciences', 'Medical Rehabilitation', 'Nursing Sciences']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Medicine', ['Medicine and Surgery']],
        ['Faculty of Pharmaceutical Sciences', ['Doctor of Pharmacy (PharmD)', 'Pharmacy']],
        ['Faculty of Physical Sciences', ['Combined Physical Sciences', 'Computer Science', 'Computer and Statistics', 'Geology', 'Mathematics', 'Physics and Astronomy', 'Pure and Industrial Chemistry', 'Science Laboratory Technology', 'Statistics']],
        ['Faculty of Social Sciences', ['Combined Social Sciences', 'Criminology', 'Economics', 'Geography', 'Philosophy', 'Political Science', 'Psychology', 'Public Administration and Local Government', 'Religion and Cultural Studies', 'Social Work', 'Sociology and Anthropology']],
        ['Faculty of Veterinary Medicine', ['Veterinary Medicine']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Computer and Robotics Education', 'Computer Education', 'Home Economics Education', 'Industrial Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Obafemi Awolowo University, Ile-Ife': {
      label: 'Faculty',
      list: [
        ['Faculty of Administration', ['Accounting', 'Business Administration', 'International Relations', 'Local Government and Development Studies', 'Public Administration']],
        ['Faculty of Agriculture', ['Agricultural Economics', 'Agricultural Extension and Rural Development', 'Animal Sciences', 'Crop Production and Protection', 'Family, Nutrition and Consumer Sciences', 'Plant Science', 'Soil Science and Land Resources Management']],
        ['Faculty of Arts', ['Dramatic Arts', 'English', 'Foreign Languages', 'History', 'Linguistics and African Languages', 'Music', 'Philosophy', 'Religious Studies']],
        ['Faculty of Computing Science and Engineering', ['Computer Engineering', 'Computer Science and Cyber Security', 'Information Systems', 'Intelligent Systems Engineering', 'Software Engineering']],
        ['Faculty of Education', ['Adult Education and Lifelong Learning', 'Arts and Social Sciences Education', 'Counselling and Human Development', 'Educational Foundations and Counselling', 'Educational Management', 'Physical and Health Education', 'Science and Technology Education']],
        ['Faculty of Environmental Design and Management', ['Architecture', 'Building', 'Estate Management', 'Fine and Applied Arts', 'Quantity Surveying', 'Surveying and Geoinformatics', 'Urban and Regional Planning']],
        ['Faculty of Law', ['Business Law', 'International Law', 'Jurisprudence and Private Law', 'Public Law']],
        ['Faculty of Pharmacy', ['Clinical Pharmacy and Pharmacy Administration', 'Pharmaceutical Chemistry', 'Pharmaceutical Microbiology', 'Pharmaceutics and Industrial Pharmacy', 'Pharmacognosy', 'Pharmacology']],
        ['Faculty of Science', ['Biochemistry', 'Botany', 'Chemistry', 'Geology', 'Mathematics', 'Microbiology', 'Physics', 'Statistics', 'Zoology']],
        ['Faculty of Social Sciences', ['Demography and Social Statistics', 'Economics', 'Geography', 'Political Science', 'Psychology', 'Sociology and Anthropology']],
        ['Faculty of Technology', ['Aerospace Engineering', 'Agricultural and Environmental Engineering', 'Chemical Engineering', 'Civil Engineering', 'Computer Science and Engineering', 'Electronic and Electrical Engineering', 'Food Science and Technology', 'Materials Science and Engineering', 'Mechanical Engineering']],
        ['College of Health Sciences: Faculty of Basic Medical Sciences', ['Anatomy and Cell Biology', 'Haematology and Immunology', 'Human Nutrition and Dietetics', 'Medical Biochemistry', 'Medical Microbiology and Parasitology', 'Medical Pharmacology and Therapeutics', 'Medical Rehabilitation', 'Morbid Anatomy and Forensic Medicine', 'Nursing Science', 'Physiological Sciences']],
        ['College of Health Sciences: Faculty of Clinical Sciences', ['Anaesthesia', 'Community Health and Nutrition', 'Dermatology and Venereology', 'Medicine', 'Mental Health', 'Obstetrics, Gynaecology and Perinatology', 'Ophthalmology', 'Orthopaedics and Traumatology', 'Paediatrics and Child Health', 'Radiology']],
        ['College of Health Sciences: Faculty of Dentistry', ['Child Dental Health', 'Oral and Maxillofacial Surgery and Oral Pathology', 'Preventive and Community Dentistry', 'Restorative Dentistry']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'University of Port Harcourt': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop and Soil Science', 'Fisheries', 'Forestry and Wildlife']],
        ['Faculty of Basic Medical Sciences', ['Anatomical Pathology', 'Anatomy', 'Chemical Pathology', 'Haematology, Blood Transfusion and Immunology', 'Medical Biochemistry', 'Medical Microbiology', 'Pharmacology', 'Physiology']],
        ['Faculty of Clinical Sciences', ['Anaesthesiology', 'Ear, Nose and Throat Surgery', 'Internal Medicine', 'Mental Health', 'Nursing', 'Obstetrics and Gynaecology', 'Ophthalmology', 'Paediatrics and Child Health', 'Preventive and Social Medicine', 'Radiology', 'Surgery']],
        ['Faculty of Computing', ['Cyber Security', 'Information Technology']],
        ['Faculty of Dentistry', ['Child Dental Health', 'Oral and Maxillofacial Surgery', 'Oral Pathology and Oral Biology', 'Preventive and Social Dentistry', 'Restorative Dentistry']],
        ['Faculty of Education', ['Adult and Non-Formal Education', 'Curriculum Studies and Educational Technology', 'Early Childhood and Primary Education', 'Educational Foundations', 'Educational Management and Planning', 'Educational Psychology, Guidance and Counselling', 'Human Kinetics and Health Education', 'Library and Information Science']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Environmental Engineering', 'Gas Engineering', 'Mechanical Engineering', 'Petroleum Engineering']],
        ['Faculty of Humanities', ['English Studies', 'Fine Arts and Design', 'Foreign Languages and Literature', 'History and Diplomatic Studies', 'Linguistics and Communication Studies', 'Music', 'Philosophy', 'Religious and Cultural Studies', 'Theatre and Film Studies']],
        ['Faculty of Law', ['Commercial and Industrial Law', 'Jurisprudence and International Law', 'Private and Property Law', 'Public Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Finance and Banking', 'Hospitality Management and Tourism', 'Management', 'Marketing']],
        ['Faculty of Pharmaceutical Sciences', ['Clinical Pharmacy and Management', 'Experimental Pharmacology and Toxicology', 'Pharmaceutical and Medicinal Chemistry', 'Pharmaceutical Microbiology and Biotechnology']],
        ['Faculty of Science', ['Animal and Environmental Biology', 'Biochemistry', 'Computer Science', 'Geology', 'Mathematics and Statistics', 'Microbiology', 'Physics', 'Plant Science and Biotechnology', 'Pure and Industrial Chemistry']],
        ['Faculty of Social Sciences', ['Economics', 'Geography and Environmental Management', 'Political and Administrative Studies', 'Social Work', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'University of Calabar': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture, Forestry and Wildlife Resource Management', ['Agricultural Economics', 'Agricultural Extension and Rural Sociology', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture', 'Food Science and Technology', 'Forestry and Wildlife Resource Management', 'Soil Science']],
        ['Faculty of Allied Medical Sciences', ['Nursing Sciences', 'Physiotherapy', 'Public Health', 'Radiography and Radiological Sciences']],
        ['Faculty of Arts', ['English and Literary Studies', 'Fine and Applied Arts', 'History and International Studies', 'Linguistics and Nigerian Languages', 'Mass Communication', 'Modern Languages and Translation Studies', 'Music', 'Philosophy', 'Religious and Cultural Studies', 'Theatre and Media Studies']],
        ['Faculty of Arts and Social Science Education', ['Arts Education', 'Continuing Education and Development', 'Environmental Education', 'Library and Information Science', 'Social Science Education']],
        ['Faculty of Basic Clinical Sciences', ['Chemical Pathology and Immunology', 'Haematology and Blood Transfusion', 'Medical Microbiology and Parasitology', 'Pathology', 'Pharmacology and Therapeutics']],
        ['Faculty of Basic Medical Sciences', ['Biochemistry', 'Human Anatomy', 'Human Nutrition and Dietetics', 'Pharmacology', 'Physiology']],
        ['Faculty of Biological Sciences', ['Genetics and Biotechnology', 'Microbiology', 'Plant and Ecological Studies', 'Science Laboratory Technology', 'Zoology and Environmental Biology']],
        ['Faculty of Clinical Sciences', ['Anaesthesiology', 'Community Medicine', 'Family Medicine', 'Internal Medicine', 'Obstetrics and Gynaecology', 'Ophthalmology', 'Otorhinolaryngology', 'Paediatrics', 'Psychiatry', 'Radiology', 'Surgery']],
        ['Faculty of Dentistry', ['Child Dental Health', 'Oral and Maxillofacial Surgery', 'Oral Pathology and Oral Medicine', 'Preventive Dentistry', 'Restorative Dentistry']],
        ['Faculty of Educational Foundation Studies', ['Curriculum and Teaching', 'Educational Foundations', 'Educational Management', 'Guidance and Counselling', 'Special Education']],
        ['Faculty of Science and Vocational Education', ['Human Kinetics and Health Education', 'Science Education', 'Vocational Education']],
        ['Faculty of Engineering and Technology', ['Agricultural and Bioresource Engineering', 'Chemical Engineering', 'Civil and Environmental Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Petroleum Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Environmental Resource Management', 'Estate Management and Valuation', 'Geography and Environmental Science', 'Surveying and Geoinformatics', 'Urban and Regional Planning']],
        ['Faculty of Law', ['Private Law', 'Public and International Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Management', 'Marketing', 'Public Administration']],
        ['Faculty of Medical Laboratory Science', ['Clinical Chemistry and Immunology', 'Haematology and Blood Transfusion Sciences', 'Histopathology and Cytology', 'Medical Bacteriology, Virology and Mycology', 'Medical Parasitology and Entomology']],
        ['Faculty of Pharmacy', ['Clinical Pharmacy and Pharmacy Administration', 'Pharmaceutical and Medicinal Chemistry', 'Pharmaceutical Microbiology and Biotechnology', 'Pharmaceutics and Pharmaceutical Technology', 'Pharmacognosy and Traditional Medicine', 'Social and Administrative Pharmacy']],
        ['Faculty of Physical Sciences', ['Computer Science', 'Geology', 'Mathematics', 'Physics', 'Pure and Applied Chemistry', 'Statistics']],
        ['Faculty of Social Sciences', ['Economics', 'Political Science', 'Social Work', 'Sociology', 'Tourism Studies']]
      ].map(([name, departments]) => ({ name, departments }))
    },
      'University of Uyo': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture', 'Food Science and Technology', 'Forestry and Environmental Management', 'Home Economics', 'Soil Science and Land Management']],
        ['Faculty of Arts', ['Communication Arts', 'English', 'Foreign Languages (French)', 'History and International Studies', 'Linguistics and Nigerian Languages', 'Music', 'Philosophy', 'Religious and Cultural Studies', 'Theatre Arts']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Biochemistry', 'Physiology']],
        ['Faculty of Biological Sciences', ['Animal and Environmental Biology', 'Biochemistry', 'Botany and Ecological Studies', 'Microbiology']],
        ['Faculty of Clinical Sciences', ['Community Health', 'Haematology', 'Medical Microbiology and Parasitology', 'Obstetrics and Gynaecology', 'Orthopaedics and Traumatology', 'Paediatrics']],
        ['Faculty of Computing', ['Computer Science', 'Cyber Security', 'Data Science']],
        ['Faculty of Education', ['Curriculum Studies, Educational Management and Planning', 'Early Childhood and Special Education', 'Educational Foundations, Guidance and Counselling', 'Educational Technology and Library Science', 'Physical and Health Education', 'Science Education', 'Vocational Education']],
        ['Faculty of Engineering', ['Agricultural Engineering', 'Chemical Engineering', 'Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Food Engineering', 'Mechanical Engineering', 'Petroleum Engineering']],
        ['Faculty of Environmental Studies', ['Architecture', 'Building', 'Estate Management', 'Fine and Industrial Arts', 'Geoinformatics and Land Surveying', 'Quantity Surveying', 'Urban and Regional Planning']],
        ['Faculty of Law', ['International Law and Jurisprudence', 'Private Law', 'Public Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Management', 'Insurance', 'Marketing']],
        ['Faculty of Pharmacy', ['Clinical and Biopharmacy', 'Pharmaceutical and Medicinal Chemistry', 'Pharmaceutics and Pharmaceutical Technology', 'Pharmacognosy and Natural Medicine', 'Pharmacology and Toxicology']],
        ['Faculty of Physical Sciences', ['Chemistry', 'Geology', 'Geophysics', 'Mathematics', 'Physics', 'Statistics']],
        ['Faculty of Social Sciences', ['Economics', 'Geography', 'Political Science and Public Administration', 'Psychology', 'Sociology and Anthropology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ahmadu Bello University, Zaria': {
      label: 'Faculty',
      list: [
        ['Faculty of Administration', ['Local Government and Development Studies', 'Public Administration']],
        ['ABU Business School', ['Accounting', 'Actuarial Science and Insurance', 'Banking and Finance', 'Business Administration', 'Economics', 'Marketing']],
        ['Faculty of Agriculture', ['Agricultural Economics', 'Agricultural Extension and Rural Development', 'Agronomy', 'Animal Science', 'Crop Protection', 'Fisheries and Aquaculture', 'Forestry and Wildlife Management', 'Plant Science', 'Soil Science']],
        ['Faculty of Arts', ['African Languages and Culture', 'Arabic', 'Archaeology', 'English', 'French', 'History', 'Theatre and Performing Arts']],
        ['Faculty of Education', ['Arts and Social Studies Education', 'Educational Foundations and Curriculum', 'Educational Psychology and Counselling', 'Home Economics', 'Human Kinetics and Health Education', 'Library and Information Science', 'Religious Studies', 'Science Education', 'Vocational and Technical Education']],
        ['Faculty of Engineering', ['Agricultural Engineering', 'Automotive Engineering', 'Chemical Engineering', 'Civil Engineering', 'Communication Engineering', 'Computer Engineering', 'Electrical Engineering', 'Materials and Metallurgical Engineering', 'Mechanical Engineering', 'Mechatronics Engineering', 'Polymer and Textile Engineering', 'Water Resources and Environmental Engineering']],
        ['Faculty of Environmental Design', ['Architecture', 'Building', 'Fine Arts', 'Geomatics', 'Industrial Design', 'Quantity Surveying', 'Urban and Regional Planning']],
        ['Faculty of Law', ['Commercial Law', 'Islamic Law', 'Private Law', 'Public Law']],
        ['Faculty of Life Sciences', ['Biochemistry', 'Biological Sciences', 'Microbiology']],
        ['Faculty of Pharmaceutical Sciences', ['Pharmaceutical and Medicinal Chemistry', 'Pharmaceutics and Pharmaceutical Microbiology', 'Pharmacognosy and Drug Development', 'Pharmacology and Clinical Pharmacy']],
        ['Faculty of Physical Sciences', ['Chemistry', 'Computer Science', 'Geography', 'Geology', 'Mathematics', 'Physics', 'Statistics']],
        ['Faculty of Social Sciences', ['Mass Communication', 'Political Science and International Studies', 'Sociology']],
        ['Faculty of Veterinary Medicine', ['Veterinary Anatomy', 'Veterinary Medicine and Surgery', 'Veterinary Microbiology', 'Veterinary Parasitology and Entomology', 'Veterinary Pathology', 'Veterinary Physiology and Pharmacology', 'Veterinary Public Health and Preventive Medicine', 'Veterinary Surgery and Radiology']],
        ['College of Health Sciences: Faculty of Allied Health Sciences', ['Medical Biology', 'Medical Laboratory Science', 'Nursing Sciences', 'Radiography']],
        ['College of Health Sciences: Faculty of Basic Clinical Sciences', ['Chemical Pathology', 'Clinical Pharmacology and Therapeutics', 'Haematology and Blood Transfusion', 'Medical Microbiology', 'Pathology']],
        ['College of Health Sciences: Faculty of Basic Medical Sciences', ['Human Anatomy', 'Human Physiology']],
        ['College of Health Sciences: Faculty of Clinical Sciences', ['Anaesthesia', 'Community Medicine', 'Dental Surgery', 'Medicine', 'Obstetrics and Gynaecology', 'Ophthalmology', 'Paediatrics', 'Psychiatry', 'Radiology', 'Surgery', 'Trauma and Orthopaedic Surgery']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Bayero University, Kano': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agriculture', 'Fisheries and Aquaculture', 'Food Science and Technology', 'Forestry and Wildlife Management']],
        ['Faculty of Arts and Islamic Studies', ['Arabic', 'English and Literary Studies', 'History', 'Islamic Studies and Shari\'ah', 'Linguistics and Foreign Languages', 'Nigerian Languages']],
        ['Faculty of Communication', ['Information and Media Studies', 'Mass Communication', 'Theatre and Performing Arts']],
        ['Faculty of Computing', ['Computer Science', 'Cyber Security', 'Information Technology', 'Software Engineering']],
        ['Faculty of Earth and Environmental Sciences', ['Architecture', 'Environmental Management', 'Estate Management', 'Geography', 'Geology', 'Meteorology', 'Quantity Surveying', 'Urban and Regional Planning']],
        ['Faculty of Education', ['Adult Education', 'Agriculture Education', 'Arabic Education', 'Biology Education', 'Chemistry Education', 'Early Childhood Education', 'Economics Education', 'English Education', 'French Education', 'Geography Education', 'Hausa Education', 'Health Education', 'History Education', 'Islamic Studies Education', 'Library and Information Science', 'Mathematics Education', 'Physical Education', 'Physics Education', 'Primary Education', 'Special Education', 'Technology Education']],
        ['Faculty of Engineering', ['Agricultural Engineering', 'Automotive Engineering', 'Chemical Engineering', 'Civil Engineering', 'Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Mechatronics Engineering', 'Petroleum Engineering', 'Telecommunication Engineering']],
        ['Faculty of Law', ['Common and Islamic Law']],
        ['Faculty of Life Sciences', ['Applied Biology', 'Botany', 'Microbiology', 'Zoology']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Entrepreneurship', 'Public Administration', 'Taxation']],
        ['Faculty of Pharmaceutical Sciences', ['Pharmacy']],
        ['Faculty of Physical Sciences', ['Chemistry', 'Electronics with Physics', 'Forensic Science', 'Industrial Chemistry', 'Mathematics', 'Physics', 'Statistics']],
        ['Faculty of Social Sciences', ['Criminology', 'Economics', 'International Relations', 'Political Science', 'Sociology']],
        ['Faculty of Veterinary Medicine', ['Veterinary Medicine']],
        ['College of Health Sciences: Faculty of Allied Health Sciences', ['Environmental Health Science', 'Medical Laboratory Science', 'Nursing', 'Optometry', 'Physiotherapy', 'Radiography']],
        ['College of Health Sciences: Faculty of Basic Medical Sciences', ['Anatomy', 'Biochemistry', 'Nutrition and Dietetics', 'Physiology']],
        ['College of Health Sciences: Faculty of Clinical Sciences', ['Medicine and Surgery (MBBS)']],
        ['College of Health Sciences: Faculty of Dentistry', ['Dentistry and Dental Surgery']]
      ].map(([name, departments]) => ({ name, departments }))
    },
      'Usmanu Danfodiyo University, Sokoto': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics', 'Agricultural Extension and Rural Development', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture', 'Forestry and Environment', 'Soil Science and Agricultural Engineering']],
        ['Faculty of Arabic and Islamic Studies', ['Arabic Literary Studies', 'Arabic Studies', 'Islamic Studies', 'Quran and Hadith Studies']],
        ['Faculty of Arts', ['English and Literary Studies', 'French', 'History and International Studies', 'Linguistics', 'Mass Communication', 'Nigerian Languages']],
        ['Faculty of Chemical and Life Sciences', ['Biochemistry and Molecular Biology', 'Biology', 'Energy and Applied Chemistry', 'Microbiology', 'Plant Science', 'Pure and Environmental Chemistry', 'Zoology']],
        ['Faculty of Education and Extension Services', ['Adult Education and Extension Services', 'Curriculum Studies and Educational Technology', 'Education Foundations', 'Science and Vocational Education']],
        ['Faculty of Engineering and Environmental Design', ['Civil Engineering', 'Electrical Engineering and Electronics', 'Environmental and Resource Management', 'Information and Communication Technology', 'Mechanical Engineering']],
        ['Faculty of Law', ['Islamic Law', 'Private and Business Law', 'Public Law and Jurisprudence']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Public Administration']],
        ['Faculty of Pharmaceutical Sciences', ['Clinical Pharmacy and Pharmacy Practice', 'Pharmaceutical and Medicinal Chemistry', 'Pharmaceutics and Pharmaceutical Microbiology', 'Pharmacognosy and Ethno-Pharmacy', 'Pharmacology and Toxicology']],
        ['Faculty of Physical and Computing Sciences', ['Computer Science', 'Geology', 'Mathematics', 'Physics', 'Statistics']],
        ['Faculty of Social Sciences', ['Economics', 'Geography', 'Political Science', 'Sociology']],
        ['Faculty of Veterinary Medicine', ['Theriogenology and Animal Production', 'Veterinary Anatomy', 'Veterinary Medicine', 'Veterinary Microbiology', 'Veterinary Parasitology and Entomology', 'Veterinary Pathology', 'Veterinary Pharmacology and Toxicology', 'Veterinary Physiology and Biochemistry', 'Veterinary Public Health and Preventive Medicine', 'Veterinary Surgery and Radiology']],
        ['School of Medical Laboratory Science', ['Chemical Pathology', 'Haematology', 'Histopathology', 'Immunology', 'Medical Microbiology']],
        ['College of Health Sciences: Faculty of Basic Medical Sciences', ['Anatomy', 'Chemical Pathology and Immunology', 'Haematology and Blood Transfusion', 'Medical Biochemistry', 'Microbiology and Parasitology', 'Morbid Anatomy and Forensic Medicine', 'Pharmacology and Therapeutics', 'Physiology']],
        ['College of Health Sciences: Faculty of Clinical Sciences', ['Community Medicine', 'Medicine', 'Nursing Sciences', 'Obstetrics and Gynaecology', 'Paediatrics', 'Psychiatry', 'Radiography', 'Radiology', 'Surgery']]
      ].map(([name, departments]) => ({ name, departments }))
    },
      'Federal University of Technology, Akure': {
      label: 'School',
      list: [
        ['School of Agriculture and Agricultural Technology', ['Agricultural and Resource Economics', 'Agricultural Extension and Communication Technology', 'Animal Production and Health', 'Crop, Soil and Pest Management', 'Ecotourism and Wildlife Management', 'Fisheries and Aquaculture Technology', 'Food Science and Technology', 'Forestry and Wood Technology']],
        ['School of Computing', ['Computer Science', 'Cybersecurity', 'Information Systems', 'Information Technology', 'Software Engineering']],
        ['School of Earth and Mineral Sciences', ['Applied Geology', 'Applied Geophysics', 'Marine Science and Technology', 'Meteorology and Climate Science', 'Remote Sensing and Geoscience Information Systems']],
        ['School of Electrical Systems Engineering', ['Computer Engineering', 'Electrical and Electronics Engineering', 'Information and Communication Technology']],
        ['School of Environmental Technology', ['Architecture', 'Building Technology', 'Estate Management', 'Industrial Design', 'Quantity Surveying', 'Surveying and Geoinformatics', 'Urban and Regional Planning']],
        ['School of Infrastructural, Minerals and Manufacturing Engineering', ['Agricultural and Environmental Engineering', 'Civil and Environmental Engineering', 'Industrial and Production Engineering', 'Mechanical Engineering', 'Metallurgical and Materials Engineering', 'Mining Engineering']],
        ['School of Life Sciences', ['Biochemistry', 'Biology', 'Biotechnology', 'Microbiology']],
        ['School of Logistics and Innovation Technology', ['Entrepreneurship Management Technology', 'Library Management Technology', 'Project Management Technology', 'Transport Management Technology']],
        ['School of Physical Sciences', ['Chemistry', 'Mathematical Sciences', 'Physics', 'Statistics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'Federal University of Technology, Minna': {
      label: 'School',
      list: [
        ['College of Medical Sciences and Health Technology: School of Basic Medical Sciences', ['Human Anatomy', 'Human Physiology', 'Medicine and Surgery']],
        ['College of Medical Sciences and Health Technology: School of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science']],
        ['College of Medical Sciences and Health Technology: School of Pharmaceutical Sciences', ['Pharmacy (Pharm.D)']],
        ['School of Agronomy and Forestry Technology', ['Crop Production', 'Forestry and Wildlife Technology', 'Horticulture', 'Soil Science and Land Management']],
        ['School of Agricultural Management and Extension Technology', ['Agribusiness', 'Agricultural Economics and Farm Management', 'Agricultural Extension and Rural Development']],
        ['School of Food Science and Agricultural Technology', ['Animal Production', 'Food Science and Technology', 'Human Nutrition and Dietetics', 'Water Resources, Aquaculture and Fisheries Technology']],
        ['School of Architectural Technology', ['Architecture', 'Furniture Design and Architecture', 'Interior Architecture and Design', 'Landscape Architecture']],
        ['School of Electrical Engineering and Technology', ['Computer Engineering', 'Electrical and Electronics Engineering', 'Mechatronics Engineering', 'Telecommunication Engineering']],
        ['School of Environmental Technology', ['Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geoinformatics', 'Urban and Regional Planning']],
        ['School of Information and Communication Technology', ['Computer Science', 'Cyber Security Science', 'Data Science', 'Information Science and Media Studies', 'Information Technology', 'Software Engineering']],
        ['School of Infrastructure, Process Engineering and Technology', ['Agricultural and Bioresources Engineering', 'Biomedical Engineering', 'Chemical Engineering', 'Civil Engineering', 'Food Engineering', 'Marine Engineering', 'Materials and Metallurgical Engineering', 'Mechanical Engineering', 'Petroleum and Gas Engineering']],
        ['School of Innovative Technology', ['Entrepreneurship', 'Logistics and Supply Chain Management', 'Logistics and Transport Technology', 'Procurement Management Technology', 'Project Management Technology']],
        ['School of Life Sciences', ['Animal Biology', 'Biochemistry', 'Biotechnology', 'Forensic Science', 'Microbiology', 'Plant Biology', 'Public Health']],
        ['School of Physical Sciences', ['Applied Geophysics', 'Chemistry', 'Geography', 'Geology', 'Industrial Mathematics', 'Mathematics', 'Meteorology', 'Physics', 'Statistics']],
        ['School of Science and Technology Education', ['Biology Education', 'Chemistry Education', 'Educational Technology', 'Geography Education', 'Industrial and Technology Education', 'Library and Information Science', 'Mathematics Education', 'Physics Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
      'Federal University of Technology, Owerri': {
      label: 'School',
      list: [
        ['School of Agriculture and Agricultural Technology', ['Agribusiness', 'Agricultural Economics', 'Agricultural Extension', 'Animal Science and Technology', 'Crop Science and Technology', 'Fisheries and Aquaculture Technology', 'Forestry and Wildlife Technology', 'Soil Science and Technology']],
        ['School of Basic Medical Sciences', ['Human Anatomy', 'Human Physiology']],
        ['School of Biological Sciences', ['Biochemistry', 'Biology', 'Biotechnology', 'Forensic Science', 'Microbiology']],
        ['School of Electrical Systems and Engineering Technology', ['Computer Engineering', 'Electrical (Power Systems) Engineering', 'Electronics Engineering', 'Mechatronics Engineering', 'Telecommunications Engineering']],
        ['School of Engineering and Engineering Technology', ['Agricultural and Bioresources Engineering', 'Biomedical Engineering', 'Chemical Engineering', 'Civil Engineering', 'Food Science and Technology', 'Materials and Metallurgical Engineering', 'Mechanical Engineering', 'Petroleum Engineering', 'Polymer and Textile Engineering']],
        ['School of Health Technology', ['Biomedical Technology', 'Dental Technology', 'Environmental Health Science', 'Optometry', 'Prosthetics and Orthotics', 'Public Health Technology', 'Radiography']],
        ['School of Information and Communication Technology', ['Computer Science', 'Cybersecurity', 'Information Technology', 'Software Engineering']],
        ['School of Logistics and Innovation Technology', ['Financial Management Technology', 'Management Technology', 'Maritime Management Technology', 'Project Management Technology', 'Transport Management Technology']],
        ['School of Physical Sciences', ['Chemistry', 'Geology', 'Mathematics', 'Physics', 'Science Laboratory Technology', 'Statistics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nnamdi Azikiwe University, Awka': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science and Horticulture', 'Fisheries and Aquaculture', 'Food Science and Technology', 'Forestry and Wildlife', 'Soil Science and Soil Resources Management']],
        ['Faculty of Arts', ['English Language and Literature', 'History and International Studies', 'Igbo, African and Asian Studies', 'Linguistics', 'Modern European Languages', 'Music', 'Philosophy', 'Religion and Human Relations', 'Theatre Arts and Film Studies']],
        ['Faculty of Basic Medical Sciences', ['Human Anatomy', 'Human Physiology']],
        ['Faculty of Biosciences', ['Applied Biochemistry', 'Applied Microbiology and Brewing', 'Botany', 'Parasitology and Entomology', 'Zoology']],
        ['Faculty of Education', ['Adult Education', 'Early Childhood and Primary Education', 'Educational Foundations', 'Educational Management and Policy', 'Guidance and Counselling', 'Human Kinetics and Health Education', 'Library and Information Science', 'Science Education', 'Vocational Education']],
        ['Faculty of Engineering', ['Agricultural and Bioresources Engineering', 'Chemical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Electronic and Computer Engineering', 'Industrial and Production Engineering', 'Mechanical Engineering', 'Metallurgical and Materials Engineering', 'Polymer and Textile Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Building', 'Environmental Management', 'Estate Management', 'Fine and Applied Arts', 'Geography and Meteorology', 'Quantity Surveying', 'Surveying and Geoinformatics']],
        ['Faculty of Health Sciences and Technology', ['Environmental Health Science', 'Medical Laboratory Science', 'Medical Rehabilitation', 'Nursing Science', 'Radiography']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accountancy', 'Banking and Finance', 'Business Administration', 'Cooperative Economics and Management', 'Entrepreneurship', 'Marketing', 'Public Administration']],
        ['Faculty of Medicine', ['Medicine and Surgery']],
        ['Faculty of Pharmaceutical Sciences', ['Pharmaceutical and Medicinal Chemistry', 'Pharmaceutical Microbiology and Biotechnology', 'Pharmaceutics and Pharmaceutical Technology', 'Pharmacognosy and Traditional Medicine', 'Pharmacology and Toxicology']],
        ['Faculty of Physical Sciences', ['Applied Geophysics', 'Computer Science', 'Cyber Security', 'Geological Sciences', 'Information Technology', 'Mathematics', 'Physics and Industrial Physics', 'Pure and Industrial Chemistry', 'Software Engineering', 'Statistics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Psychology', 'Sociology and Anthropology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'University of Abuja': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics', 'Agricultural Extension and Rural Sociology', 'Animal Science', 'Crop Protection', 'Crop Science', 'Soil Science']],
        ['Faculty of Arts', ['English and Literary Studies', 'History', 'Linguistics and African Languages', 'Philosophy and Religion', 'Theatre Arts']],
        ['Faculty of Communication and Media Studies', ['Advertising and Public Relations', 'Broadcasting, Film and Multimedia Studies', 'Development and Strategic Communication', 'Information, Journalism and Media Studies']],
        ['Faculty of Education', ['Arts and Social Science Education', 'Counselling and Educational Psychology', 'Educational Foundations', 'Educational Management', 'Library and Information Science', 'Science and Environmental Education']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Building', 'Estate Management', 'Industrial Design', 'Quantity Surveying', 'Surveying and Geoinformatics', 'Urban and Regional Planning']],
        ['Faculty of Law', ['International Law and Jurisprudence', 'Islamic Law', 'Private and Property Law', 'Public Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Nursing and Allied Health Services', ['Medical Laboratory Science', 'Nursing Science']],
        ['Faculty of Pharmaceutical Sciences', ['Clinical Pharmacy and Pharmacy Practice', 'Pharmaceutical and Medicinal Chemistry', 'Pharmaceutical Microbiology and Biotechnology', 'Pharmaceutics and Pharmaceutical Technology', 'Pharmacognosy', 'Pharmacology and Toxicology']],
        ['Faculty of Science', ['Biochemistry', 'Biological Sciences', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics', 'Statistics']],
        ['Faculty of Social Sciences', ['Economics', 'Geography and Environmental Management', 'Political Science and International Relations', 'Sociology']],
        ['Faculty of Veterinary Medicine', ['Veterinary Anatomy', 'Veterinary Animal Health and Production', 'Veterinary Medicine', 'Veterinary Microbiology', 'Veterinary Parasitology and Entomology', 'Veterinary Pathology', 'Veterinary Pharmacology and Toxicology', 'Veterinary Physiology and Biochemistry', 'Veterinary Public Health', 'Veterinary Surgery', 'Veterinary Theriogenology']],
        ['College of Health Sciences: Faculty of Basic Medical Sciences', ['Anatomical Sciences', 'Medical Biochemistry', 'Physiology']],
        ['College of Health Sciences: Faculty of Basic Clinical Sciences', ['Haematology and Blood Transfusion', 'Pathology and Forensic Medicine']],
        ['College of Health Sciences: Faculty of Clinical Sciences', ['Community Medicine', 'Internal Medicine', 'Obstetrics and Gynaecology', 'Ophthalmology', 'Paediatrics', 'Surgery']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'Federal University, Oye-Ekiti': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Crop Science and Horticulture', 'Fisheries and Aquaculture', 'Food Science and Technology', 'Hospitality and Tourism Management', 'Water Resources Management and Agro-Meteorology']],
        ['Faculty of Arts', ['English and Literary Studies', 'History and International Studies', 'Linguistics and Languages', 'Philosophy', 'Religious Studies', 'Theatre and Media Arts']],
        ['Faculty of Communication and Media Studies', ['Broadcasting', 'Journalism', 'Mass Communication', 'Public Relations']],
        ['Faculty of Computer and Information Engineering', ['Computer Engineering', 'Information and Communication Engineering', 'Systems Engineering']],
        ['Faculty of Computing', ['Computer Science', 'Cybersecurity', 'Data Science and Analytics', 'Software Engineering']],
        ['Faculty of Education', ['Adult Education', 'Agricultural Education', 'Biology Education', 'Business Education', 'Chemistry Education', 'Education and Economics', 'Education and Physics', 'Educational Management', 'Educational Technology', 'English Language Education', 'Guidance and Counselling', 'Health Education', 'Human Kinetics', 'Library and Information Science', 'Mathematics Education', 'Primary Education']],
        ['Faculty of Engineering', ['Agricultural and Bioresources Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Materials and Metallurgical Engineering', 'Mechanical Engineering', 'Mechatronics Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Life Sciences', ['Animal and Environmental Biology', 'Biochemistry', 'Environmental Management and Toxicology', 'Microbiology', 'Plant Science and Biotechnology']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Finance', 'Public Administration']],
        ['Faculty of Pharmacy', ['Pharmacy']],
        ['Faculty of Physical Sciences', ['Chemistry', 'Geology', 'Geophysics', 'Industrial Chemistry', 'Mathematics', 'Physics', 'Statistics']],
        ['Faculty of Social Sciences', ['Criminology and Security Studies', 'Demography and Social Statistics', 'Economics', 'Peace and Conflict Studies', 'Political Science', 'Psychology', 'Sociology']],
        ['College of Medicine', ['Medicine and Surgery']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Laboratory Science', 'Physiology', 'Radiology and Radiation Science']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University, Lokoja': {
      label: 'Faculty',
      list: [
        ['Faculty of Agricultural Science', ['Agricultural Science']],
        ['Faculty of Arts', ['Arabic Studies', 'Archaeology and Museum Studies', 'Christian Religious Studies', 'English and Literary Studies', 'French', 'History and International Studies', 'Islamic Studies', 'Linguistics', 'Music', 'Philosophy', 'Theatre Arts']],
        ['Faculty of Communication and Media Studies', ['Mass Communication']],
        ['Faculty of Computing', ['Computer Science', 'Cyber Security', 'Data Science', 'Information Technology', 'Software Engineering']],
        ['Faculty of Education', ['Arts and Social Science Education', 'Educational Foundations', 'Science Education']],
        ['Faculty of Engineering and Technology', ['Computer Engineering', 'Electrical and Electronic Engineering', 'Mechanical Engineering']],
        ['Faculty of Environmental Sciences', ['Geography']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Life Sciences', ['Biochemistry', 'Biology', 'Biotechnology', 'Botany', 'Microbiology', 'Zoology']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Pharmaceutical Sciences', ['Pharmacy']],
        ['Faculty of Physical Sciences', ['Chemistry', 'Geology', 'Industrial Chemistry', 'Mathematics', 'Physics', 'Statistics']],
        ['Faculty of Social Sciences', ['Economics', 'Political Science', 'Sociology']],
        ['College of Health Sciences', ['Environmental Health', 'Human Anatomy', 'Human Physiology', 'Medical Biochemistry', 'Medical Laboratory Science', 'Medicine and Surgery', 'Nursing Science', 'Public Health']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'Federal University, Dutse': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture', 'Forestry and Wildlife', 'Soil Science']],
        ['Faculty of Arts and Social Sciences', ['Economics', 'English Language', 'Library and Information Science', 'Political Science', 'Sociology']],
        ['Faculty of Computing', ['Computer Science', 'Information Technology', 'Software Engineering']],
        ['Faculty of Education', ['Islamic Studies', 'Primary Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Actuarial Science', 'Banking and Finance', 'Business Administration', 'Taxation']],
        ['Faculty of Science', ['Biochemistry', 'Biological Sciences', 'Chemistry', 'Environmental Management and Toxicology', 'Mathematics', 'Microbiology and Biotechnology', 'Physics']],
        ['College of Medical Sciences: Faculty of Basic Medical Sciences', ['Environmental Health', 'Human Anatomy', 'Human Physiology', 'Medical Biochemistry', 'Nursing Sciences', 'Public Health']],
        ['College of Medical Sciences: Faculty of Basic Clinical Sciences', ['Chemical Pathology', 'Clinical Pharmacology and Therapeutics', 'Haematology', 'Histopathology', 'Medical Microbiology and Parasitology']],
        ['College of Medical Sciences: Faculty of Clinical Sciences', ['Community Medicine', 'Internal Medicine', 'Obstetrics and Gynaecology', 'Paediatrics', 'Surgery']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'Federal University, Dutsin-Ma': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agriculture', 'Fisheries and Aquaculture Technology', 'Forestry and Wildlife']],
        ['Faculty of Arts', ['Arabic Studies', 'English Language', 'Hausa', 'History', 'Islamic Studies']],
        ['Faculty of Education', ['Business Education', 'Early Childhood Education', 'Education and Biology', 'Education and Chemistry', 'Education and English Language', 'Education and Mathematics', 'Education and Physics', 'Educational Administration', 'Guidance and Counselling', 'Human Kinetics and Health Education', 'Library and Information Science', 'Primary Education', 'Special Education']],
        ['Faculty of Engineering', ['Agricultural Engineering', 'Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Management', 'Entrepreneurship']],
        ['Faculty of Science', ['Animal and Environmental Biology', 'Biochemistry', 'Biology', 'Chemistry', 'Computer Information and Communication Science', 'Food Science', 'Geology', 'Industrial Chemistry', 'Mathematics', 'Microbiology', 'Physics', 'Physics Electronics', 'Plant Science and Biotechnology']],
        ['Faculty of Social Sciences', ['Economics', 'Geography', 'Political Science', 'Sociology']],
        ['Faculty of Basic Medical Sciences', ['Human Anatomy', 'Human Physiology']],
        ['Faculty of Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University, Gusau': {
      label: 'Faculty',
      list: [
        ['Faculty of Humanities', ['Arabic', 'English and Literature', 'Hausa', 'History and International Studies', 'Islamic Studies', 'Languages and Cultures']],
        ['Faculty of Education', ['Arabic Education', 'Biology Education', 'Chemistry Education', 'Economics Education', 'English Education', 'Islamic Studies Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management and Social Sciences', ['Accounting and Finance', 'Business Administration', 'Economics', 'Political Science', 'Public Administration', 'Sociology']],
        ['Faculty of Science', ['Biochemistry', 'Biological Sciences', 'Chemistry', 'Computer Science', 'Geological Sciences', 'Mathematics', 'Microbiology', 'Physics']],
        ['College of Health Sciences', ['Dental Surgery', 'Human Nutrition and Dietetics', 'Medicine and Surgery', 'Nursing Science', 'Physiotherapy']]
      ].map(([name, departments]) => ({ name, departments }))
    },
            'Federal University, Birnin Kebbi': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture', 'Soil Science']],
        ['Faculty of Arts and Social Sciences', ['Economics', 'English Language', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Administration', 'English Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University, Gashua': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics', 'Agronomy', 'Animal Science', 'Fisheries and Aquaculture']],
        ['Faculty of Arts and Social Sciences', ['Economics', 'English Language', 'Hausa', 'Islamic Studies', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Education and Mathematics', 'English Education', 'Physics Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University, Kashere': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture']],
        ['Faculty of Arts and Social Sciences', ['Arabic', 'Economics', 'English Language', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Economics Education', 'Educational Administration', 'English Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Microbiology', 'Physics', 'Statistics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University, Lafia': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture']],
        ['Faculty of Arts', ['English Language', 'History and International Studies', 'Linguistics', 'Theatre and Film Studies']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'English Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University, Otuoke': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts', ['English and Literary Studies', 'History and Diplomatic Studies', 'Linguistics and Communication Studies']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Business Administration', 'Economics', 'Political Science', 'Sociology']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University, Wukari': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture']],
        ['Faculty of Arts', ['English Language', 'History and International Studies', 'Theatre and Film Studies']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Administration', 'English Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
            'Abubakar Tafawa Balewa University, Bauchi': {
      label: 'School',
      list: [
        ['School of Agriculture and Agricultural Technology', ['Agricultural and Bioresources Engineering', 'Agricultural Economics and Extension', 'Animal Science', 'Crop Production', 'Soil Science']],
        ['School of Engineering and Engineering Technology', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Mechatronics Engineering', 'Metallurgical and Materials Engineering']],
        ['School of Environmental Technology', ['Architecture', 'Building', 'Estate Management', 'Quantity Surveying', 'Urban and Regional Planning']],
        ['School of Management Technology', ['Accounting', 'Business Administration and Management Technology', 'Entrepreneurship', 'Project Management Technology']],
        ['School of Science and Science Education', ['Biological Sciences', 'Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Physics', 'Science Education', 'Statistics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Modibbo Adama University, Yola': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Protection', 'Crop Science', 'Soil Science']],
        ['Faculty of Arts and Social Sciences', ['Economics', 'English Language', 'Geography', 'History', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Engineering and Engineering Technology', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Life Sciences', ['Biochemistry', 'Biological Sciences', 'Microbiology']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Public Administration']],
        ['Faculty of Physical Sciences', ['Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Physics', 'Statistics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University of Agriculture, Abeokuta': {
      label: 'College',
      list: [
        ['College of Animal Science and Livestock Production', ['Animal Nutrition', 'Animal Physiology', 'Animal Breeding and Genetics', 'Pasture and Range Management']],
        ['College of Plant Science and Crop Production', ['Crop Protection', 'Horticulture', 'Plant Breeding and Seed Technology', 'Plant Physiology and Crop Production', 'Pure and Applied Botany']],
        ['College of Agricultural Management and Rural Development', ['Agricultural Administration', 'Agricultural Economics and Farm Management', 'Agricultural Extension and Rural Development']],
        ['College of Engineering', ['Agricultural and Bioresources Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Mechatronics Engineering']],
        ['College of Environmental Resources Management', ['Aquaculture and Fisheries Management', 'Forestry and Wildlife Management', 'Environmental Management and Toxicology', 'Water Resources Management and Agrometeorology']],
        ['College of Biological Sciences', ['Biochemistry', 'Microbiology', 'Pure and Applied Zoology']],
        ['College of Food Science and Human Ecology', ['Food Science and Technology', 'Hospitality and Tourism', 'Home Science and Management', 'Nutrition and Dietetics']],
        ['College of Physical Sciences', ['Chemistry', 'Computer Science', 'Mathematics', 'Physics', 'Statistics']],
        ['College of Veterinary Medicine', ['Veterinary Medicine']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University of Petroleum Resources, Effurun': {
      label: 'College',
      list: [
        ['College of Science', ['Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Physics', 'Marine Science']],
        ['College of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Petroleum Engineering']],
        ['College of Management and Social Sciences', ['Accounting', 'Business Administration', 'Economics', 'Entrepreneurship']],
        ['College of Environmental Sciences', ['Architecture', 'Estate Management', 'Quantity Surveying', 'Surveying and Geoinformatics', 'Urban and Regional Planning']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Michael Okpara University of Agriculture, Umudike': {
      label: 'College',
      list: [
        ['College of Agribusiness and Financial Management', ['Agribusiness and Financial Management', 'Agricultural Economics', 'Agricultural Extension and Rural Development']],
        ['College of Animal Science and Animal Production', ['Animal Breeding and Physiology', 'Animal Nutrition and Forage Science', 'Animal Production Technology']],
        ['College of Applied Food Sciences and Tourism', ['Food Science and Technology', 'Home Science, Nutrition and Dietetics', 'Hospitality and Tourism']],
        ['College of Crop and Soil Sciences', ['Agronomy', 'Plant Health Management', 'Soil Science and Meteorology']],
        ['College of Engineering and Engineering Technology', ['Agricultural and Bioresources Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['College of Natural Resources and Environmental Management', ['Fisheries and Aquaculture', 'Forestry and Environmental Management']],
        ['College of Natural Sciences', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics', 'Statistics']],
        ['College of Veterinary Medicine', ['Veterinary Medicine']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Joseph Sarwuan Tarka University, Makurdi': {
      label: 'College',
      list: [
        ['College of Agronomy', ['Crop Production', 'Horticulture', 'Plant Breeding and Seed Science', 'Soil Science']],
        ['College of Animal Science', ['Animal Production', 'Animal Nutrition', 'Fisheries and Aquaculture']],
        ['College of Agricultural Economics and Extension', ['Agricultural Economics', 'Agricultural Extension and Communication']],
        ['College of Engineering', ['Agricultural and Environmental Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['College of Food Technology', ['Food Science and Technology', 'Home Science and Nutrition']],
        ['College of Forestry and Fisheries', ['Forest Production and Products', 'Wildlife and Range Management', 'Fisheries and Aquaculture']],
        ['College of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics', 'Statistics']],
        ['College of Veterinary Medicine', ['Veterinary Medicine']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'Federal University of Agriculture, Zuru': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Agronomy', 'Animal Science', 'Fisheries and Aquaculture', 'Soil Science']],
        ['Faculty of Education', ['Agricultural Science Education', 'Biology Education', 'Chemistry Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Business Administration', 'Economics']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University of Technology, Babura': {
      label: 'Faculty',
      list: [
        ['Faculty of Computing', ['Computer Science', 'Cyber Security', 'Information Technology', 'Software Engineering']],
        ['Faculty of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Environmental Technology', ['Architecture', 'Building', 'Quantity Surveying', 'Surveying and Geoinformatics', 'Urban and Regional Planning']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Mathematics', 'Microbiology', 'Physics', 'Statistics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University of Technology, Ikot Abasi': {
      label: 'Faculty',
      list: [
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Petroleum Engineering']],
        ['Faculty of Environmental Technology', ['Architecture', 'Building', 'Estate Management', 'Quantity Surveying', 'Urban and Regional Planning']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Entrepreneurship']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics', 'Statistics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Alex Ekwueme Federal University, Ndufu-Alike': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture and Natural Resources Management', ['Agricultural Economics', 'Agronomy', 'Animal Science', 'Fisheries and Aquaculture']],
        ['Faculty of Arts and Humanities', ['English and Literary Studies', 'History and International Studies', 'Theatre and Film Studies']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Economics Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Industrial Chemistry', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'Federal University of Transportation, Daura': {
      label: 'Faculty',
      list: [
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Transport Engineering']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Logistics and Transport Management', 'Maritime Management']],
        ['Faculty of Science', ['Chemistry', 'Computer Science', 'Mathematics', 'Physics']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Estate Management', 'Urban and Regional Planning']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University of Applied Sciences, Kachia': {
      label: 'Faculty',
      list: [
        ['Faculty of Applied Sciences', ['Applied Biology', 'Applied Chemistry', 'Applied Physics', 'Computer Science', 'Mathematics']],
        ['Faculty of Engineering Technology', ['Civil Engineering Technology', 'Electrical Engineering Technology', 'Mechanical Engineering Technology']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Entrepreneurship']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University of Environment and Technology, Ogoni': {
      label: 'Faculty',
      list: [
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Environmental Engineering', 'Petroleum Engineering']],
        ['Faculty of Environmental Sciences', ['Environmental Management', 'Geography and Environmental Studies', 'Urban and Regional Planning']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Economics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University of Health Sciences, Azare': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic Medical Sciences', ['Human Anatomy', 'Human Physiology', 'Medical Biochemistry']],
        ['Faculty of Allied Health Sciences', ['Environmental Health Science', 'Medical Laboratory Science', 'Public Health', 'Radiography']],
        ['Faculty of Nursing Sciences', ['Nursing Science']],
        ['Faculty of Clinical Sciences', ['Medicine and Surgery']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University of Health Sciences, Ila-Orangun': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic Medical Sciences', ['Human Anatomy', 'Human Physiology', 'Medical Biochemistry']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Optometry', 'Physiotherapy', 'Public Health', 'Radiography']],
        ['Faculty of Nursing Sciences', ['Nursing Science']],
        ['Faculty of Clinical Sciences', ['Medicine and Surgery']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University of Health Sciences, Otukpo': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic Medical Sciences', ['Human Anatomy', 'Human Physiology', 'Medical Biochemistry']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nutrition and Dietetics', 'Physiotherapy', 'Public Health', 'Radiography']],
        ['Faculty of Nursing Sciences', ['Nursing Science']],
        ['Faculty of Clinical Sciences', ['Medicine and Surgery']]
      ].map(([name, departments]) => ({ name, departments }))
    },
            'Federal University of Education, Kontagora': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Science Education', ['Arabic Education', 'Economics Education', 'English Education', 'Geography Education', 'History Education', 'Islamic Studies Education', 'Political Science Education']],
        ['Faculty of Science Education', ['Biology Education', 'Chemistry Education', 'Computer Science Education', 'Integrated Science Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Educational Foundations', ['Early Childhood Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Primary Education']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics Education', 'Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University of Education, Pankshin': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Science Education', ['Christian Religious Studies Education', 'Economics Education', 'English Education', 'Geography Education', 'History Education', 'Political Science Education']],
        ['Faculty of Science Education', ['Biology Education', 'Chemistry Education', 'Computer Science Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Educational Foundations', ['Early Childhood Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Primary Education']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal University of Education, Zaria': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Science Education', ['Arabic Education', 'Economics Education', 'English Education', 'Geography Education', 'Hausa Education', 'History Education', 'Islamic Studies Education', 'Political Science Education']],
        ['Faculty of Science Education', ['Biology Education', 'Chemistry Education', 'Computer Science Education', 'Integrated Science Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Educational Foundations', ['Early Childhood Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Primary Education', 'Special Education']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics Education', 'Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Yusuf Maitama Sule Federal University of Education, Kano': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Science Education', ['Arabic Education', 'Economics Education', 'English Education', 'Geography Education', 'Hausa Education', 'History Education', 'Islamic Studies Education', 'Political Science Education']],
        ['Faculty of Science Education', ['Biology Education', 'Chemistry Education', 'Computer Science Education', 'Integrated Science Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Educational Foundations', ['Early Childhood Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Primary Education', 'Special Education']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics Education', 'Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Adeyemi Federal University of Education, Ondo': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts Education', ['Christian Religious Studies Education', 'English Language Education', 'French Education', 'History Education', 'Islamic Studies Education', 'Yoruba Education']],
        ['Faculty of Social Sciences Education', ['Economics Education', 'Geography Education', 'Political Science Education', 'Social Studies Education']],
        ['Faculty of Science Education', ['Biology Education', 'Chemistry Education', 'Computer Science Education', 'Integrated Science Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Educational Foundations', ['Early Childhood Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Primary Education', 'Special Education']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics Education', 'Technology Education']],
        ['Faculty of Human Kinetics and Health Education', ['Health Education', 'Human Kinetics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Alvan Ikoku Federal University of Education, Owerri': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts Education', ['Christian Religious Studies Education', 'English Education', 'Igbo Education', 'Music Education']],
        ['Faculty of Social Sciences Education', ['Economics Education', 'Geography Education', 'Political Science Education', 'Social Studies Education']],
        ['Faculty of Science Education', ['Biology Education', 'Chemistry Education', 'Computer Science Education', 'Integrated Science Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Educational Foundations', ['Early Childhood Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Primary Education', 'Special Education']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics Education', 'Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Tai Solarin Federal University of Education, Ijebu-Ode': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts Education', ['Christian Religious Studies Education', 'English Language Education', 'French Education', 'History Education', 'Islamic Studies Education', 'Yoruba Education']],
        ['Faculty of Social Sciences Education', ['Economics Education', 'Geography Education', 'Political Science Education', 'Social Studies Education']],
        ['Faculty of Science Education', ['Biology Education', 'Chemistry Education', 'Computer Science Education', 'Integrated Science Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Educational Foundations', ['Early Childhood Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Primary Education', 'Special Education']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics Education', 'Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'Federal University of Agriculture and Development Studies, Iragbiji': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Agronomy', 'Animal Science', 'Fisheries and Aquaculture', 'Soil Science']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Business Administration', 'Economics']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Food Science and Technology', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'University of Agriculture and Environmental Sciences, Umuagwo': {
      label: 'College',
      list: [
        ['College of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture', 'Soil Science']],
        ['College of Environmental Sciences', ['Environmental Management', 'Forestry and Wildlife', 'Urban and Regional Planning']],
        ['College of Natural and Applied Sciences', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['College of Management and Social Sciences', ['Accounting', 'Business Administration', 'Economics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'National Open University of Nigeria': {
      label: 'Faculty',
      list: [
        ['Faculty of Agricultural Sciences', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture']],
        ['Faculty of Arts', ['Christian Theology', 'English', 'French', 'Islamic Studies', 'Linguistics']],
        ['Faculty of Education', ['Arts and Social Science Education', 'Early Childhood Care and Education', 'Educational Foundations', 'Library and Information Science', 'Science and Technology Education']],
        ['Faculty of Health Sciences', ['Environmental Health Science', 'Health Information Management', 'Nursing Science', 'Public Health']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Entrepreneurship', 'Human Resource Management', 'Marketing', 'Public Administration', 'Transport Management']],
        ['Faculty of Sciences', ['Biology', 'Chemistry', 'Computer Science', 'Cyber Security', 'Environmental Science', 'Information Technology', 'Mathematics', 'Physics', 'Software Engineering']],
        ['Faculty of Social Sciences', ['Criminology and Security Studies', 'Economics', 'International Relations', 'Mass Communication', 'Peace Studies and Conflict Resolution', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nigerian Defence Academy, Kaduna': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Sciences', ['Economics', 'English', 'History', 'Political Science', 'Psychology']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Mechatronics Engineering']],
        ['Faculty of Science', ['Biological Sciences', 'Chemistry', 'Computer Science', 'Mathematics', 'Physics']],
        ['Faculty of Military Science and Interdisciplinary Studies', ['Military Science', 'Strategic Studies']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nigerian Army University, Biu': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Sciences', ['Economics', 'English', 'History and Strategic Studies', 'Political Science']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nigeria Police Academy, Wudil': {
      label: 'Faculty',
      list: [
        ['Faculty of Social and Management Sciences', ['Criminology and Security Studies', 'Economics', 'Political Science', 'Psychology', 'Sociology']],
        ['Faculty of Science', ['Computer Science', 'Mathematics', 'Physics']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nigerian Maritime University, Okerenkoko': {
      label: 'Faculty',
      list: [
        ['Faculty of Engineering', ['Marine Engineering', 'Naval Architecture and Shipbuilding', 'Petroleum and Gas Engineering']],
        ['Faculty of Maritime Management and Social Sciences', ['Maritime Transport and Logistics', 'Nautical Science', 'Port and Shipping Management']],
        ['Faculty of Science', ['Computer Science', 'Marine Environmental Management', 'Mathematics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'Abdulkadir Kure University, Minna': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture']],
        ['Faculty of Arts and Social Sciences', ['Economics', 'English Language', 'History', 'Islamic Studies', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Abia State University, Uturu': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture and Veterinary Medicine', ['Agricultural Economics and Extension', 'Animal Science', 'Crop and Soil Science', 'Veterinary Medicine']],
        ['Faculty of Arts', ['English Language and Literature', 'History and International Studies', 'Igbo, African and Asian Studies', 'Religious and Cultural Studies', 'Theatre Arts']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Biochemistry', 'Physiology']],
        ['Faculty of Clinical Medicine', ['Medicine and Surgery']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Agricultural Engineering', 'Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Biological and Physical Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Industrial Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Adamawa State University, Mubi': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries']],
        ['Faculty of Arts', ['Arabic', 'English', 'History', 'Hausa', 'Religious Studies']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Geography', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Adekunle Ajasin University, Akungba-Akoko': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture']],
        ['Faculty of Arts', ['English Language', 'History and International Studies', 'Linguistics', 'Religious Studies', 'Theatre Arts', 'Yoruba']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Industrial Chemistry', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Geography', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Akwa Ibom State University, Ikot Akpaden': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries and Aquaculture']],
        ['Faculty of Arts', ['English Language and Literature', 'History and International Studies', 'Linguistics and Nigerian Languages', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Petroleum Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Aliko Dangote University of Science and Technology, Wudil': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture and Agricultural Technology', ['Agricultural Economics', 'Agronomy', 'Animal Science', 'Soil Science']],
        ['Faculty of Computer Science and Information Technology', ['Computer Science', 'Cyber Security', 'Information Technology', 'Software Engineering']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering']],
        ['Faculty of Environmental Technology', ['Architecture', 'Building', 'Quantity Surveying', 'Urban and Regional Planning']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Economics']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Mathematics', 'Microbiology', 'Physics', 'Statistics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ambrose Alli University, Ekpoma': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries']],
        ['Faculty of Arts', ['English and Literary Studies', 'History and International Studies', 'Linguistics', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering and Technology', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Pharmacy', ['Pharmacy']],
        ['Faculty of Science', ['Biochemistry', 'Biological Sciences', 'Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Geography', 'Mass Communication', 'Political Science', 'Sociology']],
        ['College of Medicine', ['Anatomy', 'Medicine and Surgery', 'Nursing Science', 'Physiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
            'Bamidele Olumilua University of Education, Science and Technology, Ikere-Ekiti': {
      label: 'Faculty',
      list: [
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Early Childhood Education', 'Science Education', 'Social Science Education']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Agricultural Sciences', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Engineering and Technology', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Arts and Social Sciences', ['Economics', 'English Language', 'Political Science', 'Religious Studies']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Bauchi State University, Gadau': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Sciences', ['Arabic', 'Economics', 'English', 'Hausa', 'Islamic Studies', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Bayelsa Medical University, Yenagoa': {
      label: 'College',
      list: [
        ['College of Medicine', ['Anatomy', 'Biochemistry', 'Medicine and Surgery', 'Physiology']],
        ['College of Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Pharmacy', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Benue State University, Makurdi': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Production', 'Fisheries']],
        ['Faculty of Arts', ['English', 'History', 'Linguistics', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biological Sciences', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['College of Health Sciences', ['Medical Laboratory Science', 'Medicine and Surgery', 'Nursing Science', 'Public Health']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Borno State University, Maiduguri': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Sciences', ['Arabic', 'Economics', 'English', 'Hausa', 'Islamic Studies', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Capital City University, Kano': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Sciences', ['Economics', 'English', 'Mass Communication', 'Political Science']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Chukwuemeka Odumegwu Ojukwu University, Uli': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries']],
        ['Faculty of Arts', ['English Language and Literature', 'History and International Studies', 'Igbo, African and Asian Studies', 'Religion and Human Relations', 'Theatre and Film Studies']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Estate Management', 'Surveying and Geoinformatics', 'Urban and Regional Planning']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Biosciences', ['Biochemistry', 'Botany', 'Microbiology', 'Zoology']],
        ['Faculty of Physical Sciences', ['Chemistry', 'Computer Science', 'Mathematics', 'Physics', 'Statistics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['College of Medicine', ['Anatomy', 'Medicine and Surgery', 'Nursing Science', 'Physiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'Confluence University of Science and Technology, Osara': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Business Administration', 'Economics']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Cross River University of Technology, Calabar': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture and Forestry', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Forestry and Wildlife']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Estate Management', 'Urban and Regional Planning']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Delta State University of Science and Technology, Ozoro': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Petroleum Engineering']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Banking and Finance']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Delta State University, Abraka': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries']],
        ['Faculty of Arts', ['English and Literary Studies', 'History and International Studies', 'Linguistics', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Biochemistry', 'Physiology']],
        ['Faculty of Clinical Sciences', ['Medicine and Surgery']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Pharmacy', ['Pharmacy']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Microbiology', 'Physics', 'Zoology']],
        ['Faculty of Social Sciences', ['Economics', 'Geography', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Dennis Osadebay University, Asaba': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ebonyi State University, Abakaliki': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries']],
        ['Faculty of Arts', ['English and Literary Studies', 'History and International Studies', 'Igbo, African and Asian Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Biochemistry', 'Physiology']],
        ['Faculty of Clinical Medicine', ['Medicine and Surgery']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Edo State University, Uzairue': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts', ['English', 'History and International Studies', 'Religious Studies']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ekiti State University, Ado-Ekiti': {
      label: 'Faculty',
      list: [
        ['Faculty of Agricultural Sciences', ['Agricultural Economics and Extension', 'Animal Production', 'Crop Production', 'Fisheries']],
        ['Faculty of Arts', ['English Language', 'History and International Studies', 'Linguistics and Nigerian Languages', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Biochemistry', 'Physiology']],
        ['Faculty of Clinical Sciences', ['Medicine and Surgery']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Pharmaceutical Sciences', ['Pharmacy']],
        ['Faculty of Science', ['Biochemistry', 'Biological Sciences', 'Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social and Management Sciences', ['Accounting', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Emmanuel Alayande University of Education, Oyo': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Science Education', ['Economics Education', 'English Education', 'Geography Education', 'History Education', 'Yoruba Education']],
        ['Faculty of Science Education', ['Biology Education', 'Chemistry Education', 'Computer Science Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Educational Foundations', ['Early Childhood Education', 'Guidance and Counselling', 'Primary Education']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Enugu State University of Science and Technology, Enugu': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture and Natural Resources Management', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Applied Natural Sciences', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Biochemistry', 'Physiology']],
        ['Faculty of Clinical Medicine', ['Medicine and Surgery']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Estate Management', 'Urban and Regional Planning']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'First Technical University, Ibadan': {
      label: 'Faculty',
      list: [
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Computing', ['Computer Science', 'Cyber Security', 'Software Engineering']],
        ['Faculty of Environmental Technology', ['Architecture', 'Building Technology', 'Quantity Surveying']],
        ['Faculty of Science', ['Industrial Chemistry', 'Mathematics', 'Physics', 'Statistics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Gombe State University of Science and Technology, Kumo': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Business Administration', 'Economics']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Gombe State University, Gombe': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Sciences', ['Arabic', 'Economics', 'English', 'Hausa', 'History', 'Islamic Studies', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['College of Medical Sciences', ['Anatomy', 'Medicine and Surgery', 'Nursing Science', 'Physiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ibrahim Badamasi Babangida University, Lapai': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Arts and Social Sciences', ['Economics', 'English', 'History', 'Islamic Studies', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ignatius Ajuru University of Education, Port Harcourt': {
      label: 'Faculty',
      list: [
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Early Childhood Education', 'Library and Information Science']],
        ['Faculty of Humanities', ['English Education', 'History Education', 'Religious Studies Education']],
        ['Faculty of Science', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Social Sciences', ['Economics Education', 'Geography Education', 'Political Science Education']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Imo State University, Owerri': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries']],
        ['Faculty of Arts', ['English and Literary Studies', 'History and International Studies', 'Igbo, African and Asian Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['College of Medicine', ['Anatomy', 'Medicine and Surgery', 'Nursing Science', 'Physiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kaduna State University, Kaduna': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Arts', ['Arabic', 'English', 'Hausa', 'History', 'Islamic Studies']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Pharmaceutical Sciences', ['Pharmacy']],
        ['Faculty of Science', ['Biochemistry', 'Biological Sciences', 'Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social and Management Sciences', ['Accounting', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['College of Medicine', ['Anatomy', 'Medicine and Surgery', 'Nursing Science', 'Physiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kebbi State University of Science and Technology, Aliero': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries']],
        ['Faculty of Arts and Social Sciences', ['Economics', 'English', 'Hausa', 'Islamic Studies', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kwara State University, Malete': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Production', 'Crop Production', 'Fisheries']],
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Communication and Information Sciences', ['Information and Communication Science', 'Mass Communication', 'Library and Information Science']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education']],
        ['Faculty of Engineering and Technology', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Humanities and Social Sciences', ['Economics', 'English', 'History', 'Political Science', 'Sociology']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ladoke Akintola University of Technology, Ogbomoso': {
      label: 'Faculty',
      list: [
        ['Faculty of Agricultural Sciences', ['Agricultural Economics and Extension', 'Animal Production', 'Crop Production', 'Fisheries']],
        ['Faculty of Engineering and Technology', ['Chemical Engineering', 'Civil Engineering', 'Computer Science and Engineering', 'Electronic and Electrical Engineering', 'Mechanical Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Estate Management', 'Urban and Regional Planning']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Marketing']],
        ['Faculty of Pure and Applied Sciences', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics', 'Statistics']],
        ['College of Health Sciences', ['Anatomy', 'Medicine and Surgery', 'Nursing Science', 'Physiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'Lagos State University of Education, Oto-Ijanikin': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Science Education', ['Economics Education', 'English Education', 'Geography Education', 'History Education', 'Yoruba Education']],
        ['Faculty of Science Education', ['Biology Education', 'Chemistry Education', 'Computer Science Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Educational Foundations', ['Early Childhood Education', 'Guidance and Counselling', 'Primary Education']],
        ['Faculty of Vocational and Technical Education', ['Business Education', 'Home Economics Education', 'Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Lagos State University of Science and Technology, Ikorodu': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Estate Management', 'Urban and Regional Planning']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Lagos State University, Ojo': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts', ['English', 'History and Strategic Studies', 'Linguistics, African and Asian Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Computer Engineering', 'Electronics and Computer Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics', 'Zoology']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['College of Medicine', ['Anatomy', 'Medicine and Surgery', 'Nursing Science', 'Physiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Moshood Abiola University of Science and Technology, Abeokuta': {
      label: 'Faculty',
      list: [
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Estate Management', 'Urban and Regional Planning']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nasarawa State University, Keffi': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Arts', ['English', 'History', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Estate Management', 'Geography', 'Urban and Regional Planning']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Niger Delta University, Wilberforce Island': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries']],
        ['Faculty of Arts', ['English', 'History and Diplomatic Studies', 'Linguistics', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Biochemistry', 'Physiology']],
        ['Faculty of Clinical Sciences', ['Medicine and Surgery']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Pharmacy', ['Pharmacy']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Olabisi Onabanjo University, Ago-Iwoye': {
      label: 'Faculty',
      list: [
        ['Faculty of Agricultural Sciences', ['Agricultural Economics and Extension', 'Animal Production', 'Crop Production']],
        ['Faculty of Arts', ['English', 'History and International Studies', 'Linguistics and Languages', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering and Environmental Sciences', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Architecture']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Pure and Applied Sciences', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['College of Health Sciences', ['Anatomy', 'Medicine and Surgery', 'Nursing Science', 'Physiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Olusegun Agagu University of Science and Technology, Okitipupa': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Petroleum Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Estate Management', 'Urban and Regional Planning']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Business Administration', 'Economics']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Osun State University, Osogbo': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['College of Humanities and Culture', ['English', 'History and International Studies', 'Linguistics and Languages', 'Religious Studies', 'Theatre Arts']],
        ['College of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['College of Science, Engineering and Technology', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['College of Health Sciences', ['Anatomy', 'Medicine and Surgery', 'Nursing Science', 'Physiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Oyo State Technical University, Ibadan': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Computing', ['Computer Science', 'Cyber Security', 'Software Engineering']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Environmental Technology', ['Architecture', 'Building', 'Quantity Surveying']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Plateau State University, Bokkos': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Arts', ['English', 'History', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Prince Abubakar Audu University, Anyigba': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries']],
        ['Faculty of Arts', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Natural Sciences', ['Biochemistry', 'Biological Sciences', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Rivers State University, Port Harcourt': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science', 'Fisheries']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education']],
        ['Faculty of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Petroleum Engineering']],
        ['Faculty of Environmental Sciences', ['Architecture', 'Estate Management', 'Urban and Regional Planning']],
        ['Faculty of Humanities', ['English', 'History and Diplomatic Studies', 'Linguistics and Communication Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['College of Medical Sciences', ['Anatomy', 'Medicine and Surgery', 'Nursing Science', 'Physiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        "Sa'adatu Rimi University of Education, Kumbotso": {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Science Education', ['Arabic Education', 'Economics Education', 'English Education', 'Geography Education', 'Hausa Education', 'Islamic Studies Education']],
        ['Faculty of Science Education', ['Biology Education', 'Chemistry Education', 'Computer Science Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Educational Foundations', ['Early Childhood Education', 'Guidance and Counselling', 'Primary Education', 'Special Education']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Sokoto State University, Sokoto': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Arts and Social Sciences', ['Arabic', 'Economics', 'English', 'Hausa', 'Islamic Studies', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Sule Lamido University, Kafin Hausa': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Arts and Social Sciences', ['Arabic', 'Economics', 'English', 'Hausa', 'Islamic Studies', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Business Administration', 'Public Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Tai Solarin University of Education, Ijagun': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Science Education', ['Economics Education', 'English Education', 'Geography Education', 'History Education', 'Yoruba Education']],
        ['Faculty of Science Education', ['Biology Education', 'Chemistry Education', 'Computer Science Education', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Educational Foundations', ['Early Childhood Education', 'Guidance and Counselling', 'Primary Education']],
        ['Faculty of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics Education']],
        ['Faculty of Natural Sciences', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Taraba State University, Jalingo': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Arts', ['English', 'History', 'Religious Studies']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        "Umaru Musa Yar'adua University, Katsina": {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Arts and Humanities', ['Arabic', 'English', 'Hausa', 'History', 'Islamic Studies']],
        ['Faculty of Education', ['Biology Education', 'Chemistry Education', 'Educational Foundations', 'Mathematics Education', 'Physics Education']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Public Administration']],
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'University of Africa, Toru-Orua': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts', ['English', 'History and Diplomatic Studies', 'Religious Studies']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Business Administration', 'Economics', 'Political Science']],
        ['Faculty of Science', ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']]
      ].map(([name, departments]) => ({ name, departments }))
    },
          'Achievers University, Owo': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Adeleke University, Ede': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Admiralty University of Nigeria, Ibusa': {
      label: 'Faculty',
      list: [
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Afe Babalola University, Ado-Ekiti': {
      label: 'College',
      list: [
        ['College of Medicine and Health Sciences', ['Anatomy', 'Medical Laboratory Science', 'Medicine and Surgery', 'Nursing Science', 'Physiology']],
        ['College of Sciences', ['Biochemistry', 'Chemistry', 'Computer Science', 'Industrial Chemistry', 'Mathematics', 'Microbiology', 'Physics']],
        ['College of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Mechatronics Engineering', 'Petroleum Engineering']],
        ['College of Social and Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['College of Law', ['Law']],
        ['College of Pharmacy', ['Pharmacy']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'African University of Science and Technology, Abuja': {
      label: 'Faculty',
      list: [
        ['Faculty of Science and Engineering', ['Computer Science', 'Life Sciences', 'Materials Science and Engineering', 'Petroleum Engineering', 'Pure and Applied Mathematics', 'Theoretical and Applied Physics']],
        ['Faculty of Management', ['Management Science']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ahman Pategi University, Patigi': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ajayi Crowther University, Oyo': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Al-Hikmah University, Ilorin': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Al-Istiqamah University, Sumaila': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Al-Qalam University, Katsina': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'American University of Nigeria, Yola': {
      label: 'School',
      list: [
        ['School of Arts and Sciences', ['Biology', 'Chemistry', 'Economics', 'English', 'Mass Communication', 'Political Science', 'Psychology']],
        ['School of Business and Entrepreneurship', ['Accounting', 'Business Administration', 'Entrepreneurship', 'Marketing']],
        ['School of Information Technology and Computing', ['Computer Science', 'Cyber Security', 'Information Systems', 'Software Engineering']],
        ['School of Engineering', ['Civil Engineering', 'Electrical and Electronics Engineering', 'Petroleum Engineering']],
        ['School of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
   'Anan University, Kwall': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Anchor University, Lagos': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Arthur Jarvis University, Akpabuyo': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Atiba University, Oyo': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Augustine University, Ilara-Epe': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ave Maria University, Piyanko': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Baba Ahmed University, Kano': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Babcock University, Ilishan-Remo': {
      label: 'School',
      list: [
        ['School of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Microbiology', 'Physics', 'Mathematics']],
        ['School of Computing and Engineering Sciences', ['Computer Science', 'Software Engineering', 'Information Technology', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['School of Education and Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Educational Management']],
        ['School of Law and Security Studies', ['Law', 'Criminology and Security Studies']],
        ['School of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['School of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['School of Public and Allied Health', ['Medical Laboratory Science', 'Nursing Science', 'Public Health']],
        ['Benjamin Carson (Snr) School of Medicine', ['Anatomy', 'Medicine and Surgery', 'Physiology']],
        ['School of Pharmacy', ['Pharmacy']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Baze University, Abuja': {
      label: 'Faculty',
      list: [
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Bells University of Technology, Ota': {
      label: 'College',
      list: [
        ['College of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['College of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['College of Management and Social Sciences', ['Accounting', 'Business Administration', 'Economics', 'Mass Communication']],
        ['College of Environmental Sciences', ['Architecture', 'Building Technology', 'Estate Management', 'Quantity Surveying']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Benson Idahosa University, Benin City': {
      label: 'Faculty',
      list: [
        ['Faculty of Arts and Social Sciences', ['Economics', 'English', 'History and International Studies', 'Mass Communication', 'Political Science', 'Religious Studies', 'Sociology']],
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Business Administration', ['Accounting', 'Business Administration', 'Banking and Finance', 'Marketing']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Bingham University, Karu': {
      label: 'Faculty',
      list: [
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Bowen University, Iwo': {
      label: 'College',
      list: [
        ['College of Agriculture, Engineering and Science', ['Agronomy', 'Animal Science', 'Biochemistry', 'Chemistry', 'Computer Science', 'Electrical and Electronics Engineering', 'Mathematics', 'Mechanical Engineering', 'Microbiology', 'Physics']],
        ['College of Liberal Studies', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['College of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science']],
        ['College of Health Sciences', ['Anatomy', 'Medical Laboratory Science', 'Medicine and Surgery', 'Nursing Science', 'Physiology']],
        ['College of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Caleb University, Imota': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Chrisland University, Abeokuta': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Christopher University, Mowe': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Clifford University, Owerrinta': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Coal City University, Enugu': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Covenant University, Ota': {
      label: 'College',
      list: [
        ['College of Science and Technology', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Industrial Mathematics', 'Information Systems', 'Industrial Physics', 'Microbiology', 'Software Engineering', 'Cyber Security']],
        ['College of Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Information and Communication Engineering', 'Mechanical Engineering', 'Petroleum Engineering']],
        ['College of Leadership and Development Studies', ['Architecture', 'Building Technology', 'Economics', 'English', 'International Relations', 'Mass Communication', 'Policy and Strategic Studies', 'Psychology', 'Sociology', 'Estate Management']],
        ['College of Business and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Management', 'Marketing', 'Industrial Relations and Human Resource Management', 'Taxation']],
        ['College of Medicine and Health Sciences', ['Anatomy', 'Medicine and Surgery', 'Nursing Science', 'Physiology', 'Public Health']],
        ['College of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Crawford University, Igbesa': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Crescent University, Abeokuta': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Crown-Hill University, Eiyenkorin': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Dominican University, Ibadan': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Dominion University, Ibadan': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Eastern Palm University, Ogboko': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Edwin Clark University, Kiagbodo': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Eko University of Medical and Health Sciences, Ijanikin': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Biochemistry', 'Physiology']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']],
        ['Faculty of Nursing Sciences', ['Nursing Science']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'El-Amin University, Minna': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Elizade University, Ilara-Mokin': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Evangel University, Akaeze': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Fountain University, Osogbo': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Glorious Vision University, Ogwa': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Godfrey Okoye University, Enugu': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Greenfield University, Kasarami': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Gregory University, Uturu': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Hallmark University, Ijebu-Itele': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Hezekiah University, Umudi': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Igbinedion University, Okada': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['College of Health Sciences', ['Anatomy', 'Medical Laboratory Science', 'Medicine and Surgery', 'Nursing Science', 'Physiology']],
        ['Faculty of Pharmacy', ['Pharmacy']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'James Hope University, Lagos': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Joseph Ayo Babalola University, Ikeji-Arakeji': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Karl-Kumm University, Vom': {
      label: 'Faculty',
      list: [
        ['Faculty of Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Khadija University, Majia': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kings University, Odeomu': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kola Daisi University, Ibadan': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kwararafa University, Wukari': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Landmark University, Omu-Aran': {
      label: 'College',
      list: [
        ['College of Agricultural Sciences', ['Agricultural Economics', 'Agronomy', 'Animal Science', 'Food Science and Technology', 'Soil Science']],
        ['College of Pure and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Industrial Chemistry', 'Mathematics', 'Microbiology', 'Physics']],
        ['College of Science and Engineering', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Petroleum Engineering']],
        ['College of Business and Social Sciences', ['Accounting', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Lead City University, Ibadan': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Legacy University, Okija': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Lux Mundi University, Umuahia': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Madonna University, Okija': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']],
        ['College of Health Sciences', ['Anatomy', 'Medical Laboratory Science', 'Medicine and Surgery', 'Nursing Science', 'Physiology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Maranatha University, Lagos': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Margaret Lawrence University, Umunya': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'McPherson University, Seriki Sotayo': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Micheal and Cecilia Ibru University, Agbarha-Otor': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Mountain Top University, Prayer City': {
      label: 'College',
      list: [
        ['College of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['College of Humanities, Management and Social Sciences', ['Accounting', 'Business Administration', 'Economics', 'English', 'Mass Communication', 'Political Science']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Mudiame University, Irrua': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Muhammad Kamalud-Deen University, Ilorin': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Newgate University, Minna': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nigerian British University, Asa': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nigerian Turkish Nile University, Abuja': {
      label: 'Faculty',
      list: [
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nile University of Nigeria, Abuja': {
      label: 'Faculty',
      list: [
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Computing', ['Computer Science', 'Cyber Security', 'Information Technology', 'Software Engineering']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nok University, Kachia': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Novena University, Ogume': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Obong University, Obong Ntak': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Oduduwa University, Ipetumodu': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ojaja University, Eiyenkorin': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Pan-Atlantic University, Lagos': {
      label: 'School',
      list: [
        ['School of Media and Communication', ['Mass Communication']],
        ['School of Science and Technology', ['Computer Science', 'Cyber Security', 'Information Systems']],
        ['Lagos Business School', ['Accounting', 'Business Administration', 'Entrepreneurship']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Paul University, Awka': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Pen Resource University, Gombe': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Peter University, Achina-Onneh': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Phoenix University, Agwada': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Precious Cornerstone University, Ibadan': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        "Redeemer's University, Ede": {
      label: 'College',
      list: [
        ['College of Natural Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['College of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['College of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['College of Humanities', ['English', 'History and International Studies', 'Religious Studies']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Renaissance University, Ugbawka': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Rhema University, Obeama-Asa': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ritman University, Ikot Ekpene': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Salem University, Lokoja': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Samuel Adegboyega University, Ogwa': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Skyline University Nigeria, Kano': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Southwestern University, Okun-Owa': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Spiritan University, Nneochi': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Summit University, Offa': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Tansian University, Umunya': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Thomas Adewumi University, Oko-Irese': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Topfaith University, Mkpatak': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Trinity University, Yaba': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'University of Mkar, Mkar': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Venite University, Iloro-Ekiti': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Veritas University, Abuja': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Wellspring University, Evbuobanosa': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Wesley University, Ondo': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Western Delta University, Oghara': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Law', ['Law']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Westland University, Iwo': {
      label: 'Faculty',
      list: [
        ['Faculty of Natural and Applied Sciences', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']],
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Wigwe University, Isiokpo': {
      label: 'Faculty',
      list: [
        ['Faculty of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Computing', ['Computer Science', 'Cyber Security', 'Information Technology', 'Software Engineering']],
        ['Faculty of Management and Social Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'University of Cross River State, Calabar': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Arts', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'University of Delta, Agbor': {
      label: 'Faculty',
      list: [
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'University of Medical Sciences, Ondo': {
      label: 'Faculty',
      list: [
        ['Faculty of Basic Medical Sciences', ['Anatomy', 'Medical Biochemistry', 'Physiology']],
        ['Faculty of Clinical Sciences', ['Medicine and Surgery']],
        ['Faculty of Pharmacy', ['Pharmacy']],
        ['Faculty of Nursing Sciences', ['Nursing Science']],
        ['Faculty of Allied Health Sciences', ['Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Radiography']],
        ['Faculty of Dentistry', ['Dentistry and Dental Surgery']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Yobe State University, Damaturu': {
      label: 'Faculty',
      list: [
        ['Faculty of Agriculture', ['Agricultural Economics and Extension', 'Animal Science', 'Crop Science']],
        ['Faculty of Arts', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
        },
   'Yusuf Maitama Sule University, Kano': {
      label: 'Faculty',
      list: [
        ['Faculty of Humanities', ['English', 'History and International Studies', 'Religious Studies', 'Theatre Arts']],
        ['Faculty of Education', ['Educational Foundations', 'Guidance and Counselling', 'Science Education', 'Social Science Education']],
        ['Faculty of Law', ['Law']],
        ['Faculty of Management Sciences', ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing']],
        ['Faculty of Science', ['Biochemistry', 'Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics']],
        ['Faculty of Social Sciences', ['Economics', 'Mass Communication', 'Political Science', 'Sociology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Abdu Gusau Polytechnic, Talata Mafara': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Abia State Polytechnic, Aba': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Abubakar Tatari Ali Polytechnic, Bauchi': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Agricultural Technology', ['Agricultural Extension and Management', 'Agricultural Technology', 'Animal Health and Production Technology', 'Fisheries Technology', 'Forestry Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Adamawa State Polytechnic, Yola': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Akanu Ibiam Federal Polytechnic, Unwana': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Akwa Ibom State Polytechnic, Ikot Osurua': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Allover Central Polytechnic, Sango-Otta': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Anambra State Polytechnic, Mgbakwu': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Benue State Polytechnic, Ugbokolo': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Binyaminu Usman Polytechnic, Hadejia': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Bolmor Polytechnic, Ibadan': {
      label: 'School',
      list: [
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Captain Elechi Amadi Polytechnic, Port Harcourt': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Citi Polytechnic, Abuja': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Covenant Polytechnic, Aba': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Crown Polytechnic, Ado-Ekiti': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Delta State Polytechnic, Ogwashi-Uku': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Delta State Polytechnic, Otefe-Oghara': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Delta State Polytechnic, Ozoro': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Dorben Polytechnic, Abuja': {
      label: 'School',
      list: [
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Edo State Polytechnic, Usen': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Enugu State Polytechnic, Iwollo': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic of Oil and Gas, Bonny': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology', 'Petroleum and Gas Engineering Technology', 'Welding and Fabrication Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Ado-Ekiti': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Auchi': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Art and Design', ['Fashion Design', 'Fine and Applied Arts', 'Graphic Design', 'Industrial Design']],
        ['School of Health Technology', ['Community Health', 'Health Information Management', 'Medical Laboratory Technology', 'Nutrition and Dietetics', 'Pharmacy Technology', 'Public Health Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Ayede': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Bali': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Agricultural Technology', ['Agricultural Extension and Management', 'Agricultural Technology', 'Animal Health and Production Technology', 'Fisheries Technology', 'Forestry Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Bauchi': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Bida': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Damaturu': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Daura': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Ede': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Ekowe': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Gwandu': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Idah': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Ilaro': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Art and Design', ['Fashion Design', 'Fine and Applied Arts', 'Graphic Design', 'Industrial Design']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Ile-Oluji': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Kabo': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Kaltungo': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Kaura Namoda': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Monguno': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Mubi': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Agricultural Technology', ['Agricultural Extension and Management', 'Agricultural Technology', 'Animal Health and Production Technology', 'Fisheries Technology', 'Forestry Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Nasarawa': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Nekede, Owerri': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Nyak, Shendam': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Offa': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Oko': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Orogun': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Ugep': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Ugwuolawo': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal Polytechnic, Ukana': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
  'Federal Polytechnic, Wannune': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Fidei Polytechnic, Gboko': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Gateway ICT Polytechnic, Saapade': {
      label: 'School',
      list: [
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Gombe State Polytechnic, Bajoga': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Hassan Usman Katsina Polytechnic, Katsina': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Heritage Polytechnic, Ikot Udota': {
      label: 'School',
      list: [
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ibadan City Polytechnic, Ibadan': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Igbajo Polytechnic, Igbajo': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Imo State Polytechnic, Umuagwo': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Institute of Management and Technology, Enugu': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Art and Design', ['Fashion Design', 'Fine and Applied Arts', 'Graphic Design', 'Industrial Design']],
        ['School of Health Technology', ['Community Health', 'Health Information Management', 'Medical Laboratory Technology', 'Nutrition and Dietetics', 'Pharmacy Technology', 'Public Health Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Interlink Polytechnic, Ijebu-Jesa': {
      label: 'School',
      list: [
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Isa Mustapha Agwai I Polytechnic, Lafia': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kaduna Polytechnic, Kaduna': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Art and Design', ['Fashion Design', 'Fine and Applied Arts', 'Graphic Design', 'Industrial Design']],
        ['School of Health Technology', ['Community Health', 'Health Information Management', 'Medical Laboratory Technology', 'Nutrition and Dietetics', 'Pharmacy Technology', 'Public Health Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kano State Polytechnic, Kano': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kenule Beeson Saro-Wiwa Polytechnic, Bori': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kings Polytechnic, Ubiaja': {
      label: 'School',
      list: [
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kogi State Polytechnic, Lokoja': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Agricultural Technology', ['Agricultural Extension and Management', 'Agricultural Technology', 'Animal Health and Production Technology', 'Fisheries Technology', 'Forestry Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kwara State Polytechnic, Ilorin': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Lagos City Polytechnic, Ikeja': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Lagos State Polytechnic, Ikorodu': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Lens Polytechnic, Offa': {
      label: 'School',
      list: [
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Mai Idris Alooma Polytechnic, Geidam': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Mohammed Abdullahi Wase Polytechnic, Wase': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Moshood Abiola Polytechnic, Abeokuta': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Niger State Polytechnic, Zungeru': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Agricultural Technology', ['Agricultural Extension and Management', 'Agricultural Technology', 'Animal Health and Production Technology', 'Fisheries Technology', 'Forestry Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nigerian Institute of Leather and Science Technology, Zaria': {
      label: 'School',
      list: [
        ['School of Leather and Polymer Technology', ['Leather and Leather Products Technology', 'Polymer Technology', 'Textile Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nuhu Bamalli Polytechnic, Zaria': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Agricultural Technology', ['Agricultural Extension and Management', 'Agricultural Technology', 'Animal Health and Production Technology', 'Fisheries Technology', 'Forestry Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Oke-Ogun Polytechnic, Saki': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Osun State College of Technology, Esa-Oke': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Agricultural Technology', ['Agricultural Extension and Management', 'Agricultural Technology', 'Animal Health and Production Technology', 'Fisheries Technology', 'Forestry Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Osun State Polytechnic, Iree': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Petroleum Training Institute, Effurun': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Instrumentation Engineering Technology', 'Mechanical Engineering Technology', 'Petroleum Engineering Technology', 'Welding and Fabrication Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Science Laboratory Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Plateau State Polytechnic, Barkin Ladi': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Agricultural Technology', ['Agricultural Extension and Management', 'Agricultural Technology', 'Animal Health and Production Technology', 'Fisheries Technology', 'Forestry Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ramat Polytechnic, Maiduguri': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Rufus Giwa Polytechnic, Owo': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Shaka Polytechnic, Benin City': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Taraba State Polytechnic, Suntai': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Temple Gate Polytechnic, Aba': {
      label: 'School',
      list: [
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'The Polytechnic, Ibadan': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Umaru Ali Shinkafi Polytechnic, Sokoto': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
  'Waziri Umaru Federal Polytechnic, Birnin Kebbi': {
      label: 'School',
      list: [
        ['School of Engineering Technology', ['Chemical Engineering Technology', 'Civil Engineering Technology', 'Computer Engineering Technology', 'Electrical/Electronic Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics']],
        ['School of Business and Management Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Communication and Liberal Studies', ['Library and Information Science', 'Mass Communication']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Yaba College of Technology, Lagos': {
      label: 'School',
      list: [
        ['School of Engineering', ['Civil Engineering', 'Computer Engineering', 'Electrical/Electronic Engineering', 'Mechanical Engineering', 'Metallurgical Engineering', 'Chemical Engineering']],
        ['School of Environmental Studies', ['Architectural Technology', 'Building Technology', 'Estate Management and Valuation', 'Quantity Surveying', 'Surveying and Geo-Informatics', 'Urban and Regional Planning']],
        ['School of Science', ['Computer Science', 'Food Technology', 'Science Laboratory Technology', 'Statistics', 'Mathematics and Statistics', 'Biochemistry']],
        ['School of Technology', ['Computer Technology', 'Hospitality Management', 'Leisure and Tourism', 'Printing Technology', 'Textile Technology']],
        ['School of Management and Business Studies', ['Accountancy', 'Banking and Finance', 'Business Administration and Management', 'Marketing', 'Office Technology and Management', 'Public Administration']],
        ['School of Liberal Studies', ['Library and Information Science', 'Mass Communication']],
        ['School of Art, Design and Printing', ['Fashion Design', 'Fine and Applied Arts', 'Graphic Design', 'Industrial Design']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Adamawa State College of Education, Hong': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Adamu Augie College of Education, Argungu': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Adeniran Ogunsanya College of Education, Ijanikin': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Islamic Studies', 'Political Science', 'Social Studies', 'Yoruba']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Akwa Ibom State College of Education, Afaha Nsit': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Aminu Saleh College of Education, Azare': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Bayelsa State College of Education, Sagbama': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'College of Education, Akwanga': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'College of Education, Gindiri': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'College of Education, Katsina-Ala': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'College of Education, Langtang': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'College of Education, Oju': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'College of Education, Waka-Biu': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Cross River State College of Education, Akamkpa': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Delta State College of Education, Mosogar': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Delta State College of Education, Warri': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Ebonyi State College of Education, Ikwo': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Igbo', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Edo State College of Education, Igueben': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Enugu State College of Education (Technical), Enugu': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Igbo', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Building Technology Education', 'Business Education', 'Electrical/Electronics Technology Education', 'Home Economics', 'Mechanical Technology Education', 'Woodwork Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'FCT College of Education, Zuba': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Agriculture, Akure': {
      label: 'School',
      list: [
        ['School of Agricultural Technology', ['Agricultural Extension and Management', 'Agricultural Technology', 'Animal Production Technology', 'Crop Production Technology', 'Fisheries Technology', 'Soil Science Technology']],
        ['School of Agricultural Engineering Technology', ['Agricultural and Bio-Environmental Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Agriculture, Ibadan': {
      label: 'School',
      list: [
        ['School of Agricultural Technology', ['Agricultural Extension and Management', 'Agricultural Technology', 'Animal Production Technology', 'Crop Production Technology', 'Fisheries Technology', 'Soil Science Technology']],
        ['School of Agricultural Engineering Technology', ['Agricultural and Bio-Environmental Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Agriculture, Ishiagu': {
      label: 'School',
      list: [
        ['School of Agricultural Technology', ['Agricultural Extension and Management', 'Agricultural Technology', 'Animal Production Technology', 'Crop Production Technology', 'Fisheries Technology', 'Soil Science Technology']],
        ['School of Agricultural Engineering Technology', ['Agricultural and Bio-Environmental Engineering Technology', 'Mechanical Engineering Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Animal Health and Production Technology, Ibadan': {
      label: 'School',
      list: [
        ['School of Animal Health and Production', ['Animal Health Technology', 'Animal Production Technology', 'Veterinary Laboratory Technology']],
        ['School of Applied Sciences', ['Computer Science', 'Food Technology', 'Science Laboratory Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education (Special), Oyo': {
      label: 'School',
      list: [
        ['School of Special Education', ['Education of the Blind', 'Education of the Deaf', 'Education of the Gifted and Talented', 'Education of the Intellectually Disabled', 'Education of Learners with Learning Disabilities']],
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'Geography', 'History', 'Islamic Studies', 'Social Studies', 'Yoruba']],
        ['School of Education', ['Early Childhood Care Education', 'Guidance and Counselling', 'Primary Education Studies']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education (Technical), Akoka': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Islamic Studies', 'Political Science', 'Social Studies', 'Yoruba']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Building Technology Education', 'Business Education', 'Electrical/Electronics Technology Education', 'Home Economics', 'Mechanical Technology Education', 'Woodwork Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education (Technical), Asaba': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Building Technology Education', 'Business Education', 'Electrical/Electronics Technology Education', 'Home Economics', 'Mechanical Technology Education', 'Woodwork Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education (Technical), Bichi': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Building Technology Education', 'Business Education', 'Electrical/Electronics Technology Education', 'Home Economics', 'Mechanical Technology Education', 'Woodwork Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education (Technical), Gombe': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Building Technology Education', 'Business Education', 'Electrical/Electronics Technology Education', 'Home Economics', 'Mechanical Technology Education', 'Woodwork Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education (Technical), Gusau': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Building Technology Education', 'Business Education', 'Electrical/Electronics Technology Education', 'Home Economics', 'Mechanical Technology Education', 'Woodwork Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education (Technical), Potiskum': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Building Technology Education', 'Business Education', 'Electrical/Electronics Technology Education', 'Home Economics', 'Mechanical Technology Education', 'Woodwork Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education (Technical), Umunze': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Igbo', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Building Technology Education', 'Business Education', 'Electrical/Electronics Technology Education', 'Home Economics', 'Mechanical Technology Education', 'Woodwork Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education, Abeokuta': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Islamic Studies', 'Political Science', 'Social Studies', 'Yoruba']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education, Eha-Amufu': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Igbo', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education, Katsina': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education, Obudu': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education, Odugbo': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education, Okene': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education, Omoku': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education, Osiele, Abeokuta': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Islamic Studies', 'Political Science', 'Social Studies', 'Yoruba']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Education, Yola': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Fisheries and Marine Technology, Lagos': {
      label: 'School',
      list: [
        ['School of Fisheries', ['Aquaculture Technology', 'Fisheries Technology', 'Fish Processing Technology']],
        ['School of Marine Technology', ['Marine Engineering', 'Maritime Transport Management', 'Nautical Science']],
        ['School of Applied Sciences', ['Computer Science', 'Science Laboratory Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Federal College of Forestry, Ibadan': {
      label: 'School',
      list: [
        ['School of Forestry', ['Agroforestry', 'Forest Products Development and Utilization', 'Forestry Technology', 'Wildlife Management and Ecotourism']],
        ['School of Applied Sciences', ['Computer Science', 'Science Laboratory Technology']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Gombe State College of Education, Billiri': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Havard Wilson College of Education, Aba': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Igbo', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Isa Kaita College of Education, Dutsin-Ma': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Jigawa State College of Education, Gumel': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kaduna State College of Education, Gidan Waya': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kogi State College of Education (Technical), Kabba': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Building Technology Education', 'Business Education', 'Electrical/Electronics Technology Education', 'Home Economics', 'Mechanical Technology Education', 'Woodwork Technology Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kogi State College of Education, Ankpa': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kwara State College of Education, Ilorin': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Kwara State College of Education, Oro': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Michael Otedola College of Primary Education, Noforija-Epe': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Islamic Studies', 'Political Science', 'Social Studies', 'Yoruba']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Niger State College of Education, Minna': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Nwafor Orizu College of Education, Nsugbe': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Igbo', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Osun State College of Education, Ila-Orangun': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Islamic Studies', 'Political Science', 'Social Studies', 'Yoruba']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Osun State College of Education, Ilesa': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Islamic Studies', 'Political Science', 'Social Studies', 'Yoruba']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Oyo State College of Education, Lanlate': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Islamic Studies', 'Political Science', 'Social Studies', 'Yoruba']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Peaceland College of Education, Enugu': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'History', 'Igbo', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Shehu Shagari College of Education, Sokoto': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Taraba State College of Education, Zing': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Umar Suleiman College of Education, Gashua': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
        'Zamfara State College of Education, Maru': {
      label: 'School',
      list: [
        ['School of Sciences', ['Biology Education', 'Chemistry Education', 'Computer Education', 'Integrated Science', 'Mathematics Education', 'Physics Education']],
        ['School of Arts and Social Sciences', ['Arabic', 'Christian Religious Studies', 'Economics', 'English Language', 'French', 'Geography', 'Hausa', 'History', 'Islamic Studies', 'Political Science', 'Social Studies']],
        ['School of Education', ['Early Childhood Care Education', 'Educational Administration and Planning', 'Guidance and Counselling', 'Physical and Health Education', 'Primary Education Studies', 'Special Education']],
        ['School of Vocational and Technical Education', ['Agricultural Education', 'Business Education', 'Home Economics', 'Technical Education']]
      ].map(([name, departments]) => ({ name, departments }))
    },
};
