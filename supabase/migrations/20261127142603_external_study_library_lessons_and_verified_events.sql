-- PRIME-CBT External Exams: in-site study library, editorial review metadata and verified NECO dates.
-- This migration is limited to External Exams tables. It does not alter University data or workflows.
begin;

alter table public.external_exam_topics
  add column if not exists learning_objectives text[] not null default '{}',
  add column if not exists review_status text not null default 'draft',
  add column if not exists reviewed_at timestamptz,
  add column if not exists content_version integer not null default 1;

alter table public.external_exam_resources
  add column if not exists content_markdown text,
  add column if not exists key_points text[] not null default '{}',
  add column if not exists learning_objectives text[] not null default '{}',
  add column if not exists estimated_minutes integer,
  add column if not exists review_status text not null default 'draft',
  add column if not exists reviewed_at timestamptz,
  add column if not exists rights_status text not null default 'unknown',
  add column if not exists content_version integer not null default 1;

alter table public.external_exam_topics drop constraint if exists external_exam_topics_review_status_check;
alter table public.external_exam_topics add constraint external_exam_topics_review_status_check
  check (review_status in ('draft','editorial_reviewed','teacher_approved'));
alter table public.external_exam_resources drop constraint if exists external_exam_resources_review_status_check;
alter table public.external_exam_resources add constraint external_exam_resources_review_status_check
  check (review_status in ('draft','editorial_reviewed','teacher_approved'));
alter table public.external_exam_resources drop constraint if exists external_exam_resources_rights_status_check;
alter table public.external_exam_resources add constraint external_exam_resources_rights_status_check
  check (rights_status in ('unknown','original','licensed','permission_granted','permission_required','personal_study_only'));

create index if not exists external_exam_resources_library_idx
  on public.external_exam_resources(exam_code,subject_id,resource_type,is_published,created_at desc);
create index if not exists external_exam_topics_subject_published_idx
  on public.external_exam_topics(subject_id,is_published,sort_order);

with subject_map(exam_code,subject_name,family) as (
  values ('JAMB','Use of English','english'),('JAMB','Mathematics','mathematics'),
  ('JAMB','Biology','biology'),('JAMB','Chemistry','chemistry'),('JAMB','Physics','physics'),
  ('WAEC','English Language','english'),('WAEC','General Mathematics','mathematics'),
  ('NECO','English Language','english'),('NECO','General Mathematics','mathematics'),
  ('NECO','Biology','biology'),('NECO','Chemistry','chemistry'),('NECO','Physics','physics')
),
topic_seed(family,title,description,objectives,sort_order) as (
  values
  ('english','Reading comprehension and inference','Identify a passage main idea, supporting details, tone and conclusions supported by the text.',array['Identify main ideas and supporting details','Distinguish facts from evidence-based inferences','Use context to interpret unfamiliar words'],10),
  ('english','Grammar: parts of speech and sentence structure','Recognise word classes and how they function in grammatical sentences.',array['Identify common word classes','Recognise subjects, predicates and objects','Check subject–verb agreement'],20),
  ('mathematics','Number operations, fractions and percentages','Use place value, fractions, ratios and percentages in calculations.',array['Perform operations with fractions','Convert fractions, decimals and percentages','Solve ratio and percentage problems'],10),
  ('mathematics','Algebraic expressions and linear equations','Simplify expressions, expand brackets and solve one-variable linear equations.',array['Collect like terms','Apply the distributive law','Solve and verify linear equations'],20),
  ('biology','Cell structure and organisation','Describe cell organisation and relate organelles to their functions.',array['Distinguish prokaryotic and eukaryotic cells','Identify major cell structures','Relate organelles to functions'],10),
  ('biology','Nutrition and energy in living organisms','Explain photosynthesis and how organisms obtain and use nutrients.',array['State photosynthesis requirements and products','Explain the role of chlorophyll and light','Distinguish autotrophic and heterotrophic nutrition'],20),
  ('chemistry','Atomic structure and the periodic table','Describe atomic particles and explain atomic and mass numbers.',array['Identify protons, neutrons and electrons','Calculate subatomic particles','Explain periods and groups'],10),
  ('chemistry','Chemical bonding and simple compounds','Compare ionic and covalent bonding and relate structure to properties.',array['Explain electron transfer','Explain electron sharing','Relate bonding to physical properties'],20),
  ('physics','Motion, speed and acceleration','Use distance, displacement, speed, velocity and acceleration in problems.',array['Distinguish distance and displacement','Calculate speed and velocity','Calculate acceleration'],10),
  ('physics','Electric current, voltage and resistance','Explain current, potential difference and resistance and apply Ohm’s law.',array['Define current and potential difference','Apply Ohm’s law','Compare series and parallel circuits'],20)
),
subject_rows as (
  select s.id subject_id,sm.exam_code,sm.family
  from subject_map sm join public.external_exam_subjects s
    on s.exam_code=sm.exam_code and s.name=sm.subject_name and s.is_active
)
insert into public.external_exam_topics(subject_id,title,description,learning_objectives,sort_order,is_published,review_status,reviewed_at)
select sr.subject_id,ts.title,ts.description,ts.objectives,ts.sort_order,true,'editorial_reviewed',now()
from subject_rows sr join topic_seed ts on ts.family=sr.family
where not exists(select 1 from public.external_exam_topics t where t.subject_id=sr.subject_id and lower(t.title)=lower(ts.title));

insert into public.external_exam_resources
(subject_id,topic_id,exam_code,resource_type,title,description,source_year,source_label,is_published,is_premium,
 content_markdown,key_points,learning_objectives,estimated_minutes,review_status,reviewed_at,rights_status)
select s.id,t.id,s.exam_code,'lesson',t.title,t.description,2026,
'PRIME-CBT original foundational lesson · editorially reviewed · not an official past question',
true,false,
case t.title
when 'Reading comprehension and inference' then E'# Reading comprehension and inference\n\nReading comprehension means understanding a passage and answering with evidence from the text. Read once for the main message, then return to the relevant lines for each question.\n\n## Main idea and details\nThe main idea is the central point. Supporting details explain or provide evidence for it. Do not choose an option that adds information the writer did not provide.\n\n## Inference and tone\nAn inference is a conclusion drawn from clues in the passage. Tone describes the writer’s attitude, such as critical, optimistic or concerned. Use the writer’s words and treatment of the subject as evidence.\n\n## Exam tip\nWhen two options seem plausible, choose the one most directly supported by the passage.'
when 'Grammar: parts of speech and sentence structure' then E'# Grammar: parts of speech and sentence structure\n\nGrammar describes how words combine to communicate meaning. A noun names, a pronoun replaces a noun, a verb expresses an action or state, an adjective describes a noun, and an adverb modifies a verb, adjective or another adverb. Prepositions show relationships; conjunctions join words or clauses.\n\n## Sentence parts\nThe subject tells who or what the sentence is about. The predicate says something about the subject and contains the verb. An object receives the action of a transitive verb.\n\n## Subject–verb agreement\nA singular subject takes a singular verb in the simple present (“The candidate writes”). A plural subject takes a plural verb (“The candidates write”). Identify the true subject before choosing the verb.\n\n## Exam tip\nCheck tense, agreement, pronoun reference and whether the sentence expresses a complete thought.'
when 'Number operations, fractions and percentages' then E'# Number operations, fractions and percentages\n\nEvaluate brackets first, then powers or roots, multiplication and division from left to right, and finally addition and subtraction from left to right.\n\n## Fractions\nUse a common denominator to add or subtract fractions. For multiplication, multiply numerators and denominators. For division, multiply by the reciprocal of the second fraction.\n\nExample: 1/3 + 1/6 = 2/6 + 1/6 = 1/2.\n\n## Percentages and ratios\nA percentage is a fraction with denominator 100. To find 15% of 240, calculate 0.15 × 240 = 36. A ratio compares quantities in the same order; simplify by dividing each term by their highest common factor.\n\n## Exam tip\nEstimate the answer before calculating to catch misplaced decimal points or incorrect operations.'
when 'Algebraic expressions and linear equations' then E'# Algebraic expressions and linear equations\n\nA variable is a letter used to represent a number. Like terms have the same variable raised to the same power, so 3x + 5x = 8x but 3x + 5y cannot be combined.\n\n## The distributive law\na(b + c) = ab + ac. Apply the multiplier to every term inside the brackets.\n\n## Solving a linear equation\nExample: 3x + 5 = 20. Subtract 5 from both sides to get 3x = 15, then divide by 3: x = 5. Substitute the value into the original equation to verify it.\n\n## Exam tip\nKeep both sides balanced by performing the same operation on each side.'
when 'Cell structure and organisation' then E'# Cell structure and organisation\n\nThe cell is the basic structural and functional unit of living organisms. The cell membrane controls movement of substances; cytoplasm is where many reactions occur; the nucleus contains genetic material; mitochondria produce much of the ATP in aerobic respiration; ribosomes make proteins.\n\n## Plant and animal cells\nPlant cells usually have a cellulose cell wall, a large permanent vacuole and chloroplasts in photosynthetic tissues. Animal cells do not have a cellulose cell wall or chloroplasts.\n\n## Prokaryotic and eukaryotic cells\nProkaryotic cells such as bacteria lack a membrane-bound nucleus. Eukaryotic cells have a nucleus and other membrane-bound organelles.\n\n## Exam tip\nThe cell wall provides support; the cell membrane regulates exchange with the environment.'
when 'Nutrition and energy in living organisms' then E'# Nutrition and energy in living organisms\n\nNutrition is how organisms obtain and use materials for energy, growth and repair. Green plants are mainly autotrophic; animals are heterotrophic.\n\n## Photosynthesis\nChlorophyll absorbs light energy used to make glucose from carbon dioxide and water, releasing oxygen. A simplified equation is **6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂** in the presence of light and chlorophyll.\n\nLight intensity, carbon dioxide concentration, temperature and water availability affect the rate. Plants may use glucose in respiration, convert it to cellulose or store it as starch.\n\n## Exam tip\nPhotosynthesis stores energy in organic molecules; respiration releases usable energy from food.'
when 'Atomic structure and the periodic table' then E'# Atomic structure and the periodic table\n\nAn atom has a dense nucleus containing positively charged protons and uncharged neutrons, with negatively charged electrons around it.\n\n## Atomic and mass numbers\nAtomic number = number of protons. Mass number = protons + neutrons. Therefore, neutrons = mass number − atomic number. A neutral atom has equal numbers of protons and electrons.\n\nIsotopes are atoms of the same element with the same proton number but different neutron numbers. Elements are arranged by increasing atomic number. Periods are horizontal rows; groups are vertical columns.\n\n## Exam tip\nIdentify the atomic number and mass number before calculating neutrons.'
when 'Chemical bonding and simple compounds' then E'# Chemical bonding and simple compounds\n\nAtoms form bonds to achieve more stable electron arrangements.\n\n## Ionic bonding\nElectrons are transferred, commonly from a metal to a non-metal. The resulting oppositely charged ions attract. Many ionic compounds conduct electricity when molten or dissolved because their ions can move.\n\n## Covalent bonding\nNon-metal atoms share pairs of electrons. Simple molecular substances often have relatively low melting and boiling points because forces between molecules are weaker than the covalent bonds within each molecule.\n\n## Structure and properties\nGiant covalent structures such as diamond have very high melting points. Graphite has layers and can conduct electricity. Explain properties by referring to structure and bonding.\n\n## Exam tip\nIdentify whether the particles are ions, molecules or atoms in a giant network.'
when 'Motion, speed and acceleration' then E'# Motion, speed and acceleration\n\nDistance is the total path travelled. Displacement is the straight-line change in position in a specified direction.\n\n## Speed and velocity\nAverage speed = total distance ÷ total time. Average velocity = displacement ÷ time. Speed is scalar; velocity includes direction. A cyclist travelling 120 m in 20 s has an average speed of 6 m/s.\n\n## Acceleration\nAcceleration is change in velocity divided by time: **a = (v − u) / t**, where u is initial velocity and v is final velocity. Its SI unit is m/s².\n\n## Graphs\nThe gradient of a displacement–time graph is velocity. The gradient of a velocity–time graph is acceleration; the area under it is displacement.\n\n## Exam tip\nShow the formula, substitution and units.'
when 'Electric current, voltage and resistance' then E'# Electric current, voltage and resistance\n\nCurrent is the rate of flow of electric charge, measured in amperes (A). Potential difference is energy transferred per unit charge, measured in volts (V). Resistance is opposition to current, measured in ohms (Ω).\n\n## Ohm’s law\nFor an ohmic conductor under constant physical conditions, **V = IR**. If a 4 Ω resistor carries 2 A, its potential difference is 8 V.\n\n## Series and parallel circuits\nIn series, the same current passes through each component and supply voltage is shared. In parallel, each branch has the same potential difference as the supply, while current divides between branches.\n\n## Exam tip\nRearrange V = IR carefully and include the correct unit.'
else E'An original PRIME-CBT lesson is being prepared for this topic.'
end,
case t.title
when 'Reading comprehension and inference' then array['Identify the main idea and supporting details','Base inferences on passage evidence','Use context and tone to interpret meaning']
when 'Grammar: parts of speech and sentence structure' then array['Identify word classes by function','Find the subject and verb','Check subject–verb agreement']
when 'Number operations, fractions and percentages' then array['Follow order of operations','Use common denominators','Convert percentages to decimals']
when 'Algebraic expressions and linear equations' then array['Combine like terms','Apply the distributive law','Verify a solution by substitution']
when 'Cell structure and organisation' then array['The cell is the basic unit of life','The membrane controls exchange','Plant cells have a cellulose wall']
when 'Nutrition and energy in living organisms' then array['Photosynthesis uses light energy','Carbon dioxide and water are raw materials','Respiration releases usable energy']
when 'Atomic structure and the periodic table' then array['Atomic number equals proton number','Mass number equals protons plus neutrons','Periods are rows and groups are columns']
when 'Chemical bonding and simple compounds' then array['Ionic bonds attract oppositely charged ions','Covalent bonds share electron pairs','Structure helps explain material properties']
when 'Motion, speed and acceleration' then array['Speed = distance ÷ time','Velocity includes direction','Acceleration = change in velocity ÷ time']
when 'Electric current, voltage and resistance' then array['Current is charge flow per second','Potential difference is energy per charge','Ohm’s law is V = IR under stated conditions']
else array[]::text[] end,
t.learning_objectives,
case when t.title like 'Reading%' or t.title like 'Number%' or t.title like 'Cell%' or t.title like 'Atomic%' or t.title like 'Motion%' then 12 else 14 end,
'editorial_reviewed',now(),'original'
from public.external_exam_subjects s
join public.external_exam_topics t on t.subject_id=s.id
where s.is_active and s.exam_code in ('JAMB','WAEC','NECO')
  and t.is_published and t.review_status='editorial_reviewed'
  and not exists(select 1 from public.external_exam_resources r where r.topic_id=t.id and r.resource_type='lesson');

insert into public.external_exam_updates
(update_type,title,summary,target_url,starts_at,published_at,is_published,source_name,source_url,source_item_id)
values
('event','NECO 2027 SSCE Internal examination window','NECO lists the 2027 SSCE Internal examination window as 1 April to 11 May 2027. The detailed official timetable remains the authority for each subject paper.','https://neco.gov.ng/','2027-04-01T09:00:00Z',now(),true,'National Examinations Council','https://neco.gov.ng/','NECO_2027_SSCE_INTERNAL_WINDOW'),
('event','NECO 2027 BECE examination window','NECO lists the 2027 Basic Education Certificate Examination window as 19 May to 31 May 2027. Candidates should use the official timetable for subject-level dates.','https://neco.gov.ng/','2027-05-19T09:00:00Z',now(),true,'National Examinations Council','https://neco.gov.ng/','NECO_2027_BECE_WINDOW')
on conflict (source_item_id) do update set
 title=excluded.title,summary=excluded.summary,target_url=excluded.target_url,
 starts_at=excluded.starts_at,published_at=excluded.published_at,is_published=true,
 source_name=excluded.source_name,source_url=excluded.source_url;

commit;