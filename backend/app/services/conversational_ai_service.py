# app/services/conversational_ai_service.py
from app.services.llm_service import require_json_with_retry
from typing import List, Dict, Optional
import re


class ConversationalAIService:
    @staticmethod
    def analyze_conversation_for_medical_context(
        user_message: str, conversation_history: List[Dict]
    ) -> Dict:
        """
        Analyze if we have enough medical info to switch to analyzer mode.
        This is the BRAIN that decides when to switch modes.
        """
        system_prompt = """You are a medical conversation analyzer. Determine if we have enough information to provide medical advice.
        
        Look for:
        - Specific symptoms mentioned (headache, fever, pain, etc.)
        - Duration of symptoms (how long, when it started)
        - Severity descriptions (mild, severe, etc.)
        - Whether the user is directly asking for medical advice or analysis
        - Enough details to make a reasonable assessment
        
        Return JSON with:
        {
            "has_sufficient_info": boolean,
            "missing_info": list of strings (e.g., ["duration", "severity"]),
            "extracted_symptoms": string of all symptoms mentioned,
            "extracted_duration": string if duration mentioned,
            "should_offer_analysis": boolean (true if user seems to want medical advice),
            "confidence_score": number 0-1 (how confident we are in the assessment)
        }
        
        Only return valid JSON. Be conservative - only offer analysis when clearly appropriate."""

        # Build the conversation context for analysis
        conversation_text = "\n".join(
            [
                f"{msg['role']}: {msg['content']}"
                for msg in conversation_history[-8:]  # Last 8 messages for context
            ]
        )
        conversation_text += f"\nuser: {user_message}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": conversation_text},
        ]

        return require_json_with_retry(messages)

    @staticmethod
    def generate_conversational_response(
        user_message: str, conversation_history: List[Dict], session_context: Dict
    ) -> Dict:
        """
        Generate a normal, friendly response while gathering medical info naturally.
        This is the NORMAL MODE.
        """
        system_prompt = """You are a friendly, empathetic healthcare assistant. Your goal is to:
        1. Have a natural, comforting conversation about health concerns
        2. Gently gather important medical information through normal conversation
        3. Build trust and make the user feel heard
        4. ONLY offer medical analysis when the user clearly wants it and we have enough info

        Gather information naturally by asking follow-up questions like:
        - "How long have you been experiencing this?"
        - "Can you describe what the pain feels like?"
        - "Have you taken any medication for this?"
        - "Is there anything that makes it better or worse?"

        IMPORTANT RULES:
        - Don't sound like a questionnaire! Be conversational
        - Only offer analysis when: 
          * User directly asks for medical advice AND
          * We have specific symptoms + duration + severity info
        - If offering analysis, say: "Based on what you've told me, I can analyze your symptoms and provide some guidance. Would you like me to do that?"

        Return JSON with:
        {
            "response": "your conversational response",
            "update_context": {"symptom": "headache", "duration": "2 days"} OR {},
            "should_offer_analysis": false
        }"""

        # Build conversation context
        history_text = "\n".join(
            [
                f"{msg['role']}: {msg['content']}"
                for msg in conversation_history[-6:]  # Last 6 messages
            ]
        )

        current_context = (
            f"Current known context: {session_context}\n\n" if session_context else ""
        )

        user_prompt = f"{current_context}Conversation history:\n{history_text}\n\nUser: {user_message}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        return require_json_with_retry(messages)

    @staticmethod
    def extract_medical_context_from_conversation(
        conversation_history: List[Dict],
    ) -> Dict:
        """
        Extract structured medical info from conversation when switching to analyzer mode.
        This prepares data for your existing ehr_advice system.
        """
        system_prompt = """Extract medical information from this conversation and structure it for medical analysis.
        
        Return JSON with:
        {
            "symptoms": string of all symptoms mentioned,
            "duration": string describing duration if mentioned,
            "medications": list of medications mentioned,
            "conditions": list of medical conditions mentioned,
            "age": number if mentioned, else 30,
            "sex": string if mentioned, else null
        }
        
        Only include information that was explicitly mentioned in the conversation."""

        conversation_text = "\n".join(
            [f"{msg['role']}: {msg['content']}" for msg in conversation_history]
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": conversation_text},
        ]

        return require_json_with_retry(messages)
