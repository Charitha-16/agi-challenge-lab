/* =========================================================
   AGI CHALLENGE LAB
   COMPLETE SCRIPT
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const problemInput = document.getElementById("problemInput");

const thinkBtn = document.getElementById("thinkBtn");
const exampleBtn = document.getElementById("exampleBtn");
const challengeBtn = document.getElementById("challengeBtn");

const pipeline = document.getElementById("pipeline");
const resultSection = document.getElementById("resultSection");

const understandText = document.getElementById("understandText");
const decomposeText = document.getElementById("decomposeText");
const connectText = document.getElementById("connectText");
const adaptText = document.getElementById("adaptText");
const createText = document.getElementById("createText");

const domainsContainer = document.getElementById("domains");
const impactText = document.getElementById("impactText");
const transferFlow = document.getElementById("transferFlow");

const knowledgePanel =
    document.getElementById("knowledgePanel");

const knowledgeContent =
    document.getElementById("knowledgeContent");


/* =========================================================
   TASK DETECTION
   ========================================================= */

function detectTask(problem) {

    const p = String(problem || "").toLowerCase();


    /* CODING */

    if (
        /\b(python|javascript|java|c\+\+|c#|code|coding|program|function|algorithm|debug|bug|syntax|html|css|sql)\b/
            .test(p)
    ) {
        return "coding";
    }


    /* STUDY */

    if (
        /\b(exam|exams|study plan|study schedule|timetable|revision|prepare for|subjects|semester|test preparation)\b/
            .test(p)
    ) {
        return "study";
    }


    /* LEARNING */

    if (
        /\b(teach me|explain|learn|learning|concept|what is|understand|quiz|lesson|how does)\b/
            .test(p)
    ) {
        return "learning";
    }


    /* PLANNING */

    if (
        /\b(plan|planning|budget|timeline|hackathon|event|project plan|organize|organise|schedule a|roadmap)\b/
            .test(p)
    ) {
        return "planning";
    }


    /* MEMORY */

    if (
        /\b(remember|memory|preference|prefer|save this|don't forget|do not forget|keep in mind)\b/
            .test(p)
    ) {
        return "memory";
    }


    return "general";
}


/* =========================================================
   EXAMPLE PROBLEMS
   ========================================================= */

const exampleProblems = [

    "Our college hostel wastes a large amount of food every day. Design a smart solution.",

    "A village has frequent water shortages during summer. Create a practical solution.",

    "Traffic congestion is increasing near our college during peak hours. How can technology help?",

    "Farmers are losing crops because diseases are detected too late. Design an affordable solution.",

    "Our college consumes too much electricity. Design a system to reduce energy wastage.",

    "A city is struggling with plastic waste and poor recycling. Create a smart solution."

];


/* =========================================================
   CHALLENGE PROBLEMS
   ========================================================= */

const challengeProblems = [

    "How can we reduce waiting time in government hospitals?",

    "A village loses drinking water because of pipeline leakage. Design a solution.",

    "Students spend too much time waiting in college canteen queues. Solve it.",

    "How can a city reduce emergency response time during floods?",

    "Farmers cannot afford expensive technology to monitor crops. Design a low-cost solution.",

    "How can we reduce unnecessary electricity usage in college classrooms?",

    "A residential area has poor waste segregation. Design a solution.",

    "How can we reduce traffic congestion around a school during opening and closing hours?",

    "A hospital has limited beds but unpredictable patient demand. How can technology help?",

    "How can a college encourage students to use public transport instead of individual vehicles?"

];


/* =========================================================
   EXAMPLE BUTTON
   ========================================================= */

if (exampleBtn) {

    exampleBtn.addEventListener("click", () => {

        const randomProblem =
            exampleProblems[
                Math.floor(
                    Math.random() * exampleProblems.length
                )
            ];

        problemInput.value = randomProblem;

        problemInput.focus();

    });

}


/* =========================================================
   CHALLENGE BUTTON
   ========================================================= */

if (challengeBtn) {

    challengeBtn.addEventListener("click", () => {

        const randomProblem =
            challengeProblems[
                Math.floor(
                    Math.random() * challengeProblems.length
                )
            ];

        problemInput.value = randomProblem;

        problemInput.focus();

    });

}


/* =========================================================
   THINK BUTTON
   ========================================================= */

if (thinkBtn) {

    thinkBtn.addEventListener(
        "click",
        startThinking
    );

}


/* =========================================================
   START THINKING
   ========================================================= */

async function startThinking() {

    const problem =
        problemInput.value.trim();


    if (!problem) {

        alert(
            "Give AGI a problem first!"
        );

        problemInput.focus();

        return;
    }


    /* Reset */

    resultSection.classList.remove("show");


    understandText.textContent =
        "Understanding the problem and identifying its context...";


    decomposeText.textContent =
        "Breaking the problem into smaller challenges...";


    connectText.textContent =
        "Transferring knowledge from other domains...";


    adaptText.textContent =
        "Adapting knowledge to real-world constraints...";


    createText.textContent =
        "Creating a generalized solution...";


    domainsContainer.innerHTML = "";

    transferFlow.innerHTML = "";


    /* Reset knowledge */

    if (knowledgePanel) {

        knowledgePanel.classList.remove(
            "found",
            "saved"
        );

    }


    if (knowledgeContent) {

        knowledgeContent.innerHTML = `

            <div class="knowledge-scanning">

                <span class="knowledge-pulse">
                    ◉
                </span>

                <div>

                    <strong>
                        SEARCHING PREVIOUS KNOWLEDGE...
                    </strong>

                    <small>
                        Comparing this problem with solved cases.
                    </small>

                </div>

            </div>

        `;

    }


    /* Remove previous task UI */

    const oldTask =
        document.getElementById("taskOutput");

    if (oldTask) {

        oldTask.classList.remove("show");

        oldTask.innerHTML = "";

    }


    /* Reset generic UI */

    resetGenericUI();


    /* Start pipeline */

    pipeline.classList.add("thinking");

    thinkBtn.disabled = true;

    if (challengeBtn)
        challengeBtn.disabled = true;

    if (exampleBtn)
        exampleBtn.disabled = true;


    thinkBtn.innerHTML =
        "⚡ THINKING...";


    try {

        /* Pipeline */

        await runStage("stage1");

        await runStage("stage2");

        await runStage("stage3");

        await runStage("stage4");

        await runStage("stage5");


        /* =====================================================
           LOCAL AGI ENGINE
           ===================================================== */

        const response =
            await fetch(
                "/api/solve",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        problem: problem
                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Processing failed."
            );

        }


        /* =====================================================
           GENERIC AGI RESULT
           ===================================================== */

        understandText.textContent =
            data.understand || "Problem understood.";


        decomposeText.innerHTML =
            Array.isArray(data.decompose)
                ? data.decompose
                    .map(
                        item =>
                            `• ${escapeHtml(item)}`
                    )
                    .join("<br>")
                : "• Problem decomposed into manageable tasks.";


        connectText.innerHTML =
            Array.isArray(data.connect)
                ? data.connect
                    .map(
                        item =>
                            `• ${escapeHtml(item)}`
                    )
                    .join("<br>")
                : "• Relevant knowledge domains connected.";


        adaptText.textContent =
            data.adapt ||
            "Knowledge adapted to the current context.";


        createText.textContent =
            data.create ||
            "A generalized solution was created.";


        impactText.textContent =
            data.impact ||
            "The solution can be adapted to similar problems.";


        /* =====================================================
           DOMAINS
           ===================================================== */

        domainsContainer.innerHTML = "";

        if (Array.isArray(data.domains)) {

            data.domains.forEach(
                domain => {

                    const tag =
                        document.createElement("span");

                    tag.className =
                        "domain-tag";

                    tag.textContent =
                        domain;

                    domainsContainer.appendChild(tag);

                }
            );

        }


        /* =====================================================
           TASK-SPECIFIC OUTPUT
           ===================================================== */

        renderTaskOutput(
            problem,
            data
        );


        /* =====================================================
           KNOWLEDGE
           ===================================================== */

        renderKnowledge(data);


        /* =====================================================
           TRANSFER MAP
           ===================================================== */

        buildTransferMap(
            data.transfer_map
        );


        /* Show */

        resultSection.classList.add("show");


        setTimeout(() => {

            resultSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 300);

    }


    catch (error) {

        console.error(error);


        if (knowledgeContent) {

            knowledgeContent.innerHTML = `

                <div class="knowledge-empty">

                    <span>!</span>

                    <div>

                        <strong>
                            KNOWLEDGE SEARCH UNAVAILABLE
                        </strong>

                        <small>
                            The main AGI solver returned an error.
                        </small>

                    </div>

                </div>

            `;

        }


        alert(
            "AGI Engine Error:\n\n" +
            error.message
        );

    }


    finally {

        pipeline.classList.remove(
            "thinking"
        );


        thinkBtn.disabled = false;

        if (challengeBtn)
            challengeBtn.disabled = false;

        if (exampleBtn)
            exampleBtn.disabled = false;


        thinkBtn.innerHTML =
            "⚡ THINK AGAIN";

    }

}


/* =========================================================
   RESET GENERIC UI
   ========================================================= */

function resetGenericUI() {

    const cards =
        document.querySelectorAll(
            ".analysis-card"
        );

    cards.forEach(card => {

        card.style.display = "";

    });


    const impact =
        document.querySelector(
            ".impact-panel"
        );

    if (impact)
        impact.style.display = "";


    const capabilities =
        document.querySelector(
            ".capabilities"
        );

    if (capabilities)
        capabilities.style.display = "";


    const judge =
        document.querySelector(
            ".judge-message"
        );

    if (judge)
        judge.style.display = "";

}


/* =========================================================
   CREATE TASK OUTPUT
   ========================================================= */

function ensureTaskOutput() {

    let host =
        document.getElementById(
            "taskOutput"
        );


    if (host)
        return host;


    host =
        document.createElement("div");

    host.id =
        "taskOutput";

    host.className =
        "task-output";


    /* =====================================================
       TASK UI CSS
       ===================================================== */

    const style =
        document.createElement("style");

    style.id =
        "taskOutputStyles";


    style.textContent = `

        .task-output {
            margin: 26px 0 0;
            display: none;
        }

        .task-output.show {
            display: block;
            animation: taskReveal .45s ease;
        }

        @keyframes taskReveal {

            from {
                opacity: 0;
                transform: translateY(12px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }

        }

        .task-card {

            border:
                1px solid
                rgba(255,255,255,.10);

            border-radius: 18px;

            padding: 22px;

            background:
                rgba(255,255,255,.035);

            box-shadow:
                0 12px 35px
                rgba(0,0,0,.12);

        }

        .task-head {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 15px;

            margin-bottom: 18px;

        }

        .task-head h3 {

            margin: 0;

            font-size: 1.05rem;

        }

        .task-kicker {

            font-size: .68rem;

            letter-spacing: .14em;

            opacity: .6;

            margin-bottom: 5px;

        }

        .task-badge {

            padding: 6px 10px;

            border-radius: 999px;

            font-size: .68rem;

            border:
                1px solid
                rgba(255,255,255,.12);

            white-space: nowrap;

        }

        .task-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(0,1fr)
                );

            gap: 12px;

        }

        .task-box {

            padding: 15px;

            border-radius: 13px;

            background:
                rgba(255,255,255,.035);

            border:
                1px solid
                rgba(255,255,255,.07);

        }

        .task-box strong {

            display: block;

            margin-bottom: 7px;

        }

        .task-box small {

            opacity: .68;

            line-height: 1.5;

        }

        .task-table {

            width: 100%;

            border-collapse: collapse;

        }

        .task-table th,
        .task-table td {

            padding: 11px 10px;

            text-align: left;

            border-bottom:
                1px solid
                rgba(255,255,255,.08);

            font-size: .88rem;

        }

        .task-table th {

            opacity: .6;

            font-size: .72rem;

            letter-spacing: .08em;

        }

        .task-code {

            margin: 0;

            padding: 17px;

            border-radius: 13px;

            background: #090b10;

            overflow: auto;

            font-family:
                ui-monospace,
                SFMono-Regular,
                Consolas,
                monospace;

            font-size: .84rem;

            line-height: 1.55;

            white-space: pre-wrap;

        }

        .task-actions {

            display: flex;

            gap: 10px;

            flex-wrap: wrap;

            margin-top: 14px;

        }

        .task-action {

            border:
                1px solid
                rgba(255,255,255,.14);

            background: transparent;

            color: inherit;

            border-radius: 10px;

            padding: 9px 13px;

            cursor: pointer;

            transition: .2s ease;

        }

        .task-action:hover {

            transform:
                translateY(-1px);

            background:
                rgba(255,255,255,.05);

        }

        .task-output-result {

            margin-top: 12px;

            padding: 12px;

            border-radius: 10px;

            background:
                rgba(255,255,255,.04);

            font-family:
                ui-monospace,
                monospace;

            display: none;

        }

        .task-output-result.show {

            display: block;

        }

        .quiz-option {

            display: block;

            width: 100%;

            text-align: left;

            margin: 8px 0;

            padding: 11px 13px;

            border:
                1px solid
                rgba(255,255,255,.1);

            background: transparent;

            color: inherit;

            border-radius: 10px;

            cursor: pointer;

            transition: .2s ease;

        }

        .quiz-option:hover {

            background:
                rgba(255,255,255,.05);

        }

        .quiz-option.correct {

            border-color:
                currentColor;

        }

        .memory-line {

            display: flex;

            justify-content: space-between;

            gap: 15px;

            padding: 13px 0;

            border-bottom:
                1px solid
                rgba(255,255,255,.08);

        }

        .memory-line span {

            opacity: .65;

        }

        .plan-step {

            display: flex;

            gap: 15px;

            padding: 15px 0;

            border-bottom:
                1px solid
                rgba(255,255,255,.08);

        }

        .plan-number {

            min-width: 32px;

            height: 32px;

            border-radius: 50%;

            display: flex;

            align-items: center;

            justify-content: center;

            border:
                1px solid
                rgba(255,255,255,.15);

        }

        .learning-flow {

            display: grid;

            grid-template-columns:
                repeat(3,1fr);

            gap: 12px;

            margin-top: 18px;

        }

        .flow-item {

            padding: 16px;

            border-radius: 13px;

            background:
                rgba(255,255,255,.035);

            border:
                1px solid
                rgba(255,255,255,.07);

        }

        @media(max-width:750px) {

            .task-grid,
            .learning-flow {

                grid-template-columns: 1fr;

            }

            .task-head {

                align-items: flex-start;

                flex-direction: column;

            }

            .memory-line {

                flex-direction: column;

            }

        }

    `;


    document.head.appendChild(style);


    /* Insert before original result */

    if (resultSection &&
        resultSection.parentNode) {

        resultSection.parentNode.insertBefore(
            host,
            resultSection
        );

    }


    return host;

}


/* =========================================================
   CLEAN CREATE TEXT
   ========================================================= */

function textFromCreate(data) {

    return String(
        data?.create || ""
    )
        .replace(
            /<[^>]*>/g,
            ""
        )
        .trim();

}


/* =========================================================
   TASK-SPECIFIC RENDERER
   ========================================================= */

function renderTaskOutput(
    problem,
    data
) {

    const host =
        ensureTaskOutput();


    const task =
        detectTask(problem);


    /* =====================================================
       IMPORTANT:
       TASK UI ONLY FOR SPECIFIC TASKS
       ===================================================== */

    const taskSpecific =
        task !== "general";


    const analysisCards =
        document.querySelectorAll(
            ".analysis-card"
        );

    const impactPanel =
        document.querySelector(
            ".impact-panel"
        );

    const capabilities =
        document.querySelector(
            ".capabilities"
        );

    const judgeMessage =
        document.querySelector(
            ".judge-message"
        );


    /* Hide old generic output */

    analysisCards.forEach(
        card => {

            card.style.display =
                taskSpecific
                    ? "none"
                    : "";

        }
    );


    if (impactPanel) {

        impactPanel.style.display =
            taskSpecific
                ? "none"
                : "";

    }


    if (capabilities) {

        capabilities.style.display =
            taskSpecific
                ? "none"
                : "";

    }


    if (judgeMessage) {

        judgeMessage.style.display =
            taskSpecific
                ? "none"
                : "";

    }


    /* General problem */

    if (task === "general") {

        host.classList.remove(
            "show"
        );

        host.innerHTML = "";

        return;

    }


    const solution =
        textFromCreate(data);


    host.classList.add(
        "show"
    );


    /* =====================================================
       CODING MODE
       ===================================================== */

    if (task === "coding") {

        const codeMatch =
            /```(?:python|javascript|java|cpp|c\+\+|c#)?\s*([\s\S]*?)```/i
                .exec(solution);


        const code =
            codeMatch?.[1]?.trim()
            ||
            solution
            ||
            `# AGI-generated solution

print("Solution generated by AGI Challenge Lab")`;


        host.innerHTML = `

            <div class="task-card">

                <div class="task-head">

                    <div>

                        <div class="task-kicker">
                            TASK-SPECIFIC OUTPUT · CODING
                        </div>

                        <h3>
                            💻 CODE WORKSPACE
                        </h3>

                    </div>

                    <span class="task-badge">
                        EXECUTABLE TASK
                    </span>

                </div>


                <pre
                    class="task-code"
                    id="generatedCode"
                >${escapeHtml(code)}</pre>


                <div class="task-actions">

                    <button
                        class="task-action"
                        id="runGeneratedCode"
                    >
                        ▶ RUN
                    </button>


                    <button
                        class="task-action"
                        id="copyGeneratedCode"
                    >
                        ⧉ COPY CODE
                    </button>

                </div>


                <div
                    class="task-output-result"
                    id="codeRunResult"
                ></div>

            </div>

        `;


        /* RUN */

        const runButton =
            document.getElementById(
                "runGeneratedCode"
            );


        if (runButton) {

            runButton.onclick = () => {

                const result =
                    document.getElementById(
                        "codeRunResult"
                    );


                result.textContent =
                    "✓ Code prepared successfully. Real execution requires a secure backend sandbox.";


                result.classList.add(
                    "show"
                );

            };

        }


        /* COPY */

        const copyButton =
            document.getElementById(
                "copyGeneratedCode"
            );


        if (copyButton) {

            copyButton.onclick =
                async () => {

                    try {

                        await navigator
                            .clipboard
                            .writeText(code);


                        copyButton.textContent =
                            "✓ COPIED";


                        setTimeout(() => {

                            copyButton.textContent =
                                "⧉ COPY CODE";

                        }, 1500);

                    }

                    catch (error) {

                        console.error(
                            error
                        );

                        copyButton.textContent =
                            "COPY FAILED";

                    }

                };

        }


        return;

    }


    /* =====================================================
       STUDY MODE
       ===================================================== */

    if (task === "study") {

        host.innerHTML = `

            <div class="task-card">

                <div class="task-head">

                    <div>

                        <div class="task-kicker">
                            TASK-SPECIFIC OUTPUT · STUDY
                        </div>

                        <h3>
                            📚 ADAPTIVE STUDY PLAN
                        </h3>

                    </div>

                    <span class="task-badge">
                        AGI PLANNING
                    </span>

                </div>


                <div class="task-grid">

                    <div class="task-box">

                        <strong>
                            INPUT ANALYSIS
                        </strong>

                        <small>
                            ${escapeHtml(problem)}
                        </small>

                    </div>


                    <div class="task-box">

                        <strong>
                            STRATEGY
                        </strong>

                        <small>
                            Learn → Practice → Revise → Test
                        </small>

                    </div>


                    <div class="task-box">

                        <strong>
                            ADAPTATION
                        </strong>

                        <small>
                            Weak areas receive additional revision time.
                        </small>

                    </div>

                </div>


                <table class="task-table">

                    <thead>

                        <tr>

                            <th>
                                DAY
                            </th>

                            <th>
                                FOCUS
                            </th>

                            <th>
                                ACTIVITY
                            </th>

                            <th>
                                GOAL
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        <tr>

                            <td>
                                01
                            </td>

                            <td>
                                Core Concepts
                            </td>

                            <td>
                                Learn + Notes
                            </td>

                            <td>
                                Understand
                            </td>

                        </tr>


                        <tr>

                            <td>
                                02
                            </td>

                            <td>
                                Problem Solving
                            </td>

                            <td>
                                Practice
                            </td>

                            <td>
                                Apply
                            </td>

                        </tr>


                        <tr>

                            <td>
                                03
                            </td>

                            <td>
                                Weak Areas
                            </td>

                            <td>
                                Targeted Revision
                            </td>

                            <td>
                                Improve
                            </td>

                        </tr>


                        <tr>

                            <td>
                                04
                            </td>

                            <td>
                                Mock Test
                            </td>

                            <td>
                                Timed Practice
                            </td>

                            <td>
                                Evaluate
                            </td>

                        </tr>


                        <tr>

                            <td>
                                05
                            </td>

                            <td>
                                Final Revision
                            </td>

                            <td>
                                Recall + Review
                            </td>

                            <td>
                                Master
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        `;


        return;

    }


    /* =====================================================
       LEARNING MODE
       ===================================================== */

    if (task === "learning") {

        host.innerHTML = `

            <div class="task-card">

                <div class="task-head">

                    <div>

                        <div class="task-kicker">
                            TASK-SPECIFIC OUTPUT · LEARNING
                        </div>

                        <h3>
                            🧠 CONCEPT → UNDERSTANDING → QUIZ
                        </h3>

                    </div>

                    <span class="task-badge">
                        ADAPTIVE LESSON
                    </span>

                </div>


                <div class="learning-flow">

                    <div class="flow-item">

                        <strong>
                            01 · CONCEPT
                        </strong>

                        <p>
                            ${escapeHtml(problem)}
                        </p>

                    </div>


                    <div class="flow-item">

                        <strong>
                            02 · UNDERSTAND
                        </strong>

                        <p>
                            ${escapeHtml(
                                solution.slice(
                                    0,
                                    350
                                )
                            ) || "The system extracted the central idea."}
                        </p>

                    </div>


                    <div class="flow-item">

                        <strong>
                            03 · TRANSFER
                        </strong>

                        <p>
                            Apply the knowledge to a new situation.
                        </p>

                    </div>

                </div>


                <div
                    style="margin-top:22px"
                >

                    <strong>
                        ⚡ QUICK CHECK
                    </strong>

                    <p>
                        What demonstrates real understanding?
                    </p>


                    <button
                        class="quiz-option"
                        data-answer="wrong"
                    >
                        A. I only memorized the definition
                    </button>


                    <button
                        class="quiz-option"
                        data-answer="correct"
                    >
                        B. I can apply the concept to a new problem
                    </button>


                    <button
                        class="quiz-option"
                        data-answer="wrong"
                    >
                        C. I cannot explain it in another context
                    </button>


                    <div
                        id="quizFeedback"
                        style="
                            margin-top:12px;
                            opacity:.8
                        "
                    ></div>

                </div>

            </div>

        `;


        host
            .querySelectorAll(
                ".quiz-option"
            )
            .forEach(button => {

                button.onclick = () => {

                    const feedback =
                        document.getElementById(
                            "quizFeedback"
                        );


                    if (
                        button.dataset.answer ===
                        "correct"
                    ) {

                        feedback.textContent =
                            "✓ Correct! Applying knowledge to a new context demonstrates generalization.";

                        button.classList.add(
                            "correct"
                        );

                    }

                    else {

                        feedback.textContent =
                            "Try again — think about whether the knowledge can be transferred to a new situation.";

                    }

                };

            });


        return;

    }


    /* =====================================================
       PLANNING MODE
       ===================================================== */

    if (task === "planning") {

        host.innerHTML = `

            <div class="task-card">

                <div class="task-head">

                    <div>

                        <div class="task-kicker">
                            TASK-SPECIFIC OUTPUT · PLANNING
                        </div>

                        <h3>
                            📋 EXECUTION PLAN
                        </h3>

                    </div>

                    <span class="task-badge">
                        GOAL → ACTION
                    </span>

                </div>


                <div>

                    <div class="plan-step">

                        <div class="plan-number">
                            01
                        </div>

                        <div>

                            <strong>
                                DEFINE
                            </strong>

                            <p>
                                Identify the goal, people,
                                resources and constraints.
                            </p>

                        </div>

                    </div>


                    <div class="plan-step">

                        <div class="plan-number">
                            02
                        </div>

                        <div>

                            <strong>
                                DECOMPOSE
                            </strong>

                            <p>
                                Break the objective into
                                smaller actionable tasks.
                            </p>

                        </div>

                    </div>


                    <div class="plan-step">

                        <div class="plan-number">
                            03
                        </div>

                        <div>

                            <strong>
                                PRIORITIZE
                            </strong>

                            <p>
                                Allocate time, budget and
                                people according to importance.
                            </p>

                        </div>

                    </div>


                    <div class="plan-step">

                        <div class="plan-number">
                            04
                        </div>

                        <div>

                            <strong>
                                EXECUTE
                            </strong>

                            <p>
                                Convert the plan into
                                concrete actions.
                            </p>

                        </div>

                    </div>


                    <div class="plan-step">

                        <div class="plan-number">
                            05
                        </div>

                        <div>

                            <strong>
                                MEASURE
                            </strong>

                            <p>
                                Track progress and adapt
                                the plan when conditions change.
                            </p>

                        </div>

                    </div>

                </div>


                <div
                    style="margin-top:20px"
                >

                    <strong>
                        GENERATED SOLUTION
                    </strong>

                    <p>
                        ${escapeHtml(
                            solution ||
                            "A practical execution plan was generated."
                        )}
                    </p>

                </div>

            </div>

        `;


        return;

    }


    /* =====================================================
       MEMORY MODE
       ===================================================== */

    if (task === "memory") {

        host.innerHTML = `

            <div class="task-card">

                <div class="task-head">

                    <div>

                        <div class="task-kicker">
                            TASK-SPECIFIC OUTPUT · MEMORY
                        </div>

                        <h3>
                            💾 MEMORY INTERFACE
                        </h3>

                    </div>

                    <span class="task-badge">
                        PERSISTENT CONTEXT
                    </span>

                </div>


                <div class="memory-line">

                    <span>
                        Input
                    </span>

                    <strong>
                        ${escapeHtml(problem)}
                    </strong>

                </div>


                <div class="memory-line">

                    <span>
                        Memory state
                    </span>

                    <strong>
                        ✓ READY TO STORE
                    </strong>

                </div>


                <div class="memory-line">

                    <span>
                        Knowledge type
                    </span>

                    <strong>
                        USER PREFERENCE
                    </strong>

                </div>


                <div class="memory-line">

                    <span>
                        Future behavior
                    </span>

                    <strong>
                        RECALL + ADAPT
                    </strong>

                </div>


                <div
                    style="
                        margin-top:18px;
                        opacity:.7
                    "
                >
                    The AGI concept demonstrates how
                    previous context can influence
                    future problem solving.
                </div>

            </div>

        `;


        return;

    }

}


/* =========================================================
   KNOWLEDGE UI
   ========================================================= */

function renderKnowledge(data) {

    if (!knowledgeContent)
        return;


    const match =
        data.previous_knowledge;


    /* =====================================================
       PREVIOUS KNOWLEDGE FOUND
       ===================================================== */

    if (match) {

        if (knowledgePanel) {

            knowledgePanel.classList.add(
                "found"
            );

        }


        knowledgeContent.innerHTML = `

            <div class="knowledge-found">

                <div class="knowledge-status">

                    <span class="status-icon">
                        ✦
                    </span>

                    <div>

                        <strong>
                            PREVIOUS KNOWLEDGE FOUND
                        </strong>

                        <small>
                            A solved case can help with this problem.
                        </small>

                    </div>

                    <div class="similarity">

                        <b>
                            ${escapeHtml(
                                match.similarity ?? ""
                            )}%
                        </b>

                        <span>
                            SIMILARITY
                        </span>

                    </div>

                </div>


                <div class="knowledge-case">

                    <div class="case-column">

                        <span>
                            PREVIOUS PROBLEM
                        </span>

                        <p>
                            ${escapeHtml(
                                match.problem
                            )}
                        </p>

                    </div>


                    <div class="case-divider">
                        →
                    </div>


                    <div class="case-column">

                        <span>
                            REUSABLE INSIGHT
                        </span>

                        <p>
                            ${escapeHtml(
                                match.solution
                            )}
                        </p>

                    </div>

                </div>


                <div class="knowledge-actions">

                    <button
                        class="reuse-btn"
                        id="reuseKnowledgeBtn"
                    >
                        ♻ REUSE THIS KNOWLEDGE
                    </button>

                    <small>

                        Solved previously in

                        <b>
                            ${escapeHtml(
                                match.domain
                            )}
                        </b>

                    </small>

                </div>

            </div>

        `;


        const reuseButton =
            document.getElementById(
                "reuseKnowledgeBtn"
            );


        if (reuseButton) {

            reuseButton.addEventListener(
                "click",
                () => {

                    createText.textContent =
                        match.solution;


                    adaptText.textContent =
                        "Previous knowledge was recalled and adapted to the new problem context.";


                    impactText.textContent =
                        "The system avoided solving from zero by reusing a previous solution and adapting it to the current context.";


                    reuseButton.innerHTML =
                        "✓ KNOWLEDGE REUSED";


                    reuseButton.disabled =
                        true;

                }
            );

        }

    }


    /* =====================================================
       NO PREVIOUS KNOWLEDGE
       ===================================================== */

    else {

        knowledgeContent.innerHTML = `

            <div class="knowledge-empty">

                <span>
                    ◎
                </span>

                <div>

                    <strong>
                        NO PREVIOUS KNOWLEDGE FOUND
                    </strong>

                    <small>
                        This is a new case. Solve it and save the result to build system memory.
                    </small>

                </div>

            </div>


            <div class="knowledge-save-row">

                <button
                    class="save-btn"
                    id="saveKnowledgeBtn"
                >
                    💾 SAVE SOLUTION TO KNOWLEDGE BASE
                </button>

                <small>
                    Your solved case becomes reusable for future problems.
                </small>

            </div>

        `;


        const saveButton =
            document.getElementById(
                "saveKnowledgeBtn"
            );


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                () => saveKnowledge(data)
            );

        }

    }

}


/* =========================================================
   SAVE KNOWLEDGE
   ========================================================= */

async function saveKnowledge(data) {

    const button =
        document.getElementById(
            "saveKnowledgeBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            "💾 SAVING...";

    }


    try {

        const response =
            await fetch(
                "/api/knowledge/save",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        problem:
                            problemInput
                                .value
                                .trim(),

                        domain:
                            data.domains?.[0] ||
                            "General Problem Solving",

                        solution:
                            data.create,

                        understand:
                            data.understand

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Could not save knowledge."
            );

        }


        if (knowledgePanel) {

            knowledgePanel.classList.add(
                "saved"
            );

        }


        knowledgeContent.innerHTML = `

            <div class="knowledge-saved">

                <div class="saved-icon">
                    ✓
                </div>

                <div>

                    <strong>
                        SOLUTION SAVED TO KNOWLEDGE BASE
                    </strong>

                    <p>
                        This solved problem can now help the system solve similar future challenges.
                    </p>

                </div>

                <span class="memory-badge">
                    MEMORY UPDATED
                </span>

            </div>

        `;

    }


    catch (error) {

        console.error(error);


        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                "💾 SAVE SOLUTION TO KNOWLEDGE BASE";

        }


        alert(
            "Knowledge Base Error:\n\n" +
            error.message
        );

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   PIPELINE ANIMATION
   ========================================================= */

function runStage(stageId) {

    return new Promise(
        resolve => {

            const stage =
                document.getElementById(
                    stageId
                );


            if (stage) {

                stage.classList.add(
                    "active"
                );

            }


            setTimeout(
                () => {

                    if (stage) {

                        stage.classList.add(
                            "completed"
                        );

                    }

                    resolve();

                },
                650
            );

        }
    );

}


/* =========================================================
   BUILD TRANSFER MAP
   ========================================================= */

function buildTransferMap(nodes) {

    transferFlow.innerHTML = "";


    if (!Array.isArray(nodes) ||
        nodes.length === 0) {

        return;

    }


    nodes.forEach(
        (node, index) => {

            const nodeElement =
                document.createElement(
                    "div"
                );


            nodeElement.className =
                "transfer-node";


            if (index === 0) {

                nodeElement.classList.add(
                    "problem-node"
                );

            }


            if (
                index ===
                nodes.length - 1
            ) {

                nodeElement.classList.add(
                    "solution-node"
                );

            }


            let icon =
                "◎";


            if (index === 0) {

                icon = "?";

            }

            else if (
                index ===
                nodes.length - 1
            ) {

                icon = "✦";

            }

            else if (index === 2) {

                icon = "◇";

            }

            else {

                icon = "↗";

            }


            const title =
                node?.title ||
                "Knowledge Domain";


            const detail =
                node?.detail ||
                "Reusable knowledge";


            nodeElement.innerHTML = `

                <div class="node-icon">
                    ${escapeHtml(icon)}
                </div>

                <strong>
                    ${escapeHtml(title)}
                </strong>

                <small>
                    ${escapeHtml(detail)}
                </small>

            `;


            transferFlow.appendChild(
                nodeElement
            );


            /* Arrow */

            if (
                index <
                nodes.length - 1
            ) {

                const arrow =
                    document.createElement(
                        "div"
                    );


                arrow.className =
                    "transfer-line";


                arrow.innerHTML =
                    "<span>→</span>";


                transferFlow.appendChild(
                    arrow
                );

            }

        }
    );

}


/* =========================================================
   INITIAL STATE
   ========================================================= */

console.log(
    "AGI Challenge Lab loaded successfully."
);

console.log(
    "Task detector:",
    {
        coding:
            detectTask(
                "Create a Python program to sort student marks."
            ),

        study:
            detectTask(
                "I have 3 exams in 5 days. Make a study plan."
            ),

        learning:
            detectTask(
                "Teach me binary search."
            ),

        planning:
            detectTask(
                "Plan a college hackathon with 10000 budget."
            ),

        memory:
            detectTask(
                "Remember that my preferred study time is evening."
            )
    }
);
