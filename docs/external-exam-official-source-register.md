# PRIME-CBT External Examinations — Official Source Register

This register identifies first-party examination-body sources for syllabus and past-question research. A source being listed here does not imply permission to bulk-copy, republish, or commercially redistribute its content.

Last reviewed: 2026-11-27

## JAMB (UTME)

- Examination body: Joint Admissions and Matriculation Board (JAMB)
- Official website: https://www.jamb.gov.ng/
- Official syllabus system: https://ibass.jamb.gov.ng/
- Access route: JAMB website → Quick Links → Syllabus System (IBASS)
- Source type: Interactive official syllabus/brochure system.
- Ingestion status: Source located; automated extraction not yet verified. The IBASS application requires JavaScript and must be inspected through its supported interface.
- Import rule: Capture subject, topic, objective, content, notes, and recommended texts only where exposed by the official interface. Store source URL, retrieval date, syllabus edition/year, and a source snapshot/reference. Do not invent missing topics.

## WAEC (WASSCE)

- Examination body: The West African Examinations Council.
- Official website: https://waecnigeria.org/
- Official e-Learning platform: https://www.waeconline.org.ng/e-Learning/index.htm
- Official syllabus publications: https://waecnigeria.org/news
- Example official syllabus publication: https://www.waecnigeria.org/article/bookkeeping-office-practice-2022-2025-wassce-syllabus
- Source type: Official subject learning resources, examination analyses, selected past-paper materials, and subject syllabus publications.
- Ingestion status: Official subject categories and e-Learning pages located. Coverage and downloadable material must be checked per subject and year.
- Import rule: Record paper/session/year and subject. Keep examiner comments and question content distinct. Do not treat an examiner report or analysis as a complete question paper.

## NECO (SSCE)

- Examination body: National Examinations Council (NECO).
- Official website: https://neco.gov.ng/
- Official examinations page: https://neco.gov.ng/exams
- Official SSCE External portal: https://ssceexternal.neco.gov.ng/
- Source type: Official exam notices, registration information, timetables, and syllabus information.
- Access note: NECO's official examination page lists the SSCE syllabus at ₦2,000 per copy. Obtain the syllabus through an authorised purchase or written permission before ingesting it.
- Ingestion status: Official source located; complete syllabus content not publicly verified as freely downloadable.
- Import rule: Do not scrape candidate portals or bypass payment, authentication, or access controls. Record edition, purchase/permission evidence, and source metadata.


## NECO — free curriculum reference (not the NECO syllabus)

- Publisher: Nigerian Educational Research and Development Council (NERDC), a Federal Government education agency.
- Official revised Senior Secondary Education Curriculum landing page: https://www.nerdc.gov.ng/content_manager/new_senior_curriculum_home.html
- Public curriculum subject/topic browser: https://nerdc.org.ng/CurriculumView.aspx
- Public subject listings: https://nerdc.org.ng/SubjectListings.aspx
- Federal Ministry of Education / NERDC approved subject-list notice: https://education.gov.ng/wp-content/uploads/2026/11/FME-APPROVED-GUIDELINES.pdf
- Access status: Publicly viewable curriculum listings and selected topic outlines are available without the NECO syllabus purchase.
- Critical distinction: NERDC curriculum is a national school curriculum reference, not a NECO-issued examination syllabus. Do not label it “NECO official syllabus” or assume every listed subject/topic is examinable in the current NECO session.
- Rights/access note: NERDC's e-Curriculum portal states that posted syllabi, lecture recordings, slides, and learning materials are for personal study. Public visibility is not permission to bulk-copy or commercially republish them. Obtain written permission or a suitable licence before importing full text into PRIME-CBT or redistributing it.
- Safe use in PRIME-CBT: Store source metadata and subject taxonomy references; use the curriculum as a provisional cross-reference for research and educator review. Do not publish copied curriculum text or map it as NECO coverage until the examination-body alignment and reuse rights are verified.
- Example topic view: the public General Mathematics curriculum browser exposes SSS-level themes including Number and Numeration, Algebraic Process, Geometry, and Statistics. This is a curriculum-browser example, not a verified NECO topic list.

## NECO free-source research outcome (reviewed 2026-11-27)

- NECO's 2027 SSCE Internal page explicitly lists the syllabus at ₦2,000 per copy: https://neco.gov.ng/exams/ssce-internal
- The 2027 SSCE Internal registration guidelines repeat the ₦2,000 price: https://neco.gov.ng/2027%20SSCE%20INTERNAL%20REGISTRATION%20GUIDELINES.pdf
- The public 2027 guidelines and examination timetable are free administrative documents; neither is the full subject syllabus.
- No complete free official NECO SSCE syllabus download was verified during this research. Do not use a third-party PDF merely because it is labelled “NECO syllabus”.
- Free official alternative found: NERDC's public revised SSS curriculum portal, subject listings, and selected curriculum views. Use only as a clearly labelled curriculum reference and respect the personal-study restriction above.

## Question provenance requirements

Every imported question must carry:
- Examination body and exam code.
- Subject and syllabus topic.
- Examination year/session/paper where known.
- Source type: official past question, licensed past question, or original practice.
- Source URL or document reference.
- Retrieval/import date and document checksum.
- Rights/permission status.
- Review status and reviewer.
- Explanation/solution provenance.

Never label an AI-generated or independently authored question as an official past question. Generated practice questions must be marked as original practice and reviewed against the applicable syllabus before publication.

## Import and publication workflow

1. Register the source and confirm its access/rights status.
2. Acquire the source through its official public interface, authorised download, purchase, or written permission.
3. Preserve the original document and calculate a checksum.
4. Extract text, tables, equations, and diagrams into a draft batch.
5. Match each question to a subject and syllabus topic.
6. Detect duplicates using normalized text and a content hash.
7. Validate answer options and explanations; never infer an answer key silently.
8. Require an authorised reviewer to approve the item.
9. Publish only approved items; retain provenance and revision history.

## Known limitations

- JAMB IBASS is an interactive system; a bulk public API has not been verified.
- WAEC's e-Learning pages expose subject resources, but they do not establish unrestricted bulk redistribution rights.
- NECO's syllabus is listed as a paid item; no free complete syllabus download has been verified.
- This register is a source map, not evidence that question banks have been populated.


## PRIME-CBT in-site study library — starter release (reviewed 2026-11-27)

- PRIME-CBT now stores original foundational lesson notes in its own External Exams resource table and renders them inside the Study page. Students do not need to leave the Study page to read these lessons.
- Starter coverage: English, Mathematics, Biology, Chemistry and Physics across the currently matching JAMB, WAEC and NECO catalogue entries; 24 topic entries and 24 original lesson resources.
- Lesson text is independently authored for PRIME-CBT. It is not copied from JAMB IBASS, WAEC e-Learning, NECO paid syllabus documents, or NERDC restricted study materials.
- Status: `editorial_reviewed` means content/editorial review for this starter release. It does not claim independent teacher approval or certify that these ten foundation topics constitute a complete examination syllabus.
- The starter lessons are free and are not marked PRIME PRO. The full syllabus coverage, additional subjects, downloadable packs and teacher-reviewed question resources remain to be built and reviewed.
- NECO official homepage currently lists the 2027 SSCE Internal exam window (1 April–11 May 2027) and 2027 BECE window (19–31 May 2027). These dates are recorded as sourced events; subject-level timetables remain authoritative when published.
- No 2027 JAMB UTME or WAEC WASSCE exam window is published as confirmed in this starter release. Proposed or media-reported dates must not be shown as official dates until the examination body confirms them.
