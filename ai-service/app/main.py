"""Intelligent, empathetic AI mental wellness service for MindMate.
Powered by local Ollama LLM with automatic graceful fallback to the local student wellness engine.
"""
from fastapi import FastAPI
from pydantic import BaseModel, Field
from textblob import TextBlob
import requests
import json
import re
import os

app = FastAPI(title='MindMate AI Service', version='2.1.0')

OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://127.0.0.1:11434')
DEFAULT_OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3.2:3b')

class AnalysisInput(BaseModel):
    mood: str
    journal: str = Field(default='', max_length=3000)

class BurnoutInput(BaseModel):
    attendance_percentage: float = Field(ge=0, le=100)
    study_hours: float = Field(ge=0, le=24)
    assignment_workload: int = Field(ge=0, le=10)
    sleep_duration: float = Field(ge=0, le=24)
    recent_low_mood_days: int = Field(default=0, ge=0, le=31)

class ChatInput(BaseModel):
    message: str = Field(max_length=2000)
    history: list[dict] = Field(default_factory=list)

def level(score: float) -> str:
    if score >= 85:
        return 'Critical'
    if score >= 65:
        return 'High'
    if score >= 35:
        return 'Moderate'
    return 'Low'

# Check Ollama status and pick best available model
def get_ollama_info():
    try:
        r = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=2.0)
        if r.status_code == 200:
            models_data = r.json().get('models', [])
            names = [m.get('name') for m in models_data]
            # Prioritize fast 3b/smaller models over heavy 26b
            chosen = DEFAULT_OLLAMA_MODEL
            if chosen not in names:
                for candidate in ['llama3.2:3b', 'llama3.2:latest', 'llama3.2', 'phi3:mini', 'gemma4:26b']:
                    if candidate in names:
                        chosen = candidate
                        break
                else:
                    chosen = names[0] if names else DEFAULT_OLLAMA_MODEL
            return {'available': True, 'model': chosen, 'installed_models': names}
    except Exception:
        pass
    return {'available': False, 'model': DEFAULT_OLLAMA_MODEL, 'installed_models': []}

# Call Ollama /api/chat with timeout and fallback
def call_ollama_chat(messages: list[dict], model: str, timeout: float = 12.0) -> str | None:
    try:
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "num_predict": 450
            }
        }
        res = requests.post(f"{OLLAMA_HOST}/api/chat", json=payload, timeout=timeout)
        if res.status_code == 200:
            content = res.json().get('message', {}).get('content', '').strip()
            if content:
                return content
    except Exception as e:
        print(f"Ollama call failed or timed out: {e}")
    return None

# Rule-based fallback recommendations generator
def get_tailored_recommendations(mood: str, journal_text: str, stress_score: float) -> list[str]:
    text = journal_text.lower()
    recs = []

    is_exam = bool(re.search(r'\b(exam|test|quiz|midterm|final|study|grade|marks|syllabus|gpa)\b', text))
    is_assignment = bool(re.search(r'\b(assignment|homework|project|deadline|due|procrastinat|essay|lab)\b', text))
    is_sleep = bool(re.search(r'\b(sleep|insomnia|tired|exhaust|awake|night|drowsy|fatigue)\b', text))
    is_lonely = bool(re.search(r'\b(alone|lonely|isolated|friend|roommate|homesick|belong|social)\b', text))
    is_panic = bool(re.search(r'\b(panic|heart racing|can\'t breathe|shaking|freaking out|terror)\b', text))
    is_overwhelm = bool(re.search(r'\b(overwhelm|too much|drowning|burnout|can\'t keep up|pressure)\b', text))

    if is_panic:
        recs.append("Try the 5-4-3-2-1 grounding technique: acknowledge 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.")
        recs.append("Splash cold water on your face or hold an ice cube to activate your body's natural calming reflex.")
    elif is_exam:
        recs.append("Use the 25/5 Pomodoro method: study for 25 focused minutes, then take a real 5-minute movement break.")
        recs.append("Try active recall: write down the 3 hardest concepts from memory and review only what you missed.")
        recs.append("Take 3 deep physiological sighs (two quick inhales through the nose, one long slow exhale) before starting revision.")
    elif is_assignment:
        recs.append("Apply the 2-Minute Rule: commit to opening your assignment and writing just one sentence to beat starting friction.")
        recs.append("Break your project into micro-tasks (e.g., 'read 2 pages' instead of 'finish entire chapter').")
    elif is_sleep:
        recs.append("Try a 15-minute 'worry download': write tomorrow's to-do list on paper to clear your mind before lying down.")
        recs.append("Follow the screen detox rule: put away phones and laptops 30 minutes before sleep and dim overhead lights.")
    elif is_lonely:
        recs.append("Send a low-pressure text to a friend or classmate (e.g., 'Hey, hope your week is going alright!').")
        recs.append("Consider studying in a communal space like the campus library or a local coffee shop to feel around others.")
    elif is_overwhelm:
        recs.append("Do an energy audit: pick the top 1 task that must happen today and give yourself permission to defer the rest.")
        recs.append("Schedule 30 minutes of intentional, guilt-free downtime where you do not check academic emails or notifications.")

    mood_recs = {
        'Happy': [
            "Take a moment to anchor this feeling: note what went well today so you can repeat it later.",
            "Share your positive energy with a friend or peer who might need a smile.",
            "Channel this clarity into planning a fun weekend break or tackling a creative hobby."
        ],
        'Neutral': [
            "Use this steady baseline to check in with your body: stretch your neck and shoulders, drink a glass of water.",
            "Plan a small activity you genuinely look forward to later this evening.",
            "Take a short 10-minute walk outside to get fresh air and natural daylight."
        ],
        'Sad': [
            "Treat yourself with extra kindness today; low energy days are completely normal and valid.",
            "Focus on comfort: wrap up in a warm sweater, make a hot drink, and reduce your demands for the evening.",
            "If you want to talk, reach out to a close friend or schedule a free chat with a campus counselor."
        ],
        'Stressed': [
            "Step away from your workspace for 5 minutes and stretch your shoulders and neck.",
            "Separate what you can control right now from what you can't; focus on just the next 30 minutes.",
            "Try box breathing: inhale for 4 seconds, hold for 4, exhale for 4, hold for 4."
        ],
        'Anxious': [
            "Ground your physical body: place both feet flat on the floor and feel the solid ground beneath you.",
            "Name the anxiety out loud: 'I am noticing anxious thoughts right now, and thoughts are not facts.'",
            "Drink a cool glass of water slowly, paying attention to the temperature and sensation."
        ]
    }

    for item in mood_recs.get(mood, mood_recs['Neutral']):
        if item not in recs:
            recs.append(item)

    if stress_score >= 65:
        recs.append("Consider booking a confidential appointment with your campus counseling center or wellness advisor.")
    if stress_score >= 85:
        recs.append("Immediate support is available 24/7. Please reach out to your local crisis helpline or trusted emergency contact.")

    return recs[:4]

# Rule-based fallback conversational intelligence
def get_rule_based_chat(msg: str) -> dict:
    text = msg.lower()
    if re.search(r'\b(exam|test|midterm|final|quiz|grade|gpa|syllabus|marks|studying for|failing|tests)\b', text):
        return {
            'topic': 'exams',
            'message': (
                "Exam pressure can feel overwhelmingly heavy, but you have navigated tough tests before, and you can get through this one step at a time.\n\n"
                "Here is an actionable strategy for today:\n"
                "1. **Triage the Material:** Don't try to re-read everything. Pick the 3 high-yield topics or concepts that confuse you most.\n"
                "2. **The 25/5 Pomodoro Cycle:** Set a timer for 25 minutes of focused review with your phone in another room. When the timer rings, take a mandatory 5-minute break to stretch.\n"
                "3. **Active Recall over Passive Highlighting:** Close your notes and sketch out mind-maps or explain the topic out loud. It locks in memory 2x faster.\n"
                "4. **Physiological Reset:** Right before study sessions or walking into the exam room, take two sharp inhales through your nose, then a slow, extended exhale through your mouth.\n\n"
                "What subject or test is causing you the most stress right now?"
            )
        }
    if re.search(r'\b(assignment|homework|project|procrastinat|deadline|due|too much work|workload|behind|drowning)\b', text):
        return {
            'topic': 'workload',
            'message': (
                "When deadlines pile up, our brains trigger freeze or avoidance mode. That doesn't mean you are lazy — it means your nervous system is overwhelmed.\n\n"
                "Let's break the freeze with these micro-steps:\n"
                "• **The 2-Minute Kickstart:** Don't try to finish the assignment right now. Just open the document and write 2 sentences or outline 3 bullet points. Once momentum starts, the resistance drops.\n"
                "• **The 'Must / Should / Could' Filter:** Pick ONE 'Must' task for today. The rest can wait.\n"
                "• **Change Your Sensory Setting:** Move to a well-lit library desk or campus study lounge. A fresh physical environment signals your brain to reset focus.\n"
                "• **Communicate Early:** If a deadline is genuinely unrealistic, email your professor or TA today with a polite request for a brief extension.\n\n"
                "What is the single most urgent task on your plate right now?"
            )
        }
    if re.search(r'\b(sleep|can\'t sleep|insomnia|tired|exhausted|waking up|nightmare|restless|fatigue|sleepy)\b', text):
        return {
            'topic': 'sleep',
            'message': (
                "Struggling to sleep while dealing with college demands is exhausting and makes everything during the day feel ten times harder.\n\n"
                "Try these sleep-restoration steps tonight:\n"
                "• **The 'Brain Dump' Journal:** Keep a notebook next to your bed. If racing thoughts or tomorrow's to-dos keep you awake, write them down on paper to 'park' them outside your mind.\n"
                "• **The 20-Minute Rule:** If you've been in bed awake for over 20 minutes, don't stay tossing and turning. Get out of bed, sit in dim light, and read something physical until you feel drowsy.\n"
                "• **Screen Sunset:** Blue light blocks melatonin release. Switch your phone to Night Shift/Warm mode and try to stop scrolling 30 minutes before sleep.\n"
                "• **Progressive Muscle Relaxation:** While lying down, gently squeeze your toes for 5 seconds, then release. Move upward to your calves, thighs, shoulders, and jaw.\n\n"
                "Have you been having trouble falling asleep, or waking up in the middle of the night?"
            )
        }
    if re.search(r'\b(anxious|anxiety|panic|scared|nervous|freaking out|heart racing|shaking|breath|hyperventilat)\b', text):
        return {
            'topic': 'anxiety',
            'message': (
                "Take a slow breath right now. You are safe in this moment, and your body is simply responding to elevated adrenaline.\n\n"
                "Let's ground your senses together:\n"
                "• **5-4-3-2-1 Sensory Grounding:** Look around and name:\n"
                "   👀 **5 things** you can see\n"
                "   ✋ **4 things** you can physically touch\n"
                "   👂 **3 things** you can hear right now\n"
                "   👃 **2 things** you can smell\n"
                "   👅 **1 thing** you can taste or the taste in your mouth\n"
                "• **Cold Shock Reflex:** Go to the sink and splash cold water over your face, or hold an ice cube in your palm for 30 seconds. This activates the vagus nerve and drops your heart rate.\n"
                "• **Release Muscle Tension:** Drop your shoulders down away from your ears and unclench your jaw.\n\n"
                "Take all the time you need. How does your body feel right now?"
            )
        }
    if re.search(r'\b(lonely|alone|isolated|no friends|homesick|don\'t belong|fitting in|left out|nobody cares)\b', text):
        return {
            'topic': 'loneliness',
            'message': (
                "Feeling isolated at university is far more common than people admit — social media makes it look like everyone has an effortless group of best friends, but countless students feel just as lonely.\n\n"
                "Here are gentle ways to reconnect:\n"
                "• **Low-Stakes Proximity:** You don't have to force deep conversations immediately. Just being in shared spaces (campus library, student union, campus gym) reduces the feeling of isolation.\n"
                "• **Micro-Connections:** Say a quick 'thank you' to the barista, ask a peer in class 'Did you catch the homework problem?', or smile at a neighbor. Small daily interactions nurture belonging.\n"
                "• **Activity-Based Groups:** Join a club focused on doing rather than mingling (e.g., board game night, volunteer group, hiking club, coding hackathons).\n"
                "• **Check In Back Home:** Give a quick call or voice note to an old friend or family member who knows you well.\n\n"
                "Are you feeling homesick, or finding it difficult to meet people in your current courses?"
            )
        }

    blob = TextBlob(msg)
    sentiment = blob.sentiment.polarity
    if sentiment < -0.1:
        advice = (
            "I hear that you're going through a tough time right now. Dealing with this kind of pressure as a student takes a lot of mental energy.\n\n"
            "Here are two gentle ideas to help reset:\n"
            "1. **Pause and reset:** Step away from your computer screen or workspace for a 10-minute break.\n"
            "2. **One small win:** Focus only on the single easiest thing you can do next, rather than looking at the whole picture.\n\n"
            "Tell me a bit more about what's going on so I can give you more specific advice."
        )
    else:
        advice = (
            "Thank you for sharing that with me. Academic life brings so many shifting demands, and taking time to reflect is a great first step.\n\n"
            "To help me support you better, what area would you most like advice on right now?\n"
            "• Study tips & exam preparation\n"
            "• Sleep & managing daily fatigue\n"
            "• Managing overwhelm or heavy assignments\n"
            "• Stress relief & grounding techniques"
        )
    return {'topic': 'general', 'message': advice}

@app.get('/health')
def health():
    ollama = get_ollama_info()
    return {
        'ok': True,
        'service': 'MindMate AI Service',
        'version': '2.1.0',
        'ollama': ollama
    }

@app.get('/ollama/status')
def ollama_status():
    return get_ollama_info()

@app.post('/analyze')
def analyze(data: AnalysisInput):
    journal = data.journal.strip()
    sentiment = TextBlob(journal).sentiment.polarity if journal else 0.0

    mood_base = {'Happy': 15, 'Neutral': 35, 'Sad': 58, 'Stressed': 72, 'Anxious': 70}.get(data.mood, 40)

    distress_matches = re.findall(
        r'\b(overwhelmed|panic|hopeless|unsafe|suicide|self harm|depressed|can\'t take it|exhausted|failing|scared|crying|lonely)\b',
        journal.lower()
    )
    distress_penalty = len(distress_matches) * 7

    positive_matches = re.findall(
        r'\b(grateful|hopeful|better|calm|relaxed|accomplished|relieved|proud|happy|good|peaceful)\b',
        journal.lower()
    )
    positive_relief = len(positive_matches) * 5

    score = max(5, min(100, round(mood_base - (sentiment * 22) + distress_penalty - positive_relief)))
    stress = level(score)

    insights = []
    if journal:
        theme_names = []
        if re.search(r'\b(exam|test|study|grade|gpa)\b', journal.lower()):
            theme_names.append("academic exams and performance")
        if re.search(r'\b(assignment|deadline|project|homework)\b', journal.lower()):
            theme_names.append("workload and looming deadlines")
        if re.search(r'\b(sleep|tired|insomnia|exhaust)\b', journal.lower()):
            theme_names.append("sleep quality and rest levels")
        if re.search(r'\b(friend|roommate|alone|lonely|social)\b', journal.lower()):
            theme_names.append("social relationships and community")

        theme_phrase = f" centered around {', '.join(theme_names)}" if theme_names else ""
        sentiment_desc = "predominantly positive" if sentiment > 0.2 else "challenging or burdened" if sentiment < -0.15 else "mixed or steady"
        insights.append(f"Your check-in reflects {stress.lower()} stress levels with a {sentiment_desc} emotional tone{theme_phrase}.")
    else:
        insights.append(f"Logged feeling {data.mood.lower()} today, indicating a {stress.lower()} stress baseline.")

    if score >= 70:
        insights.append("Your current pressure levels are elevated. Prioritizing mental downtime and healthy boundaries is essential today.")
    elif score <= 30:
        insights.append("You are in a healthy, balanced state. Celebrate your steady rhythm and maintain your positive habits.")

    recs = get_tailored_recommendations(data.mood, journal, score)
    return {
        'sentiment': round(sentiment, 2),
        'stress_score': score,
        'stress_level': stress,
        'insights': insights,
        'recommendations': recs
    }

@app.post('/burnout')
def burnout(d: BurnoutInput):
    score, factors = 0, []
    if d.attendance_percentage < 75:
        score += 25
        factors.append(f'Attendance ({d.attendance_percentage:.0f}%) is below the recommended 75% threshold')
    if d.sleep_duration < 6:
        score += 25
        factors.append(f'Sleep duration ({d.sleep_duration:.1f} hrs) is significantly below the 7-8 hour target')
    if d.assignment_workload >= 7:
        score += 20
        factors.append(f'Assignment workload rating ({d.assignment_workload}/10) is very high')
    if d.study_hours >= 10:
        score += 15
        factors.append(f'Daily study duration ({d.study_hours:.1f} hrs) risks diminishing cognitive returns')
    if d.recent_low_mood_days >= 5:
        score += 20
        factors.append(f'{d.recent_low_mood_days} low-mood days reported recently indicate sustained emotional drain')

    risk = 'High' if score >= 50 else 'Medium' if score >= 25 else 'Low'

    recs = []
    if d.sleep_duration < 6:
        recs.append("Prioritize an 8-hour sleep window tonight: sleep debt is the #1 accelerant of student burnout.")
    if d.assignment_workload >= 7 or d.study_hours >= 10:
        recs.append("Schedule 2 hours of complete academic disconnection today to let your cognitive processing recover.")
        recs.append("Speak with course professors or teaching assistants about staggered deadlines or assignment extensions.")
    if risk == 'High':
        recs.append("Book a consultation with university counseling or academic advising to construct a sustainable study plan.")
    else:
        recs.append("Maintain short 10-minute breaks every 50 minutes of studying to prevent cognitive fatigue.")

    return {
        'risk': risk,
        'score': score,
        'factors': factors or ['Inputs indicate a balanced, healthy current study-life distribution.'],
        'recommendations': recs
    }

# Unified Chatbot: Ollama LLM with intelligent instant fallback
@app.post('/chat')
def chat(data: ChatInput):
    msg = data.message.strip()
    text = msg.lower()

    # 1. Immediate Crisis / Self-Harm Safety Check (always highest priority)
    if re.search(r'\b(suicid\w*|kill(ing)? myself|end(ing)? my life|want to die|wishing I were dead|self.?harm|hurt(ing)? myself|take my life|hang(ing)? myself)\b', text):
        return {
            'urgent': True,
            'source': 'safety_protocol',
            'topic': 'crisis',
            'message': (
                "I am so glad you reached out. Please know you are not alone, and your safety is the most important thing.\n\n"
                "🚨 **Immediate Support is Available 24/7:**\n"
                "• **National Crisis Hotline:** Call or text **988** (US/Canada) or call your country's emergency number (**911**, **112**, **999**)\n"
                "• **Crisis Text Line:** Text **HOME** to **741741** to connect with a crisis counselor\n"
                "• **Campus Security & Health:** Please call your university's emergency health services\n\n"
                "Please reach out to one of these resources or contact a trusted friend or family member right now to stay with you."
            )
        }

    # 2. Check Ollama availability
    ollama_info = get_ollama_info()

    if ollama_info['available']:
        system_prompt = (
            "You are MindMate AI, a compassionate, warm, and practical mental wellness assistant designed specifically for college and university students.\n"
            "Guidelines:\n"
            "1. Validate the student's feelings with empathy and without clinical jargon.\n"
            "2. Offer 2 to 4 concrete, actionable, realistic techniques (use bullet points or numbered lists).\n"
            "3. Help with academic pressure (Pomodoro, study triage, active recall), sleep hygiene, loneliness, burnout, and anxiety grounding (5-4-3-2-1).\n"
            "4. Keep your answer focused, supportive, and under 250 words.\n"
            "5. End with an encouraging check-in or gentle follow-up question.\n"
            "6. Remind them gently that you are an AI wellness companion, not a licensed medical professional."
        )

        messages = [{"role": "system", "content": system_prompt}]

        # Append last 4 history turns for context
        for h in data.history[-4:]:
            role = 'user' if h.get('role') in ['user', True] or h.get('mine') else 'assistant'
            content = h.get('content') or h.get('text') or ''
            if content:
                messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": msg})

        ollama_reply = call_ollama_chat(messages, model=ollama_info['model'], timeout=12.0)
        if ollama_reply:
            return {
                'urgent': False,
                'source': 'ollama',
                'model': ollama_info['model'],
                'message': ollama_reply
            }

    # 3. Fallback to our local rule-based student intelligence engine
    fb = get_rule_based_chat(msg)
    return {
        'urgent': False,
        'source': 'local_engine',
        'topic': fb.get('topic', 'general'),
        'message': fb['message']
    }
