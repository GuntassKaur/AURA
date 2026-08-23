import uuid
import logging
from datetime import datetime, date, timedelta, timezone
from typing import Tuple, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from models.document import Document
from models.memory_event import MemoryEvent
from models.enums import DocumentType

logger = logging.getLogger(__name__)

class MemoryEventService:
    @staticmethod
    def _parse_document_date(document: Document) -> datetime:
        """
        Helper to parse issue_date from metadata_json or fallback to upload_date.
        Ensures a timezone-aware datetime is returned.
        """
        issue_date_str = None
        if document.metadata_json:
            issue_date_str = document.metadata_json.get("issue_date")
            
        if issue_date_str:
            try:
                # Attempt to parse YYYY-MM-DD format
                parsed = datetime.strptime(issue_date_str, "%Y-%m-%d")
                return parsed.replace(tzinfo=timezone.utc)
            except ValueError:
                pass
                
        # Fallback to upload_date (which is already timezone-aware)
        return document.upload_date

    @staticmethod
    def _calculate_match_score(
        doc_date: datetime, 
        doc_location: str, 
        doc_title: str, 
        event: MemoryEvent
    ) -> float:
        """
        Heuristic scoring engine to check how well a document matches an event.
        Returns a score between 0.0 and 1.0.
        """
        score = 0.0
        
        # 1. Date proximity check (72 hour window = 3 days)
        event_date = event.event_date
        if event_date:
            date_diff = abs(doc_date - event_date)
            if date_diff <= timedelta(hours=72):
                score += 0.5  # High score weight for temporal proximity
                # Bonus points if dates match exactly
                if date_diff <= timedelta(hours=12):
                    score += 0.1
                    
        # 2. Location proximity check
        if doc_location and (event.city or event.country):
            doc_loc_lower = doc_location.lower()
            city_match = event.city and event.city.lower() in doc_loc_lower
            country_match = event.country and event.country.lower() in doc_loc_lower
            if city_match or country_match:
                score += 0.3
                
        # 3. Context keywords match
        doc_title_lower = doc_title.lower()
        event_title_lower = event.title.lower()
        
        travel_keywords = ["flight", "hotel", "trip", "ticket", "stay", "booking", "travel"]
        purchase_keywords = ["invoice", "receipt", "warranty", "purchase", "device", "ac", "appliances"]
        
        # Check if both document and event share categories (e.g. both are travel-related)
        is_travel_overlap = any(kw in doc_title_lower for kw in travel_keywords) and \
                             any(kw in event_title_lower for kw in travel_keywords)
                             
        is_purchase_overlap = any(kw in doc_title_lower for kw in purchase_keywords) and \
                               any(kw in event_title_lower for kw in purchase_keywords)
                               
        if is_travel_overlap or is_purchase_overlap:
            score += 0.2
            
        return min(score, 1.0)

    @classmethod
    def link_document_to_event(cls, document_id: uuid.UUID, db: Session) -> Tuple[uuid.UUID, str, bool, List[str]]:
        """
        Analyzes a document's details to either link it to an existing MemoryEvent
        or automatically create a new one.
        
        Returns:
            Tuple[uuid.UUID, str, bool, List[str]]: 
            (memory_event_id, memory_event_title, created_new, list_of_linked_document_titles)
        """
        # 1. Retrieve document metadata
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.deleted_at == None
        ).first()

        if not document:
            raise ValueError(f"Document with ID {document_id} not found.")

        user_id = document.user_id
        doc_date = cls._parse_document_date(document)
        
        # Extract location attributes
        doc_location = ""
        if document.metadata_json:
            doc_location = document.metadata_json.get("address") or ""

        # 2. Query all existing memory events of the user
        existing_events = db.query(MemoryEvent).filter(
            MemoryEvent.user_id == user_id,
            MemoryEvent.deleted_at == None
        ).all()

        best_event: Optional[MemoryEvent] = None
        best_score = 0.0

        # Run heuristic scoring against all user memory events
        for event in existing_events:
            score = cls._calculate_match_score(doc_date, doc_location, document.title, event)
            if score > best_score:
                best_score = score
                best_event = event

        created_new = False

        # 3. Decision threshold (requires > 0.6 score to match)
        if best_event and best_score >= 0.6:
            logger.info(f"Linking document {document_id} to existing event: {best_event.title} (score: {best_score})")
            document.event_id = best_event.id
            db.commit()
            linked_event = best_event
        else:
            # 4. Create new MemoryEvent automatically
            logger.info(f"No match found for document {document_id}. Creating new MemoryEvent.")
            
            # Format title dynamically based on category/metadata
            vendor = document.metadata_json.get("vendor") if document.metadata_json else None
            city = document.metadata_json.get("city") if document.metadata_json else None
            country = document.metadata_json.get("country") if document.metadata_json else None
            
            # Determine suitable title
            if document.document_type == DocumentType.WARRANTY:
                title = f"{vendor or 'Product'} Purchase & Warranty"
            elif document.document_type == DocumentType.UTILITY_BILL:
                title = f"Utility Billing: {vendor or 'Service'}"
            elif doc_location or city:
                title = f"Trip / Outing in {city or doc_location[:15]}"
            else:
                title = f"Activity at {vendor or document.title[:20]}"
            
            # Extract geolocation metadata if present
            lat, lon = None, None
            if document.metadata_json:
                lat = document.metadata_json.get("latitude")
                lon = document.metadata_json.get("longitude")

            # Create event row
            new_event = MemoryEvent(
                user_id=user_id,
                title=title,
                description=f"Auto-generated event grouping resources for: {document.title}",
                event_date=doc_date,
                city=city,
                country=country,
                latitude=lat,
                longitude=lon
            )
            db.add(new_event)
            db.commit()
            db.refresh(new_event)

            # Link document
            document.event_id = new_event.id
            db.commit()
            
            linked_event = new_event
            created_new = True

        # Fetch list of all document titles currently linked to this event
        linked_docs = db.query(Document.title).filter(
            Document.event_id == linked_event.id,
            Document.deleted_at == None
        ).all()
        
        linked_titles = [doc.title for doc in linked_docs]

        return linked_event.id, linked_event.title, created_new, linked_titles
