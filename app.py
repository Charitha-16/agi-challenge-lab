from flask import Flask, render_template, request, jsonify
import re
import random
from difflib import SequenceMatcher
from datetime import datetime

app = Flask(__name__)


# =========================================================
# DOMAIN KNOWLEDGE
# =========================================================

DOMAIN_KNOWLEDGE = {

    "water": {
        "keywords": [
            "water", "drought", "leak", "rain", "irrigation",
            "shortage", "waste water", "water wastage"
        ],
        "domain": "Water Management",
        "connections": [
            "IoT Sensor Networks",
            "Smart Agriculture",
            "Predictive Analytics",
            "Behavioral Science"
        ],
        "transfer": [
            ("IoT SENSING", "Monitor water usage continuously."),
            ("PREDICTION", "Forecast demand and detect abnormal usage."),
            ("FEEDBACK LOOPS", "Alert users and measure savings.")
        ]
    },

    "food": {
        "keywords": [
            "food", "hostel food", "canteen", "meal",
            "waste food", "food waste", "leftover"
        ],
        "domain": "Food Management",
        "connections": [
            "Demand Forecasting",
            "Supply Chain Optimization",
            "Behavioral Science",
            "Computer Vision"
        ],
        "transfer": [
            ("DEMAND FORECASTING", "Predict how many people will consume."),
            ("SUPPLY CHAIN", "Match preparation with predicted demand."),
            ("BEHAVIORAL SCIENCE", "Use feedback to reduce unnecessary waste.")
        ]
    },

    "traffic": {
        "keywords": [
            "traffic", "congestion", "vehicles", "road",
            "signal", "parking", "transport"
        ],
        "domain": "Traffic Management",
        "connections": [
            "Queueing Theory",
            "Computer Vision",
            "IoT",
            "Human Behavior Analysis"
        ],
        "transfer": [
            ("QUEUEING THEORY", "Model vehicles as a changing flow."),
            ("COMPUTER VISION", "Estimate traffic density automatically."),
            ("PREDICTION", "Anticipate congestion before it peaks.")
        ]
    },

    "agriculture": {
        "keywords": [
            "farmer", "farmers", "crop", "agriculture",
            "plant", "pest", "soil", "harvest", "farming"
        ],
        "domain": "Agriculture",
        "connections": [
            "Computer Vision",
            "IoT Sensors",
            "Predictive Analytics",
            "Climate Science"
        ],
        "transfer": [
            ("COMPUTER VISION", "Detect visible crop abnormalities."),
            ("IoT SENSORS", "Measure soil and environmental conditions."),
            ("PREDICTIVE ANALYTICS", "Identify risks before damage spreads.")
        ]
    },

    "education": {
        "keywords": [
            "student", "students", "college", "school",
            "education", "learning", "exam", "teacher",
            "classroom"
        ],
        "domain": "Education",
        "connections": [
            "Personalization Systems",
            "Recommendation Engines",
            "Learning Analytics",
            "Gamification"
        ],
        "transfer": [
            ("PERSONALIZATION", "Adapt learning to individual needs."),
            ("RECOMMENDATION", "Select resources based on performance."),
            ("FEEDBACK", "Continuously adjust difficulty.")
        ]
    },

    "health": {
        "keywords": [
            "hospital", "patient", "health", "healthcare",
            "doctor", "medicine", "disease", "clinic"
        ],
        "domain": "Healthcare",
        "connections": [
            "Early Warning Systems",
            "Decision Support",
            "Predictive Analytics",
            "Scheduling Optimization"
        ],
        "transfer": [
            ("EARLY WARNING", "Detect abnormal patterns early."),
            ("PREDICTION", "Identify potentially high-risk cases."),
            ("OPTIMIZATION", "Prioritize limited resources.")
        ]
    },

    "energy": {
        "keywords": [
            "electricity", "energy", "power", "solar",
            "battery", "electric", "current", "ac"
        ],
        "domain": "Energy Management",
        "connections": [
            "Smart Grids",
            "Demand Forecasting",
            "IoT Monitoring",
            "Optimization Algorithms"
        ],
        "transfer": [
            ("SMART GRIDS", "Balance supply and demand dynamically."),
            ("DEMAND FORECASTING", "Predict peak consumption."),
            ("OPTIMIZATION", "Shift usage to reduce unnecessary load.")
        ]
    },

    "waste": {
        "keywords": [
            "garbage", "waste", "plastic", "recycling",
            "trash", "litter", "waste management"
        ],
        "domain": "Waste Management",
        "connections": [
            "Computer Vision",
            "Circular Economy",
            "Route Optimization",
            "Behavioral Science"
        ],
        "transfer": [
            ("COMPUTER VISION", "Classify different waste types."),
            ("ROUTE OPTIMIZATION", "Collect waste according to demand."),
            ("CIRCULAR ECONOMY", "Turn usable waste into resources.")
        ]
    },

    "security": {
        "keywords": [
            "security", "theft", "crime", "safety",
            "fraud", "attack", "cyber"
        ],
        "domain": "Security",
        "connections": [
            "Anomaly Detection",
            "Computer Vision",
            "Risk Analysis",
            "Behavioral Patterns"
        ],
        "transfer": [
            ("ANOMALY DETECTION", "Identify unusual activity."),
            ("RISK ANALYSIS", "Estimate the severity of threats."),
            ("BEHAVIORAL PATTERNS", "Compare current activity with normal behavior.")
        ]
    }
}


# =========================================================
# REUSABLE KNOWLEDGE BASE
# =========================================================
# Prototype memory: solved cases remain available while the
# Flask server is running. This can later be moved to SQLite.
KNOWLEDGE_BASE = []


KNOWLEDGE_STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on",
    "for", "our", "how", "can", "we", "is", "are", "has",
    "have", "this", "that", "with", "from", "by", "during",
    "every", "large", "amount", "create", "design", "solution"
}


def problem_tokens(text):
    words = re.findall(r"[a-z0-9]+", normalize(text))
    return {
        word for word in words
        if len(word) > 2 and word not in KNOWLEDGE_STOPWORDS
    }


def calculate_similarity(current_problem, old_problem, same_domain=False):
    current_tokens = problem_tokens(current_problem)
    old_tokens = problem_tokens(old_problem)

    if not current_tokens or not old_tokens:
        lexical = 0
    else:
        intersection = len(current_tokens & old_tokens)
        union = len(current_tokens | old_tokens)
        lexical = intersection / union if union else 0

    sequence = SequenceMatcher(
        None,
        normalize(current_problem),
        normalize(old_problem)
    ).ratio()

    base = (lexical * 0.65) + (sequence * 0.35)

    # Same-domain cases get a contextual boost because they are
    # much more likely to be reusable than unrelated cases.
    if same_domain:
        score = 55 + (base * 45)
    else:
        score = base * 100

    return round(min(score, 99))


def find_similar_knowledge(problem, domain):
    best_match = None
    best_score = 0

    for case in KNOWLEDGE_BASE:

        score = calculate_similarity(
            problem,
            case["problem"],
            case["domain"] == domain
        )

        if score > best_score:
            best_score = score
            best_match = case

    # 60% is intentionally conservative for this prototype.
    if best_match and best_score >= 60:
        return {
            "id": best_match["id"],
            "problem": best_match["problem"],
            "domain": best_match["domain"],
            "solution": best_match["solution"],
            "similarity": best_score,
            "saved_at": best_match["saved_at"]
        }

    return None


def save_knowledge(problem, domain, solution, understand):
    case = {
        "id": len(KNOWLEDGE_BASE) + 1,
        "problem": problem,
        "domain": domain,
        "solution": solution,
        "understand": understand,
        "saved_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

    KNOWLEDGE_BASE.append(case)

    return case


# =========================================================
# FALLBACK
# =========================================================

GENERAL_KNOWLEDGE = {
    "domain": "General Problem Solving",
    "connections": [
        "Systems Thinking",
        "Optimization",
        "Feedback Loops",
        "Human-Centered Design"
    ],
    "transfer": [
        ("SYSTEMS THINKING", "Understand the problem as an interconnected system."),
        ("OPTIMIZATION", "Identify bottlenecks and improve resource usage."),
        ("FEEDBACK LOOPS", "Measure results and continuously improve.")
    ]
}


# =========================================================
# HELPERS
# =========================================================

def normalize(text):
    return re.sub(r"\s+", " ", text.lower()).strip()


def detect_domains(problem):

    text = normalize(problem)

    matches = []

    for key, info in DOMAIN_KNOWLEDGE.items():

        score = 0

        for keyword in info["keywords"]:

            if keyword in text:
                score += 1

        if score > 0:
            matches.append((score, key, info))

    matches.sort(reverse=True, key=lambda x: x[0])

    return matches


def identify_stakeholders(problem):

    text = normalize(problem)

    stakeholders = []

    groups = {
        "Students": ["student", "college", "hostel", "campus"],
        "Farmers": ["farmer", "crop", "agriculture", "farm"],
        "Residents": ["village", "city", "community", "people"],
        "Customers": ["customer", "shop", "business"],
        "Workers": ["employee", "worker", "office"],
        "Patients": ["patient", "hospital", "health"]
    }

    for person, keywords in groups.items():

        if any(word in text for word in keywords):
            stakeholders.append(person)

    if not stakeholders:
        stakeholders.append("People affected by the problem")

    return stakeholders


def create_subproblems(domain):

    templates = {

        "Water Management": [
            "Measure where and when water is being consumed.",
            "Identify major sources of leakage or unnecessary usage.",
            "Predict demand using historical usage patterns.",
            "Provide timely alerts and recommendations.",
            "Measure water savings after intervention."
        ],

        "Food Management": [
            "Measure food preparation and consumption patterns.",
            "Identify where excess food is being generated.",
            "Predict meal demand more accurately.",
            "Create a safe process for surplus redistribution.",
            "Track food-waste reduction over time."
        ],

        "Traffic Management": [
            "Measure traffic volume during different time periods.",
            "Identify the major congestion points.",
            "Predict changes in traffic demand.",
            "Adapt signals, routes or parking dynamically.",
            "Measure improvement in travel time."
        ],

        "Agriculture": [
            "Collect information about crop and environmental conditions.",
            "Detect abnormal crop patterns early.",
            "Identify the likely cause of the problem.",
            "Recommend an affordable intervention.",
            "Measure crop health after intervention."
        ],

        "Education": [
            "Identify the learner's current performance.",
            "Find specific knowledge gaps.",
            "Recommend personalized learning material.",
            "Adapt difficulty based on progress.",
            "Measure improvement over time."
        ],

        "Healthcare": [
            "Identify important patient or system signals.",
            "Detect abnormal patterns early.",
            "Prioritize high-risk cases.",
            "Recommend an appropriate next action.",
            "Measure outcomes and continuously improve."
        ],

        "Energy Management": [
            "Measure energy consumption patterns.",
            "Identify unnecessary peak usage.",
            "Predict future energy demand.",
            "Optimize when and where energy is consumed.",
            "Track energy savings."
        ],

        "Waste Management": [
            "Measure the type and source of waste.",
            "Classify recyclable and non-recyclable material.",
            "Optimize collection routes.",
            "Increase reuse and recycling.",
            "Measure reduction in waste."
        ],

        "Security": [
            "Define normal activity patterns.",
            "Detect unusual behavior.",
            "Estimate the severity of an event.",
            "Trigger an appropriate response.",
            "Learn from previous incidents."
        ]
    }

    return templates.get(
        domain,
        [
            "Understand the main causes of the problem.",
            "Identify the people and systems affected.",
            "Find the major bottlenecks.",
            "Design an intervention.",
            "Measure whether the intervention works."
        ]
    )


def build_solution(domain):

    solutions = {

        "Water Management":
            "Deploy low-cost water-flow sensors at major consumption "
            "points. Compare real-time usage with expected demand to "
            "detect abnormal consumption or leaks and alert responsible staff.",

        "Food Management":
            "Create a smart food-demand system that records meal "
            "attendance, studies historical consumption, and helps the "
            "kitchen adjust preparation quantities. Surplus food can "
            "be redirected through a safe redistribution workflow.",

        "Traffic Management":
            "Use traffic counters or cameras to estimate vehicle flow. "
            "The system identifies congestion patterns and recommends "
            "adaptive signal timing, alternate routes, or parking guidance.",

        "Agriculture":
            "Combine inexpensive soil and environmental sensors with "
            "periodic crop images. The system detects unusual changes "
            "and recommends targeted action before the problem spreads.",

        "Education":
            "Build an adaptive learning system that tracks performance "
            "at the topic level, identifies knowledge gaps, recommends "
            "targeted resources, and changes difficulty according to progress.",

        "Healthcare":
            "Create an early-warning dashboard that combines relevant "
            "signals and prioritizes unusual or high-risk cases. "
            "The system supports human decision-making rather than replacing doctors.",

        "Energy Management":
            "Install smart meters at major consumption points and analyze "
            "usage patterns. The system predicts peak demand and recommends "
            "load shifting or automated controls.",

        "Waste Management":
            "Create smart collection points that record waste types and "
            "volumes. Collection routes can then be optimized according "
            "to actual demand while recycling data identifies areas needing intervention.",

        "Security":
            "Create an anomaly-detection system that establishes normal "
            "activity patterns and flags unusual events. A risk score can "
            "prioritize human review and alerts."
    }

    return solutions.get(
        domain,
        "Create a feedback-driven system that identifies the main "
        "bottleneck, recommends an intervention, observes the result, "
        "and improves the intervention using measured outcomes."
    )


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


# =========================================================
# AGI SOLVER
# =========================================================

@app.route("/api/solve", methods=["POST"])
def solve_problem():

    data = request.get_json()

    if not data or not data.get("problem"):
        return jsonify({
            "error": "Please enter a problem."
        }), 400

    problem = data["problem"].strip()

    if len(problem) < 5:
        return jsonify({
            "error": "Please enter a more detailed problem."
        }), 400


    # -----------------------------------------------------
    # UNDERSTAND
    # -----------------------------------------------------

    matches = detect_domains(problem)

    stakeholders = identify_stakeholders(problem)

    if matches:

        primary = matches[0][2]
        domain = primary["domain"]

    else:

        primary = GENERAL_KNOWLEDGE
        domain = primary["domain"]


    # -----------------------------------------------------
    # RECALL PREVIOUS KNOWLEDGE
    # -----------------------------------------------------

    previous_knowledge = find_similar_knowledge(problem, domain)


    understand = (
        f"The system identifies this as a {domain.lower()} problem. "
        f"The main stakeholders are {', '.join(stakeholders)}. "
        f"The objective is to address the root cause rather than "
        f"only treating the visible symptoms."
    )


    # -----------------------------------------------------
    # DECOMPOSE
    # -----------------------------------------------------

    decompose = create_subproblems(domain)


    # -----------------------------------------------------
    # CONNECT
    # -----------------------------------------------------

    transfer = primary["transfer"]

    connect = [
        f"{title}: {description}"
        for title, description in transfer
    ]


    # -----------------------------------------------------
    # ADAPT
    # -----------------------------------------------------

    if previous_knowledge:
        adapt = (
            "Recall the previous solution, identify what is reusable, "
            "and adapt it to the new context while starting with a "
            "low-cost prototype, collecting only necessary data, "
            "keeping humans involved in important decisions, and "
            "measuring outcomes before scaling."
        )
    else:
        adapt = (
            "Adapt the transferred knowledge to real-world constraints "
            "by starting with a low-cost prototype, collecting only "
            "necessary data, keeping humans involved in important "
            "decisions, and measuring outcomes before scaling."
        )


    # -----------------------------------------------------
    # CREATE
    # -----------------------------------------------------

    create = build_solution(domain)


    # -----------------------------------------------------
    # IMPACT
    # -----------------------------------------------------

    if previous_knowledge:
        impact = (
            "The system reuses a solved case instead of starting from "
            "zero, then adapts it to the new context. This creates a "
            "knowledge loop where solved problems become reusable "
            "intelligence for future challenges."
        )
    else:
        impact = (
            "The solution creates a measurable feedback loop: "
            "observe → analyze → act → measure → improve. "
            "This makes the system adaptive instead of fixed."
        )


    # -----------------------------------------------------
    # DOMAINS
    # -----------------------------------------------------

    domains = [domain]

    for connection in primary["connections"][:3]:
        domains.append(connection)


    # -----------------------------------------------------
    # DYNAMIC TRANSFER MAP
    # -----------------------------------------------------

    transfer_map = [
        {
            "title": "NEW PROBLEM",
            "detail": domain
        }
    ]

    for title, description in transfer:

        transfer_map.append({
            "title": title,
            "detail": description
        })


    transfer_map.append({
        "title": "ADAPTED SOLUTION",
        "detail": "Context-specific generalized output"
    })


    return jsonify({

        "understand": understand,

        "decompose": decompose,

        "connect": connect,

        "adapt": adapt,

        "create": create,

        "domains": domains,

        "impact": impact,

        "transfer_map": transfer_map,

        "previous_knowledge": previous_knowledge

    })


# =========================================================
# KNOWLEDGE BASE
# =========================================================

@app.route("/api/knowledge/save", methods=["POST"])
def save_knowledge_route():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No knowledge data received."
        }), 400

    problem = str(data.get("problem", "")).strip()
    domain = str(data.get("domain", "General Problem Solving")).strip()
    solution = str(data.get("solution", "")).strip()
    understand = str(data.get("understand", "")).strip()

    if len(problem) < 5:
        return jsonify({
            "error": "Problem is too short."
        }), 400

    if not solution:
        return jsonify({
            "error": "A solution is required before saving."
        }), 400

    # Avoid creating duplicate memory entries.
    for existing in KNOWLEDGE_BASE:
        if normalize(existing["problem"]) == normalize(problem):
            return jsonify({
                "success": True,
                "message": "This problem is already in the knowledge base.",
                "case": existing,
                "duplicate": True
            })

    case = save_knowledge(
        problem,
        domain,
        solution,
        understand
    )

    return jsonify({
        "success": True,
        "message": "Solution saved to knowledge base.",
        "case": case,
        "duplicate": False
    })


# =========================================================
# START
# =========================================================

if __name__ == "__main__":
    app.run(debug=True)