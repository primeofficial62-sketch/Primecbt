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
