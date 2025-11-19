# app/services/chat_service.py
from sqlalchemy.orm import Session
from app.database.models import ChatSession, ChatMessage
from datetime import datetime
from typing import List, Optional, Dict


class ChatService:
    @staticmethod
    def create_session(
        db: Session, user_id: int, context_data: Optional[Dict] = None
    ) -> ChatSession:
        """Create a new chat session"""
        session = ChatSession(user_id=user_id, context_data=context_data or {})
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def get_session(
        db: Session, session_id: int, user_id: int
    ) -> Optional[ChatSession]:
        """Get a specific session that belongs to a user"""
        return (
            db.query(ChatSession)
            .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
            .first()
        )

    @staticmethod
    def get_user_sessions(
        db: Session, user_id: int, limit: int = 10
    ) -> List[ChatSession]:
        """Get all sessions for a user, most recent first"""
        return (
            db.query(ChatSession)
            .filter(ChatSession.user_id == user_id)
            .order_by(ChatSession.updated_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def add_message(
        db: Session,
        session_id: int,
        role: str,
        content: str,
        message_type: str = "text",
        message_metadata: Optional[Dict] = None,
    ) -> ChatMessage:
        """Add a message to a chat session and update the session timestamp"""
        message = ChatMessage(
            session_id=session_id,
            role=role,
            content=content,
            message_type=message_type,
            message_metadata=message_metadata or {},
        )
        db.add(message)

        # Update session timestamp
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if session:
            session.updated_at = datetime.now()  # Tampa time

        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def get_session_messages(
        db: Session, session_id: int, limit: int = 50
    ) -> List[ChatMessage]:
        """Get all messages from a session, oldest first"""
        return (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.timestamp.asc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def update_session_context(
        db: Session, session_id: int, context_updates: Dict
    ) -> ChatSession:
        """Update the context data for a session (like storing extracted symptoms)"""
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if session:
            if session.context_data is None:
                session.context_data = {}
            session.context_data.update(context_updates)
            session.updated_at = datetime.now()  # Tampa time
            db.commit()
            db.refresh(session)
        return session
