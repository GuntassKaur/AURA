import uuid
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
import datetime
from models.document import Document
from models.enums import DocumentType, UtilityType
from models.utility_record import UtilityRecord
from schemas.analytics import (
    DashboardAnalyticsResponse, MonthlySpendItem, CategorySpendItem,
    ExpenseTrendItem, RecurringPaymentItem, LargestExpenseItem, WarrantyOverviewItem
)

class LifestyleService:
    @staticmethod
    def get_dashboard_analytics(user_id: uuid.UUID, db: Session) -> DashboardAnalyticsResponse:
        """
        Aggregates financial details, utility trends, and warranty metrics
        for the dashboard views.
        """
        # 1. Fetch Monthly spending (last 6 months)
        # Using document metadata total_amount if available
        docs = db.query(Document).filter(
            Document.user_id == user_id,
            Document.deleted_at == None
        ).all()

        # Helper to group costs by month
        monthly_spent_map: Dict[str, Decimal] = {}
        category_spent_map: Dict[str, Decimal] = {}
        largest_expenses: List[LargestExpenseItem] = []
        warranties: List[WarrantyOverviewItem] = []
        travel_count = 0
        medical_count = 0

        current_date = datetime.date.today()

        for doc in docs:
            # Extract billing parameters
            meta = doc.metadata_json or {}
            amount_val = meta.get("total_amount")
            
            # Fallback parsing
            amount = Decimal("0.00")
            if amount_val is not None:
                try:
                    amount = Decimal(str(amount_val))
                except (ValueError, TypeError):
                    pass

            # Extract issue date YYYY-MM
            issue_date_str = meta.get("issue_date") or doc.upload_date.strftime("%Y-%m-%d")
            month_key = issue_date_str[:7] # YYYY-MM
            
            # Accumulate spending
            monthly_spent_map[month_key] = monthly_spent_map.get(month_key, Decimal("0.00")) + amount

            # Accumulate categories
            cat = doc.document_type.value
            category_spent_map[cat] = category_spent_map.get(cat, Decimal("0.00")) + amount

            # Travel & medical counts
            if doc.document_type == DocumentType.RECEIPT and ("trip" in doc.title.lower() or "travel" in doc.title.lower()):
                travel_count += 1
            if "medical" in doc.title.lower() or "health" in doc.title.lower() or "prescription" in doc.title.lower():
                medical_count += 1

            # Populate largest expenses
            if amount > 0:
                largest_expenses.append(
                    LargestExpenseItem(
                        document_id=str(doc.id),
                        title=doc.title,
                        vendor=meta.get("vendor"),
                        amount=amount,
                        date=datetime.datetime.strptime(issue_date_str, "%Y-%m-%d").date() if meta.get("issue_date") else doc.upload_date.date()
                    )
                )

            # Populate warranty expirations
            if doc.document_type == DocumentType.WARRANTY:
                exp_date_str = meta.get("expiry_date")
                pur_date_str = meta.get("issue_date") or doc.upload_date.strftime("%Y-%m-%d")
                
                if exp_date_str:
                    try:
                        exp_date = datetime.datetime.strptime(exp_date_str, "%Y-%m-%d").date()
                        pur_date = datetime.datetime.strptime(pur_date_str, "%Y-%m-%d").date()
                        days_rem = (exp_date - current_date).days
                        
                        warranties.append(
                            WarrantyOverviewItem(
                                document_id=str(doc.id),
                                title=doc.title,
                                product_name=meta.get("title") or doc.title,
                                purchase_date=pur_date,
                                expiry_date=exp_date,
                                days_remaining=max(days_rem, 0)
                            )
                        )
                    except ValueError:
                        pass

        # Sort largest expenses
        largest_expenses.sort(key=lambda x: x.amount, reverse=True)
        largest_expenses = largest_expenses[:5]

        # Format Monthly Spending list
        monthly_spending = [
            MonthlySpendItem(month=k, total_spent=v) 
            for k, v in sorted(monthly_spent_map.items())[-6:]
        ]

        # Format Category Spending list
        total_all = sum(category_spent_map.values()) or Decimal("1.00")
        category_spending = [
            CategorySpendItem(
                category=k, 
                amount=v, 
                percentage=float(round((v / total_all) * 100, 2))
            )
            for k, v in category_spent_map.items()
        ]

        # 2. Fetch Utility Record trends
        # Retrieve utility data from database
        utility_records = db.query(UtilityRecord).filter(
            UtilityRecord.user_id == user_id
        ).order_by(UtilityRecord.bill_date.asc()).all()

        utility_trends_map: Dict[str, Dict[str, Decimal]] = {}
        for ur in utility_records:
            m_key = ur.bill_date.strftime("%Y-%m")
            if m_key not in utility_trends_map:
                utility_trends_map[m_key] = {}
            utility_trends_map[m_key][ur.utility_type.value] = ur.amount

        expense_trends = [
            ExpenseTrendItem(
                month=k,
                electricity_amount=v.get("electricity"),
                water_amount=v.get("water"),
                shopping_amount=category_spent_map.get("receipt", Decimal("0.00")) + category_spent_map.get("invoice", Decimal("0.00")),
                other_amount=v.get("gas")
            )
            for k, v in sorted(utility_trends_map.items())[-6:]
        ]

        # 3. Simple recurring payments heuristic (grouping by vendor)
        recurring_payments: List[RecurringPaymentItem] = []
        vendor_docs: Dict[str, List[Document]] = {}
        for d in docs:
            m = d.metadata_json or {}
            v_name = m.get("vendor")
            if v_name:
                vendor_docs.setdefault(v_name.strip().lower(), []).append(d)

        for v_lower, doc_list in vendor_docs.items():
            if len(doc_list) >= 2:
                # Calculate average amount and interval
                amounts = []
                dates = []
                for d in doc_list:
                    m = d.metadata_json or {}
                    amt = m.get("total_amount")
                    if amt is not None:
                        amounts.append(Decimal(str(amt)))
                    dates.append(m.get("issue_date") or d.upload_date.strftime("%Y-%m-%d"))
                
                if amounts:
                    avg_amt = sum(amounts) / len(amounts)
                    dates.sort()
                    last_date = datetime.datetime.strptime(dates[-1], "%Y-%m-%d").date()
                    
                    recurring_payments.append(
                        RecurringPaymentItem(
                            vendor=doc_list[0].metadata_json.get("vendor"),
                            average_amount=avg_amt,
                            frequency_months=1,  # Default billing assume monthly
                            last_payment_date=last_date
                        )
                    )

        return DashboardAnalyticsResponse(
            monthly_spending=monthly_spending,
            category_spending=category_spending,
            expense_trends=expense_trends,
            recurring_payments=recurring_payments,
            largest_expenses=largest_expenses,
            warranties=warranties,
            travel_count_last_year=travel_count,
            medical_records_count=medical_count
        )
