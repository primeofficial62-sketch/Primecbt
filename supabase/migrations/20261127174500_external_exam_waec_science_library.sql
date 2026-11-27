-- Complete the core WAEC science subject catalogue and restore the expanded English reading module.
begin;

insert into public.external_exam_subjects(exam_code,name,slug,syllabus_version,is_active,sort_order)
values
 ('WAEC','Biology','biology','WAEC e-Learning cross-reference; exam syllabus verification pending',true,3),
 ('WAEC','Chemistry','chemistry','WAEC e-Learning cross-reference; exam syllabus verification pending',true,4),
 ('WAEC','Physics','physics','WAEC e-Learning cross-reference; exam syllabus verification pending',true,5)
on conflict (exam_code,slug) do update set is_active=true;

-- The reading-comprehension topic existed in the first release and was archived
-- during replacement. Restore it with a fuller original lesson.
update public.external_exam_topics t
set is_published=true,review_status='editorial_reviewed',reviewed_at=now(),
    source_id=(select id from public.external_exam_sources where source_url='https://nerdc.gov.ng/content_manager/new_senior_curriculum_home.html' limit 1),
    source_locator='Cross-exam foundational topic; confirm against the current exam-body syllabus'
from public.external_exam_subjects s
where t.subject_id=s.id and s.is_active
  and ((s.exam_code='JAMB' and s.name='Use of English') or
       (s.exam_code in ('WAEC','NECO') and s.name='English Language'))
  and t.title='Reading comprehension and inference';

update public.external_exam_resources r
set is_published=true,review_status='editorial_reviewed',reviewed_at=now(),
    content_version=2,
    content_origin='original_prime_cbt',
    source_url='https://nerdc.gov.ng/content_manager/new_senior_curriculum_home.html',
    source_label='Original PRIME-CBT reading guide. Cross-curriculum reference only; not an examination-body syllabus or past-paper extract.',
    content_markdown=E'# Reading comprehension and inference\n\n## Read for meaning\nRead the passage once to understand its subject and overall message. Read again to locate the evidence needed for each question. A strong answer is supported by the passage, not simply by what seems likely in everyday life.\n\n## Main idea and supporting details\nThe main idea is the central point developed by the writer. Supporting details may include facts, examples, reasons, comparisons or explanations. A good title captures the whole passage rather than one minor detail.\n\n## Inference\nAn inference is a conclusion drawn from clues in the text. It must be reasonable and supported. If a passage says a road was flooded after heavy rain, you may infer that travel became difficult; you cannot conclude that the road was closed for a month unless the passage says so.\n\n## Tone, purpose and audience\nTone describes the writer’s attitude, such as critical, sympathetic, humorous, cautious or optimistic. Purpose may be to inform, persuade, explain, entertain or warn. Audience means the readers the writer has in mind. Use word choice and the writer’s treatment of the subject as evidence.\n\n## Vocabulary in context\nReplace the target word with each option and reread the sentence. The correct choice must fit the meaning and grammar of that context. A dictionary meaning may not be the intended meaning in a particular passage.\n\n## A reliable answering routine\n1. Read the question before searching the passage.\n2. Locate the sentence or paragraph that contains the clue.\n3. Eliminate options that introduce unsupported information.\n4. Check that the chosen answer matches the question wording.\n5. Return to the passage if two options appear similar.',
    key_points=array['The passage is the authority for comprehension answers','Inference must be supported by textual clues','Tone and purpose are different concepts','Vocabulary must fit the sentence context'],
    estimated_minutes=15
where r.topic_id in (
 select t.id from public.external_exam_topics t join public.external_exam_subjects s on s.id=t.subject_id
 where t.title='Reading comprehension and inference'
 and ((s.exam_code='JAMB' and s.name='Use of English') or (s.exam_code in ('WAEC','NECO') and s.name='English Language'))
);

-- Copy PRIME-CBT-authored lesson modules from the existing NECO foundational
-- science library to WAEC. These are original lessons, not NECO question papers.
with source_subjects as (
 select n.id as source_subject_id,w.id as target_subject_id,n.name
 from public.external_exam_subjects n
 join public.external_exam_subjects w on w.exam_code='WAEC' and w.name=n.name and w.is_active
 where n.exam_code='NECO' and n.name in ('Biology','Chemistry','Physics')
),
new_topics as (
 insert into public.external_exam_topics
 (subject_id,title,description,learning_objectives,sort_order,is_published,review_status,reviewed_at,source_id,source_locator)
 select ss.target_subject_id,t.title,t.description,t.learning_objectives,t.sort_order,true,'editorial_reviewed',now(),
        t.source_id,t.source_locator
 from source_subjects ss
 join public.external_exam_topics t on t.subject_id=ss.source_subject_id and t.is_published
 where not exists(select 1 from public.external_exam_topics x where x.subject_id=ss.target_subject_id and x.title=t.title)
 returning id,subject_id,title
)
insert into public.external_exam_resources
(subject_id,topic_id,exam_code,resource_type,title,description,source_year,source_label,source_url,is_published,is_premium,
 content_markdown,key_points,learning_objectives,estimated_minutes,review_status,reviewed_at,rights_status,content_origin,content_version)
select ss.target_subject_id,nt.id,'WAEC','lesson',r.title,r.description,null,
       'Original PRIME-CBT foundational study guide. Curriculum cross-reference only; confirm the current WAEC syllabus before treating a topic as examinable.',
       r.source_url,true,false,r.content_markdown,r.key_points,r.learning_objectives,r.estimated_minutes,
       'editorial_reviewed',now(),'original','original_prime_cbt',2
from new_topics nt
join source_subjects ss on ss.target_subject_id=nt.subject_id
join public.external_exam_topics source_topic on source_topic.subject_id=ss.source_subject_id and source_topic.title=nt.title
join public.external_exam_resources r on r.topic_id=source_topic.id and r.is_published
where not exists(select 1 from public.external_exam_resources x where x.topic_id=nt.id and x.is_published);

-- Link the WAEC science study topics to the curriculum-reference record while
-- explicitly keeping the exam-specific alignment state unconfirmed.
insert into public.external_exam_syllabus_entries
(source_id,exam_code,subject_id,linked_topic_id,entry_kind,title,source_locator,edition_label,alignment_status,review_notes,is_published,sort_order)
select
 (select id from public.external_exam_sources where source_url='https://nerdc.gov.ng/content_manager/new_senior_curriculum_home.html' limit 1),
 'WAEC',s.id,t.id,'topic',t.title,
 'https://nerdc.gov.ng/content_manager/new_senior_curriculum_home.html',
 'NERDC revised SSS curriculum reference; cross-exam mapping only',
 'needs_clarification',
 'Original study content. This is not a verified WAEC syllabus statement; compare against the current WAEC subject syllabus before declaring exact coverage.',
 true,t.sort_order
from public.external_exam_subjects s
join public.external_exam_topics t on t.subject_id=s.id and t.is_published
where s.exam_code='WAEC' and s.name in ('Biology','Chemistry','Physics')
and not exists (
 select 1 from public.external_exam_syllabus_entries e
 where e.source_id=(select id from public.external_exam_sources where source_url='https://nerdc.gov.ng/content_manager/new_senior_curriculum_home.html' limit 1)
 and e.exam_code='WAEC' and e.subject_id=s.id and e.linked_topic_id=t.id and e.entry_kind='topic' and e.title=t.title
);

commit;