import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
import datetime
from models.reminder import Reminder
from models.document import Document
from models.enums import ReminderType, ReminderStatus, DocumentType
from schemas.reminder import ReminderCreate, ReminderUpdate

class ReminderService:
    @staticmethod
    def get_reminders(
        user_id: uuid.UUID, 
        db: Session, 
        status: Optional[ReminderStatus] = None
    ) -> List[Reminder]:
        """
        Retrieves all active reminders for a user, optionally filtering by status.
        """
        query = db.query(Reminder).filter(Reminder.user_id == user_id)
        if status:
            query = query.filter(Reminder.status == status)
        return query.order_by(Reminder.due_date.asc()).all()

    @staticmethod
    def create_reminder(payload: ReminderCreate, db: Session) -> Reminder:
        """
        Manually creates a new reminder.
        """
        db_reminder = Reminder(
            user_id=payload.user_id,
            document_id=payload.document_id,
            title=payload.title,
            reminder_type=payload.reminder_type,
            due_date=payload.due_date,
            status=payload.status or ReminderStatus.PENDING
        )
        db.add(db_reminder)
        db.commit()
        db.refresh(db_reminder)
        return db_reminder

    @staticmethod
    def update_reminder(reminder_id: uuid.UUID, payload: ReminderUpdate, db: Session) -> Reminder:
        """
        Updates an existing reminder (e.g. marking it as completed or snoozing).
        """
        db_reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if not db_reminder:
            raise ValueError(f"Reminder with ID {reminder_id} not found.")

        if payload.title is not None:
            db_reminder.title = payload.title
        if payload.due_date is not None:
            db_reminder.due_date = payload.due_date
        if payload.status is not None:
            db_reminder.status = payload.status

        db_reminder.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        db.refresh(db_reminder)
        return db_reminder

    @staticmethod
    def delete_reminder(reminder_id: uuid.UUID, db: Session) -> bool:
        """
        Deletes a reminder from the database.
        """
        db_reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if not db_reminder:
            return False
        db.delete(db_reminder)
        db.commit()
        return True

    @classmethod
    def auto_generate_document_reminders(cls, document: Document, db: Session) -> List[Reminder]:
        """
        Analyzes a document's classification and parsed metadata to automatically
        schedule reminders (e.g., warranty expirations or billing deadlines).
        """
        reminders_created = []
        meta = document.metadata_json or {}
        issue_date_str = meta.get("issue_date")
        exp_date_str = meta.get("expiry_date")
        vendor = meta.get("vendor") or "Vendor"
        
        # Parse issue date
        issue_date = document.upload_date
        if issue_date_str:
            try:
                issue_date = datetime.datetime.strptime(issue_date_str, "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
            except ValueError:
                pass

        # Case 1: Warranty Expiration
        if document.document_type == DocumentType.WARRANTY and exp_date_str:
            try:
                exp_date = datetime.datetime.strptime(exp_date_str, "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
                # Create warning alert 30 days before expiration
                warning_date = exp_date - datetime.timedelta(days=30)
                
                # Check for existing reminder
                exists = db.query(Reminder).filter(
                    Reminder.user_id == document.user_id,
                    Reminder.document_id == document.id,
                    Reminder.reminder_type == ReminderType.WARRANTY_EXPIRATION
                ).first()
                
                if not exists:
                    rem = cls.create_reminder(
                        ReminderCreate(
                            user_id=document.user_id,
                            document_id=document.id,
                            title=f"Warranty Expiry Warning: {vendor} ({document.title})",
                            reminder_type=ReminderType.WARRANTY_EXPIRATION,
                            due_date=warning_date
                        ),
                        db
                    )
                    reminders_created.append(rem)
            except ValueError:
                pass

        # Case 2: Utility Bill Payment Due
        elif document.document_type == DocumentType.UTILITY_BILL:
            # Typically utility bills are due 15 days after issue date
            due_date = issue_date + datetime.timedelta(days=15)
            
            # Check for existing reminder
            exists = db.query(Reminder).filter(
                Reminder.user_id == document.user_id,
                Reminder.document_id == document.id,
                Reminder.reminder_type == ReminderType.BILL_DUE
            ).first()
            
            if not exists:
                rem = cls.create_reminder(
                    ReminderCreate(
                        user_id=document.user_id,
                        document_id=document.id,
                        title=f"Utility Bill Due: {vendor} ({document.title})",
                        reminder_type=ReminderType.BILL_DUE,
                        due_date=due_date
                    ),
                    db
                )
                reminders_created.append(rem)

        return reminders_created
