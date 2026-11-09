import type { SectionId } from "../design/tokens";

/**
 * Content lives only here and in data/meta.ts.
 * Use **double asterisks** around the key words you want to glow when a build appears.
 * `builds: 0` means the slide is shown fully built, with no progressive reveals.
 *
 * The source material is studentsdara/students.md. Slides condense each source
 * block for readability while keeping every heading, example, and key fact.
 */
export type Variant =
  | "bullets"
  | "cards"
  | "buildList"
  | "table"
  | "visualText"
  | "focus"
  | "closing"
  | "references"
  | "diagram"
  | "activity"
  | "quiz";

export type DiagramVisual =
  | "persona"
  | "purpose"
  | "classification"
  | "projective"
  | "objective"
  | "formalInformal"
  | "rorschach";

export type SlideVisual =
  | "maskDissolve"
  | "inkblot"
  | "checklist"
  | "none"
  | DiagramVisual;

export interface CardItem {
  title: string;
  text: string;
  icon?: string;
}

export interface SlideTable {
  columns: string[];
  rows: string[][];
}

export interface QuizQuestion {
  q: string;
  options: string[];
  /** Zero-based index of the correct option. */
  answer: number;
}

export interface Slide {
  id: string;
  variant: Variant;
  heading: string;
  subheading?: string;
  items?: string[] | CardItem[];
  table?: SlideTable;
  quiz?: QuizQuestion[];
  /** Number of reveals. Defaults to the number of items, table rows, or quiz questions. 0 = all at once. */
  builds?: number;
  visual?: SlideVisual;
  notes?: string;
  status?: "final" | "draft";
}

export interface Section {
  id: SectionId;
  title: string;
  shortTitle: string;
  /** A lucide-react icon name. */
  icon: string;
  slides: Slide[];
}

export interface SectionPlanEntry {
  id: SectionId;
  title: string;
  shortTitle: string;
  icon: string;
}

/**
 * The five presenter-led parts of the group presentation.
 */
export const SECTION_PLAN: readonly SectionPlanEntry[] = [
  { id: 1, title: "Introduction", shortTitle: "Introduction", icon: "Drama" },
  {
    id: 2,
    title: "Formal & Informal Assessment",
    shortTitle: "Formal & Informal",
    icon: "Target",
  },
  { id: 3, title: "Objective Assessment", shortTitle: "Objective", icon: "ClipboardCheck" },
  { id: 4, title: "Projective Assessment", shortTitle: "Projective", icon: "Eye" },
  {
    id: 5,
    title: "Rorschach, HTP & Comparison",
    shortTitle: "Rorschach & HTP",
    icon: "Layers",
  },
];

export const SECTIONS: readonly Section[] = [{
    id: 1,
    title: "Introduction",
    shortTitle: "Introduction",
    icon: "Drama",
    slides: [
      {
        id: "1-cover",
        variant: "diagram",
        heading: "The Persona Behind the Pattern",
        subheading: "Personality and the science of understanding people",
        items: [
          "Personality is the relatively stable pattern of **thinking, feeling, and behaving**.",
          "Assessment measures that pattern — it **never reduces a person to a label**.",
        ],
        builds: 0,
        visual: "persona",
        status: "final",
        notes:
          "Open the presentation with the persona figure. The nested shells are the threads of personality; the solid core is the relatively stable self. Promise the audience a practical tour: what personality is, how it is assessed, and why method matters.",
      },
      {
        id: "1-opening",
        variant: "bullets",
        heading: "Why Do We Need Personality?",
        subheading: "Same situation, different reactions",
        items: [
          "Two people face the same exam: one stays calm, the other becomes anxious.",
          "One seeks a crowded room; another prefers to be alone.",
          "These differences are not random — they form **recognisable patterns**.",
          "Personality is the study of those patterns across situations and time.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Start with the exam and the party examples. Ask the audience to notice that both reactions are normal; the interesting question is the pattern. Make the transition: if patterns are real, we need a disciplined way to study them.",
      },
      {
        id: "1-origin",
        variant: "bullets",
        heading: "Origin: The Persona",
        subheading: "The word behind the idea",
        items: [
          "From Latin **persona** — the mask worn by actors in ancient Roman theatre.",
          "The mask represented a character; personality represents the stable characteristics that make a person unique.",
          "Old French and Medieval Latin **personalité / personalitas** — the quality of being a person.",
          "Psychology adopted the term for typical patterns of thinking, feeling, and behaving.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Hold up the theatrical image: the mask is what the world sees, but the person is behind it. Trace persona through Old French and Medieval Latin, then land on the psychological meaning. Avoid overclaiming a single etymology; the historical path is layered.",
      },
      {
        id: "1-definition",
        variant: "bullets",
        heading: "Defining Personality",
        subheading: "Enduring patterns, not a single moment",
        items: [
          "APA: an enduring configuration of characteristics and behaviour that shapes a person's unique adjustment to life.",
          "It includes **traits, interests, drives, values, self-concept, abilities, and emotional patterns**.",
          "In simple terms: the unique and relatively stable way a person thinks, feels, and behaves.",
          "It explains both differences between people and consistency within one person.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Read the APA definition slowly, then paraphrase it in plain language. Emphasise relatively stable: personality is consistent enough to recognise, but not frozen. The final line sets up assessment: we can only measure a pattern if it repeats.",
      },
      {
        id: "1-assessment",
        variant: "bullets",
        heading: "What Is Personality Assessment?",
        subheading: "Measuring thoughts, feelings, and behaviour",
        items: [
          "The process of measuring and understanding characteristic patterns of thinking, feeling, and behaving.",
          "Methods include **interviews, observation, self-report questionnaires, ratings, and projective techniques**.",
          "The goal is to understand **strengths, weaknesses, emotional patterns, and interpersonal behaviour**.",
          "Assessment describes a person; it does not judge a person's worth.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Define assessment as measurement, not judgement. Name the methods briefly; the rest of the presentation will unpack them. Stress the ethical boundary in the final line — this is the thread that returns in every later section.",
      },
      {
        id: "1-purpose",
        variant: "buildList",
        heading: "Purpose and Importance",
        subheading: "Five settings, one ethical standard",
        items: [
          "**Clinical** — understand emotional and behavioural problems; support diagnosis and treatment planning.",
          "**Education** — understand learning styles, motivation, confidence, and social behaviour.",
          "**Organisations** — recruitment, leadership development, and team building.",
          "**Research** — study individual differences and test theories of personality.",
          "**Counseling** — build self-awareness and support personal and career decisions.",
          "**Ethics** — one test should never judge a person; interpret results with trained professionals and multiple sources.",
        ],
        builds: 6,
        status: "final",
        notes:
          "Walk through the five applied settings, then pause on the sixth line. The ethics point is not an afterthought: it constrains how every tool in this presentation may be used. Ask the audience which setting they expect to encounter most often.",
      },
      {
        id: "1-classification",
        variant: "bullets",
        heading: "A First Map of the Methods",
        subheading: "From interviews to inkblots",
        items: [
          "Assessment methods include interviews, behavioural observation, self-report inventories, ratings, and psychological tests.",
          "**Projective** methods use ambiguous stimuli — inkblots, pictures, incomplete sentences (Rorschach, TAT).",
          "**Objective** methods use structured items with fixed response options and standard scoring.",
        ],
        builds: 3,
        status: "final",
        notes:
          "Give the audience a map before the detail. The key distinction is not 'good versus bad'; it is how much structure the stimulus provides and how much interpretation the scoring requires. This previews the next four sections.",
      },
      {
        id: "1-activity",
        variant: "activity",
        heading: "Same Situation, Different Response",
        subheading: "A 60-second pair activity. The pattern, not the moment, is personality.",
        items: [
          "Think of a recent situation that made you nervous.",
          "Turn to a neighbour: what did each of you notice, feel, and do?",
          "Look for a pattern — not a single reaction.",
        ],
        builds: 0,
        status: "final",
        notes:
          "Give the room one minute. Ask two pairs to share one difference. Point out that both accounts can be accurate; the value of assessment is turning those accounts into evidence without flattening the person.",
      },
    ],
  },
  {
    id: 2,
    title: "Formal & Informal Assessment",
    shortTitle: "Formal & Informal",
    icon: "Target",
    slides: [
      {
        id: "2-cover",
        variant: "diagram",
        heading: "Two Ways of Seeing a Person",
        subheading: "Formal structure and informal observation",
        items: [
          "**Formal** assessment standardises the same questions and scoring for everyone.",
          "**Informal** assessment stays flexible and natural — and each reveals a different kind of truth.",
        ],
        builds: 0,
        visual: "formalInformal",
        status: "final",
        notes:
          "Introduce the section with the split figure: a rigid grid on one side, a flowing form on the other. Neither side is the 'real' assessment; the contrast is between control and context. Fatima's section explains when each is appropriate.",
      },
      {
        id: "2-formal",
        variant: "bullets",
        heading: "Formal Assessment",
        subheading: "Standardised, comparable, and norm-referenced",
        items: [
          "Standardised and structured: the same instructions and scoring for everyone.",
          "Built on **norms, reliability, and validity**.",
          "Examples: IQ tests, MMPI-2, Rorschach, and the Mental Status Examination (MSE).",
          "Strength: precision and fair comparison across people.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Define formal assessment through control: same instructions, same scoring, established norms. Clarify that 'formal' does not automatically mean 'objective' — the Rorschach is formal in administration but projective in interpretation. That distinction matters later.",
      },
      {
        id: "2-informal",
        variant: "bullets",
        heading: "Informal Assessment",
        subheading: "Flexible, contextual, and close to everyday life",
        items: [
          "Flexible, non-standardised, everyday methods.",
          "No norms or fixed scoring; meaning emerges from context.",
          "Methods: **observation, interviews, and conversation**.",
          "Methods: **checklists, rating scales, work samples, self-reports, and journals**.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Explain that informal does not mean careless. It means the method adapts to the person and setting. Give an example: a teacher noticing a student withdraw after group work is collecting informal evidence, but it still needs to be recorded and checked.",
      },
      {
        id: "2-activity",
        variant: "activity",
        heading: "Observe Us",
        subheading: "Activity 1 · observation versus interpretation",
        items: [
          "You have been observing us for the last few minutes.",
          "What did you notice — in the group as a whole and in each member?",
          "Report only what you saw or heard. 'Spoke softly' is an observation; 'is nervous' is an interpretation.",
        ],
        builds: 0,
        status: "final",
        notes:
          "Run the activity exactly as written. Collect two observations and one interpretation, then ask the room to separate them. The rule is the lesson: good assessment starts with observable behaviour, not with a story about it.",
      },
      {
        id: "2-interviews",
        variant: "cards",
        heading: "Three Interview Formats",
        subheading: "One method, three levels of structure",
        items: [
          {
            title: "Structured",
            icon: "ClipboardCheck",
            text: "Fixed questions in the same order for everyone. **Leans toward formal assessment** because comparison is built in.",
          },
          {
            title: "Unstructured",
            icon: "HeartHandshake",
            text: "No fixed questions; a free-flowing conversation. **Informal assessment** that follows the person's own associations.",
          },
          {
            title: "Semi-Structured",
            icon: "Layers",
            text: "A prepared guide plus freedom to follow up. Balances **consistency with depth** and is common in clinical practice.",
          },
        ],
        builds: 3,
        status: "final",
        notes:
          "Contrast the three formats on a single axis: how much of the conversation is decided in advance. Point out that semi-structured interviews are often the practical compromise — enough structure to compare, enough freedom to listen.",
      },
      {
        id: "2-table",
        variant: "table",
        heading: "Formal vs Informal Assessment",
        subheading: "A side-by-side comparison",
        table: {
          columns: ["Feature", "Formal", "Informal"],
          rows: [
            ["Structure", "Standardised", "Flexible"],
            ["Scoring", "Fixed, norm-based", "Subjective"],
            ["Reliability", "High", "Lower"],
            ["Context", "Limited", "Rich, natural"],
            [
              "Examples",
              "MMPI-2, IQ tests, MSE, structured interview",
              "Observation, checklists, journals, unstructured interview",
            ],
            ["Best for", "Diagnosis, comparison", "Daily behaviour, progress"],
          ],
        },
        builds: 6,
        status: "final",
        notes:
          "Walk the table row by row. The point is not to crown a winner: formal methods buy comparability at the cost of context; informal methods buy context at the cost of standardisation. The final row makes the trade-off explicit.",
      },
      {
        id: "2-closing",
        variant: "closing",
        heading: "Use Both, Not One",
        subheading:
          "Formal assessment gives precision and fair comparison. Informal assessment gives context, warmth, and natural behaviour. Best practice combines both.",
        builds: 0,
        status: "final",
        notes:
          "Close Fatima's section with the integration message. Ask the audience to name one formal and one informal source they would want in a real assessment. This hands the next section a question: what happens when the stimulus itself is ambiguous?",
      },
    ],
  },
  {
    id: 3,
    title: "Objective Assessment",
    shortTitle: "Objective",
    icon: "ClipboardCheck",
    slides: [
      {
        id: "3-cover",
        variant: "diagram",
        heading: "The Objective Lens",
        subheading: "Structure, scoring, and standard comparison",
        items: [
          "Fixed items and **predetermined keys** remove examiner interpretation from scoring.",
          "Scores become meaningful against **empirical norms**.",
        ],
        builds: 0,
        visual: "objective",
        status: "final",
        notes:
          "Open with the measured grid. Objective does not mean bias-free; it means the scoring rule is fixed. The moving scan is the normative frame placing an individual score in context. this section explains the machinery behind that frame.",
      },
      {
        id: "3-intro",
        variant: "bullets",
        heading: "Introduction and Definition",
        subheading: "A fair, scientific method of measurement",
        items: [
          "A fair, scientific method of measuring personality and behaviour.",
          "Part of psychological measurement; developed from the late nineteenth century.",
          "Key contributors: **Wundt, Galton, Cattell, Binet, Simon, and Woodworth**.",
          "Definition: a standardised method with fixed answers, freedom from personal bias, and fair comparison.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Place objective assessment in the history of psychometrics. The names matter less than the project: making measurement repeatable. Emphasise that standardisation is a social and statistical achievement, not a natural property of a test.",
      },
      {
        id: "3-examples",
        variant: "bullets",
        heading: "Examples and Common Formats",
        subheading: "What objective items look like",
        items: [
          "**MMPI** — Minnesota Multiphasic Personality Inventory.",
          "**EPQ** — Eysenck Personality Questionnaire.",
          "Formats: **MCQs, true/false, matching, forced choice, fill in the blanks, and the Big Five**.",
          "Every format shares fixed response options and standard scoring.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Name the two flagship inventories, then show how ordinary the formats are. The audience has answered these item types all their lives. The difference in a psychological test is the norming, validity evidence, and scoring key behind the items.",
      },
      {
        id: "3-psychometrics",
        variant: "focus",
        heading: "Validity and Reliability",
        subheading: "Two questions every score must answer",
        items: [
          {
            title: "Validity",
            icon: "Target",
            text: "The test measures what it claims to measure. A weighing machine that reports length instead of weight is **not valid**, however precise it looks.",
          },
          {
            title: "Reliability",
            icon: "ClipboardCheck",
            text: "The test gives the same result again and again. A weighing machine is **reliable** if it shows 50 kg every time for the same person.",
          },
        ],
        builds: 2,
        status: "final",
        notes:
          "Use the weighing-machine examples exactly as Iman fatima wrote them. Then connect the two ideas: reliability is necessary but not sufficient for validity. A test can be consistent and still measure the wrong thing.",
      },
      {
        id: "3-characteristics",
        variant: "bullets",
        heading: "Four Characteristics",
        subheading: "Why objective scoring travels well",
        items: [
          "**Fixed response** — every item has a defined answer format.",
          "**Standardised** — the same administration for everyone.",
          "**Objective scoring** — a key, not an opinion, determines the score.",
          "**No examiner bias** — the clinician's expectations cannot change the result.",
        ],
        builds: 4,
        status: "final",
        notes:
          "These are the operational promises of objective assessment. Note the limits: fixing the response format does not eliminate response bias, which is why validity scales exist. The promise is about scoring, not about the person's honesty.",
      },
      {
        id: "3-tradeoffs",
        variant: "bullets",
        heading: "Advantages of Objective Assessment",
        subheading: "What structure buys",
        items: [
          "**Fast scoring** — results are available immediately after administration.",
          "**No personal bias** — a scoring key, not an opinion, determines the result.",
          "**Same rules for everyone** — standardised administration and scoring allow fair comparison.",
          "**Clear results** — scores can be compared across people and settings.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Walk through the four advantages. Objective tests are excellent when comparison and efficiency matter. The limitations of this approach are covered in the next section, where the two traditions are compared side by side.",
      },
      {
        id: "3-quiz",
        variant: "quiz",
        heading: "Small Quiz",
        subheading: "Four questions · answer before the reveal",
        quiz: [
          {
            q: "In objective assessment, how is the answer given?",
            options: ["According to your opinion", "Already fixed"],
            answer: 1,
          },
          {
            q: "The MMPI is a test of what?",
            options: ["Personality", "English"],
            answer: 0,
          },
          {
            q: "Which one is a common format of objective assessment?",
            options: ["Essay", "MCQs"],
            answer: 1,
          },
          {
            q: "What does reliability mean?",
            options: [
              "It gives the same result every time",
              "It gives a different result every time",
            ],
            answer: 0,
          },
        ],
        builds: 4,
        status: "final",
        notes:
          "Run the quiz aloud. Ask for a show of hands on A or B before advancing. The correct option is marked when each question appears, so advance only after the room has committed. Use the last question to return to validity versus reliability.",
      },
      {
        id: "3-closing",
        variant: "closing",
        heading: "A Fair and Structured Method",
        subheading:
          "Objective assessment makes scoring fast, clear, and free from personal bias. Tools such as the MMPI and EPQ show its strength — and its trade-off: less depth and creativity for reliability and fair comparison.",
        builds: 0,
        status: "final",
        notes:
          "Close this section by naming the bargain explicitly. Objective assessment is not a window into the soul; it is a well-engineered measuring instrument. The final section puts that instrument beside the projective tradition.",
      },
    ],
  },
  {
    id: 4,
    title: "Projective Assessment",
    shortTitle: "Projective",
    icon: "Eye",
    slides: [
      {
        id: "4-cover",
        variant: "diagram",
        heading: "The Projective Lens",
        subheading: "When ambiguity becomes a mirror",
        items: [
          "Ambiguous stimuli invite the person to **organise reality** from within.",
          "Responses reveal **implicit motives, conflicts, and perceptual style**.",
        ],
        builds: 0,
        visual: "projective",
        status: "final",
        notes:
          "Let the symmetric inkblot breathe before speaking. The projective hypothesis in one image: ambiguity is not emptiness; the observer supplies structure. Mahnoor's section asks what that structure can and cannot tell us.",
      },
      {
        id: "4-what",
        variant: "bullets",
        heading: "What Is Projective Assessment?",
        subheading: "Ambiguous material, personal meaning",
        items: [
          "A personality test that presents ambiguous pictures or incomplete sentences.",
          "The person reveals hidden thoughts and feelings through the response.",
          "Term coined by **Lawrence K. Frank**; the idea grows from Freud's concept of **projection**.",
          "People throw inner feelings outward and then perceive them in the world.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Define projection before the test. The logic is simple: when the stimulus does not dictate a meaning, the meaning must come from the person. Credit Frank for the term and Freud for the underlying idea without reducing the method to a single theorist.",
      },
      {
        id: "4-psychometrics-examples",
        variant: "bullets",
        heading: "Validity and Reliability in Practice",
        subheading: "Two examples that make the difference concrete",
        items: [
          "**Validity** — a weighing machine that reports **length instead of weight** is not valid, however precise it looks. It measures the wrong thing.",
          "**Reliability** — a weighing machine is **reliable** if it shows **50 kg every time** for the same person. It is consistent.",
          "**The key insight:** reliability is necessary but **not sufficient** for validity. A test can be perfectly consistent and still measure the wrong thing.",
          "**In practice:** a personality test must first be reliable (repeatable), then validated against the construct it claims to measure.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Use the weighing-machine examples to make validity and reliability concrete. First, show that a test can be precise but wrong (validity). Then show that consistency alone is not enough (reliability). Land on the key insight: reliability is necessary but not sufficient. This prepares the audience for the quiz question on reliability.",
      },
      {
        id: "4-characteristics",
        variant: "bullets",
        heading: "Four Defining Characteristics",
        subheading: "Why projective tasks feel different",
        items: [
          "**No right or wrong answer** — every response is correct because it is personal.",
          "**Ambiguous material** with no fixed meaning.",
          "**Hidden purpose** — the person does not know exactly what is being measured.",
          "**Freedom of response** — any answer is permitted.",
        ],
        builds: 4,
        status: "final",
        notes:
          "These four features explain both the power and the problem. Freedom reduces faking but also reduces control. Hidden purpose protects the response from conscious editing, yet raises ethical questions about consent and transparency.",
      },
      {
        id: "4-tools",
        variant: "focus",
        heading: "TAT and RISB",
        subheading: "Two classic projective instruments",
        items: [
          {
            title: "Thematic Apperception Test",
            icon: "BookOpen",
            text: "The person is shown **ambiguous picture cards** and asked to make up a story. The story reveals hidden thoughts, motives, and relational patterns.",
          },
          {
            title: "Rotter Incomplete Sentence Blank",
            icon: "FlaskConical",
            text: "**Forty incomplete sentences** are completed by the person. The style of completion reveals personality, emotion, and attitude toward life.",
          },
        ],
        builds: 2,
        status: "final",
        notes:
          "Contrast the media: TAT uses pictures and narrative; RISB uses language stems and completion. Both rely on the same assumption — the person fills in what the stimulus leaves open. Keep the examples concrete.",
      },
      {
        id: "4-risb-activity",
        variant: "activity",
        heading: "Complete the Sentence",
        subheading: "Activity · RISB in miniature · there are no wrong answers",
        items: [
          "Complete each stem with the first words that come to mind: **I feel happiest when ___.**",
          "**My greatest fear is ___.**",
          "**When I am alone, I ___.**",
          "**People who know me would say I am ___.**",
        ],
        builds: 0,
        status: "final",
        notes:
          "Read the four stems aloud and give the room thirty seconds. Collect two or three completions per stem. Debrief: the same stem produces very different completions, and the style of completion (emotion, length, avoidance) is the data — not the content alone. This is the RISB logic in miniature.",
      },
      {
        id: "4-advantages",
        variant: "bullets",
        heading: "Advantages",
        subheading: "Depth and resistance to faking",
        items: [
          "**Hidden thoughts surface** — the person reports what they hide or do not consciously know.",
          "**Harder to fake** — no right or wrong answer reduces deliberate impression management.",
          "**Depth** — a fuller picture of feelings, conflicts, and inner life, not just a number.",
        ],
        builds: 3,
        status: "final",
        notes:
          "Present the advantages as hypotheses with real clinical value, not as proof. The strongest claim is about depth and access to material that structured self-report may miss. The weakest claim is that any single response is a direct window into the unconscious.",
      },
      {
        id: "4-limitations",
        variant: "bullets",
        heading: "Limitations",
        subheading: "The cost of ambiguity",
        items: [
          "**Scoring differs** — two experts can interpret one response in different ways.",
          "**Low reliability and validity** compared with structured measures.",
          "**Time and training** — lengthy administration and specialised expertise.",
        ],
        builds: 3,
        status: "final",
        notes:
          "Be candid. Inter-rater disagreement is the central psychometric problem. The method can generate rich hypotheses, but hypotheses still need corroboration. This sets up the objective tradition without turning the presentation into a trial of projective tests.",
      },
      {
        id: "4-activity",
        variant: "activity",
        heading: "What Do You See?",
        subheading: "Activity · there is no correct answer",
        items: [
          "Look at the form for five seconds. Do not analyse it.",
          "Say the first three words that come to mind.",
          "Notice how the same stimulus produces different meanings — that is projection.",
        ],
        visual: "inkblot",
        builds: 0,
        status: "final",
        notes:
          "Show the inkblot and take three quick responses from the room. Do not interpret anyone's answer in public. The debrief is the point: one stimulus, many meanings, and the meaning is partly supplied by the observer.",
      },
    ],
  },
  {
    id: 5,
    title: "Rorschach, HTP & Comparison",
    shortTitle: "Rorschach & HTP",
    icon: "Layers",
    slides: [
      {
        id: "5-cover",
        variant: "diagram",
        heading: "Ten Cards, Three Drawings",
        subheading: "Rorschach, HTP, and the final comparison",
        items: [
          "The Rorschach reads **perception**; the HTP reads **drawing and symbolism**.",
          "Together they show where projective methods reveal depth — and where they demand caution.",
        ],
        builds: 0,
        visual: "rorschach",
        status: "final",
        notes:
          "Introduce the final student's section with the fan of inkblot cards. Ten cards, one at a time, is the Rorschach's basic rhythm. The HTP adds a second projective language: drawing. Keep the comparison question alive: what does each method let us see, and at what cost?",
      },
      {
        id: "5-rorschach-overview",
        variant: "bullets",
        heading: "Rorschach: Overview",
        subheading: "A standardised set of ambiguous cards",
        items: [
          "Created in **1921** by Swiss psychiatrist **Hermann Rorschach**.",
          "Ten standardised cards: **five black-and-white, two black-and-red, three multicoloured**.",
          "Purpose: analyse perception, personality traits, and emotional functioning.",
        ],
        builds: 3,
        status: "final",
        notes:
          "Correct a common misunderstanding: the cards are standardised, but the responses are not scored by intuition alone. The colour composition matters historically and clinically. Keep the focus on perception as the entry point to personality.",
      },
      {
        id: "5-rorschach-admin",
        variant: "bullets",
        heading: "Rorschach: Administration and Inquiry",
        subheading: "Two passes through the same cards",
        items: [
          "A trained expert presents each card and asks: **'What might this be?'**",
          "The evaluator records the response, focus area, speed, and card orientation.",
          "In the inquiry phase, the cards return: why did you see that? Shape, colour, texture, or movement?",
        ],
        builds: 3,
        status: "final",
        notes:
          "Walk through the two-pass structure. The first pass collects the spontaneous response; the inquiry reconstructs what the person attended to. This is where administration skill matters: a leading question can contaminate the very response being studied.",
      },
      {
        id: "5-rorschach-scoring",
        variant: "bullets",
        heading: "Rorschach: Scoring and Limits",
        subheading: "Systems, metrics, and the cost of depth",
        items: [
          "Modern systems: **Exner Comprehensive System (CS)** or **R-PAS**.",
          "Metrics: location, determinants, content, and popularity.",
          "Limits: time-consuming administration and the need for specialised training.",
        ],
        builds: 3,
        status: "final",
        notes:
          "Name the two modern systems without turning the slide into a scoring manual. The metrics show that the Rorschach is not a free-association game; it has a coding structure. Then state the cost plainly: time and expertise are not optional extras.",
      },
      {
        id: "5-htp-procedure",
        variant: "bullets",
        heading: "HTP: Overview and Procedure",
        subheading: "House, tree, person",
        items: [
          "Developed by **John Buck in 1948** to read inner feelings, personality structure, and self-perception.",
          "Draw a **house, a tree, and a person** with pencil and paper.",
          "The psychologist observes hesitations, erasures, and the drawing sequence.",
          "Follow-up questions explore thoughts and associations.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Describe the session as a structured observation, not an art lesson. The drawing is the stimulus; the behaviour around it is data. Emphasise that interpretations are hypotheses, not verdicts about the person's character.",
      },
      {
        id: "5-htp-symbols",
        variant: "cards",
        heading: "HTP: What Each Drawing Represents",
        subheading: "Three windows into inner life",
        items: [
          {
            title: "The House",
            icon: "Building2",
            text: "Home life, family relationships, and feelings about **domestic security**.",
          },
          {
            title: "The Tree",
            icon: "Layers",
            text: "Deep, unconscious feelings about the self, **life energy, and personal growth**.",
          },
          {
            title: "The Person",
            icon: "HeartHandshake",
            text: "Interpersonal relationships, social interaction, and **self-image**.",
          },
        ],
        builds: 3,
        status: "final",
        notes:
          "Present the three symbols as interpretive traditions, not fixed equations. A small window or a broken branch does not 'mean' one thing in isolation. The clinician reads the drawing as a whole, in context, alongside the inquiry.",
      },
      {
        id: "5-htp-limits",
        variant: "bullets",
        heading: "HTP: Interpretation and Limitations",
        subheading: "Symbolism versus standardisation",
        items: [
          "Artistic skill is ignored; **symbolism and structural detail** matter.",
          "Proportions, window sizes, and branch conditions can reveal coping styles and anxiety.",
          "Limitation: interpretation depends heavily on the clinician's expertise.",
          "Limitation: no rigid universal scoring compared with objective tests.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Balance the interpretive richness against the psychometric weakness. The HTP is useful for building rapport and generating hypotheses; it is not a standardised score that can travel across clinicians without training. Say this plainly.",
      },
      {
        id: "5-objective-limits",
        variant: "bullets",
        heading: "Objective Assessment: Limitations",
        subheading: "What structure costs",
        items: [
          "**No depth** — fixed options cannot capture nuance, contradiction, or material the person cannot report directly.",
          "**Chance of guessing** — forced choice and true/false formats invite random responding.",
          "**No creativity** — the person's own language and associations are constrained by the items.",
          "**Limited answers** — when experience does not fit the options, the test cannot hear it.",
        ],
        builds: 4,
        status: "final",
        notes:
          "Presented by Abdullah umar as part of the comparison. These are the costs of the objective bargain: structure buys comparability and speed, but it cannot hear what the person cannot tick. Use this slide to set up the final comparison table honestly — neither column is a free lunch.",
      },
      {
        id: "5-activity",
        variant: "activity",
        heading: "Read the Drawing",
        subheading: "A 60-second sketch · observe structure before meaning",
        items: [
          "Sketch a quick house, a tree, and a person — no artistic skill needed.",
          "Swap with a neighbour and name one structural detail: size, proportion, or placement.",
          "Offer one possible meaning, then label it a hypothesis, not a diagnosis.",
        ],
        builds: 0,
        status: "final",
        notes:
          "Run the sketch quickly; the point is not the drawing. Ask two pairs for one structural observation and one possible meaning. Then repeat the HTP caution aloud: the detail is a hypothesis that needs context, inquiry, and corroboration.",
      },
      {
        id: "5-projective-advantages",
        variant: "bullets",
        heading: "Projective Assessment: Advantages",
        subheading: "Depth and resistance to faking",
        items: [
          "**Hidden thoughts surface** — the person reports what they hide or do not consciously know.",
          "**Harder to fake** — no right or wrong answer reduces deliberate impression management.",
          "**Depth** — a fuller picture of feelings, conflicts, and inner life, not just a number.",
        ],
        builds: 3,
        status: "final",
        notes:
          "Presented by Abdullah umar as part of the comparison. These are the strengths of the projective tradition: access to material that structured self-report may miss, and resistance to impression management. Use this slide to set up the final comparison honestly.",
      },
      {
        id: "5-projective-limitations",
        variant: "bullets",
        heading: "Projective Assessment: Limitations",
        subheading: "The cost of ambiguity",
        items: [
          "**Scoring differs** — two experts can interpret one response in different ways.",
          "**Low reliability and validity** compared with structured measures.",
          "**Time and training** — lengthy administration and specialised expertise.",
        ],
        builds: 3,
        status: "final",
        notes:
          "Presented by Abdullah umar as part of the comparison. These are the costs of the projective bargain: inter-rater disagreement, weaker psychometric evidence, and heavy demands on time and training. Set this beside the objective limitations already covered so the comparison is fair.",
      },
      {
        id: "5-comparison",
        variant: "table",
        heading: "Projective vs Objective Assessment",
        subheading: "A final side-by-side comparison",
        table: {
          columns: ["Feature", "Projective", "Objective"],
          rows: [
            [
              "Responses",
              "Unstructured (inkblots, drawings); open-ended answers",
              "Structured (true/false, rating scales); fixed options",
            ],
            [
              "Focus",
              "Unconscious thoughts, deep feelings, hidden motives",
              "Conscious traits, behaviours, self-reported symptoms",
            ],
            [
              "Scoring",
              "Subjective clinical interpretation",
              "Standardised key or computer scoring",
            ],
            [
              "Reliability and speed",
              "Time-intensive; lower standardisation",
              "Quick, mass-administrable; high reliability and validity",
            ],
          ],
        },
        builds: 4,
        status: "final",
        notes:
          "This table is the anchor of the whole presentation. Walk each row slowly. The contrast is not a morality tale: each column buys something the other cannot. The final closing slide turns that contrast into a professional stance.",
      },
      {
        id: "5-references",
        variant: "references",
        heading: "Foundational Literature",
        subheading: "Seminal texts and empirical sources in personality assessment",
        items: [
          "American Psychological Association. (2017). **Ethical principles of psychologists and code of conduct**. American Psychologist, 72(7), 890–908.",
          "Costa, P. T., Jr., & McCrae, R. R. (2008). The Revised NEO Personality Inventory (NEO-PI-R). In **The SAGE Handbook of Personality Theory and Assessment** (pp. 179–198). SAGE.",
          "Exner, J. E., & Erdberg, P. (2005). **The Rorschach: A Comprehensive System** (Vol. 2, 3rd ed.). John Wiley & Sons.",
          "Hathaway, S. R., & McKinley, J. C. (1940). A multiphasic personality schedule (Minnesota). **The Journal of Psychology**, 10(2), 249–254.",
          "Murray, H. A. (1943). **Thematic Apperception Test Manual**. Harvard University Press.",
        ],
        builds: 5,
        status: "draft",
        notes:
          "Keep this slide brief. These are the foundational sources behind the methods discussed. The references are marked draft until every citation is checked against the final handout. Do not read them aloud; leave them on screen for questions.",
      },
      {
        id: "5-closing",
        variant: "closing",
        heading: "Two Lenses, One Person",
        subheading:
          "Projective methods offer depth, ambiguity, and access to implicit life. Objective methods offer structure, reliability, and fair comparison. Ethical assessment uses both — and never reduces a person to a single score.",
        builds: 0,
        status: "final",
        notes:
          "Deliver the closing thesis: psychological assessment is not about putting people into boxes, but understanding them as multi-dimensional individuals. Multimethod assessment integrates qualitative nuance with quantitative precision. End by thanking the audience and inviting questions.",
      },
      {
        id: "5-thanks",
        variant: "closing",
        heading: "Thank You",
        subheading:
          "Personality Assessment · Projective and Objective Assessment · Questions and discussion",
        builds: 0,
        status: "final",
        notes:
          "Close the deck. Thank the audience and the panel, then invite questions. Keep the screen on the Thank You slide while answering so the closing thesis stays visible. If a question needs a slide, return to it with the number keys and come back here with M.",
      },
    ],
  }];

export const getSection = (id: SectionId): Section | undefined =>
  SECTIONS.find((section) => section.id === id);

export const getSectionPlan = (id: SectionId): SectionPlanEntry | undefined =>
  SECTION_PLAN.find((section) => section.id === id);

export const getAvailableSections = (): readonly Section[] => SECTIONS;

export const isSectionAvailable = (id: SectionId): boolean => getSection(id) !== undefined;

export const getSlideCount = (section: Section): number => section.slides.length;

/** Number of reveals a slide has by default. */
export const getDefaultBuildCount = (slide: Slide): number => {
  if (slide.variant === "table") {
    return slide.table?.rows.length ?? 0;
  }

  if (slide.variant === "quiz") {
    return slide.quiz?.length ?? 0;
  }

  if (slide.variant === "closing") {
    return 0;
  }

  return slide.items?.length ?? 0;
};

/** Resolved number of reveals, honouring an explicit `builds` value. */
export const getBuildCount = (slide: Slide): number =>
  slide.builds === undefined ? getDefaultBuildCount(slide) : slide.builds;
